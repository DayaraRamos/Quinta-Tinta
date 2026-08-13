// ====== CONFIGURA AQUÍ ======
  const WHATSAPP_NUMBER = "573108240839"; // TODO: reemplaza por tu número real (código país + número, sin +)
  const STORE_NAME = "Quinta Tinta";
  // =============================

  const CATS = {
    camisetas: { label: "Camisetas", tint: "227,28,121" },   // magenta
    pocillos:  { label: "Pocillos",  tint: "0,169,206" },    // cyan
    buzos:     { label: "Buzos / Sudaderas", tint: "240,190,0" } // yellow
  };

  const ICONS = {
    camisetas: `<svg viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"><path d="M20 8 L8 18 L14 26 L20 22 V56 H44 V22 L50 26 L56 18 L44 8 Q38 14 32 14 Q26 14 20 8Z"/></svg>`,
    pocillos:  `<svg viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"><path d="M14 18 H42 V44 Q42 52 28 52 Q14 52 14 44 Z"/><path d="M42 24 H48 Q54 24 54 32 Q54 40 48 40 H42"/></svg>`,
    buzos:     `<svg viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"><path d="M22 6 L10 14 L16 24 L22 20 V56 H42 V20 L48 24 L54 14 L42 6 Q38 12 32 12 Q26 12 22 6Z"/><path d="M26 6 Q32 2 38 6"/></svg>`
  };

let PRODUCTS = [];

async function cargarProductos(){
  const res = await fetch("productos.json");
  const data = await res.json();
  let id = 1;
  Object.keys(data).forEach(cat=>{
    data[cat].forEach(item=>{
      PRODUCTS.push({id:id++, cat, name:item.name, images:item.images || []});
    });
  });
}

  let activeFilter = "todos";
  let order = {}; // id -> {product, qty}
  let imgIndex = {}; // id de producto -> índice de la foto actual

  
  function pattern(cat, seed){
    // simple varied SVG pattern per product for visual variety
    const patterns = ["dots","stripes","cross","waves"];
    const p = patterns[seed % patterns.length];
    const c = CATS[cat].tint;
    if(p==="dots") return `<circle cx="10" cy="10" r="2.2" fill="rgba(${c},0.5)"/><circle cx="30" cy="30" r="2.2" fill="rgba(${c},0.5)"/><circle cx="50" cy="10" r="2.2" fill="rgba(${c},0.5)"/><circle cx="10" cy="50" r="2.2" fill="rgba(${c},0.5)"/><circle cx="50" cy="50" r="2.2" fill="rgba(${c},0.5)"/><circle cx="30" cy="0" r="2.2" fill="rgba(${c},0.5)"/>`;
    if(p==="stripes") return `<rect x="0" y="0" width="60" height="6" fill="rgba(${c},0.35)"/><rect x="0" y="20" width="60" height="6" fill="rgba(${c},0.35)"/><rect x="0" y="40" width="60" height="6" fill="rgba(${c},0.35)"/>`;
    if(p==="cross") return `<line x1="0" y1="0" x2="60" y2="60" stroke="rgba(${c},0.35)" stroke-width="3"/><line x1="60" y1="0" x2="0" y2="60" stroke="rgba(${c},0.35)" stroke-width="3"/>`;
    return `<path d="M0 15 Q15 0 30 15 T60 15" stroke="rgba(${c},0.4)" stroke-width="3" fill="none"/><path d="M0 40 Q15 25 30 40 T60 40" stroke="rgba(${c},0.4)" stroke-width="3" fill="none"/>`;
  }

  function renderFilters(){
    const wrap = document.getElementById("filters");
    let html = `<button class="filter-btn ${activeFilter==='todos'?'active':''}" onclick="setFilter('todos')">Todos</button>`;
    Object.keys(CATS).forEach(cat=>{
      html += `<button class="filter-btn ${activeFilter===cat?'active':''}" onclick="setFilter('${cat}')">${CATS[cat].label}</button>`;
    });
    wrap.innerHTML = html;
  }

  function setFilter(cat){
    activeFilter = cat;
    renderFilters();
    renderGrid();
  }

  function filterAndScroll(cat){
    setFilter(cat);
    scrollToId('galeria');
  }

  function scrollToId(elId){
    document.getElementById(elId).scrollIntoView({behavior:"smooth", block:"start"});
  }

  function setActiveNav(btn){
  document.querySelectorAll('nav.links button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toggleMobileMenu(){
  document.getElementById('navLinks').classList.toggle('open');
}
function closeMobileMenu(){
  document.getElementById('navLinks').classList.remove('open');
}

function toggleBrandReveal(){
  document.getElementById('quintaTinta').classList.toggle('revealed');
}

  function renderGrid(){
    const grid = document.getElementById("grid");
    const list = PRODUCTS.filter(p => activeFilter==="todos" || p.cat===activeFilter);
    document.getElementById("resultCount").textContent = `${list.length} diseño${list.length!==1?'s':''}`;
    grid.innerHTML = list.map((p,i)=>{
      const c = CATS[p.cat].tint;
      const inOrder = !!order[p.id];
      return `
      <div class="card">
        <span class="reg" style="color:#fff"><span class="reg-circle"></span></span>

<div class="swatch ${p.images && p.images.length>0 ? 'clickable':''}" style="background:linear-gradient(135deg, rgb(${c}) 0%, var(--ink) 140%);" onclick="${p.images && p.images.length>0 ? `openLightbox(${p.id})` : ''}">  ${p.images && p.images.length > 0 ? `
    <img src="${p.images[imgIndex[p.id]||0]}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
    ${p.images.length > 1 ? `
      <button onclick="event.stopPropagation(); cambiarFoto(${p.id}, -1, ${p.images.length})" style="position:absolute;left:6px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.5);color:#fff;border:none;width:26px;height:26px;border-radius:50%;z-index:3;">‹</button>
      <button onclick="event.stopPropagation(); cambiarFoto(${p.id}, 1, ${p.images.length})" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.5);color:#fff;border:none;width:26px;height:26px;border-radius:50%;z-index:3;">›</button>
      <div style="position:absolute;bottom:26px;left:0;right:0;display:flex;justify-content:center;gap:5px;z-index:3;">
        ${p.images.map((_, idx)=>`<span style="width:6px;height:6px;border-radius:50%;background:${(imgIndex[p.id]||0)===idx?'#fff':'rgba(255,255,255,.4)'};"></span>`).join("")}
      </div>
    ` : ""}
  ` : `
    <svg width="60" height="60" style="position:absolute;inset:0;" viewBox="0 0 60 60">${pattern(p.cat,i)}</svg>
    ${ICONS[p.cat]}
  `}
  <span class="swatch-label">${CATS[p.cat].label}</span>
</div>

        <div class="card-body">
          <h4>${p.name}</h4>
          <span class="card-tag">Ref. ${String(p.id).padStart(3,'0')}</span>
          <div class="card-row">
            <button class="card-btn ${inOrder?'added':''}" onclick="toggleOrder(${p.id})">${inOrder?'✓ Agregado':'Agregar a pedido'}</button>
            <button class="card-btn solid" onclick="quickQuote(${p.id})">Cotizar</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }

  function toggleOrder(pid){
    const product = PRODUCTS.find(p=>p.id===pid);
    if(order[pid]){
      delete order[pid];
    } else {
      order[pid] = {product, qty:1};
    }
    renderGrid();
    updateCartCount();
    renderDrawer();
  }

function cambiarFoto(pid, delta, total){
  const actual = imgIndex[pid] || 0;
  imgIndex[pid] = (actual + delta + total) % total;
  renderGrid();
}

let lightboxState = {images:[], index:0, name:""};

function openLightbox(pid){
  const product = PRODUCTS.find(p=>p.id===pid);
  if(!product || !product.images || product.images.length===0) return;
  lightboxState = {images:product.images, index:0, name:product.name};
  renderLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.getElementById('lightboxOverlay').classList.add('open');
}

function closeLightbox(){
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxOverlay').classList.remove('open');
}

function lightboxNav(delta){
  const total = lightboxState.images.length;
  lightboxState.index = (lightboxState.index + delta + total) % total;
  renderLightbox();
}

function renderLightbox(){
  document.getElementById('lightboxImg').src = lightboxState.images[lightboxState.index];
  document.getElementById('lightboxTitle').textContent = lightboxState.name;
  document.getElementById('lightboxDots').innerHTML = lightboxState.images.map((_,i)=>
    `<span class="${i===lightboxState.index?'active':''}"></span>`
  ).join("");
}

  function changeQty(pid, delta){
    if(!order[pid]) return;
    order[pid].qty = Math.max(1, order[pid].qty + delta);
    renderDrawer();
    updateCartCount();
  }

  function removeItem(pid){
    delete order[pid];
    renderDrawer();
    renderGrid();
    updateCartCount();
  }

  function updateCartCount(){
    const count = Object.values(order).reduce((a,o)=>a+o.qty,0);
    document.getElementById("cartCount").textContent = count;
    updateWaLinks();
  }

  function renderDrawer(){
    const list = document.getElementById("drawerList");
    const items = Object.values(order);
    if(items.length===0){
      list.innerHTML = `<p class="drawer-empty">Aún no has agregado diseños.<br>Explora el catálogo y da clic en "Agregar a pedido".</p>`;
      return;
    }
    list.innerHTML = items.map(({product,qty})=>{
      const c = CATS[product.cat].tint;
      return `
      <div class="drawer-item">
        <div class="di-swatch" style="background:linear-gradient(135deg, rgb(${c}), var(--ink));"></div>
        <div class="di-info">
          <h5>${product.name}</h5>
          <span>${CATS[product.cat].label} · Ref. ${String(product.id).padStart(3,'0')}</span>
        </div>
        <div class="di-qty">
          <button onclick="changeQty(${product.id},-1)" aria-label="Menos">−</button>
          <span class="mono">${qty}</span>
          <button onclick="changeQty(${product.id},1)" aria-label="Más">+</button>
        </div>
      </div>
      <button class="di-remove" onclick="removeItem(${product.id})" style="align-self:flex-start;">Quitar</button>
      `;
    }).join("");
  }

  function buildOrderMessage(){
    const items = Object.values(order);
    if(items.length===0) return `Hola ${STORE_NAME}, quiero información sobre sus diseños.`;
    let msg = `Hola ${STORE_NAME}, quiero cotizar este pedido:\n`;
    items.forEach(({product,qty})=>{
      msg += `• ${product.name} (${CATS[product.cat].label}) x${qty}\n`;
    });
    msg += `\n¿Me confirman tallas, colores disponibles y tiempo de entrega?`;
    return msg;
  }

  function buildQuickMessage(pid){
    const product = PRODUCTS.find(p=>p.id===pid);
    return `Hola ${STORE_NAME}, quiero cotizar el diseño "${product.name}" (${CATS[product.cat].label}, Ref. ${String(product.id).padStart(3,'0')}).`;
  }

  function waUrl(text){
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function updateWaLinks(){
    const generic = waUrl(`Hola ${STORE_NAME}, quiero más información sobre sus diseños.`);
    document.getElementById("heroWaLink").href = generic;
    document.getElementById("contactWaLink").href = generic;
    document.getElementById("fabWaLink").href = generic;
    document.getElementById("sendOrderWa").href = waUrl(buildOrderMessage());
  }

  function quickQuote(pid){
    window.open(waUrl(buildQuickMessage(pid)), "_blank");
  }

  function openDrawer(){
    document.getElementById("drawer").classList.add("open");
    document.getElementById("overlay").classList.add("open");
    renderDrawer();
    updateWaLinks();
  }
  function closeDrawer(){
    document.getElementById("drawer").classList.remove("open");
    document.getElementById("overlay").classList.remove("open");
  }

  
// init
cargarProductos().then(()=>{
  renderFilters();
  renderGrid();
  updateCartCount();
  updateWaLinks();
});

/* =========================================================
   CONFIGURADOR DE PRENDA - FABRIC.JS
========================================================= */

let designCanvas = null;

let customizerState = {
  product: "camiseta",
  color: "blanco",
  size: "M",
  view: "frente"
};


/* =========================================================
   INICIALIZAR FABRIC
========================================================= */

function initCustomizer() {

  const canvasElement = document.getElementById("designCanvas");

  if (!canvasElement) return;

  designCanvas = new fabric.Canvas(canvasElement, {
    preserveObjectStacking: true,
    selection: true,
    stopContextMenu: true
  });

  resizeDesignCanvas();

  const mockupColorLayer =
    document.getElementById("mockupColorLayer");

  if (mockupColorLayer) {

    mockupColorLayer.style.webkitMaskImage =
      'url("img/camisas/frente.png")';

    mockupColorLayer.style.maskImage =
      'url("img/camisas/frente.png")';
  }

  window.addEventListener("resize", resizeDesignCanvas);

  // Permitir seleccionar y mover objetos
  designCanvas.on("object:moving", function(e) {
    e.target.setCoords();
  });

  designCanvas.on("object:scaling", function(e) {
    e.target.setCoords();
  });

  designCanvas.on("object:rotating", function(e) {
    e.target.setCoords();
  });
}


/* =========================================================
   AJUSTAR CANVAS
========================================================= */

function resizeDesignCanvas() {

  if (!designCanvas) return;

  const stage = document.getElementById("mockupStage");

  if (!stage) return;

  const width = stage.clientWidth;
  const height = stage.clientHeight;

  designCanvas.setDimensions({
    width: width,
    height: height
  });

  designCanvas.renderAll();
}

/* =========================================================
   SUBIR DISEÑO AL CANVAS
========================================================= */

// function loadDesignToCanvas(file) {

//   if (!designCanvas || !file) return;

//   const reader = new FileReader();

//   reader.onload = function(event) {

//     fabric.Image.fromURL(event.target.result, function(img) {

//       /* ==========================================
//          LIMPIAR DISEÑO ANTERIOR
//       ========================================== */

//       designCanvas.clear();


//       /* ==========================================
//          TAMAÑO INICIAL
//       ========================================== */

//       const maxWidth = designCanvas.getWidth() * 0.45;
//       const maxHeight = designCanvas.getHeight() * 0.45;

//       const scaleX = maxWidth / img.width;
//       const scaleY = maxHeight / img.height;

//       const scale = Math.min(scaleX, scaleY);


//       img.set({
//         left: designCanvas.getWidth() / 2,
//         top: designCanvas.getHeight() / 2,
//         originX: "center",
//         originY: "center",
//         scaleX: scale,
//         scaleY: scale,

//         cornerColor: "#E91E73",
//         cornerStrokeColor: "#FFFFFF",
//         borderColor: "#E91E73",
//         transparentCorners: false,

//         hasRotatingPoint: true
//       });


//       /* ==========================================
//          AGREGAR AL CANVAS
//       ========================================== */

//       designCanvas.add(img);

//       designCanvas.setActiveObject(img);

//       designCanvas.renderAll();

//     });

//   };

//   reader.readAsDataURL(file);
// }


/* =========================================================
   SUBIR DISEÑO A FABRIC.JS
========================================================= */

function uploadDesign(file) {

  if (!designCanvas || !file) return;

  const reader = new FileReader();

  reader.onload = function(event) {

    fabric.Image.fromURL(event.target.result, function(img) {

      const maxWidth = designCanvas.getWidth() * 0.45;
      const maxHeight = designCanvas.getHeight() * 0.45;

      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;

      const scale = Math.min(scaleX, scaleY);

      img.set({
        left: designCanvas.getWidth() / 2,
        top: designCanvas.getHeight() / 2,

        originX: "center",
        originY: "center",

        scaleX: scale,
        scaleY: scale,

        selectable: true,
        evented: true,

        hasControls: true,
        hasBorders: true,

        cornerColor: "#E6127F",
        cornerStrokeColor: "#FFFFFF",
        borderColor: "#E6127F",

        transparentCorners: false,

        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false
      });

      designCanvas.add(img);

      designCanvas.setActiveObject(img);

      img.setCoords();

      designCanvas.renderAll();

    }, {
      crossOrigin: "anonymous"
    });

  };

  reader.readAsDataURL(file);
}


/* =========================================================
   CAMBIAR FRENTE / ESPALDA
========================================================= */

function changeCustomizerView(view) {

  customizerState.view = view;

  const mockupImage =
    document.getElementById("mockupImage");

  const mockupColorLayer =
    document.getElementById("mockupColorLayer");

  if (!mockupImage || !mockupColorLayer) return;


  /* =========================================================
     DETERMINAR MOCKUP
  ========================================================= */

  let imagePath;


  if (view === "frente") {

    imagePath = "img/camisas/frente.png";

  } else {

    imagePath = "img/camisas/espalda.png";

  }


  /* =========================================================
     CAMBIAR IMAGEN
  ========================================================= */

  mockupImage.src = imagePath;


  /* =========================================================
     CAMBIAR MÁSCARA
  ========================================================= */

  mockupColorLayer.style.webkitMaskImage =
    `url("${imagePath}")`;

  mockupColorLayer.style.maskImage =
    `url("${imagePath}")`;


  /* =========================================================
     BOTÓN ACTIVO
  ========================================================= */

  document.querySelectorAll(".view-btn").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.view === view
    );

  });

}


/* =========================================================
   CAMBIAR COLOR
========================================================= */

function changeCustomizerColor(color) {

  customizerState.color = color;

  const mockupColorLayer =
    document.getElementById("mockupColorLayer");

  if (!mockupColorLayer) return;


  /* =========================================================
     COLORES EXACTOS
  ========================================================= */

  const colors = {

    blanco: "#FFFFFF",
    negro: "#171717",
    rosado: "#E91E73",
    morado: "#7135C9",
    azul: "#2878C8"

  };


  const selectedColor = colors[color];

  if (!selectedColor) return;


  /* =========================================================
     APLICAR COLOR
  ========================================================= */

  mockupColorLayer.style.backgroundColor =
    selectedColor;


  /* =========================================================
     BOTÓN ACTIVO
  ========================================================= */

  document.querySelectorAll(".color-option").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.color === color
    );

  });


  /* =========================================================
     ACTUALIZAR RESUMEN
  ========================================================= */

  const summaryColor =
    document.getElementById("summaryColor");

  if (summaryColor) {

    const names = {

      blanco: "Blanco",
      negro: "Negro",
      rosado: "Rosado",
      morado: "Morado",
      azul: "Azul"

    };

    summaryColor.textContent =
      names[color];

  }

}

function changeCustomizerCustomColor(color) {

  customizerState.color = color;

  const mockupColorLayer =
    document.getElementById("mockupColorLayer");

  if (!mockupColorLayer) return;


  /* =========================================================
     APLICAR COLOR PERSONALIZADO
  ========================================================= */

  mockupColorLayer.style.backgroundColor = color;


  /* =========================================================
     QUITAR ACTIVE DE LOS COLORES NORMALES
  ========================================================= */

  document
    .querySelectorAll(".color-option")
    .forEach(button => {

      button.classList.remove("active");

    });


  /* =========================================================
     ACTIVAR SELECTOR PERSONALIZADO
  ========================================================= */

  const customColorPickerBox =
    document.querySelector(".custom-color-picker");

  if (customColorPickerBox) {

    customColorPickerBox.classList.add("active");

    const label =
      customColorPickerBox.querySelector("label");

    if (label) {

      label.style.backgroundColor = color;

    }

  }


  /* =========================================================
     ACTUALIZAR RESUMEN
  ========================================================= */

  const summaryColor =
    document.getElementById("summaryColor");

  if (summaryColor) {

    summaryColor.textContent = color.toUpperCase();

  }

}


/* =========================================================
   FILTROS DE COLOR DEL MOCKUP
========================================================= */

/* =========================================================
   SUBIR DISEÑO A FABRIC.JS
========================================================= */

function uploadDesign(file) {

  if (!designCanvas || !file) return;

  const reader = new FileReader();

  reader.onload = function(event) {

    fabric.Image.fromURL(event.target.result, function(img) {

      /*
       * Tamaño inicial del diseño
       */

      const maxWidth = designCanvas.getWidth() * 0.45;
      const maxHeight = designCanvas.getHeight() * 0.45;

      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;

      const scale = Math.min(scaleX, scaleY);

      img.set({
        left: designCanvas.getWidth() / 2,
        top: designCanvas.getHeight() / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,

        /*
         * Permitir interacción
         */

        selectable: true,
        evented: true
      });

      designCanvas.add(img);

      designCanvas.setActiveObject(img);

      designCanvas.renderAll();

    });

  };

  reader.readAsDataURL(file);
}

/* =========================================================
   EVENTOS DEL CONFIGURADOR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /*
   * Frente / espalda
   */

  document.querySelectorAll(".view-btn").forEach(button => {

    button.addEventListener("click", () => {

      changeCustomizerView(button.dataset.view);

    });

  });


  /*
   * Colores
   */

  document.querySelectorAll(".color-option").forEach(button => {

    button.addEventListener("click", () => {

      changeCustomizerColor(button.dataset.color);

    });

  });

  /*
 * COLOR PERSONALIZADO
 */

const customColorPicker =
  document.getElementById("customColorPicker");

const customColorPickerBox =
  document.querySelector(".custom-color-picker");


if (customColorPicker) {

  customColorPicker.addEventListener("input", () => {

    const color = customColorPicker.value;

    changeCustomizerCustomColor(color);

  });

}
  

  /*
   * Tallas
   */

  document.querySelectorAll(".size-option").forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".size-option")
        .forEach(btn => btn.classList.remove("active"));

      button.classList.add("active");

      customizerState.size = button.textContent.trim();

      const summarySize = document.getElementById("summarySize");

      if (summarySize) {

        summarySize.textContent =
          customizerState.size;

      }

    });

  });

  /* =========================================================
   SUBIR DISEÑO
========================================================= */

const designUpload =
  document.getElementById("designUpload");

if (designUpload) {

  designUpload.addEventListener("change", function() {

    const file = this.files[0];

    if (!file) return;

    uploadDesign(file);

  });

}


  /*
   * Inicializar Fabric
   */

  initCustomizer();

});


/* =========================================================
   ELIMINAR DISEÑO SELECCIONADO con tecla suprimir o eliminar
========================================================= */

document.addEventListener("keydown", function(e) {

  if (!designCanvas) return;

  const activeObject = designCanvas.getActiveObject();

  if (!activeObject) return;

  // Evitar borrar mientras se escribe en un input
  const tag = document.activeElement.tagName;

  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (e.key === "Delete" || e.key === "Backspace") {

    designCanvas.remove(activeObject);

    designCanvas.discardActiveObject();

    designCanvas.renderAll();

  }

});

// Funcion de boton eliminar diseño

const deleteDesignBtn = document.getElementById("deleteDesignBtn");

if (deleteDesignBtn) {

  deleteDesignBtn.addEventListener("click", function() {

    if (!designCanvas) return;

    const activeObject = designCanvas.getActiveObject();

    if (!activeObject) {
      alert("Selecciona un diseño para eliminarlo.");
      return;
    }

    designCanvas.remove(activeObject);
    designCanvas.discardActiveObject();
    designCanvas.renderAll();

  });

}
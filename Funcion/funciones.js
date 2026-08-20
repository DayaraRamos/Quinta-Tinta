// ====== CONFIGURA AQUÍ ======
  const WHATSAPP_NUMBER = "573103492858"; // TODO: reemplaza por tu número real (código país + número, sin +)
  const STORE_NAME = "Quinta Tinta";
  // =============================

  const CATS = {
    camisetas: { label: "Camisetas", tint: "227,28,121" },   // magenta
    pocillos:  { label: "Pocillos",  tint: "0,169,206" },    // cyan
    buzos:     { label: "Buzos / Sudaderas", tint: "240,190,0" },
    crea:      { label: "Crea tu prenda", tint: "240,190,0" } // yellow
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

  // =========================================================
// PEDIDOS PERSONALIZADOS diseño
// =========================================================

function generarReferenciaPersonalizada() {

  let contador = parseInt(
    localStorage.getItem("qtCustomCounter") || "0"
  );

  contador++;

  localStorage.setItem(
    "qtCustomCounter",
    contador
  );

  return `QT-CAM-PER-${String(contador).padStart(3, "0")}`;
}

  
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

  // =========================================================
// AGREGAR PRENDA PERSONALIZADA AL PEDIDO
// =========================================================

// =========================================================
// AGREGAR PRENDA PERSONALIZADA AL PEDIDO
// =========================================================

// =========================================================
// AGREGAR PRENDA PERSONALIZADA AL PEDIDO
// =========================================================

async function addCustomProductToOrder() {

  // =====================================================
  // GUARDAR VISTA ORIGINAL
  // =====================================================

  const vistaOriginal = customizerState.view;


  // =====================================================
  // VERIFICAR FABRIC
  // =====================================================

  if (!designCanvas) {

    alert(
      "El personalizador todavía no está listo."
    );

    return;
  }


  // =====================================================
  // GUARDAR VISTA ACTUAL
  // =====================================================

  saveCurrentCanvasState();


  // =====================================================
  // VERIFICAR DISEÑOS
  // =====================================================

  const tieneFrente =
    canvasStates.frente &&
    canvasStates.frente.objects &&
    canvasStates.frente.objects.length > 0;

  const tieneEspalda =
    canvasStates.espalda &&
    canvasStates.espalda.objects &&
    canvasStates.espalda.objects.length > 0;


  if (!tieneFrente && !tieneEspalda) {

    alert(
      "Primero debes subir y colocar un diseño en la camiseta."
    );

    return;
  }


  // =====================================================
  // CONFIGURACIÓN
  // =====================================================

  const color =
    customizerState.color;

  const size =
    customizerState.size;


  // =====================================================
  // GENERAR REFERENCIA
  // =====================================================

  const reference =
    generarReferenciaPersonalizada();


  // =====================================================
  // ID DEL PRODUCTO
  // =====================================================

  const customId =
    `custom-${Date.now()}`;


  // =====================================================
  // VARIABLES PARA LOS MOCKUPS
  // =====================================================

  let designFront = null;
  let designBack = null;


  // =====================================================
  // GENERAR MOCKUP DEL FRENTE
  // =====================================================

  if (tieneFrente) {

    customizerState.view = "frente";

    loadCanvasState("frente");

    // Esperar a que Fabric termine de cargar
    await new Promise(resolve => {
      setTimeout(resolve, 200);
    });

    designFront =
      await generarImagenDiseno("frente");

  }


  // =====================================================
  // GENERAR MOCKUP DE LA ESPALDA
  // =====================================================

  if (tieneEspalda) {

    customizerState.view = "espalda";

    loadCanvasState("espalda");

    // Esperar a que Fabric termine de cargar
    await new Promise(resolve => {
      setTimeout(resolve, 200);
    });

    designBack =
      await generarImagenDiseno("espalda");

  }


  // =====================================================
  // RESTAURAR LA VISTA QUE TENÍA EL USUARIO
  // =====================================================

  restaurarVistaCustomizer(vistaOriginal);


  // =====================================================
  // CREAR PRODUCTO PERSONALIZADO
  // =====================================================

  const customProduct = {

    id: customId,

    name: "Camiseta personalizada",

    cat: "crea",

    reference: reference,

    custom: true,

    images: []

  };


  // =====================================================
  // GUARDAR EN EL PEDIDO
  // =====================================================

  order[customId] = {

    product: customProduct,

    qty: 1,

    customization: {

      color: color,

      size: size,

      designs: {

        frente: designFront,

        espalda: designBack

      }

    }

  };


  // =====================================================
  // ACTUALIZAR CARRITO
  // =====================================================

  updateCartCount();

  renderDrawer();


  // =====================================================
  // ABRIR PEDIDO
  // =====================================================

  openDrawer();


  // =====================================================
  // CONFIRMACIÓN
  // =====================================================

  alert(
  `¡Prenda agregada al pedido! 🎨\n\n` +
  `Referencia: ${reference}\n\n` +
  `Tus imágenes personalizadas ya están listas.\n\n` +
  `📥 Descarga las imágenes de frente y/o espalda ` +
  `desde "Tu pedido" y envíalas por el chat de WhatsApp ` +
  `para que podamos verificar tu referencia.\n\n` +
  `¡Gracias por confiar en Quinta Tinta! 💜`
);

}


// =========================================================
// RESTAURAR VISTA DEL PERSONALIZADOR
// =========================================================

function restaurarVistaCustomizer(view) {

  if (!designCanvas) return;

  const mockupImage =
    document.getElementById("mockupImage");

  const mockupColorLayer =
    document.getElementById("mockupColorLayer");

  const imagePath =
    view === "frente"
      ? "img/camisas/frente.png"
      : "img/camisas/espalda.png";


  if (mockupImage) {

    mockupImage.src =
      imagePath;

  }


  if (mockupColorLayer) {

    mockupColorLayer.style.webkitMaskImage =
      `url("${imagePath}")`;

    mockupColorLayer.style.maskImage =
      `url("${imagePath}")`;

  }


  customizerState.view =
    view;


  loadCanvasState(view);


  document.querySelectorAll(".view-btn").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.view === view
    );

  });

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

  const items = Object.values(order).sort((a, b) => {

  // Las prendas personalizadas siempre aparecen primero
  if (a.product.custom && !b.product.custom) return -1;
  if (!a.product.custom && b.product.custom) return 1;

  return 0;

});

  if(items.length === 0){

    list.innerHTML = `
      <p class="drawer-empty">
        Aún no has agregado diseños.<br>
        Explora el catálogo y da clic en
        "Agregar a pedido".
      </p>
    `;

    return;
  }

  list.innerHTML = items.map(({product, qty, customization}) => {

    // =====================================================
    // PRODUCTO PERSONALIZADO
    // =====================================================

    if(product.custom){

      const color = customization?.color || "No especificado";
      const size = customization?.size || "No especificada";

      const colorNames = {

        blanco: "Blanco",
        negro: "Negro",
        rosado: "Rosado",
        morado: "Morado",
        azul: "Azul"

      };

      const colorMostrar =
        colorNames[color] || color.toUpperCase();

      return `

        <div class="drawer-item custom-drawer-item">

          <div
            class="di-swatch"
            style="
              background:
              linear-gradient(
                135deg,
                #E6127F,
                #7135C9
              );
            "
          ></div>

          <div class="di-info">

  <h5>
    ${product.name}
  </h5>

  <span>
    Personalizada · ${product.reference}
  </span>

  <small>
    Color: ${colorMostrar}
    · Talla: ${size}
  </small>

  <div class="custom-order-help">

  <strong>⚠️ ACCIÓN REQUERIDA</strong>

  <p>
    Tu prenda personalizada está lista.
  </p>

  <p>
    <b>1.</b> Descarga tu diseño.<br>
    <b>2.</b> Envía la imagen por WhatsApp.<br>
    <b>3.</b> Indica la referencia
    <b>${product.reference}</b>.
  </p>

</div>

</div>

          <div class="di-qty">

            <button
              onclick="changeQty('${product.id}',-1)"
              aria-label="Menos"
            >
              −
            </button>

            <span class="mono">
              ${qty}
            </span>

            <button
              onclick="changeQty('${product.id}',1)"
              aria-label="Más"
            >
              +
            </button>

          </div>

        </div>

        <div class="custom-designs">

  ${customization?.designs?.frente ? `
    <button
      class="custom-download-btn"
      onclick="descargarDiseno('${product.id}', 'frente')"
    >
      ⬇ Descargar diseño · Frente
    </button>
  ` : ""}

  ${customization?.designs?.espalda ? `
    <button
      class="custom-download-btn"
      onclick="descargarDiseno('${product.id}', 'espalda')"
    >
      ⬇ Descargar diseño · Espalda
    </button>
  ` : ""}

</div>

<button
  class="di-remove"
  onclick="removeItem('${product.id}')"
  style="align-self:flex-start;"
>
  Quitar
</button>

      `;

    }


    // =====================================================
    // PRODUCTO NORMAL
    // =====================================================

    const c = CATS[product.cat].tint;

    return `

      <div class="drawer-item">

        <div
          class="di-swatch"
          style="
            background:
            linear-gradient(
              135deg,
              rgb(${c}),
              var(--ink)
            );
          "
        ></div>

        <div class="di-info">

          <h5>
            ${product.name}
          </h5>

          <span>
            ${CATS[product.cat].label}
            · Ref.
            ${String(product.id).padStart(3,'0')}
          </span>

        </div>

        <div class="di-qty">

          <button
            onclick="changeQty(${product.id},-1)"
            aria-label="Menos"
          >
            −
          </button>

          <span class="mono">
            ${qty}
          </span>

          <button
            onclick="changeQty(${product.id},1)"
            aria-label="Más"
          >
            +
          </button>

        </div>

      </div>

      <button
        class="di-remove"
        onclick="removeItem(${product.id})"
        style="align-self:flex-start;"
      >
        Quitar
      </button>

    `;

  }).join("");

}

  function buildOrderMessage(){

  const items = Object.values(order);

  if(items.length === 0) {

    return `Hola ${STORE_NAME}, quiero información sobre sus diseños.`;

  }

  let msg =
    `Hola ${STORE_NAME}, quiero cotizar este pedido:\n\n`;

  items.forEach(({product, qty, customization}) => {

    // =====================================================
    // PRENDA PERSONALIZADA
    // =====================================================

    if(product.custom){

      const colorNames = {

        blanco: "Blanco",
        negro: "Negro",
        rosado: "Rosado",
        morado: "Morado",
        azul: "Azul"

      };

      const color =
        colorNames[customization?.color]
        || customization?.color
        || "No especificado";

      const size =
        customization?.size
        || "No especificada";

      msg +=
        `👕 ${product.name}\n` +
        `Ref: ${product.reference}\n` +
        `Color: ${color}\n` +
        `Talla: ${size}\n` +
        `Cantidad: ${qty}\n\n`;

    }

    // =====================================================
    // PRODUCTO NORMAL
    // =====================================================

    else {

      msg +=
        `• ${product.name} ` +
        `(${CATS[product.cat].label}) ` +
        `x${qty}\n`;

    }

  });

  msg +=
    `\n¿Me confirman disponibilidad, ` +
    `precio y tiempo de entrega?`;

  return msg;

}

  function buildQuickMessage(pid){
    const product = PRODUCTS.find(p=>p.id===pid);
    return `Hola ${STORE_NAME}, quiero cotizar el diseño "${product.name}" (${CATS[product.cat].label}, Ref. ${String(product.id).padStart(3,'0')}).`;
  }

  function waUrl(text){
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function updateWaLinks() {

  const generic = waUrl(
    `Hola ${STORE_NAME}, quiero más información sobre sus diseños.`
  );

  const botonPrincipal =
    document.getElementById("botonprincipal");

  const fabWaLink =
    document.getElementById("fabWaLink");

  const sendOrderWa =
    document.getElementById("sendOrderWa");


  // ==========================================
  // ENLACES GENERALES
  // ==========================================

  if (botonPrincipal) {

    botonPrincipal.href = generic;

  }


  if (fabWaLink) {

    fabWaLink.href = generic;

  }


  // ==========================================
  // BOTÓN DE PEDIDO
  // ==========================================

  if (!sendOrderWa) return;


  // ==========================================
  // PEDIDO VACÍO
  // ==========================================

  if (Object.keys(order).length === 0) {

    sendOrderWa.href = "#";

    sendOrderWa.onclick = function(e) {

      e.preventDefault();

      alert(
        "Tu pedido está vacío. " +
        "Agrega al menos un diseño antes de enviarlo por WhatsApp."
      );

      return false;

    };

    return;

  }


  // ==========================================
  // BUSCAR PRENDAS PERSONALIZADAS
  // ==========================================

  const personalizados =
    Object.values(order).filter(
      item => item.product.custom
    );


  // ==========================================
  // VERIFICAR DESCARGAS
  // ==========================================

  let faltanDescargas = false;


  personalizados.forEach(item => {

    const designs =
      item.customization?.designs || {};

    const downloaded =
      item.downloaded || {};


    // Frente existe pero no se descargó
    if (
      designs.frente &&
      !downloaded.frente
    ) {

      faltanDescargas = true;

    }


    // Espalda existe pero no se descargó
    if (
      designs.espalda &&
      !downloaded.espalda
    ) {

      faltanDescargas = true;

    }

  });


  // ==========================================
  // SI FALTAN DESCARGAS
  // ==========================================

  if (faltanDescargas) {

    sendOrderWa.href = "#";

    sendOrderWa.onclick = function(e) {

      e.preventDefault();

      alert(
        "⚠️ Antes de enviar tu pedido\n\n" +

        "Tienes una prenda personalizada " +
        "que todavía requiere descargar " +
        "su diseño.\n\n" +

        "⬇️ Descarga la imagen de frente " +
        "y/o espalda desde \"Tu pedido\".\n\n" +

        "Después envía esas imágenes por WhatsApp " +
        "junto con la referencia de tu prenda."
      );

      return false;

    };

    return;

  }


  // ==========================================
  // TODO CORRECTO → WHATSAPP
  // ==========================================

  sendOrderWa.href =
    waUrl(buildOrderMessage());

  sendOrderWa.onclick = null;

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

let canvasStates = {
  frente: null,
  espalda: null
};

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
  stopContextMenu: true,

  // En móviles permitimos que el navegador
  // pueda hacer scroll cuando el usuario toca
  // una zona vacía del canvas.
  allowTouchScrolling: true
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

  // =========================================================
// CONTROL TÁCTIL EN CELULAR
// =========================================================

let touchStartX = 0;
let touchStartY = 0;
let touchOnObject = false;

canvasElement.addEventListener("touchstart", function(e) {

  if (e.touches.length !== 1) return;

  const touch = e.touches[0];

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;

  const pointer = designCanvas.getPointer(e);

  const target = designCanvas.findTarget(e, false);

  touchOnObject = !!target;

}, { passive: true });


canvasElement.addEventListener("touchmove", function(e) {

  if (e.touches.length !== 1) return;

  // Si el usuario está tocando un objeto,
  // Fabric puede manejar el movimiento.
  if (touchOnObject) return;

  const touch = e.touches[0];

  const deltaX = Math.abs(touch.clientX - touchStartX);
  const deltaY = Math.abs(touch.clientY - touchStartY);

  // Si está haciendo un gesto vertical,
  // dejamos que el navegador haga scroll.
  if (deltaY > deltaX && deltaY > 5) {

    e.stopPropagation();

  }

}, { passive: true });
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

      // AGREGAR EL NUEVO DISEÑO
      designCanvas.add(img);

      // SELECCIONARLO
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
   GUARDAR DISEÑOS DE LA VISTA ACTUAL
========================================================= */

function saveCurrentCanvasState() {

  if (!designCanvas) return;

  const currentView = customizerState.view;

  canvasStates[currentView] = designCanvas.toJSON();

  console.log(
    "GUARDADO:",
    currentView,
    canvasStates[currentView]
  );
}

/* =========================================================
   CARGAR DISEÑOS DE UNA VISTA
========================================================= */

function loadCanvasState(view) {

  if (!designCanvas) return;

  const state = canvasStates[view];

  // Primero eliminamos lo que esté actualmente en el canvas
  designCanvas.clear();

  // Si esa vista todavía no tiene diseños
  if (!state) {
    designCanvas.renderAll();

    console.log("SIN DISEÑOS EN:", view);

    return;
  }

  // Cargar exclusivamente los diseños de esa vista
  designCanvas.loadFromJSON(state, function() {

    designCanvas.renderAll();

    console.log(
      "CARGADO:",
      view,
      "Objetos:",
      designCanvas.getObjects().length
    );

  });
}

// =========================================================
// GENERAR IMAGEN DEL DISEÑO PERSONALIZADO
// =========================================================

// =========================================================
// GENERAR MOCKUP COMPLETO DE LA PRENDA
// =========================================================

// =========================================================
// GENERAR MOCKUP COMPLETO
// CAMISETA + COLOR + DISEÑO
// =========================================================

function generarImagenDiseno(view) {

  return new Promise((resolve) => {

    if (!designCanvas) {
      resolve(null);
      return;
    }

    const state = canvasStates[view];

    if (
      !state ||
      !state.objects ||
      state.objects.length === 0
    ) {
      resolve(null);
      return;
    }

    const mockupPath =
      view === "frente"
        ? "img/camisas/frente.png"
        : "img/camisas/espalda.png";


    // =====================================================
    // CREAR IMAGEN DEL MOCKUP
    // =====================================================

    const mockupImg = new Image();

    mockupImg.crossOrigin = "anonymous";


    mockupImg.onload = function () {

      // ===================================================
      // DIMENSIONES
      // ===================================================

      const width =
        mockupImg.naturalWidth;

      const height =
        mockupImg.naturalHeight;


      // ===================================================
      // CANVAS FINAL
      // ===================================================

      const finalCanvas =
        document.createElement("canvas");

      finalCanvas.width = width;
      finalCanvas.height = height;

      const ctx =
        finalCanvas.getContext("2d");


      // ===================================================
      // 1. DIBUJAR MOCKUP ORIGINAL
      // ===================================================

      ctx.drawImage(
        mockupImg,
        0,
        0,
        width,
        height
      );


      // ===================================================
      // 2. CREAR MÁSCARA DE COLOR
      // ===================================================

      const colorCanvas =
        document.createElement("canvas");

      colorCanvas.width = width;
      colorCanvas.height = height;

      const colorCtx =
        colorCanvas.getContext("2d");


      // Dibujamos el mockup como máscara
      colorCtx.drawImage(
        mockupImg,
        0,
        0,
        width,
        height
      );


      // ===================================================
      // COLOR SELECCIONADO
      // ===================================================

      let color = "#FFFFFF";

      const colores = {

        blanco: "#FFFFFF",
        negro: "#171717",
        rosado: "#E91E73",
        morado: "#7135C9",
        azul: "#2878C8"

      };


      if (customizerState.color.startsWith("#")) {

        color =
          customizerState.color;

      } else {

        color =
          colores[customizerState.color]
          || "#FFFFFF";

      }


      // ===================================================
      // COLOCAR COLOR DENTRO DE LA SILUETA
      // ===================================================

      colorCtx.globalCompositeOperation =
        "source-in";

      colorCtx.fillStyle =
        color;

      colorCtx.fillRect(
        0,
        0,
        width,
        height
      );


      // ===================================================
      // APLICAR COLOR SOBRE EL MOCKUP
      // ===================================================

      ctx.save();

      ctx.globalAlpha = 0.82;

      ctx.globalCompositeOperation =
        "multiply";

      ctx.drawImage(
        colorCanvas,
        0,
        0
      );

      ctx.restore();


      // ===================================================
      // 3. OBTENER DISEÑO DE FABRIC
      // ===================================================

      const designData =
        designCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier:
            width / designCanvas.getWidth()
        });


      const designImg =
        new Image();


      designImg.onload = function () {

        // ================================================
        // CALCULAR POSICIÓN
        // ================================================

        const scaleX =
          width /
          designCanvas.getWidth();

        const scaleY =
          height /
          designCanvas.getHeight();


        ctx.save();

        ctx.scale(
          scaleX,
          scaleY
        );


        // ================================================
        // DIBUJAR DISEÑO
        // ================================================

        ctx.drawImage(
          designImg,
          0,
          0,
          designCanvas.getWidth(),
          designCanvas.getHeight()
        );


        ctx.restore();


        // ================================================
        // EXPORTAR
        // ================================================

        resolve(
          finalCanvas.toDataURL(
            "image/png",
            1
          )
        );

      };


      designImg.onerror = function () {

        console.error(
          "No se pudo cargar el diseño."
        );

        resolve(null);

      };


      designImg.src =
        designData;

    };


    mockupImg.onerror = function () {

      console.error(
        "No se pudo cargar el mockup:",
        mockupPath
      );

      resolve(null);

    };


    mockupImg.src =
      mockupPath;

  });

}


// =========================================================
// CAPTURAR MOCKUP COMPLETO
// =========================================================

function capturarMockup(view, resolve) {

  const stage =
    document.getElementById("mockupStage");

  if (!stage) {

    resolve(null);

    return;
  }

  html2canvas(stage, {

    backgroundColor: null,

    scale: 2,

    useCORS: true,

    allowTaint: false

  }).then(canvas => {

    resolve(
      canvas.toDataURL("image/png", 1)
    );

  }).catch(error => {

    console.error(
      "Error generando mockup:",
      error
    );

    resolve(null);

  });

}


// =========================================================
// DESCARGAR DISEÑO PERSONALIZADO
// =========================================================

function descargarDiseno(customId, view) {

  const item = order[customId];

  if (!item || !item.customization) {

    alert("No se encontró el diseño personalizado.");

    return;
  }

  const dataURL =
    item.customization.designs?.[view];

  if (!dataURL) {

    alert(
      `No hay un diseño personalizado para la vista ${view}.`
    );

    return;
  }

  // ==========================================
  // CREAR REGISTRO DE DESCARGA
  // ==========================================

  if (!item.downloaded) {

    item.downloaded = {};

  }

  item.downloaded[view] = true;

  // ==========================================
  // DESCARGAR
  // ==========================================

  const link =
    document.createElement("a");

  link.href = dataURL;

  link.download =
    `${item.product.reference}-${view}.png`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  // ==========================================
  // ACTUALIZAR PEDIDO
  // ==========================================

  renderDrawer();

  updateWaLinks();

}


function changeCustomizerView(view) {

  if (!designCanvas) return;

  // Si ya estamos en esa vista, no hacemos nada
  if (customizerState.view === view) return;


  /* =========================================================
     1. GUARDAR LA VISTA ACTUAL
  ========================================================= */

  saveCurrentCanvasState();


  // Guardar imagen de la vista actual
if (designCanvas.getObjects().length > 0) {

  canvasStates[customizerState.view].image =
    designCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2
    });

}


  /* =========================================================
     2. CAMBIAR LA VISTA
  ========================================================= */

  customizerState.view = view;


  /* =========================================================
     3. ELEMENTOS DEL MOCKUP
  ========================================================= */

  const mockupImage =
    document.getElementById("mockupImage");

  const mockupColorLayer =
    document.getElementById("mockupColorLayer");

  if (!mockupImage || !mockupColorLayer) return;


  /* =========================================================
     4. DETERMINAR IMAGEN
  ========================================================= */

  let imagePath;

  if (view === "frente") {

    imagePath = "img/camisas/frente.png";

  } else {

    imagePath = "img/camisas/espalda.png";

  }


  /* =========================================================
     5. CAMBIAR MOCKUP
  ========================================================= */

  mockupImage.src = imagePath;


  /* =========================================================
     6. CAMBIAR MÁSCARA DE COLOR
  ========================================================= */

  mockupColorLayer.style.webkitMaskImage =
    `url("${imagePath}")`;

  mockupColorLayer.style.maskImage =
    `url("${imagePath}")`;


  /* =========================================================
     7. CARGAR SOLAMENTE LOS DISEÑOS DE ESTA VISTA
  ========================================================= */

  loadCanvasState(view);


  /* =========================================================
     8. BOTÓN ACTIVO
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

// /* =========================================================
//    SUBIR DISEÑO A FABRIC.JS
// ========================================================= */

// function uploadDesign(file) {

//   if (!designCanvas || !file) return;

//   const reader = new FileReader();

//   reader.onload = function(event) {

//     fabric.Image.fromURL(event.target.result, function(img) {

//       /*
//        * Tamaño inicial del diseño
//        */

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

//         /*
//          * Permitir interacción
//          */

//         selectable: true,
//         evented: true
//       });

//       designCanvas.add(img);

//       designCanvas.setActiveObject(img);

//       designCanvas.renderAll();

//     });

//   };

//   reader.readAsDataURL(file);
// }

/* =========================================================
   EVENTOS DEL CONFIGURADOR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
// BOTÓN AGREGAR PRENDA PERSONALIZADA
// =========================================================

const addCustomProduct =
  document.getElementById("addCustomProduct");

if (addCustomProduct) {

  addCustomProduct.addEventListener("click", function() {

    addCustomProductToOrder();

  });

}

  /** Frente / espalda*/

  document.querySelectorAll(".view-btn").forEach(button => {

    button.addEventListener("click", () => {

      changeCustomizerView(button.dataset.view);

    });

  });


  /** Colores*/

  document.querySelectorAll(".color-option").forEach(button => {

    button.addEventListener("click", () => {

      changeCustomizerColor(button.dataset.color);

    });

  });

  /**COLOR PERSONALIZADO*/

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
  

  /** Tallas*/

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

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const categoria = params.get("categoria");

    if (!categoria) return;

    if (categoria === "crea") {

        const seccion = document.getElementById("disena");

        if (seccion) {
            seccion.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        return;
    }

    if (
        categoria === "camisetas" ||
        categoria === "pocillos" ||
        categoria === "buzos"
    ) {
        filterAndScroll(categoria);
    }

});
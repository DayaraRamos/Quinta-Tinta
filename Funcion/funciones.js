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

        <div class="swatch" style="background:linear-gradient(135deg, rgb(${c}) 0%, var(--ink) 140%);">
  ${p.images && p.images.length > 0 ? `
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
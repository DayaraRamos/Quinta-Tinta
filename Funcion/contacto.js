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

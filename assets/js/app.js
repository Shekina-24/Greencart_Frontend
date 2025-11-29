// =======================================================
// GreenCart — Script principal (version claire + panier)
// =======================================================

// ----- Utilitaires -----
const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);
const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
const openModal  = (id) => { const m = $(`#${id}`); if (m) m.style.display = 'grid'; };
const closeModal = (id) => { const m = $(`#${id}`); if (m) m.style.display = 'none'; };

// ----- Données de démonstration -----
const PRODUCTS = [
  { id:1, name:'Pommes moches (5kg)',          price:6.5, region:'Île-de-France', category:'Fruits',     availability:'surplus', co2_saved:2.1, img:'https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=1200&auto=format&fit=crop' },
  { id:2, name:'Légumes variés B (4kg)',        price:7.9, region:'Hauts-de-France', category:'Légumes', availability:'surplus', co2_saved:2.9, img:'https://images.unsplash.com/photo-1515542706656-8e6ef17a1521?q=80&w=1200&auto=format&fit=crop' },
  { id:3, name:'Yaourts fermiers (x12)',        price:5.5, region:'Bretagne',       category:'Crèmerie',  availability:'normal',  co2_saved:0.6, img:'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1200&auto=format&fit=crop' },
  { id:4, name:'Pains de la veille (x4)',       price:2.0, region:'Île-de-France',  category:'Boulangerie',availability:'surplus',co2_saved:1.2, img:'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=1200&auto=format&fit=crop' },
  { id:5, name:'Tomates irrégulières (3kg)',    price:4.9, region:'Provence-Alpes-Côte d\'Azur', category:'Légumes', availability:'surplus', co2_saved:2.3, img:'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1200&auto=format&fit=crop' },
  { id:6, name:'Fromage de chèvre (demi)',      price:3.9, region:'Auvergne-Rhône-Alpes', category:'Crèmerie', availability:'normal', co2_saved:0.4, img:'https://images.unsplash.com/photo-1505575972945-2804b5c35f33?q=80&w=1200&auto=format&fit=crop' }
];

// ----- Initialisation des filtres -----
const CATS    = [...new Set(PRODUCTS.map(p => p.category))];
const REGIONS = [...new Set(PRODUCTS.map(p => p.region))];
const selCat = $('#f-cat');
const selRegion = $('#f-region');

if (selCat && selRegion) {
  CATS.forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; selCat.appendChild(o); });
  REGIONS.forEach(r => { const o=document.createElement('option'); o.value=r; o.textContent=r; selRegion.appendChild(o); });
}

// ----- KPIs (démo) -----
const sum = (arr, fn) => arr.reduce((a, b) => a + fn(b), 0);
const kpiCO2   = sum(PRODUCTS, p => p.co2_saved).toFixed(1);
const kpiMoney = (sum(PRODUCTS, p => p.price) * 3).toFixed(0);
const kpiProds = 42;

$('#kpi-co2')        && ($('#kpi-co2').textContent = `${kpiCO2} kg`);
$('#kpi-euros')      && ($('#kpi-euros').textContent = `${kpiMoney}€`);
$('#kpi-producteurs')&& ($('#kpi-producteurs').textContent = kpiProds);

// ----- Affichage catalogue -----
const grid = $('#catalog-grid');
const featured = $('#featured');

function productCard(p){
  const el = document.createElement('article');
  el.className = 'card product';
  el.innerHTML = `
    <img src="${p.img}" alt="${p.name}" loading="lazy"/>
    <div class="meta">
      <strong>${p.name}</strong>
      <span class="chip">${p.availability === 'surplus' ? 'Anti-gaspi' : 'Standard'}</span>
    </div>
    <div class="muted">${p.category} • ${p.region}</div>
    <div class="meta">
      <strong>${p.price.toFixed(2)} €</strong>
      <span class="muted">≈ ${p.co2_saved} kg CO₂</span>
    </div>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button class="btn btn--primary" onclick="addToCart(${p.id})">Ajouter au panier</button>
      <button class="btn" aria-label="Voir ${p.name}" onclick="openProduct(${p.id})">Voir</button>
    </div>
  `;
  return el;
}

function render(list){
  if (!grid) return;
  grid.innerHTML = '';
  list.forEach(p => grid.appendChild(productCard(p)));
}

function renderFeatured(){
  if (!featured) return;
  featured.innerHTML = '';
  PRODUCTS.filter(p => p.availability === 'surplus').slice(0, 3).forEach(p => featured.appendChild(productCard(p)));
}

// ----- Filtres -----
function filters(){
  const q = $('#f-q')?.value.toLowerCase() || '';
  const cat = selCat?.value || '';
  const reg = selRegion?.value || '';
  const dispo = $('#f-dispo')?.value || '';
  return PRODUCTS.filter(p =>
    (!cat || p.category === cat) &&
    (!reg || p.region === reg) &&
    (!dispo || p.availability === dispo) &&
    (!q || p.name.toLowerCase().includes(q))
  );
}

$('#f-cat')    && $('#f-cat').addEventListener('change',  () => render(filters()));
$('#f-region') && $('#f-region').addEventListener('change',() => render(filters()));
$('#f-dispo')  && $('#f-dispo').addEventListener('change',() => render(filters()));
$('#f-q')      && $('#f-q').addEventListener('input',     () => render(filters()));
$('#btn-reset')&& $('#btn-reset').addEventListener('click',() => {
  if (!selCat || !selRegion) return;
  selCat.value = ''; selRegion.value = '';
  $('#f-dispo').value = ''; $('#f-q').value = '';
  render(PRODUCTS);
});

// ----- Fiche produit (modal) -----
function openProduct(id){
  const p = PRODUCTS.find(x => x.id === id); if (!p) return;
  const body = $('#modal-body'); if (!body) return;
  body.innerHTML = `
    <div style="display:grid;gap:12px">
      <img src="${p.img}" alt="${p.name}" style="width:100%;height:220px;object-fit:cover;border-radius:12px;border:1px solid var(--line)"/>
      <h4>${p.name}</h4>
      <div class="muted">${p.category} • ${p.region}</div>
      <div><strong>${p.price.toFixed(2)} €</strong> <span class="muted">| ≈ ${p.co2_saved} kg CO₂ évités</span></div>
      <p class="muted">Description (démo) : lot issu de surplus / calibrage irrégulier. Qualité contrôlée par le producteur.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn--primary" onclick="addToCart(${p.id})">Ajouter au panier</button>
        <button class="btn" onclick="closeModal('modal-product')">Fermer</button>
      </div>
    </div>`;
  openModal('modal-product');
}

// ----- Auth (démo) -----
function fakeLogin(e){ e.preventDefault(); closeModal('modal-login'); alert('Connecté (démo).'); }
function fakeRegister(e){ e.preventDefault(); closeModal('modal-register'); alert('Compte créé (démo).'); }
$('#btn-login')    && ($('#btn-login').onclick = () => openModal('modal-login'));
$('#btn-register') && ($('#btn-register').onclick = () => openModal('modal-register'));

// ----- Espace Producteur (démo) -----
$('#btn-pro') && ($('#btn-pro').onclick = () => alert('Espace producteur — à implémenter (démo).'));

// =======================================================
// PANIER (modale)
// =======================================================
let CART = []; // {id, name, price, co2_saved, qty, ...}

function cartCount() {
  return CART.reduce((a,b) => a + b.qty, 0);
}
function cartTotals() {
  const total = CART.reduce((a,b)=> a + b.price * b.qty, 0);
  const co2   = CART.reduce((a,b)=> a + b.co2_saved * b.qty, 0);
  return { total, co2 };
}

function addToCart(id){
  const p = PRODUCTS.find(x => x.id === id); if (!p) return;
  const found = CART.find(i => i.id === id);
  if (found) found.qty += 1;
  else CART.push({ ...p, qty: 1 });
  renderCart();
  // petit feedback visuel sur le bouton panier
  const btn = $('#btn-cart');
  if (btn) { btn.classList.add('btn--primary'); setTimeout(()=>btn.classList.remove('btn--primary'), 400); }
}

function decQty(id){
  const it = CART.find(i=>i.id===id); if(!it) return;
  it.qty -= 1;
  if (it.qty <= 0) CART = CART.filter(i=>i.id!==id);
  renderCart();
}
function incQty(id){
  const it = CART.find(i=>i.id===id); if(!it) return;
  it.qty += 1;
  renderCart();
}
function removeFromCart(id){
  CART = CART.filter(i=>i.id!==id);
  renderCart();
}

function renderCart(){
  // compteur header
  $('#cart-count') && ($('#cart-count').textContent = cartCount());

  const list = $('#cart-items');
  if (!list) return;

  list.innerHTML = '';
  if (CART.length === 0) {
    list.innerHTML = '<p class="muted">Votre panier est vide.</p>';
  } else {
    CART.forEach(p=>{
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.style.display = 'grid';
      div.style.gap = '6px';
      div.innerHTML = `
        <strong>${p.name}</strong>
        <div class="muted">≈ ${(p.co2_saved * p.qty).toFixed(1)} kg CO₂</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn" onclick="decQty(${p.id})">−</button>
          <span>${p.qty} × ${p.price.toFixed(2)} €</span>
          <button class="btn" onclick="incQty(${p.id})">+</button>
          <button class="btn btn--danger" style="margin-left:auto" onclick="removeFromCart(${p.id})">Retirer</button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  const { total, co2 } = cartTotals();
  $('#cart-total') && ($('#cart-total').textContent = `${total.toFixed(2)} €`);
  $('#cart-co2')   && ($('#cart-co2').textContent   = `${co2.toFixed(1)} kg`);
}

// Ouvrir la modale Panier au clic
$('#btn-cart') && $('#btn-cart').addEventListener('click', () => {
  renderCart();
  openModal('modal-cart');
});

// Vider le panier
$('#btn-empty-cart') && $('#btn-empty-cart').addEventListener('click', () => {
  CART = [];
  renderCart();
});

// Valider le panier (démo)
$('#btn-checkout') && $('#btn-checkout').addEventListener('click', simulateCheckout);

// =======================================================
// TABLEAU DE BORD (démo) + Validation panier
// =======================================================
let DEMO_ORDERS = 0, DEMO_CO2 = 0, DEMO_EUROS = 0;
let WEEKLY_SAVINGS = 0;

function addDemoImpactFromCart() {
  const { total, co2 } = cartTotals();
  if (total <= 0) return;
  DEMO_ORDERS += 1;
  DEMO_CO2    += co2;
  DEMO_EUROS  += total;
  // estimation économies semaine: 15% du total validé (démo)
  WEEKLY_SAVINGS += total * 0.15;
  updateDashboard();
}

function updateDashboard(){
  $('#dash-orders') && ($('#dash-orders').textContent = DEMO_ORDERS);
  $('#dash-co2')    && ($('#dash-co2').textContent    = `${DEMO_CO2.toFixed(1)} kg`);
  $('#dash-money')  && ($('#dash-money').textContent  = `${DEMO_EUROS.toFixed(2)} €`);
  $('#weekly-savings') && ($('#weekly-savings').textContent = `${WEEKLY_SAVINGS.toFixed(2)} €`);
}

// Validation (démo)
function simulateCheckout(){
  if (CART.length === 0) return alert('Votre panier est vide.');
  const count = cartCount();
  const { total, co2 } = cartTotals();
  alert(`Merci !\n${count} article(s) validé(s).\nTotal: ${total.toFixed(2)} € • CO₂ évité: ${co2.toFixed(1)} kg (démo)`);
  addDemoImpactFromCart();
  CART = [];
  renderCart();
  closeModal('modal-cart');
  // focus tableau de bord
  const dash = document.getElementById('dashboard');
  dash && window.scrollTo({ top: dash.offsetTop - 60, behavior: 'smooth' });
}

// Bouton “Simuler une semaine” (optionnel s'il existe)
$('#simulate-week') && $('#simulate-week').addEventListener('click', ()=>{
  const added = 8 + Math.random()*22;
  WEEKLY_SAVINGS += added;
  updateDashboard();
});

// =======================================================
// Header sticky + Footer (année)
// =======================================================
(function(){
  const header = document.querySelector('.site-header');
  if(!header) return;
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

// =======================================================
// Boot
// =======================================================
function boot(){
  render(PRODUCTS);
  renderFeatured();
  updateDashboard();
  renderCart();
}
boot();

// Expose quelques fonctions utiles au scope global (pour les onclick HTML)
window.addToCart   = addToCart;
window.openProduct = openProduct;
window.closeModal  = closeModal;

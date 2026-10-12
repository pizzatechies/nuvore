const WHATSAPP = "254700000000"; // replace with the real Nuvoré WhatsApp number

const products = [
  { name: "Brisa Suave",       price: 650,  cat: "Fresh",    notes: "Citrus, sea breeze, white musk" },
  { name: "Luna Blanca",       price: 850,  cat: "Floral",   notes: "Jasmine, lily of the valley, vanilla" },
  { name: "Sol Dorado",        price: 1200, cat: "Fresh",    notes: "Bergamot, neroli, golden amber" },
  { name: "Rosa Eterna",       price: 1500, cat: "Floral",   notes: "Damask rose, peony, soft musk" },
  { name: "Noche Serena",      price: 1800, cat: "Oriental", notes: "Lavender, tonka bean, sandalwood" },
  { name: "Jardín Secreto",    price: 2200, cat: "Floral",   notes: "Magnolia, green leaves, pear blossom" },
  { name: "Bosque Encantado",  price: 2800, cat: "Woody",    notes: "Cedar, vetiver, olive leaf" },
  { name: "Amanecer",          price: 3500, cat: "Fresh",    notes: "Grapefruit, mint, ambergris" },
  { name: "Ámbar Real",        price: 4200, cat: "Oriental", notes: "Amber, saffron, oud" },
  { name: "Terciopelo Negro",  price: 5200, cat: "Woody",    notes: "Black pepper, leather, patchouli" },
  { name: "Pasión Ardiente",   price: 6500, cat: "Oriental", notes: "Red berries, cinnamon, dark vanilla" },
  { name: "Reina de Oro",      price: 8000, cat: "Extrait",  notes: "Rare oud, gold rose, Mysore sandalwood — pure extrait" }
];

const fmt = n => "KSh " + n.toLocaleString("en-KE");
const $ = id => document.getElementById(id);
let cart = {};
try { cart = JSON.parse(localStorage.getItem("nuvore-cart") || "{}"); } catch (e) {}
let filter = "All";

const bottle = i => {
  const h = 38 + (i * 7) % 20; // varied tint per product
  return `<svg viewBox="0 0 100 160" aria-hidden="true">
    <rect x="38" y="4" width="24" height="18" rx="3" fill="#bd9a21"/>
    <rect x="42" y="22" width="16" height="8" fill="#9a7c14"/>
    <circle cx="50" cy="95" r="52" fill="none" stroke="#bd9a21" stroke-width="2"/>
    <circle cx="50" cy="95" r="44" fill="hsl(${h},68%,${42 + (i % 4) * 4}%)"/>
    <text x="50" y="108" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="38" fill="#fff">N</text>
  </svg>`;
};

function renderFilters() {
  const cats = ["All", ...new Set(products.map(p => p.cat))];
  $("filters").innerHTML = cats.map(c => `<button class="${c === filter ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
}

function renderGrid() {
  $("grid").innerHTML = products.map((p, i) => ({ p, i }))
    .filter(({ p }) => filter === "All" || p.cat === filter)
    .map(({ p, i }) => `<article class="card">
      <div class="bottle">${bottle(i)}</div>
      <div class="info">
        <span class="cat">${p.cat}</span>
        <h3 class="name">${p.name}</h3>
        <p class="notes">${p.notes}</p>
        <div class="row"><span class="price">${fmt(p.price)}</span>
        <button class="add" data-i="${i}">Add to cart</button></div>
      </div></article>`).join("");
}

function save() { try { localStorage.setItem("nuvore-cart", JSON.stringify(cart)); } catch (e) {} renderCart(); }

function renderCart() {
  const ids = Object.keys(cart).filter(k => products[k]);
  const count = ids.reduce((s, k) => s + cart[k], 0);
  const total = ids.reduce((s, k) => s + cart[k] * products[k].price, 0);
  $("cartCount").textContent = count;
  $("cartTotal").textContent = fmt(total);
  $("cartItems").innerHTML = ids.length ? ids.map(k => `<li>
      <div><strong>${products[k].name}</strong><br>${fmt(products[k].price)}</div>
      <div class="qty"><button data-d="-1" data-k="${k}">−</button> ${cart[k]} <button data-d="1" data-k="${k}">+</button></div>
    </li>`).join("") : `<li class="empty">Your cart is empty.</li>`;
  const msg = "Hello Nuvoré, I'd like to order:\n" +
    ids.map(k => `• ${products[k].name} x${cart[k]} — ${fmt(products[k].price * cart[k])}`).join("\n") +
    `\nTotal: ${fmt(total)}`;
  $("checkout").href = ids.length ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}` : "#";
}

const toggle = open => {
  $("drawer").classList.toggle("open", open);
  $("scrim").classList.toggle("on", open);
  $("drawer").setAttribute("aria-hidden", !open);
};

$("filters").onclick = e => { if (e.target.dataset.c) { filter = e.target.dataset.c; renderFilters(); renderGrid(); } };
$("grid").onclick = e => { const i = e.target.dataset.i; if (i !== undefined) { cart[i] = (cart[i] || 0) + 1; save(); toggle(true); } };
$("cartItems").onclick = e => {
  const k = e.target.dataset.k; if (!k) return;
  cart[k] += +e.target.dataset.d;
  if (cart[k] <= 0) delete cart[k];
  save();
};
$("cartOpen").onclick = () => toggle(true);
$("cartClose").onclick = $("scrim").onclick = () => toggle(false);
$("checkout").onclick = e => { if ($("checkout").getAttribute("href") === "#") e.preventDefault(); };
$("waLink").href = `https://wa.me/${WHATSAPP}`;
$("yr").textContent = new Date().getFullYear();

renderFilters(); renderGrid(); renderCart();

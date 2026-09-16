const products=[
{id:"mlbb",name:"Mobile Legends",short:"MLBB",category:"games",unit:"Diamonds",icon:"ML",stock:"in",badge:"POPULAR",packages:[["86 Diamonds",1800],["172 Diamonds",3500],["257 Diamonds",5000],["706 Diamonds",13000]]},
{id:"freefire",name:"Free Fire",short:"FF",category:"games",unit:"Diamonds",icon:"FF",stock:"in",badge:"HOT",packages:[["100 Diamonds",2200],["310 Diamonds",6500],["520 Diamonds",10500],["1060 Diamonds",20500]]},
{id:"pubg",name:"PUBG Mobile",short:"PUBG",category:"games",unit:"UC",icon:"UC",stock:"low",badge:"DEAL",packages:[["60 UC",2500],["325 UC",12500],["660 UC",24000],["1800 UC",61000]]},
{id:"bloodstrike",name:"Blood Strike",short:"BS",category:"games",unit:"Gold",icon:"BS",stock:"in",badge:"NEW",packages:[["100 Gold",2000],["310 Gold",5800],["650 Gold",11500],["1350 Gold",22500]]},
{id:"capcut",name:"CapCut Pro",short:"CC",category:"services",unit:"Subscription",icon:"PRO",stock:"in",badge:"PRO",packages:[["1 Month",4500],["3 Months",12000],["6 Months",22000],["12 Months",39000]]},
{id:"youtuber",name:"YouTuber Pro",short:"YT",category:"services",unit:"Digital Service",icon:"YT",stock:"low",badge:"CREATOR",packages:[["Starter",15000],["Growth",30000],["Creator",55000],["Pro",95000]]}
];

const $=s=>document.querySelector(s);
const state={cart:JSON.parse(localStorage.getItem("cb_cart")||"[]"),orders:JSON.parse(localStorage.getItem("cb_orders")||"{}")};

function money(n){return new Intl.NumberFormat("en-US").format(n)+" KHR"}
function save(){localStorage.setItem("cb_cart",JSON.stringify(state.cart));localStorage.setItem("cb_orders",JSON.stringify(state.orders));updateCart()}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function stockText(s){return s==="in"?"● In Stock":s==="low"?"● Low Stock":"● Out of Stock"}

function renderProducts(){
 const q=$("#search").value.toLowerCase(), cat=$("#filter").value;
 const list=products.filter(p=>(cat==="all"||p.category===cat)&&(p.name.toLowerCase().includes(q)||p.unit.toLowerCase().includes(q)));
 $("#productGrid").innerHTML=list.map(p=>`
 <article class="product-card">
  <div class="product-top"><div class="game-icon">${p.icon}</div><div><h3>${p.name}</h3><p>${p.unit} top-up</p></div><span class="badge">${p.badge}</span></div>
  <div class="stock ${p.stock}">${stockText(p.stock)}</div>
  <div class="packages">${p.packages.map((x,i)=>`<button class="package" data-buy="${p.id}" data-index="${i}" ${p.stock==="out"?"disabled":""}><strong>${x[0]}</strong><span>${money(x[1])}</span></button>`).join("")}</div>
  <button class="buy" data-buy="${p.id}" data-index="0" ${p.stock==="out"?"disabled":""}>Buy Now →</button>
 </article>`).join("")||`<div class="status-box">No products found.</div>`;
 document.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>openCheckout(b.dataset.buy,Number(b.dataset.index))));
}
function addToCart(pid,idx,qty=1){
 const p=products.find(x=>x.id===pid), pack=p.packages[idx];
 const key=pid+"-"+idx;const found=state.cart.find(x=>x.key===key);
 if(found)found.qty+=qty;else state.cart.push({key,pid,idx,qty});
 save();toast(`${pack[0]} added to cart`);
}
function updateCart(){
 $("#cartCount").textContent=state.cart.reduce((a,x)=>a+x.qty,0);
 $("#cartItems").innerHTML=state.cart.length?state.cart.map(x=>{
  const p=products.find(y=>y.id===x.pid),pack=p.packages[x.idx];
  return `<div class="cart-item"><div class="cart-item-info"><b>${p.name}</b><small>${pack[0]} · ${money(pack[1])}</small></div><div class="qty"><button data-q="${x.key}" data-d="-1">−</button><span>${x.qty}</span><button data-q="${x.key}" data-d="1">+</button></div></div>`
 }).join(""):`<p style="color:var(--muted)">Your cart is empty.</p>`;
 const total=state.cart.reduce((a,x)=>{const p=products.find(y=>y.id===x.pid);return a+p.packages[x.idx][1]*x.qty},0);
 $("#cartTotal").textContent=money(total);
 document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{const x=state.cart.find(i=>i.key===b.dataset.q);x.qty+=Number(b.dataset.d);if(x.qty<=0)state.cart=state.cart.filter(i=>i!==x);save()});
}
function openCart(){$("#cartDrawer").classList.add("open");$("#overlay").classList.add("open")}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("open")}
function openCheckout(pid,idx){
 const p=products.find(x=>x.id===pid),pack=p.packages[idx];
 $("#checkoutBody").innerHTML=`<div class="eyebrow">C-BOY STORE CHECKOUT</div><h2 class="checkout-title">${p.name}</h2><p class="checkout-sub">${pack[0]} · ${money(pack[1])}</p>
 <div class="checkout-steps"><span class="active">1 Package</span><span class="active">2 Account</span><span>3 Payment</span></div>
 <form id="checkoutForm" class="form-grid">
 ${p.category==="games"?`<label>Player / Account ID<input name="player" required placeholder="Enter Player ID"></label>${p.id==="mlbb"?`<label>Server / Zone ID<input name="server" required placeholder="Enter Server / Zone ID"></label>`:""}`:`<label>Account Email / Contact<input name="player" type="email" required placeholder="Enter account email"></label>`}
 <label>Customer contact<input name="contact" required placeholder="Telegram / phone / email"></label>
 <div class="summary"><div><span>Product</span><strong>${p.name}</strong></div><div><span>Package</span><strong>${pack[0]}</strong></div><div><span>Total</span><strong>${money(pack[1])}</strong></div></div>
 <button class="btn primary">Continue to QR Payment</button></form>`;
 $("#checkoutForm").onsubmit=e=>{e.preventDefault();showPayment(pid,idx,Object.fromEntries(new FormData(e.target)))};
 $("#checkoutModal").classList.add("open");$("#checkoutModal").setAttribute("aria-hidden","false");
}
function showPayment(pid,idx,data){
 const p=products.find(x=>x.id===pid),pack=p.packages[idx];
 $("#checkoutBody").innerHTML=`<div class="eyebrow">STEP 3 · PAYMENT</div><h2 class="checkout-title">Pay by QR</h2><p class="checkout-sub">Demo placeholder — replace this area with your actual Cambodian payment QR.</p>
 <div class="qr-box"><img src="images/khqr.jpg" alt="KHQR payment QR code" style="display:block;width:100%;max-width:280px;margin:auto;border-radius:14px;background:#fff;padding:10px"><p style="text-align:center;color:var(--muted);font-size:12px;margin:10px 0 0">Replace images/khqr.jpg with your real KHQR before launch.</p></div>
 <div class="summary"><div><span>Amount to pay</span><strong>${money(pack[1])}</strong></div><div><span>Customer</span><strong>${data.contact}</strong></div></div>
 <label class="form-grid">Payment confirmation / reference<input id="paymentRef" placeholder="Optional demo reference"></label>
 <button class="btn primary full" id="placeOrder">I Have Paid — Create Order</button>`;
 $("#placeOrder").onclick=()=>{
  const id="CB-"+Math.random().toString(36).slice(2,10).toUpperCase();
  state.orders[id]={id,product:p.name,package:pack[0],amount:pack[1],data,status:"Payment Review",created:new Date().toLocaleString()};
  save();$("#checkoutModal").classList.remove("open");toast("Order created: "+id);$("#orderId").value=id;showOrder(id);
 };
}
function showOrder(id){
 const o=state.orders[id];
 $("#orderResult").innerHTML=o?`<div class="status-box"><b>${o.id}</b> · ${o.product} · ${o.package} · <strong>${o.status}</strong><br><small>${o.created}</small></div>`:`<div style="color:#ff7b7b">Order not found. Check your Order ID.</div>`;
}
$("#search").oninput=renderProducts;$("#filter").onchange=renderProducts;
$("#cartOpen").onclick=openCart;$("#cartClose").onclick=closeCart;$("#overlay").onclick=closeCart;
$("#checkoutClose").onclick=()=>$("#checkoutModal").classList.remove("open");
$("#checkoutCart").onclick=()=>{if(!state.cart.length)return toast("Your cart is empty");const first=state.cart[0];openCheckout(first.pid,first.idx)};
$("#orderForm").onsubmit=e=>{e.preventDefault();showOrder($("#orderId").value.trim().toUpperCase())};
$("#themeToggle").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("cb_theme",document.body.classList.contains("light")?"light":"dark")};
$("#menuToggle").onclick=()=>$("#mainNav").classList.toggle("open");
if(localStorage.getItem("cb_theme")==="light")document.body.classList.add("light");
for(let i=0;i<40;i++){const p=document.createElement("i");p.className="particle";p.style.left=Math.random()*100+"%";p.style.animationDelay=Math.random()*8+"s";p.style.animationDuration=5+Math.random()*8+"s";$("#particles").appendChild(p)}
renderProducts();updateCart();

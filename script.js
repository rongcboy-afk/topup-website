const games = {
  mlbb:{name:"Mobile Legends",currency:"Diamonds",icon:"💎",short:"MLBB",glow:"#6c5ce7",popular:true,
    fields:[["playerId","Player ID","Enter your Player ID"],["zoneId","Zone / Server ID","Enter your Zone ID"]],
    packages:[["86 Diamonds",86,0.99,""],["172 Diamonds",172,1.89,"+5%"],["257 Diamonds",257,2.79,"+8%"],["344 Diamonds",344,3.69,"+10%"],["429 Diamonds",429,4.49,"+12%"],["514 Diamonds",514,5.29,"+15%"]]},
  ff:{name:"Free Fire",currency:"Diamonds",icon:"🔥",short:"FREE FIRE",glow:"#ff7a18",popular:true,
    fields:[["playerId","Player ID","Enter your Player ID"]],
    packages:[["100 Diamonds",100,0.99,""],["310 Diamonds",310,2.79,"+5%"],["520 Diamonds",520,4.49,"+8%"],["1060 Diamonds",1060,8.99,"+10%"],["2180 Diamonds",2180,17.49,"+12%"],["5600 Diamonds",5600,42.99,"+15%"]]},
  pubg:{name:"PUBG Mobile",currency:"UC",icon:"🎯",short:"PUBG",glow:"#f2c94c",popular:false,
    fields:[["playerId","Player ID","Enter your PUBG Player ID"]],
    packages:[["60 UC",60,0.99,""],["325 UC",325,4.79,"+5%"],["660 UC",660,9.49,"+8%"],["1800 UC",1800,24.99,"+10%"],["3850 UC",3850,49.99,"+12%"],["8100 UC",8100,99.99,"+15%"]]},
  blood:{name:"Blood Strike",currency:"Credits",icon:"⚔️",short:"BLOOD STRIKE",glow:"#ff4d67",popular:false,
    fields:[["playerId","Player ID","Enter your Player ID"]],
    packages:[["100 Credits",100,0.99,""],["300 Credits",300,2.79,"+5%"],["500 Credits",500,4.49,"+8%"],["1050 Credits",1050,8.99,"+10%"],["2200 Credits",2200,17.49,"+12%"],["5600 Credits",5600,42.99,"+15%"]]}
};
let state={game:"mlbb",package:null,discount:0};

const $=id=>document.getElementById(id);
function money(n){return "$"+n.toFixed(2)}
function renderGames(){
  $("gamesGrid").innerHTML=Object.entries(games).map(([id,g])=>`
    <article class="game-card" style="--glow:${g.glow}" data-game="${id}">
      ${g.popular?'<span class="badge">POPULAR</span>':''}
      <div class="game-art">${g.short}</div><div class="game-icon">${g.icon}</div>
      <h3>${g.name}</h3><p>Top up with ${g.currency}</p>
      <button class="primary-btn small" onclick="selectGame('${id}')">Top Up Now →</button>
    </article>`).join("");
}
function renderGameSelect(){
  $("gameSelect").innerHTML=Object.entries(games).map(([id,g])=>`<option value="${id}">${g.name} — ${g.currency}</option>`).join("");
  $("gameSelect").value=state.game;
}
function renderFields(){
  const g=games[state.game];
  $("dynamicFields").innerHTML=g.fields.map(([id,label,placeholder])=>`
    <div class="field"><label for="${id}">${label}</label><input id="${id}" placeholder="${placeholder}" autocomplete="off"></div>`).join("");
  Object.values(games[state.game].fields).forEach(()=>{});
  updateSummary();
}
function renderPackages(){
  const g=games[state.game];
  $("packages").innerHTML=g.packages.map((p,i)=>`
    <button class="package ${state.package===i?'selected':''}" onclick="selectPackage(${i})">
      ${p[3]?`<span class="bonus">${p[3]} BONUS</span>`:""}<span class="amount">${p[0]}</span>
      <small>${p[1].toLocaleString()} ${g.currency}</small><span class="price">${money(p[2])}</span>
    </button>`).join("");
}
function selectGame(id){
  state.game=id; state.package=null; $("gameSelect").value=id; renderFields(); renderPackages(); scrollToTopup();
}
function selectPackage(i){state.package=i;renderPackages();updateSummary()}
function playerValue(){
  const ids=games[state.game].fields.map(x=>x[0]);
  return ids.map(id=>$(id)?.value.trim()).filter(Boolean).join(" / ") || "—";
}
function updateSummary(){
  const g=games[state.game], p=state.package===null?null:g.packages[state.package];
  $("sumGame").textContent=g.name;$("sumPlayer").textContent=playerValue();
  $("sumPackage").textContent=p?p[0]:"—";const price=p?p[2]:0;state.discount=p?Math.min(.20, state.package===0?0:0.05):0;
  $("sumPrice").textContent=money(price);$("sumDiscount").textContent="-"+money(price*state.discount);$("sumTotal").textContent=money(price*(1-state.discount));
}
function scrollToTopup(){document.querySelector("#topup").scrollIntoView({behavior:"smooth"})}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>$("toast").classList.remove("show"),2600)}
function openModal(){
  const g=games[state.game],p=state.package===null?null:g.packages[state.package];
  if(!p){toast("Please select a package first.");return}
  const player=playerValue();if(player==="—"){toast("Please enter your Player ID.");return}
  $("modalOrder").innerHTML=`<b>${g.name}</b><br>Player: ${player}<br>${p[0]} • Total: <b>${money(p[2]*(1-state.discount))}</b>`;
  $("modal").classList.remove("hidden");
}
function demoLink(e){e.preventDefault();toast("Demo link — replace with your verified business account.")}
window.scrollToTopup=scrollToTopup;window.selectGame=selectGame;window.selectPackage=selectPackage;window.demoLink=demoLink;

window.addEventListener("load",()=>setTimeout(()=>$("loader").classList.add("hide"),450));
$("year").textContent=new Date().getFullYear();
renderGames();renderGameSelect();renderFields();renderPackages();
$("gameSelect").addEventListener("change",e=>selectGame(e.target.value));
$("dynamicFields").addEventListener("input",updateSummary);
$("checkoutBtn").addEventListener("click",openModal);
$("modalClose").addEventListener("click",()=>$("modal").classList.add("hidden"));
$("modal").addEventListener("click",e=>{if(e.target.id==="modal")$("modal").classList.add("hidden")});
$("demoPayBtn").addEventListener("click",()=>{
  const id="DT-"+new Date().toISOString().slice(0,10).replaceAll("-","")+"-"+Math.floor(1000+Math.random()*9000);
  localStorage.setItem("diamondTopupDemoOrder",JSON.stringify({id,game:games[state.game].name,player:playerValue(),created:Date.now(),status:"Processing"}));
  $("modal").classList.add("hidden");$("trackInput").value=id;toast("Demo order created: "+id);document.querySelector("#tracking").scrollIntoView({behavior:"smooth"});
});
$("trackBtn").addEventListener("click",()=>{
  const id=$("trackInput").value.trim(),saved=JSON.parse(localStorage.getItem("diamondTopupDemoOrder")||"null");
  if(!id){toast("Enter an Order ID.");return}
  const ok=saved&&saved.id===id;
  $("trackResult").classList.remove("hidden");
  $("trackResult").innerHTML=ok?`Order <b>${saved.id}</b> • ${saved.game} • Player ${saved.player} • Status: <strong>${saved.status}</strong>`:`Demo order <b>${id}</b> not found. Create a demo order from checkout first.`;
});
$("menuBtn").addEventListener("click",()=>$("navLinks").classList.toggle("open"));
$("searchBtn").addEventListener("click",()=>{const q=prompt("Search games:");if(!q)return;const found=Object.entries(games).find(([_,g])=>g.name.toLowerCase().includes(q.toLowerCase()));found?selectGame(found[0]):toast("Game not found.")});
$("allGamesBtn").addEventListener("click",()=>toast("All four games are currently shown."));
$("loginBtn").addEventListener("click",()=>toast("Demo login — connect your authentication backend."));
$("registerBtn").addEventListener("click",()=>toast("Demo registration — connect your authentication backend."));
document.querySelectorAll(".faq button").forEach(btn=>btn.addEventListener("click",()=>{
  const panel=btn.nextElementSibling,open=panel.classList.contains("open");
  document.querySelectorAll(".faq div").forEach(x=>x.classList.remove("open"));document.querySelectorAll(".faq button span").forEach(x=>x.textContent="+");
  if(!open){panel.classList.add("open");btn.querySelector("span").textContent="−"}
}));
$("contactForm").addEventListener("submit",e=>{e.preventDefault();e.target.reset();toast("Message saved as a demo submission.")});

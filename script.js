const games=[
  {id:"ml",name:"Mobile Legends",currency:"Diamonds",zone:true,icon:"💎",art:"linear-gradient(120deg,#043a68,#0c143a)",packages:[["86 Diamonds",1,"+12 Bonus"],["172 Diamonds",2,"+25 Bonus"],["257 Diamonds",3,"+45 Bonus"],["514 Diamonds",6,"+100 Bonus"]]},
  {id:"ff",name:"Free Fire",currency:"Diamonds",zone:false,icon:"💎",art:"linear-gradient(120deg,#5a250c,#27143e)",packages:[["100 Diamonds",1.2,"+10 Bonus"],["310 Diamonds",3.5,"+35 Bonus"],["520 Diamonds",5.8,"+65 Bonus"],["1060 Diamonds",11,"+130 Bonus"]]},
  {id:"pubg",name:"PUBG Mobile",currency:"UC",zone:false,icon:"UC",art:"linear-gradient(120deg,#43505a,#101b2e)",packages:[["60 UC",1,""],["325 UC",5,""],["660 UC",10,""],["1800 UC",25,""]]},
  {id:"bs",name:"Blood Strike",currency:"Gold / Credits",zone:false,icon:"◉",art:"linear-gradient(120deg,#57131e,#17132d)",packages:[["100 Gold",1,""],["300 Gold",3,""],["680 Gold",6,""],["1380 Gold",12,""]]}
];
let state={game:0,package:0,method:"KHQR"};
const stock={};

games.forEach((g,gi)=>g.packages.forEach((_,pi)=>stock[`${gi}-${pi}`]=[42,18,7,31,12,3,26,15][gi*2+pi%2]||18));

const $=s=>document.querySelector(s);
const money=n=>"$"+Number(n).toFixed(2);
function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2200)}
function current(){return games[state.game]}
function renderGames(){
  $("#gameGrid").innerHTML=games.map((g,i)=>`<article class="game-card" data-game="${g.name.toLowerCase()}" style="--art:${g.art}"><span class="tag">${i===0?"Popular":"Top Up"}</span><h3>${g.icon} ${g.name}</h3><p>${g.currency}</p><button class="gradient-btn" onclick="chooseGame(${i})">Top Up Now →</button></article>`).join("");
  $("#gameTabs").innerHTML=games.map((g,i)=>`<button class="${i===state.game?"active":""}" onclick="chooseGame(${i})">${g.icon} ${g.name}</button>`).join("");
}
function renderPackages(){
  const g=current();
  $("#packageGrid").innerHTML=g.packages.map((p,i)=>`<div class="package ${i===state.package?"active":""}"><strong>${p[0]}</strong>${p[2]?`<small>${p[2]}</small>`:"<small>Standard package</small>"}<b>${money(p[1])}</b><button onclick="choosePackage(${i})">${i===state.package?"Selected":"Select"}</button></div>`).join("");
  $("#zoneWrap").style.display=g.zone?"block":"none";
  updateSummary();
}
function updateSummary(){
  const g=current(),p=g.packages[state.package];
  const player=$("#playerId").value.trim()||"—",zone=$("#zoneId").value.trim()||"—";
  const discount=p[1]>=5?p[1]*.10:0,total=p[1]-discount;
  $("#sumGame").textContent=g.name;$("#sumPlayer").textContent=player;$("#sumZone").textContent=g.zone?zone:"—";$("#sumPackage").textContent=p[0];$("#sumPrice").textContent=money(p[1]);$("#sumDiscount").textContent="-"+money(discount);$("#sumTotal").textContent=money(total);$("#miniAmount").textContent=money(total);
}
function chooseGame(i){state.game=i;state.package=0;renderGames();renderPackages();document.querySelector("#topup").scrollIntoView({behavior:"smooth"});}
function choosePackage(i){state.package=i;renderPackages();}
function renderStock(){
  $("#stockGrid").innerHTML=games.map((g,gi)=>g.packages.map((p,pi)=>{let n=stock[`${gi}-${pi}`];let cls=n===0?"out":n<10?"low":"ok";let status=n===0?"Out of Stock":n<10?"Low Stock":"In Stock";return `<article class="stock-card"><h3>${g.icon} ${g.name}</h3><p>${p[0]} · ${money(p[1])}</p><div class="stock-number"><span>Available</span><b>${n}</b></div><div class="bar"><div class="fill" style="width:${Math.min(100,n*2)}%"></div></div><span class="stock-status ${cls}">${status}</span></article>`}).join("")).join("");
}
function openCheckout(){
  const g=current(),p=g.packages[state.package],player=$("#playerId").value.trim(),zone=$("#zoneId").value.trim();
  if(!player||g.zone&&!zone){showToast("Please enter the required player information.");return}
  const discount=p[1]>=5?p[1]*.10:0,total=p[1]-discount;
  const order="DT-"+Date.now().toString().slice(-9);
  $("#modalOrder").textContent=order;$("#modalGame").textContent=g.name;$("#modalPlayer").textContent=player;$("#modalPackage").textContent=p[0];$("#modalAmount").textContent=money(total);
  $("#miniOrder").textContent=order;$("#miniAmount").textContent=money(total);
  $("#checkoutModal").classList.add("show");
}
function closeCheckout(){$("#checkoutModal").classList.remove("show")}
function scrollToTopup(){$("#topup").scrollIntoView({behavior:"smooth"})}

renderGames();renderPackages();renderStock();
$("#playerId").addEventListener("input",updateSummary);$("#zoneId").addEventListener("input",updateSummary);
$("#checkoutBtn").addEventListener("click",openCheckout);$("#closeModal").addEventListener("click",closeCheckout);
$("#checkoutModal").addEventListener("click",e=>{if(e.target.id==="checkoutModal")closeCheckout()});
document.querySelectorAll(".pay").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".pay").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.method=b.dataset.method;showToast(state.method+" selected")}));
$("#modalPayments").innerHTML=["KHQR","ABA Pay","Card","Wing","TrueMoney","USDT"].map(x=>`<button class="${x==="KHQR"?"active":""}">${x}</button>`).join("");
document.querySelectorAll(".faq").forEach(f=>f.addEventListener("click",()=>f.classList.toggle("open")));
$("#refreshStock").addEventListener("click",()=>{Object.keys(stock).forEach(k=>stock[k]=Math.floor(Math.random()*50));renderStock();showToast("Demo stock refreshed.")});
$("#trackBtn").addEventListener("click",()=>{let id=$("#trackInput").value.trim()||"DT-DEMO-0001";$("#trackResult").textContent=`✓ ${id}: Payment Pending → Processing → Completed (demo tracking).`});
$("#searchInput").addEventListener("input",e=>{let q=e.target.value.toLowerCase();document.querySelectorAll(".game-card").forEach(c=>c.style.display=c.dataset.game.includes(q)?"":"none")});
$("#menuBtn").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
document.querySelectorAll(".side-tab").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.target)?.scrollIntoView({behavior:"smooth"})));
$("#paidBtn").addEventListener("click",()=>{closeCheckout();showToast("Demo payment received. Order is now processing.");});

const categories = {
  Food:{icon:"☕",color:"#32b989"}, Transport:{icon:"↗",color:"#8d7de8"},
  Shopping:{icon:"◈",color:"#f2c35e"}, Bills:{icon:"▤",color:"#f18a78"},
  Entertainment:{icon:"♫",color:"#73b9df"}, Health:{icon:"✚",color:"#b4a5e9"}, Income:{icon:"↙",color:"#39b98a"}
};
const initialTransactions=[
 {id:1,title:"Monthly salary",category:"Income",date:"2026-10-01",amount:45000,type:"income"},
 {id:2,title:"Grocery shopping",category:"Food",date:"2026-10-01",amount:1850,type:"expense"},
 {id:3,title:"Metro & cab",category:"Transport",date:"2026-10-02",amount:640,type:"expense"},
 {id:4,title:"Internet bill",category:"Bills",date:"2026-10-03",amount:899,type:"expense"},
 {id:5,title:"Coffee & snacks",category:"Food",date:"2026-10-04",amount:320,type:"expense"},
 {id:6,title:"New headphones",category:"Shopping",date:"2026-10-05",amount:499,type:"expense"},
 {id:7,title:"Movie night",category:"Entertainment",date:"2026-10-06",amount:750,type:"expense"},
 {id:8,title:"Pharmacy",category:"Health",date:"2026-10-07",amount:460,type:"expense"},
 {id:9,title:"Weekly groceries",category:"Food",date:"2026-10-09",amount:1260,type:"expense"},
 {id:10,title:"Fuel",category:"Transport",date:"2026-10-10",amount:900,type:"expense"},
 {id:11,title:"Electricity bill",category:"Bills",date:"2026-10-12",amount:1450,type:"expense"},
 {id:12,title:"Clothing",category:"Shopping",date:"2026-10-14",amount:1800,type:"expense"},
 {id:13,title:"Dinner out",category:"Food",date:"2026-10-18",amount:1250,type:"expense"},
 {id:14,title:"Streaming subscription",category:"Entertainment",date:"2026-10-20",amount:299,type:"expense"},
 {id:15,title:"Personal care",category:"Health",date:"2026-10-22",amount:550,type:"expense"},
 {id:16,title:"Lunch",category:"Food",date:"2026-10-24",amount:650,type:"expense"},
 {id:17,title:"Auto rides",category:"Transport",date:"2026-10-25",amount:720,type:"expense"},
 {id:18,title:"Household supplies",category:"Shopping",date:"2026-10-26",amount:900,type:"expense"},
 {id:19,title:"Mobile recharge",category:"Bills",date:"2026-10-27",amount:399,type:"expense"},
 {id:20,title:"Weekend outing",category:"Entertainment",date:"2026-10-28",amount:1200,type:"expense"},
 {id:21,title:"Snacks",category:"Food",date:"2026-10-29",amount:450,type:"expense"},
 {id:22,title:"Bus pass",category:"Transport",date:"2026-10-30",amount:540,type:"expense"},
 {id:23,title:"Stationery",category:"Shopping",date:"2026-10-31",amount:464,type:"expense"}
];
const defaultBudgets={Food:6000,Transport:3500,Shopping:5500,Bills:4000,Entertainment:3000,Health:2000};
let transactions=load("psai-transactions",initialTransactions);
let budgets=load("psai-budgets",defaultBudgets);
function load(k,fallback){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fallback.map?fallback.map(x=>({...x})):({...fallback})}catch{return fallback.map?fallback.map(x=>({...x})):({...fallback})}}
function save(){localStorage.setItem("psai-transactions",JSON.stringify(transactions));localStorage.setItem("psai-budgets",JSON.stringify(budgets))}
const money=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const total=arr=>arr.reduce((s,t)=>s+t.amount,0);
const expenses=()=>transactions.filter(t=>t.type==="expense");
const incomes=()=>transactions.filter(t=>t.type==="income");
const spentBy=cat=>total(expenses().filter(t=>t.category===cat));
const fmtDate=s=>new Date(s+"T12:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
const byDate=()=>[...transactions].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
function render(){const inc=total(incomes()),exp=total(expenses()),bal=inc-exp,rate=inc?Math.max(0,bal/inc*100):0;
 document.getElementById("income").textContent=money(inc);document.getElementById("expenses").textContent=money(exp);document.getElementById("balance").textContent=money(bal);document.getElementById("savingsRate").textContent=rate.toFixed(1)+"%";
 document.getElementById("heroSavings").textContent=Math.max(0,bal).toLocaleString("en-IN");document.getElementById("expenseBar").style.width=Math.min(100,exp/(inc||1)*100)+"%";document.getElementById("balanceBar").style.width=Math.max(0,Math.min(100,bal/(inc||1)*100))+"%";document.getElementById("savingsBar").style.width=Math.min(100,rate)+"%";
 renderDonut();renderBudget("budgetProgress",true);renderBudget("fullBudgetProgress",false);renderRows("recentTransactions",byDate().slice(0,6));renderRows("allTransactions",filteredTransactions());renderInsights();renderPlan();
 document.getElementById("budgetTotal").textContent=money(Object.values(budgets).reduce((a,b)=>a+b,0));document.getElementById("budgetSpent").textContent=money(exp);document.getElementById("budgetRemaining").textContent=money(Object.values(budgets).reduce((a,b)=>a+b,0)-exp);
}
function renderDonut(){const cats=Object.keys(budgets),cols=cats.map(c=>categories[c].color),vals=cats.map(spentBy),sum=vals.reduce((a,b)=>a+b,0)||1;let acc=0;const stops=vals.map((v,i)=>{const start=acc;acc+=v/sum*100;return `${cols[i]} ${start}% ${acc}%`}).join(",");document.getElementById("donut").style.background=`conic-gradient(${stops})`;document.getElementById("donutTotal").textContent=money(sum).replace(/(\d)(?=(\d{3})+$)/g,"$1,");document.getElementById("legend").innerHTML=cats.map((c,i)=>`<div class="legend-item"><i class="legend-dot" style="background:${cols[i]}"></i>${c}<b>${Math.round(vals[i]/sum*100)}%</b></div>`).join("")}
function renderBudget(id,compact){const cats=Object.keys(budgets);document.getElementById(id).innerHTML=cats.map(c=>{const v=spentBy(c),limit=budgets[c],pct=limit?Math.min(100,v/limit*100):100;return `<div class="budget-row"><div class="budget-row-head"><span>${c}</span><b>${money(v)} <small>/ ${money(limit)}</small></b></div><div class="progress-track"><div class="progress-fill ${pct>85?"warn":""}" style="width:${pct}%"></div></div></div>`}).join("")}
function renderRows(id,rows){const el=document.getElementById(id);if(!rows.length){el.innerHTML='<div class="empty-state">No transactions found. Try a different search.</div>';return}el.innerHTML=rows.map(t=>{const c=categories[t.category]||categories.Food;return `<div class="transaction-row"><div class="tx-title"><div class="tx-icon" style="color:${c.color};background:${c.color}18">${c.icon}</div><div><b>${esc(t.title)}</b><small>${t.type==="income"?"Money received":"Payment"}</small></div></div><span><span class="category-pill">${t.category}</span></span><span class="tx-date">${fmtDate(t.date)}</span><span class="tx-amount ${t.type}">${t.type==="income"?"+":"−"}${money(t.amount)}</span></div>`}).join("")}
function filteredTransactions(){const q=(document.getElementById("searchTransactions")?.value||"").toLowerCase(),cat=document.getElementById("filterCategory")?.value||"all";return byDate().filter(t=>(t.title.toLowerCase().includes(q)||t.category.toLowerCase().includes(q))&&(cat==="all"||t.category===cat))}
function renderInsights(){const inc=total(incomes()),exp=total(expenses()),bal=inc-exp,rate=inc?bal/inc*100:0;const ranked=Object.keys(budgets).map(c=>({c,v:spentBy(c),limit:budgets[c]})).sort((a,b)=>b.v-a.v),top=ranked[0],over=ranked.find(x=>x.v>x.limit);
 document.getElementById("insightHeadline").textContent=over?`${over.c} is above your planned limit.`:rate>=20?"You’re building a healthy money habit.":"Small steps can strengthen your savings habit.";
 document.getElementById("insightSummary").textContent=over?`You have spent ${money(over.v-over.limit)} more than your ${over.c.toLowerCase()} budget. Review upcoming purchases and adjust your plan if needed.`:`You have ${money(Math.max(0,bal))} remaining from recorded income. Your current savings rate is ${rate.toFixed(1)}%. Keep reviewing small purchases to protect your goals.`;
 const cards=[{icon:"◉",title:"Your biggest category",body:`${top.c} is your highest recorded expense category at ${money(top.v)}.`,tip:"Review it weekly"},{icon:"◷",title:"Budget check-in",body:over?`${over.c} has passed its limit by ${money(over.v-over.limit)}.`:"Your category limits give you a clear spending guide.",tip:over?"Adjust future spending":"Keep tracking"},{icon:"✦",title:"Savings snapshot",body:`Your balance from recorded transactions is ${money(bal)}.`,tip:rate>=20?"Keep your rhythm":"Try a small goal"}];
 document.getElementById("insightCards").innerHTML=cards.map(c=>`<div class="insight-card"><span class="insight-emoji">${c.icon}</span><h4>${c.title}</h4><p>${c.body}</p><strong>↗ ${c.tip}</strong></div>`).join("")}
function renderPlan(){const inc=total(incomes())||45000,plan=[["Needs · 50%",inc*.5,"#32b989"],["Wants · 30%",inc*.3,"#8d7de8"],["Savings · 20%",inc*.2,"#f2c35e"]];document.getElementById("suggestedPlan").innerHTML=plan.map(p=>`<div class="plan-row"><i class="plan-color" style="background:${p[2]}"></i><span>${p[0]}</span><b>${money(p[1])}</b></div>`).join("")}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function showView(view){document.querySelectorAll(".content").forEach(x=>x.classList.add("hidden"));document.getElementById(view+"View").classList.remove("hidden");document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.view===view));const titles={overview:"Good morning, Adhi ✦",transactions:"Your transactions",budget:"Plan with confidence",insights:"A smarter money mindset"};document.getElementById("pageTitle").textContent=titles[view]||titles.overview;window.scrollTo({top:0,behavior:"smooth"});if(view==="transactions")renderRows("allTransactions",filteredTransactions())}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.goto)));
function openModal(){document.getElementById("transactionModal").classList.remove("hidden");document.getElementById("txDate").value=new Date().toISOString().slice(0,10);document.getElementById("txDescription").focus()}
function closeModal(){document.getElementById("transactionModal").classList.add("hidden")}
["quickAdd","addFromTransactions"].forEach(id=>document.getElementById(id).addEventListener("click",openModal));document.getElementById("closeModal").addEventListener("click",closeModal);document.getElementById("transactionModal").addEventListener("click",e=>{if(e.target.id==="transactionModal")closeModal()});
document.getElementById("txType").addEventListener("change",e=>{if(e.target.value==="income"){document.getElementById("txCategory").value="Income"}else if(document.getElementById("txCategory").value==="Income")document.getElementById("txCategory").value="Food"});
document.getElementById("transactionForm").addEventListener("submit",e=>{e.preventDefault();const type=document.getElementById("txType").value,category=type==="income"?"Income":document.getElementById("txCategory").value;transactions.push({id:Date.now(),title:document.getElementById("txDescription").value.trim(),amount:Number(document.getElementById("txAmount").value),type,category,date:document.getElementById("txDate").value});save();render();closeModal();e.target.reset();toast("Transaction saved successfully.")});
document.getElementById("searchTransactions").addEventListener("input",()=>renderRows("allTransactions",filteredTransactions()));document.getElementById("filterCategory").addEventListener("change",()=>renderRows("allTransactions",filteredTransactions()));
document.getElementById("editBudget").addEventListener("click",()=>{const result={};for(const c of Object.keys(budgets)){const val=prompt(`Set monthly budget for ${c} (₹):`,budgets[c]);if(val===null)return;const n=Number(val);if(!Number.isFinite(n)||n<0){toast("Please enter a valid non-negative amount.");return}result[c]=n}budgets=result;save();render();toast("Your budgets have been updated.")});
document.getElementById("chartRange").addEventListener("change",e=>toast(e.target.value==="week"?"Showing available sample transactions for the selected week.":"Showing monthly spending data."));
document.getElementById("monthLabel").addEventListener("click",()=>toast("This demo is showing October 2026 sample data."));
render();
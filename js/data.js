// ExpenseIQ — Data Layer

const DB={TRANSACTIONS:'eiq_tx',BUDGETS:'eiq_bud',USER:'eiq_user',ALERTS:'eiq_alerts',PREFS:'eiq_prefs'};
const CATEGORIES=[
  {id:'food',  label:'Food & Dining',    icon:'🍜',color:'#CCFF00'},
  {id:'travel',label:'Travel',           icon:'✈️', color:'#00F0FF'},
  {id:'bills', label:'Bills & Utilities',icon:'⚡', color:'#FF00FF'},
  {id:'shop',  label:'Shopping',         icon:'🛍️',color:'#FF3366'},
  {id:'health',label:'Health',           icon:'💊',color:'#44FF88'},
  {id:'entmt', label:'Entertainment',    icon:'🎮',color:'#FFB800'},
  {id:'income',label:'Income',           icon:'💰',color:'#CCFF00'},
  {id:'other', label:'Other',            icon:'◆', color:'#888888'},
];

function uid(){return Math.random().toString(36).slice(2,10);}
function parse(k,fb){try{return JSON.parse(localStorage.getItem(k))||fb;}catch{return fb;}}
function initDB(){if(!localStorage.getItem('eiq_seeded'))seedData();}

function seedData(){
  const now=new Date(),y=now.getFullYear(),m=now.getMonth();
  const ago=(d)=>new Date(y,m,now.getDate()-d).toISOString().split('T')[0];
  const r=(a,b)=>+(a+Math.random()*(b-a)).toFixed(2);
  const txns=[
    {id:uid(),type:'income', category:'income',desc:'Monthly Salary',    amount:85000,date:ago(25),note:''},
    {id:uid(),type:'income', category:'income',desc:'Freelance Project',  amount:12500,date:ago(12),note:''},
    {id:uid(),type:'expense',category:'food',  desc:'Swiggy Order',       amount:r(200,600),  date:ago(0), note:''},
    {id:uid(),type:'expense',category:'food',  desc:'Grocery Store',      amount:r(800,2000), date:ago(1), note:''},
    {id:uid(),type:'expense',category:'food',  desc:'Restaurant Dinner',  amount:r(600,1500), date:ago(3), note:''},
    {id:uid(),type:'expense',category:'travel',desc:'Uber Ride',          amount:r(150,400),  date:ago(2), note:''},
    {id:uid(),type:'expense',category:'travel',desc:'Flight Booking',     amount:r(4000,8000),date:ago(8), note:''},
    {id:uid(),type:'expense',category:'bills', desc:'Electricity Bill',   amount:r(1200,2000),date:ago(5), note:''},
    {id:uid(),type:'expense',category:'bills', desc:'Internet Plan',      amount:r(600,1200), date:ago(10),note:''},
    {id:uid(),type:'expense',category:'shop',  desc:'Amazon Purchase',    amount:r(800,3000), date:ago(4), note:''},
    {id:uid(),type:'expense',category:'shop',  desc:'Clothing Store',     amount:r(1500,4000),date:ago(9), note:''},
    {id:uid(),type:'expense',category:'health',desc:'Gym Membership',     amount:r(1200,2000),date:ago(15),note:''},
    {id:uid(),type:'expense',category:'health',desc:'Medicine',           amount:r(200,800),  date:ago(7), note:''},
    {id:uid(),type:'expense',category:'entmt', desc:'Netflix',            amount:649,         date:ago(11),note:''},
    {id:uid(),type:'expense',category:'entmt', desc:'Movie Tickets',      amount:r(400,800),  date:ago(13),note:''},
    {id:uid(),type:'expense',category:'other', desc:'Miscellaneous',      amount:r(300,700),  date:ago(16),note:''},
  ];
  for(let mo=1;mo<=3;mo++){
    const d=(day)=>new Date(y,m-mo,day).toISOString().split('T')[0];
    txns.push(
      {id:uid(),type:'income', category:'income',desc:'Monthly Salary',amount:85000,        date:d(1), note:''},
      {id:uid(),type:'expense',category:'food',  desc:'Food & Dining', amount:r(4000,7000), date:d(5), note:''},
      {id:uid(),type:'expense',category:'travel',desc:'Travel',        amount:r(2000,6000), date:d(8), note:''},
      {id:uid(),type:'expense',category:'bills', desc:'Bills',         amount:r(2000,4000), date:d(10),note:''},
      {id:uid(),type:'expense',category:'shop',  desc:'Shopping',      amount:r(3000,8000), date:d(15),note:''},
      {id:uid(),type:'expense',category:'health',desc:'Health',        amount:r(1000,3000), date:d(20),note:''},
      {id:uid(),type:'expense',category:'entmt', desc:'Entertainment', amount:r(500,2000),  date:d(22),note:''},
    );
  }
  const budgets={monthly:60000,categories:{food:8000,travel:6000,bills:5000,shop:10000,health:4000,entmt:3000,other:2000}};
  const user={name:'Harsh V.',email:'harsh@expenseiq.app',currency:'₹',currencyCode:'INR',avatar:'HV'};
  const prefs={accentColor:'acid',notifyBudget:true,notifyBills:true,notifySavings:false};
  localStorage.setItem(DB.TRANSACTIONS,JSON.stringify(txns));
  localStorage.setItem(DB.BUDGETS,JSON.stringify(budgets));
  localStorage.setItem(DB.USER,JSON.stringify(user));
  localStorage.setItem(DB.PREFS,JSON.stringify(prefs));
  localStorage.setItem('eiq_seeded','1');
}

// CRUD
function getTransactions(){return parse(DB.TRANSACTIONS,[]);}
function saveTxns(t){localStorage.setItem(DB.TRANSACTIONS,JSON.stringify(t));}
function addTransaction(tx){const t=getTransactions();t.unshift({id:uid(),...tx});saveTxns(t);refreshAlerts();return t[0];}
function updateTransaction(id,u){saveTxns(getTransactions().map(t=>t.id===id?{...t,...u}:t));refreshAlerts();}
function deleteTransaction(id){saveTxns(getTransactions().filter(t=>t.id!==id));refreshAlerts();}
function getBudgets(){return parse(DB.BUDGETS,{monthly:60000,categories:{}});}
function setBudgets(b){localStorage.setItem(DB.BUDGETS,JSON.stringify(b));refreshAlerts();}
function getUser(){return parse(DB.USER,{name:'User',email:'',currency:'₹',avatar:'U'});}
function setUser(u){localStorage.setItem(DB.USER,JSON.stringify(u));}
function getPrefs(){return parse(DB.PREFS,{accentColor:'acid',notifyBudget:true,notifyBills:true});}
function setPrefs(p){localStorage.setItem(DB.PREFS,JSON.stringify(p));}
function getAlerts(){return parse(DB.ALERTS,[]);}
function dismissAlert(id){localStorage.setItem(DB.ALERTS,JSON.stringify(getAlerts().map(a=>a.id===id?{...a,dismissed:true}:a)));}

function refreshAlerts(){
  const txns=getTransactions(),budget=getBudgets();
  const cm=currentMonth();
  const alerts=[];
  const totalSpent=txns.filter(t=>t.type==='expense'&&t.date.startsWith(cm)).reduce((s,t)=>s+t.amount,0);
  const pct=totalSpent/budget.monthly;
  if(pct>=1) alerts.push({id:'overall-exceeded',type:'critical',title:'Monthly Budget Exceeded!',msg:`Spent ₹${fmtN(totalSpent)}, over by ₹${fmtN(totalSpent-budget.monthly)}`,date:new Date().toISOString(),dismissed:false});
  else if(pct>=0.85) alerts.push({id:'overall-warning',type:'warning',title:`Budget Alert: ${Math.round(pct*100)}% Used`,msg:`Only ₹${fmtN(budget.monthly-totalSpent)} remaining this month.`,date:new Date().toISOString(),dismissed:false});
  CATEGORIES.filter(c=>c.id!=='income').forEach(cat=>{
    const cb=budget.categories[cat.id];if(!cb)return;
    const cs=txns.filter(t=>t.type==='expense'&&t.category===cat.id&&t.date.startsWith(cm)).reduce((s,t)=>s+t.amount,0);
    const cp=cs/cb;
    if(cp>=1) alerts.push({id:`cat-${cat.id}`,type:'critical',title:`${cat.label} Over Budget`,msg:`Spent ₹${fmtN(cs)} vs ₹${fmtN(cb)} budget.`,date:new Date().toISOString(),dismissed:false});
    else if(cp>=0.8) alerts.push({id:`catwarn-${cat.id}`,type:'warning',title:`${cat.label} at ${Math.round(cp*100)}%`,msg:`₹${fmtN(cb-cs)} left in ${cat.label}.`,date:new Date().toISOString(),dismissed:false});
  });
  alerts.push({id:'bill-elect',type:'info',title:'Electricity Bill Due',msg:'Due in 3 days — approx ₹1,500',date:new Date().toISOString(),dismissed:false});
  alerts.push({id:'bill-net',type:'info',title:'Internet Renewal',msg:'Due in 7 days — ₹999',date:new Date().toISOString(),dismissed:false});
  const dismissed=new Set(getAlerts().filter(a=>a.dismissed).map(a=>a.id));
  alerts.forEach(a=>{if(dismissed.has(a.id))a.dismissed=true;});
  localStorage.setItem(DB.ALERTS,JSON.stringify(alerts));
}

// CALCULATIONS
function currentMonth(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;}
function currentMonthLabel(){return new Date().toLocaleDateString('en',{month:'long',year:'numeric'});}
function fmtN(n){return Number(n).toLocaleString('en-IN');}
function fmt(n){return (getUser().currency||'₹')+fmtN(n);}
function getCatById(id){return CATEGORIES.find(c=>c.id===id)||CATEGORIES[7];}

function getMonthSummary(monthStr){
  const txns=getTransactions().filter(t=>t.date.startsWith(monthStr));
  const income=txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense=txns.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const savings=income-expense;
  return{income,expense,savings,savingsRate:income>0?(savings/income)*100:0};
}

function getCategoryBreakdown(monthStr){
  const txns=getTransactions().filter(t=>t.type==='expense'&&t.date.startsWith(monthStr));
  const map={};txns.forEach(t=>{map[t.category]=(map[t.category]||0)+t.amount;});
  return CATEGORIES.filter(c=>c.id!=='income').map(c=>({...c,spent:map[c.id]||0})).sort((a,b)=>b.spent-a.spent);
}

function getMonthlyHistory(months=6){
  const now=new Date();
  return Array.from({length:months},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    return{key,label:d.toLocaleDateString('en',{month:'short'}),...getMonthSummary(key)};
  }).reverse();
}

function getTotalBalance(){
  return getTransactions().reduce((s,t)=>t.type==='income'?s+t.amount:s-t.amount,0);
}

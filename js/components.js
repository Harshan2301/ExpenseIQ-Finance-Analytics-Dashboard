// ExpenseIQ — Reusable UI Components

// ── SIDEBAR ───────────────────────────────────────────
function getSidebar(active){
  const nav=[
    {href:'dashboard.html',icon:'◈',label:'Dashboard'},
    {href:'transactions.html',icon:'◆',label:'Transactions'},
    {href:'budget.html',icon:'◉',label:'Budget'},
    {href:'analytics.html',icon:'◐',label:'Analytics'},
    {href:'alerts.html',icon:'⚠',label:'Alerts',badge:true},
    {href:'reports.html',icon:'◇',label:'Reports'},
    {href:'profile.html',icon:'○',label:'Profile'},
  ];
  const alertCount=getAlerts().filter(a=>!a.dismissed&&a.type!=='info').length;
  const user=getUser();
  return `
  <aside class="sidebar">
    <div>
      <a href="index.html" class="logo-mark">EXPENSEIQ</a>
      <div class="logo-sub">Smart Finance OS</div>
    </div>
    <nav class="sidebar-nav">
      ${nav.map(n=>`
        <a class="nav-item${n.href===active?' active':''}" href="${n.href}">
          <span class="nav-icon">${n.icon}</span>
          <span>${n.label}</span>
          ${n.badge&&alertCount>0?`<span class="nav-badge">${alertCount}</span>`:''}
        </a>`).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="live-indicator"><span class="status-dot"></span> Live Tracking</div>
      <div class="user-chip">
        <div class="avatar">${user.avatar||'U'}</div>
        <div class="user-info">
          <div class="user-name">${user.name}</div>
          <div class="user-role">${user.currencyCode||'INR'} Account</div>
        </div>
        <a href="profile.html" style="color:var(--chrome-mid);text-decoration:none;font-size:1rem;">⚙</a>
      </div>
    </div>
  </aside>`;
}

// ── PAGE SHELL ────────────────────────────────────────
function renderPage(activePage, title, subtitle, content){
  document.getElementById('sidebar-mount').innerHTML=getSidebar(activePage);
  document.getElementById('page-title').textContent=title;
  if(subtitle)document.getElementById('page-subtitle').textContent=subtitle;
  document.getElementById('content-mount').innerHTML=content;
}

// ── MODAL ─────────────────────────────────────────────
function showModal(title, bodyHTML, footerHTML){
  let el=document.getElementById('modal-overlay');
  if(!el){
    el=document.createElement('div');
    el.id='modal-overlay';
    document.body.appendChild(el);
  }
  el.innerHTML=`
    <div class="modal-backdrop" onclick="closeModal()"></div>
    <div class="modal-box liquid-card">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML?`<div class="modal-footer">${footerHTML}</div>`:''}
    </div>`;
  el.style.display='flex';
  document.body.style.overflow='hidden';
  requestAnimationFrame(()=>el.classList.add('open'));
}

function closeModal(){
  const el=document.getElementById('modal-overlay');
  if(el){el.classList.remove('open');setTimeout(()=>{el.style.display='none';document.body.style.overflow='';},200);}
}

// ── TOAST ─────────────────────────────────────────────
function showToast(msg, type='success'){
  let wrap=document.getElementById('toast-wrap');
  if(!wrap){wrap=document.createElement('div');wrap.id='toast-wrap';document.body.appendChild(wrap);}
  const t=document.createElement('div');
  t.className=`toast toast-${type}`;
  t.textContent=msg;
  wrap.appendChild(t);
  setTimeout(()=>t.classList.add('show'),10);
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300);},3000);
}

// ── TRANSACTION FORM ──────────────────────────────────
function getTransactionForm(tx){
  const cats=CATEGORIES.filter(c=>c.id!=='income').concat(CATEGORIES.filter(c=>c.id==='income'));
  return `
    <div class="form-group">
      <label class="form-label">Type</label>
      <div class="radio-group">
        <label class="radio-opt ${!tx||tx.type==='expense'?'active':''}">
          <input type="radio" name="tx-type" value="expense" ${!tx||tx.type==='expense'?'checked':''}> Expense
        </label>
        <label class="radio-opt ${tx&&tx.type==='income'?'active':''}">
          <input type="radio" name="tx-type" value="income" ${tx&&tx.type==='income'?'checked':''}> Income
        </label>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input id="tx-desc" class="form-input" placeholder="What was this for?" value="${tx?tx.desc:''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Amount (₹)</label>
        <input id="tx-amount" class="form-input" type="number" min="0" step="0.01" placeholder="0.00" value="${tx?tx.amount:''}">
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input id="tx-date" class="form-input" type="date" value="${tx?tx.date:new Date().toISOString().split('T')[0]}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Category</label>
      <select id="tx-cat" class="form-input">
        ${cats.map(c=>`<option value="${c.id}" ${tx&&tx.category===c.id?'selected':''}>${c.icon} ${c.label}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Note (optional)</label>
      <input id="tx-note" class="form-input" placeholder="Add a note..." value="${tx?tx.note:''}">
    </div>`;
}

function collectTxForm(){
  const type=document.querySelector('input[name="tx-type"]:checked')?.value||'expense';
  const desc=document.getElementById('tx-desc')?.value.trim();
  const amount=parseFloat(document.getElementById('tx-amount')?.value);
  const date=document.getElementById('tx-date')?.value;
  const category=document.getElementById('tx-cat')?.value;
  const note=document.getElementById('tx-note')?.value.trim();
  if(!desc||!amount||!date){showToast('Please fill all required fields','error');return null;}
  return{type,desc,amount,date,category:category||'other',note};
}

// ── LIVE CLOCK ────────────────────────────────────────
function startClock(){
  const el=document.getElementById('live-time');
  if(!el)return;
  const tick=()=>el.textContent=new Date().toLocaleTimeString('en-US',{hour12:false});
  tick();setInterval(tick,1000);
}

// ── COUNTER ANIMATION ─────────────────────────────────
function animCount(el,target,prefix='',suffix='',decimals=0,dur=1000){
  if(!el)return;
  const start=performance.now();
  (function step(now){
    const t=Math.min((now-start)/dur,1);
    const v=(1-Math.pow(1-t,4))*target;
    el.textContent=prefix+v.toLocaleString('en-IN',{minimumFractionDigits:decimals,maximumFractionDigits:decimals})+suffix;
    if(t<1)requestAnimationFrame(step);
  })(start);
}

// ── RADIO GROUP TOGGLE ────────────────────────────────
document.addEventListener('change',e=>{
  if(e.target.name==='tx-type'){
    document.querySelectorAll('.radio-opt').forEach(r=>r.classList.remove('active'));
    e.target.closest('.radio-opt')?.classList.add('active');
  }
});

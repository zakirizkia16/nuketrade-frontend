// ==========================================
// AUTH GATE (SISTEM KEAMANAN BACKEND)
// ==========================================
async function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        try {
            const res = await fetch(`${API_BASE}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
                credentials: 'include'
            });
            if (res.ok) {
                window.history.replaceState({}, document.title, window.location.pathname);
                initNukeTrade();
            } else { showAccessDenied("Link undangan sudah dipakai atau tidak valid."); }
        } catch (e) { showAccessDenied("Gagal menghubungi server otorisasi."); }
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/data/mempool`, { credentials: 'include' });
        if (res.ok) { initNukeTrade(); } else { showAccessDenied(); }
    } catch (e) { showAccessDenied("Server tidak dapat dijangkau."); }
}

function showAccessDenied(msg = "Anda tidak memiliki izin untuk mengakses terminal ini.") {
    document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#060b0a;color:#4a6b5d;font-family:'JetBrains Mono',monospace;text-align:center;padding:20px;"><div><h1 style="font-size:80px;margin-bottom:10px;color:#ff3558;">403</h1><p style="font-size:24px;color:#e8f5ee;font-weight:bold;">ACCESS DENIED</p><p style="margin-top:15px;font-size:14px;max-width:400px;">${msg}</p></div></div>`;
}

// ==========================================
// MAIN APP INIT
// ==========================================
function initNukeTrade() {
    renderAll();
    initCharts();
    setupEventListeners();
    startRealTimeSimulation();
    fetchRealPrices(); // Ambil harga live dari Backend lo
}

function initCharts() {
    const cO={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(26,46,38,0.4)'},ticks:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9}}},y:{grid:{color:'rgba(26,46,38,0.4)'},ticks:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9}}}}};
    new Chart(document.getElementById('mainCh'),{type:'line',data:{labels:gL(30),datasets:[{data:gD(30,1.0,1.6),borderColor:'#00ff88',borderWidth:1.5,fill:true,backgroundColor:'rgba(0,255,136,0.06)',pointRadius:0,tension:.4}]},options:{...cO,plugins:{legend:{display:false},tooltip:{backgroundColor:'#111c18',borderColor:'#1a2e26',borderWidth:1,titleColor:'#e8f5ee',bodyColor:'#c8e0d4'}},scales:{x:{display:false},y:{display:false}}}});
    new Chart(document.getElementById('liqCh'),{type:'bar',data:{labels:gL(14),datasets:[{label:'Long',data:gD(14,20,120),backgroundColor:'rgba(255,53,88,0.5)',borderRadius:3,borderSkipped:false},{label:'Short',data:gD(14,10,80),backgroundColor:'rgba(0,194,255,0.5)',borderRadius:3,borderSkipped:false}]},options:{...cO,plugins:{legend:{display:true,position:'top',align:'end',labels:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9},boxWidth:8,boxHeight:6,padding:8}}}}});
    new Chart(document.getElementById('ifCh'),{type:'bar',data:{labels:gL(14),datasets:[{label:'In',data:gD(14,400,1200),backgroundColor:'rgba(255,53,88,0.5)',borderRadius:2,borderSkipped:false},{label:'Out',data:gD(14,600,1800).map(v=>-v),backgroundColor:'rgba(0,255,136,0.5)',borderRadius:2,borderSkipped:false}]},options:{...cO,plugins:{legend:{display:true,position:'top',align:'end',labels:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9},boxWidth:8,boxHeight:6,padding:8}}}}});
    new Chart(document.getElementById('ifExCh'),{type:'bar',data:{labels:['Binance','Coinbase','OKX','Bybit','Kraken'],datasets:[{label:'$M',data:[840,420,380,340,280],backgroundColor:['#f59e0b','#00c2ff','#ff3558','#a855f7','#00ff88'],borderRadius:4,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(26,46,38,0.3)'},ticks:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9},callback:v=>'$'+v+'M'}},y:{grid:{display:false},ticks:{color:'#c8e0d4',font:{family:'JetBrains Mono',size:9}}}}}});
}

function startRealTimeSimulation() {
    function sim(){bn++;document.getElementById('btcP').textContent='$'+Math.round(bB+=(Math.random()-.49)*40).toLocaleString();document.getElementById('ethP').textContent='$'+Math.round(eB+=(Math.random()-.49)*4).toLocaleString();document.getElementById('gasP').textContent=Math.round(gB=Math.max(5,Math.min(50,gB+(Math.random()-.5)*2)))+' Gwei';bC+=(Math.random()-.5)*.08;eC+=(Math.random()-.5)*.06;tC+=(Math.random()-.5)*.04;const u=v=>v>=0;['btc','eth','tvl'].forEach(k=>{const el=document.getElementById(k+'Ch'),ic=document.getElementById(k==='btc'?'btcC':k==='eth'?'ethC':'tvlC');if(el){el.textContent=(u(eval(k+'C'))?'+':'')+eval(k+'C').toFixed(2)+'%';el.className='text-[10px] cv font-medium '+(u(eval(k+'C'))?'text-chain-accent':'text-chain-danger');}if(ic){ic.className='fa-solid fa-caret-'+(u(eval(k+'C'))?'up':'down')+' text-[9px] '+(u(eval(k+'C'))?'text-chain-accent':'text-chain-danger');}});if(Math.random()<.04){const a=alerts.find(x=>x.ac&&!x.tr);if(a){a.tr=true;a.msg='Condition met: '+a.tk+' '+a.co+' '+a.va;rA();toast('ALERT: '+a.tk+' '+a.co,'danger');}}}
    setInterval(sim,4000);
}

function setupEventListeners() {
    // Search
    const sO=document.getElementById('searchOv'),sI=document.getElementById('searchIn');
    function oS(){sO.classList.add('active');sI.focus();}
    function cS(){sO.classList.remove('active');sI.blur();}
    document.getElementById('searchBtnD').addEventListener('click',oS);
    document.getElementById('searchBtnM').addEventListener('click',oS);
    sI.addEventListener('input',e=>{const q=e.target.value.toLowerCase(),r=document.getElementById('searchRes');if(!q.trim()){r.innerHTML='<div class="px-4 py-6 text-center text-chain-muted text-xs">Type to search...</div>';return;}const m=TD.filter(t=>t.s.toLowerCase().includes(q)||t.n.toLowerCase().includes(q));r.innerHTML=m.length?m.map(t=>`<div class="sr-item flex items-center gap-3 px-4 py-3 cursor-pointer" data-s="${t.s}"><i class="${t.ic} ${t.icc}"></i><span class="text-sm text-chain-bright">${t.s}</span><span class="text-[10px] text-chain-muted">${t.n}</span><span class="cv text-[10px] ml-auto ${t.ch>=0?'text-chain-accent':'text-chain-danger'}">${t.ch>=0?'+':''}${t.ch}%</span></div>`).join(''):'<div class="px-4 py-6 text-center text-chain-muted text-xs">No results</div>';});
    document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();oS();}if(e.key==='Escape'){cS();closeAP();}});
    sO.addEventListener('click',e=>{if(e.target.id==='searchOv')cS();});

    // Alert panel
    function openAP(){document.getElementById('aPn').classList.add('open');document.getElementById('aBk').classList.add('open');rA();}
    window.closeAP=function(){document.getElementById('aPn').classList.remove('open');document.getElementById('aBk').classList.remove('open');};
    document.getElementById('alertBtnD').addEventListener('click',openAP);
    document.getElementById('alertBtnM').addEventListener('click',openAP);
    document.getElementById('aBk').addEventListener('click',closeAP);
    document.querySelectorAll('.qa').forEach(b=>{b.addEventListener('click',()=>{alerts.push({id:aId++,tk:'BTC',co:{above:'Price Above',whale:'Whale Txn'}[b.dataset.c]||b.dataset.c,va:b.dataset.v,ac:true,tr:false,tm:'Just now'});rA();toast('Alert created!','success');});});

    // Liq tabs
    document.querySelectorAll('.lt').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.lt').forEach(x=>{x.classList.remove('active');x.className=x.className.replace('bg-chain-accent/10 text-chain-accent border-chain-accent/20','text-chain-muted border-chain-border');});b.classList.add('active');b.className=b.className.replace('text-chain-muted border-chain-border','bg-chain-accent/10 text-chain-accent border-chain-accent/20');curLiq=b.dataset.a;rLL();});}); 

    // Whale filters
    document.querySelectorAll('.wf').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.wf').forEach(x=>{x.classList.remove('active');x.className=x.className.replace('bg-chain-accent/10 text-chain-accent border-chain-accent/20','text-chain-muted border-chain-border');});b.classList.add('active');b.className=b.className.replace('text-chain-muted border-chain-border','bg-chain-accent/10 text-chain-accent border-chain-accent/20');rWH(b.dataset.f);});});

    // Connect
    document.getElementById('connectBtnD').addEventListener('click',()=>toast('Wallet connection initiated...','info'));

    // Navigation
    const secs=document.querySelectorAll('section[id]');
    function updNav(){const s=window.scrollY+140;secs.forEach(sec=>{const t=sec.offsetTop,h=sec.offsetHeight,id=sec.getAttribute('id');if(s>=t&&s<t+h){document.querySelectorAll('.bnav-i').forEach(n=>{n.classList.toggle('active',n.dataset.bn===id);n.classList.toggle('text-chain-muted',n.dataset.bn!==id);});document.querySelectorAll('.nl').forEach(n=>{n.classList.toggle('active',n.getAttribute('href')==='#'+id);n.classList.toggle('text-chain-accent',n.getAttribute('href')==='#'+id);n.classList.toggle('text-chain-muted',n.getAttribute('href')!=='#'+id);});}});}
    window.addEventListener('scroll',updNav);

    // Fade-in
    const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),parseInt(e.target.dataset.delay||0));obs.unobserve(e.target);}});},{threshold:0.05});
    document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));

    // Particles
    (function(){const c=document.getElementById('particles');for(let i=0;i<8;i++){const p=document.createElement('div');p.className='particle';p.style.left=Math.random()*100+'%';p.style.animationDuration=(10+Math.random()*15)+'s';p.style.animationDelay=(Math.random()*8)+'s';p.style.width=(1+Math.random())+'px';p.style.height=p.style.width;p.style.opacity=(0.08+Math.random()*0.1).toString();c.appendChild(p);}})();
}

// JALANKAN AUTH GATE PERTAMA KALI
// JALANKAN AUTH GATE PERTAMA KALI
document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); // <--- DIMATIIN SEMENTARA BIAR LANGSUNG MASUK
});
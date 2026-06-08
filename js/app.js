// ==========================================
// FUNGSI HELPER: FETCH DATA + OTOMATIS BAWA TOKEN
// ==========================================
async function fetchWithAuth(url) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
        console.error("Nggak ada token, user belum login!");
        return null;
    }

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            console.error("Token ditolak (401 Unauthorized)");
            return null;
        }

        if (!res.ok) {
            console.error("Gagal fetch data:", res.status);
            return null;
        }

        return await res.json();
    } catch (err) {
        console.error("Error fetch:", err);
        return null;
    }
}

// ==========================================
// LOGIN AUTH (SUPABASE) - YANG BENER
// ==========================================
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        initNukeTrade(); // User udah login, jalankan app
    } else {
        window.location.href = '/login.html'; // Belum login, redirect ke login form
    }
}

// Jalankan Auth pertama kali
document.addEventListener('DOMContentLoaded', checkAuth);

// ==========================================
// MAIN APP INIT
// ==========================================
function initNukeTrade() {
    renderAll();
    initCharts();
    setupEventListeners();
    startRealTimeSimulation();
    
    // PANGGIL SEMUA FUNGSI FETCH DISINI
    fetchRealPrices(); 
    fetchMempoolData();
    fetchBlocksData();
    fetchFeesData();
}

function initCharts() {
    // DESTROY DULU CHART LAMA KALO ADA (FIX ERROR CANVAS)
    if (window.mainChartInstance) window.mainChartInstance.destroy();
    if (window.liqChartInstance) window.liqChartInstance.destroy();
    if (window.ifChartInstance) window.ifChartInstance.destroy();
    if (window.ifExChartInstance) window.ifExChartInstance.destroy();

    const cO={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(26,46,38,0.4)'},ticks:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9}}},y:{grid:{color:'rgba(26,46,38,0.4)'},ticks:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9}}}}};
    
    // SIMPEN INSTANCE CHART KE WINDOW
    window.mainChartInstance = new Chart(document.getElementById('mainCh'),{type:'line',data:{labels:gL(30),datasets:[{data:gD(30,1.0,1.6),borderColor:'#00ff88',borderWidth:1.5,fill:true,backgroundColor:'rgba(0,255,136,0.06)',pointRadius:0,tension:.4}]},options:{...cO,plugins:{legend:{display:false},tooltip:{backgroundColor:'#111c18',borderColor:'#1a2e26',borderWidth:1,titleColor:'#e8f5ee',bodyColor:'#c8e0d4'}},scales:{x:{display:false},y:{display:false}}}});
    
    window.liqChartInstance = new Chart(document.getElementById('liqCh'),{type:'bar',data:{labels:gL(14),datasets:[{label:'Long',data:gD(14,20,120),backgroundColor:'rgba(255,53,88,0.5)',borderRadius:3,borderSkipped:false},{label:'Short',data:gD(14,10,80),backgroundColor:'rgba(0,194,255,0.5)',borderRadius:3,borderSkipped:false}]},options:{...cO,plugins:{legend:{display:true,position:'top',align:'end',labels:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9},boxWidth:8,boxHeight:6,padding:8}}}}});
    
    window.ifChartInstance = new Chart(document.getElementById('ifCh'),{type:'bar',data:{labels:gL(14),datasets:[{label:'In',data:gD(14,400,1200),backgroundColor:'rgba(255,53,88,0.5)',borderRadius:2,borderSkipped:false},{label:'Out',data:gD(14,600,1800).map(v=>-v),backgroundColor:'rgba(0,255,136,0.5)',borderRadius:2,borderSkipped:false}]},options:{...cO,plugins:{legend:{display:true,position:'top',align:'end',labels:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9},boxWidth:8,boxHeight:6,padding:8}}}}});
    
    window.ifExChartInstance = new Chart(document.getElementById('ifExCh'),{type:'bar',data:{labels:['Binance','Coinbase','OKX','Bybit','Kraken'],datasets:[{label:'$M',data:[840,420,380,340,280],backgroundColor:['#f59e0b','#00c2ff','#ff3558','#a855f7','#00ff88'],borderRadius:4,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(26,46,38,0.3)'},ticks:{color:'#4a6b5d',font:{family:'JetBrains Mono',size:9},callback:v=>'$'+v+'M'}},y:{grid:{display:false},ticks:{color:'#c8e0d4',font:{family:'JetBrains Mono',size:9}}}}}});
}

function startRealTimeSimulation() {
    function sim(){
        bn++;
        document.getElementById('btcP').textContent='$'+Math.round(bB+=(Math.random()-.49)*40).toLocaleString();
        document.getElementById('ethP').textContent='$'+Math.round(eB+=(Math.random()-.49)*4).toLocaleString();
        document.getElementById('gasP').textContent=Math.round(gB=Math.max(5,Math.min(50,gB+(Math.random()-.5)*2)))+' Gwei';
        
        bC+=(Math.random()-.5)*.08;
        eC+=(Math.random()-.5)*.06;
        tC+=(Math.random()-.5)*.04;
        
        const u=v=>v>=0;
        ['btc','eth','tvl'].forEach(k=>{
            const el=document.getElementById(k+'Ch');
            const ic=document.getElementById(k==='btc'?'btcC':k==='eth'?'ethC':'tvlC');
            
            // FIX ERROR toFixed: Bungkus dengan Number() biar nggak undefined
            let currentVal = Number(eval(k+'C')); 
            
            if(el){
                el.textContent=(u(currentVal)?'+':'')+currentVal.toFixed(2)+'%';
                el.className='text-[10px] cv font-medium '+(u(currentVal)?'text-chain-accent':'text-chain-danger');
            }
            if(ic){
                ic.className='fa-solid fa-caret-'+(u(currentVal)?'up':'down')+' text-[9px] '+(u(currentVal)?'text-chain-accent':'text-chain-danger');
            }
        });
        
        if(Math.random()<.04){const a=alerts.find(x=>x.ac&&!x.tr);if(a){a.tr=true;a.msg='Condition met: '+a.tk+' '+a.co+' '+a.va;rA();toast('ALERT: '+a.tk+' '+a.co,'danger');}}
    }
    setInterval(sim,4000);
}

function setupEventListeners() {
    const sO=document.getElementById('searchOv'),sI=document.getElementById('searchIn');
    function oS(){sO.classList.add('active');sI.focus();}
    function cS(){sO.classList.remove('active');sI.blur();}
    document.getElementById('searchBtnD').addEventListener('click',oS);
    document.getElementById('searchBtnM').addEventListener('click',oS);
    sI.addEventListener('input',e=>{const q=e.target.value.toLowerCase(),r=document.getElementById('searchRes');if(!q.trim()){r.innerHTML='<div class="px-4 py-6 text-center text-chain-muted text-xs">Type to search...</div>';return;}const m=TD.filter(t=>t.s.toLowerCase().includes(q)||t.n.toLowerCase().includes(q));r.innerHTML=m.length?m.map(t=>`<div class="sr-item flex items-center gap-3 px-4 py-3 cursor-pointer" onclick="window.location.href='/detail.html?id=${t.id}'" data-s="${t.s}">><i class="${t.ic} ${t.icc}"></i><span class="text-sm text-chain-bright">${t.s}</span><span class="text-[10px] text-chain-muted">${t.n}</span><span class="cv text-[10px] ml-auto ${t.ch>=0?'text-chain-accent':'text-chain-danger'}">${t.ch>=0?'+':''}${t.ch}%</span></div>`).join(''):'<div class="px-4 py-6 text-center text-chain-muted text-xs">No results</div>';});
    document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();oS();}if(e.key==='Escape'){cS();closeAP();}});
    sO.addEventListener('click',e=>{if(e.target.id==='searchOv')cS();});

    function openAP(){document.getElementById('aPn').classList.add('open');document.getElementById('aBk').classList.add('open');rA();}
    window.closeAP=function(){document.getElementById('aPn').classList.remove('open');document.getElementById('aBk').classList.remove('open');};
    document.getElementById('alertBtnD').addEventListener('click',openAP);
    document.getElementById('alertBtnM').addEventListener('click',openAP);
    document.getElementById('aBk').addEventListener('click',closeAP);
    document.querySelectorAll('.qa').forEach(b=>{b.addEventListener('click',()=>{alerts.push({id:aId++,tk:'BTC',co:{above:'Price Above',whale:'Whale Txn'}[b.dataset.c]||b.dataset.c,va:b.dataset.v,ac:true,tr:false,tm:'Just now'});rA();toast('Alert created!','success');});});

    document.querySelectorAll('.lt').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.lt').forEach(x=>{x.classList.remove('active');x.className=x.className.replace('bg-chain-accent/10 text-chain-accent border-chain-accent/20','text-chain-muted border-chain-border');});b.classList.add('active');b.className=b.className.replace('text-chain-muted border-chain-border','bg-chain-accent/10 text-chain-accent border-chain-accent/20');curLiq=b.dataset.a;rLL();});}); 

    document.querySelectorAll('.wf').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.wf').forEach(x=>{x.classList.remove('active');x.className=x.className.replace('bg-chain-accent/10 text-chain-accent border-chain-accent/20','text-chain-muted border-chain-border');});b.classList.add('active');b.className=b.className.replace('text-chain-muted border-chain-border','bg-chain-accent/10 text-chain-accent border-chain-accent/20');rWH(b.dataset.f);});});

    document.getElementById('connectBtnD').addEventListener('click',()=>toast('Wallet connection initiated...','info'));

    const secs=document.querySelectorAll('section[id]');
    function updNav(){const s=window.scrollY+140;secs.forEach(sec=>{const t=sec.offsetTop,h=sec.offsetHeight,id=sec.getAttribute('id');if(s>=t&&s<t+h){document.querySelectorAll('.bnav-i').forEach(n=>{n.classList.toggle('active',n.dataset.bn===id);n.classList.toggle('text-chain-muted',n.dataset.bn!==id);});document.querySelectorAll('.nl').forEach(n=>{n.classList.toggle('active',n.getAttribute('href')==='#'+id);n.classList.toggle('text-chain-accent',n.getAttribute('href')==='#'+id);n.classList.toggle('text-chain-muted',n.getAttribute('href')!=='#'+id);});}});}
    window.addEventListener('scroll',updNav);

    const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),parseInt(e.target.dataset.delay||0));obs.unobserve(e.target);}});},{threshold:0.05});
    document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));

    (function(){const c=document.getElementById('particles');for(let i=0;i<8;i++){const p=document.createElement('div');p.className='particle';p.style.left=Math.random()*100+'%';p.style.animationDuration=(10+Math.random()*15)+'s';p.style.animationDelay=(Math.random()*8)+'s';p.style.width=(1+Math.random())+'px';p.style.height=p.style.width;p.style.opacity=(0.08+Math.random()*0.1).toString();c.appendChild(p);}})();
}

// ==========================================
// FUNGSI FETCH DATA MEMPOOLS/BLOCKS/FEES
// ==========================================
async function fetchRealPrices() {
    const data = await fetchWithAuth(`${API_BASE}/data?endpoint=price`);
    if (data) {
        if (data.bitcoin) { bB = data.bitcoin.usd; bC = data.bitcoin.usd_24h_change; }
        if (data.ethereum) { eB = data.ethereum.usd; eC = data.ethereum.usd_24h_change; }
    }
}

async function fetchMempoolData() {
    const data = await fetchWithAuth(`${API_BASE}/data?endpoint=mempool`);
    if (data) {
        // TODO: Update DOM Mempool lo di sini (misal: document.getElementById('mempoolCount').innerText = data.count;)
        console.log("Mempool data loaded", data);
    }
}

async function fetchBlocksData() {
    const data = await fetchWithAuth(`${API_BASE}/data?endpoint=blocks`);
    if (data) {
        // TODO: Update DOM Blocks lo di sini
        console.log("Blocks data loaded", data);
    }
}

async function fetchFeesData() {
    const data = await fetchWithAuth(`${API_BASE}/data?endpoint=fees`);
    if (data) {
        // TODO: Update DOM Fees lo di sini (misal: document.getElementById('gasP').innerText = data.fastestFee;)
        console.log("Fees data loaded", data);
    }
}
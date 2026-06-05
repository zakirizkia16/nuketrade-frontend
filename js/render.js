// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Fungsi pembantu buat bikin Tag UI (kayak "Long", "Smart", "Hot")
function createTag(text, bgColorClass, textColorClass) {
    return `<span class="tag ${bgColorClass} ${textColorClass}">${text}</span>`;
}

// ==========================================
// MAIN RENDER
// ==========================================

function renderAll() {
    rC('cBtc', 'btc');
    rC('cEth', 'eth');
    rC('cTvl', 'tvl');
    rC('cGas', 'gas');

    const tickerEl = document.getElementById('tickerContent');
    if (tickerEl) {
        tickerEl.innerHTML = [...TI, ...TI].map(t => `
            <span class="inline-flex items-center gap-1.5 text-[10px]">
                <span class="font-medium text-chain-bright">${t.l}</span>
                <span class="cv text-chain-text">${t.pr}</span>
                <span class="${t.u ? 'text-chain-accent' : 'text-chain-danger'} cv">${t.c}</span>
            </span>
        `).join('');
    }

    rLL(); 
    rWH(); 
    rPR(); 
    rA(); 
    renderLiqTable(); 
    renderInflowTable(); 
    renderWhaleFeedTable();
}

// ==========================================
// SECTION RENDERERS
// ==========================================

function rLL() {
    const el = document.getElementById('liqList');
    if (!el) return;

    const dataMap = { btc: LLB, eth: LLE, sol: LLS };
    const d = dataMap[curLiq] || LLB;

    el.innerHTML = d.map(l => {
        // Variabel untuk conditional styling
        const isCurrent = l.cu;
        const isCluster = l.cl;
        const rowClass = isCurrent ? 'bg-chain-accent/5 border-l-2 border-l-chain-accent' : '';
        const priceClass = isCurrent ? 'text-chain-accent font-bold' : 'text-chain-bright';

        return `
            <div class="flex items-center gap-2 py-1.5 px-2 rounded ${rowClass}">
                <div class="cv text-[11px] ${priceClass} w-16 sm:w-20 shrink-0">${l.pr}</div>
                <div class="flex-1 space-y-0.5">
                    <div class="flex items-center gap-1">
                        <span class="text-[8px] text-chain-muted w-8">Long</span>
                        <div class="liq-bar flex-1"><div class="liq-bar-f bg-chain-danger" style="width:${l.lp}%"></div></div>
                        <span class="cv text-[8px] text-chain-danger w-10 text-right">${l.ll}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-[8px] text-chain-muted w-8">Short</span>
                        <div class="liq-bar flex-1"><div class="liq-bar-f bg-chain-info" style="width:${l.sp}%"></div></div>
                        <span class="cv text-[8px] text-chain-info w-10 text-right">${l.sl}</span>
                    </div>
                </div>
                ${isCluster ? createTag('Cluster', 'bg-chain-warn/10', 'text-chain-warn') : ''}
                ${isCurrent ? createTag('Now', 'bg-chain-accent/10', 'text-chain-accent') : ''}
            </div>
        `;
    }).join('');
}

function renderLiqTable() {
    const el = document.getElementById('liqTb');
    if (!el) return;

    el.innerHTML = RL.map(l => {
        const sideColor = l.si === 'Long' ? 'bg-chain-danger/10 text-chain-danger' : 'bg-chain-info/10 text-chain-info';

        return `
            <tr>
                <td data-l="Time" class="cv text-chain-muted">${l.t}</td>
                <td data-l="Asset" class="font-medium text-chain-bright">${l.a}</td>
                <td data-l="Side">${createTag(l.si, sideColor, '')}</td>
                <td data-l="Size" class="cv text-chain-bright">${l.sz}</td>
                <td data-l="Value" class="cv text-chain-warn font-medium">${l.v}</td>
                <td data-l="Price" class="cv text-chain-text hidden sm:table-cell">${l.lp}</td>
                <td data-l="Exchange" class="text-chain-muted hidden sm:table-cell">${l.ex}</td>
            </tr>
        `;
    }).join('');
}

function rWH(f = 'all') {
    const el = document.getElementById('whaleG');
    if (!el) return;

    let d = [...WH];
    if (f !== 'all') d = d.filter(w => w.tp === f);

    el.innerHTML = d.map(w => {
        // Mapping warna untuk tipe whale
        const typeColors = {
            smart: 'bg-chain-accent/10 text-chain-accent',
            exchange: 'bg-chain-info/10 text-chain-info',
            fund: 'bg-chain-purple/10 text-chain-purple',
            mev: 'bg-chain-warn/10 text-chain-warn'
        };

        const isHunting = hunted.has(w.ad);
        const btnClass = isHunting
            ? 'bg-chain-accent/15 border-chain-accent text-chain-accent'
            : 'bg-chain-surface border-chain-border text-chain-muted hover:border-chain-accent/30';
        const btnIcon = isHunting ? 'fa-crosshairs' : 'fa-plus';
        const btnText = isHunting ? 'Hunting' : 'Hunt';
        
        const scoreClass = w.sc >= 80 ? 'text-chain-accent' : w.sc >= 60 ? 'text-chain-warn' : 'text-chain-muted';
        const pnlClass = w.pn.startsWith('+') ? 'text-chain-accent' : 'text-chain-muted';

        // Mini chart bar
        const miniChart = w.ac.map(v => 
            `<div class="w-1 sm:w-1.5 rounded-sm bg-chain-accent/40" style="height:${Math.max(v * 1.5, 1)}px"></div>`
        ).join('');

        return `
            <div class="hunt-c bg-chain-card rounded-lg p-3">
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <div class="font-semibold text-chain-bright text-xs sm:text-sm">${w.lb}</div>
                        <div class="cv text-[9px] text-chain-muted">${w.ad}</div>
                    </div>
                    <button class="hb px-2 py-1 text-[9px] font-semibold rounded border ${btnClass}" data-a="${w.ad}">
                        <i class="fa-solid ${btnIcon} mr-0.5"></i>${btnText}
                    </button>
                </div>
                <div class="flex items-center gap-1.5 mb-2">
                    ${createTag(w.tp, typeColors[w.tp] || '', '')}
                    <span class="cv text-[9px] ${scoreClass}">${w.sc}</span>
                </div>
                <div class="grid grid-cols-3 gap-1 text-[9px] sm:text-[10px] mb-2">
                    <div><span class="text-chain-muted block">Bal</span><span class="cv text-chain-bright font-medium">${w.ba}</span></div>
                    <div><span class="text-chain-muted block">PnL</span><span class="cv ${pnlClass} font-medium">${w.pn}</span></div>
                    <div><span class="text-chain-muted block">WR</span><span class="cv text-chain-bright font-medium">${w.wr}</span></div>
                </div>
                <div class="text-[9px] text-chain-muted mb-1.5">${w.lt}: <span class="text-chain-text">${w.lm}</span></div>
                <div class="flex items-end gap-px h-4">${miniChart}</div>
            </div>
        `;
    }).join('');

    // Pasang ulang event listener untuk tombol Hunt
    document.querySelectorAll('.hb').forEach(b => {
        b.addEventListener('click', () => {
            const addr = b.dataset.a;
            if (hunted.has(addr)) {
                hunted.delete(addr);
                toast('Stopped', 'warn');
            } else {
                hunted.add(addr);
                toast('Now hunting!', 'success');
            }
            // Refresh tampilan whale
            const activeFilter = document.querySelector('.wf.active')?.dataset.f || 'all';
            rWH(activeFilter);
            
            const hCnt = document.getElementById('hCnt');
            if (hCnt) hCnt.textContent = hunted.size;
        });
    });
}

function renderInflowTable() {
    const el = document.getElementById('ifTb');
    if (!el) return;

    el.innerHTML = IT.map(t => {
        const signalColors = {
            bearish: 'bg-chain-danger/10 text-chain-danger',
            bullish: 'bg-chain-accent/10 text-chain-accent',
            neutral: 'bg-chain-muted/10 text-chain-muted'
        };
        const sigClass = signalColors[t.sg] || signalColors.neutral;

        return `
            <tr>
                <td data-l="Time" class="cv text-chain-muted">${t.t}</td>
                <td data-l="Token" class="font-medium text-chain-bright">${t.tk}</td>
                <td data-l="From" class="cv text-chain-text">${t.fr}</td>
                <td data-l="To" class="text-chain-text">${t.to}</td>
                <td data-l="Amount" class="cv text-chain-bright">${t.am}</td>
                <td data-l="Value" class="cv text-chain-warn font-medium">${t.vl}</td>
                <td data-l="Signal">${createTag(t.sg, sigClass, '')}</td>
            </tr>
        `;
    }).join('');
}

function rPR() {
    const el = document.getElementById('predG');
    if (!el) return;

    el.innerHTML = PR.map(p => {
        const yesColor = p.yp > 50 ? '#00ff88' : '#4a6b5d';
        const noColor = p.np > 50 ? '#ff3558' : '#4a6b5d';
        const hotTag = p.ho ? createTag('Hot', 'bg-chain-danger/10', 'text-chain-danger', '<i class="fa-solid fa-fire mr-0.5"></i>') : '';

        return `
            <div class="mc bg-chain-card rounded-lg p-3">
                <div class="text-[12px] sm:text-sm font-medium text-chain-bright leading-snug mb-1.5">${p.q}</div>
                <div class="flex items-center gap-1.5 mb-2">
                    ${hotTag}
                    <span class="text-[9px] text-chain-muted cv">Ends ${p.ed}</span>
                </div>
                <div class="mb-2.5">
                    <div class="flex justify-between text-[10px] mb-1">
                        <span class="cv font-medium" style="color:${yesColor}">Yes ${p.yp}%</span>
                        <span class="cv font-medium" style="color:${noColor}">No ${p.np}%</span>
                    </div>
                    <div class="pred-bar flex">
                        <div class="pred-bar-f" style="width:${p.yp}%;background:${yesColor}"></div>
                        <div class="pred-bar-f" style="width:${p.np}%;background:${noColor}"></div>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-[9px] text-chain-muted cv">Vol: ${p.vo}</span>
                    <div class="flex gap-1">
                        <button class="pv px-2.5 py-1 bg-chain-accent/10 border border-chain-accent/30 text-chain-accent text-[10px] font-semibold rounded active:bg-chain-accent/20" data-i="${p.id}" data-s="y">Yes</button>
                        <button class="pv px-2.5 py-1 bg-chain-danger/10 border border-chain-danger/30 text-chain-danger text-[10px] font-semibold rounded active:bg-chain-danger/20" data-i="${p.id}" data-s="n">No</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Event listener tombol vote
    document.querySelectorAll('.pv').forEach(b => {
        b.addEventListener('click', () => {
            const p = PR.find(x => x.id === parseInt(b.dataset.i));
            if (!p) return;

            if (b.dataset.s === 'y') {
                p.yp = Math.min(99, p.yp + 1);
                p.np = 100 - p.yp;
            } else {
                p.np = Math.min(99, p.np + 1);
                p.yp = 100 - p.np;
            }
            rPR();
            toast('Vote recorded!', 'success');
        });
    });
}

function renderWhaleFeedTable() {
    const el = document.getElementById('whTb');
    if (!el) return;

    el.innerHTML = WTx.map(w => {
        const typeColors = {
            transfer: 'bg-chain-accent/10 text-chain-accent',
            swap: 'bg-chain-info/10 text-chain-info',
            deposit: 'bg-chain-purple/10 text-chain-purple'
        };
        const tClass = typeColors[w.tp] || typeColors.transfer;

        return `
            <tr>
                <td data-l="Time" class="cv text-chain-muted">${w.t}</td>
                <td data-l="Type">${createTag(w.tp, tClass, '')}</td>
                <td data-l="From" class="cv text-chain-text">${w.f}</td>
                <td data-l="To" class="cv text-chain-text">${w.to}</td>
                <td data-l="Value" class="cv text-chain-bright font-medium">${w.v}</td>
                <td data-l="USD" class="cv text-chain-warn">${w.u}</td>
            </tr>
        `;
    }).join('');
}

function rA() {
    const aList = document.getElementById('aList');
    if (!aList) return;

    const activeAlerts = alerts.filter(a => a.ac).length;
    
    const badge1 = document.getElementById('alertBadgeD');
    const badge2 = document.getElementById('alertBadgeM');
    if (badge1) badge1.textContent = activeAlerts;
    if (badge2) badge2.textContent = activeAlerts;

    aList.innerHTML = alerts.map(a => {
        const borderClass = a.tr ? 'border-chain-danger/30' : 'border-chain-border';
        const triggerMsg = a.tr ? `<div class="text-[9px] text-chain-danger"><i class="fa-solid fa-bolt mr-0.5"></i>${a.msg}</div>` : '';
        const activeClass = a.ac ? 'text-chain-accent' : 'text-chain-muted';
        const activeText = a.ac ? 'Active' : 'Paused';

        return `
            <div class="bg-chain-surface rounded-lg p-2.5 border ${borderClass}">
                <div class="flex items-center justify-between mb-0.5">
                    <span class="text-[11px] font-semibold text-chain-bright">${a.tk} — ${a.co}</span>
                    <button class="da text-chain-muted text-[9px]" data-id="${a.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="cv text-[9px] text-chain-muted">${a.va}</div>
                ${triggerMsg}
                <div class="flex items-center justify-between mt-1">
                    <span class="text-[8px] text-chain-muted">${a.tm}</span>
                    <button class="ta cv text-[9px] ${activeClass}" data-id="${a.id}">${activeText}</button>
                </div>
            </div>
        `;
    }).join('');

    // Event Listeners Alerts
    document.querySelectorAll('.da').forEach(b => {
        b.addEventListener('click', () => {
            alerts = alerts.filter(a => a.id !== parseInt(b.dataset.id));
            rA();
        });
    });

    document.querySelectorAll('.ta').forEach(b => {
        b.addEventListener('click', () => {
            const a = alerts.find(x => x.id === parseInt(b.dataset.id));
            if (a) a.ac = !a.ac;
            rA();
        });
    });
}
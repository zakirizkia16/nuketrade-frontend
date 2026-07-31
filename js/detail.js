// Fungsi Fetch dengan Auth
async function fetchWithAuth(url) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const token = session?.access_token;
    if (!token) return window.location.href = '/login.html';

    try {
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) { return null; }
}

// Cek Auth dulu
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) window.location.href = '/login.html';
    else loadTokenData();
}
checkAuth();

// Fungsi format angka besar
function formatLargeNum(num) {
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num?.toLocaleString();
}

// Main Logic
async function loadTokenData() {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenId = urlParams.get('id');

    if (!tokenId) {
        document.getElementById('tokenName').innerText = "Token Not Found";
        return;
    }

    // 1. Fetch Data Detail Koin
    const detail = await fetchWithAuth(`${API_BASE}/data?endpoint=token_detail&id=${tokenId}`);
    
    if (!detail || detail.error || !detail.market_data) {
        document.getElementById('tokenName').innerText = "Data Not Available";
        document.getElementById('tokenPrice').innerText = "N/A";
        document.getElementById('tokenChange').innerText = "API Limit / Coin Not Found";
        console.warn("Gagal load detail koin:", detail);
        return;
    }

    // Update Header Info
    document.getElementById('tokenName').innerText = detail.name || 'Unknown';
    document.getElementById('tokenSymbol').innerText = detail.symbol || '';
    
    const price = detail.market_data.current_price?.usd || 0;
    const change = detail.market_data.price_change_percentage_24h || 0;
    
    document.getElementById('tokenPrice').innerText = '$' + price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6});
    
    const changeEl = document.getElementById('tokenChange');
    changeEl.innerText = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
    changeEl.className = 'text-sm mt-1 font-medium ' + (change >= 0 ? 'text-chain-accent' : 'text-chain-danger');

    if (detail.image?.thumb) {
        const img = document.getElementById('tokenImg');
        img.src = detail.image.thumb;
        img.classList.remove('hidden');
    }

    // ==========================================
    // 2. RENDER POSITIONING BOARD
    // ==========================================
    const positioningTable = document.getElementById('positioningTableBody');
    const otherTokens = ['Bitcoin', 'Ethereum', 'Solana', 'Dogecoin', 'Ripple'];
    
    if (!otherTokens.includes(detail.name)) {
        otherTokens.unshift(detail.name);
    } else {
        otherTokens.splice(otherTokens.indexOf(detail.name), 1);
        otherTokens.unshift(detail.name);
    }

    let posHtml = '';
    otherTokens.forEach(name => {
        const hashStr = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const smartCOT = (hashStr % 60) + 20; 
        const retailLong = (hashStr % 70) + 15; 
        
        let signalText = 'NEUTRAL';
        let signalColor = 'text-chain-muted';
        
        if (Math.abs(smartCOT - (100-retailLong)) > 40) { 
            signalText = 'DIVERGENT'; signalColor = 'text-yellow-400'; 
        } else if (smartCOT > 70) { 
            signalText = 'EKSTRIM LONG'; signalColor = 'text-chain-accent'; 
        } else if (smartCOT < 30) { 
            signalText = 'EKSTRIM SHORT'; signalColor = 'text-chain-danger'; 
        }

        const smartBarColor = smartCOT >= 50 ? 'bg-chain-accent' : 'bg-chain-danger';
        const retailBarColor = retailLong >= 50 ? 'bg-chain-danger' : 'bg-chain-accent';

        const isActive = name === detail.name;

        posHtml += `
            <tr class="border-b border-[#1a2e26] last:border-0 ${isActive ? 'bg-[#0a1410]' : ''}">
                <td class="py-3 px-2">
                    <div class="text-sm ${isActive ? 'text-chain-accent font-bold' : 'text-chain-bright font-medium'}">${name}</div>
                    <div class="text-[10px] text-chain-muted uppercase">${name.substring(0,3)}</div>
                </td>
                <td class="py-3 px-2">
                    <div class="flex items-center gap-2">
                        <div class="flex-1 h-1.5 bg-[#060b0a] rounded-full overflow-hidden">
                            <div class="h-full ${smartBarColor} rounded-full" style="width: ${smartCOT}%"></div>
                        </div>
                        <span class="text-chain-bright font-medium w-12 text-right">${smartCOT}/100</span>
                    </div>
                </td>
                <td class="py-3 px-2">
                    <div class="flex items-center gap-2">
                        <div class="flex-1 h-1.5 bg-[#060b0a] rounded-full overflow-hidden">
                            <div class="h-full ${retailBarColor} rounded-full" style="width: ${retailLong}%"></div>
                        </div>
                        <span class="text-chain-bright font-medium w-16 text-right">${retailLong}% Long</span>
                    </div>
                </td>
                <td class="py-3 px-2 text-right">
                    <span class="text-[10px] font-bold uppercase ${signalColor}">${signalText}</span>
                </td>
            </tr>
        `;
    });
    
    positioningTable.innerHTML = posHtml;

    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('pbTimestamp').innerText = now.toLocaleDateString('id-ID', options) + ' WIB';

    // ==========================================
    // 3. FETCH & RENDER CHART HARGA
    // ==========================================
    const chartData = await fetchWithAuth(`${API_BASE}/data?endpoint=token_chart&id=${tokenId}`);
    if (chartData && chartData.prices) {
        const prices = chartData.prices.map(p => p[1]);
        const labels = chartData.prices.map(p => {
            const d = new Date(p[0]);
            return d.getDate() + '/' + (d.getMonth()+1);
        });

        const ctx = document.getElementById('priceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: { labels: labels, datasets: [{ data: prices, borderColor: '#00ff88', borderWidth: 1.5, fill: true, backgroundColor: 'rgba(0,255,136,0.06)', pointRadius: 0, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }

    // ==========================================
    // 4. RENDER PIE CHART HOLDERS (SIMULASI)
    // ==========================================
    const ctxHolders = document.getElementById('holdersChart').getContext('2d');
    new Chart(ctxHolders, {
        type: 'doughnut',
        data: { labels: ['Whales', 'Institutions', 'Retail'], datasets: [{ data: [35, 25, 40], backgroundColor: ['#ff3558', '#00c2ff', '#00ff88'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#4a6b5d', font: { family: "'JetBrains Mono', monospace", size: 10 } } } } }
    });

    // ==========================================
    // 5. RENDER TABEL TOP INFLOW TXNS (SIMULASI)
    // ==========================================
    const inflowTable = document.getElementById('inflowTableBody');
    const signals = ['bearish', 'bullish', 'neutral'];
    const exchanges = ['Binance', 'Coinbase', 'OKX', 'Bybit', 'Kraken', 'Uniswap'];
    const wallets = ['0x3f5c...a8c2', '0x7d2F...f1E9', '0xd7F4...D2f4', '0x2ba7...A4c6', '0xab1C...C1e3'];
    
    let tableHtml = '';
    for(let i = 0; i < 5; i++) {
        const time = `${i*2 + 1}m ago`;
        const from = wallets[Math.floor(Math.random() * wallets.length)];
        const to = exchanges[Math.floor(Math.random() * exchanges.length)];
        const amount = (Math.random() * 1000).toFixed(2) + ' ' + (detail.symbol || 'TKN').toUpperCase();
        const value = '$' + (Math.random() * 50).toFixed(1) + 'M';
        const signal = signals[Math.floor(Math.random() * signals.length)];
        
        const signalColor = signal === 'bullish' ? 'text-chain-accent' : signal === 'bearish' ? 'text-chain-danger' : 'text-chain-muted';
        
        tableHtml += `
            <tr class="border-b border-[#1a2e26] last:border-0 hover:bg-[#0a1410]">
                <td class="py-2 px-2 text-chain-muted">${time}</td>
                <td class="py-2 px-2 text-chain-bright font-medium uppercase">${detail.symbol || 'TKN'}</td>
                <td class="py-2 px-2 text-chain-muted hidden md:table-cell font-mono">${from}</td>
                <td class="py-2 px-2 text-chain-muted hidden md:table-cell">${to}</td>
                <td class="py-2 px-2 text-chain-bright">${amount}</td>
                <td class="py-2 px-2 text-chain-bright font-medium">${value}</td>
                <td class="py-2 px-2 ${signalColor} uppercase font-medium text-[10px]">${signal}</td>
            </tr>
        `;
    }
    inflowTable.innerHTML = tableHtml;
} // <--- INI KURUNG TUTUP YANG BENER UNTUK loadTokenData
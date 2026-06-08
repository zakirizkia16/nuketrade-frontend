// HAPUS BARIS INI DARI KODE LO:
// const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fungsi Fetch dengan Auth (sama kayak di app.js)
async function fetchWithAuth(url) {
    const { data: { session } } = await supabaseClient.auth.getSession(); // Sekarang supabaseClient bakal kebaca dari config.js
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

// Fungsi format angka besar (Miliar, Triliun)
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

    // Fetch Data Detail Koin
    const detail = await fetchWithAuth(`${API_BASE}/data?endpoint=token_detail&id=${tokenId}`);
    
    if (detail) {
        document.getElementById('tokenName').innerText = detail.name;
        document.getElementById('tokenSymbol').innerText = detail.symbol;
        
        const price = detail.market_data.current_price.usd;
        const change = detail.market_data.price_change_percentage_24h;
        
        document.getElementById('tokenPrice').innerText = '$' + price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6});
        
        const changeEl = document.getElementById('tokenChange');
        changeEl.innerText = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        changeEl.className = 'text-sm mt-1 font-medium ' + (change >= 0 ? 'text-chain-accent' : 'text-chain-danger');

        document.getElementById('statMcap').innerText = formatLargeNum(detail.market_data.market_cap.usd);
        document.getElementById('statVol').innerText = formatLargeNum(detail.market_data.total_volume.usd);
        document.getElementById('statChain').innerText = detail.detailing?.platforms ? Object.keys(detail.detailing.platforms)[0]?.charAt(0).toUpperCase() + " Network" : "Native";

        if (detail.image?.thumb) {
            const img = document.getElementById('tokenImg');
            img.src = detail.image.thumb;
            img.classList.remove('hidden');
        }
    }

    // Fetch Data Chart Harga (7 Hari)
    const chartData = await fetchWithAuth(`${API_BASE}/data?endpoint=token_chart&id=${tokenId}`);
    if (chartData) {
        const prices = chartData.prices.map(p => p[1]);
        const labels = chartData.prices.map(p => {
            const d = new Date(p[0]);
            return d.getDate() + '/' + (d.getMonth()+1);
        });

        const ctx = document.getElementById('priceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: prices,
                    borderColor: '#00ff88',
                    borderWidth: 1.5,
                    fill: true,
                    backgroundColor: 'rgba(0,255,136,0.06)',
                    pointRadius: 0,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }

    // Render Pie Chart Holders (Simulasi)
    const ctxHolders = document.getElementById('holdersChart').getContext('2d');
    new Chart(ctxHolders, {
        type: 'doughnut',
        data: {
            labels: ['Whales', 'Institutions', 'Retail'],
            datasets: [{
                data: [35, 25, 40],
                backgroundColor: ['#ff3558', '#00c2ff', '#00ff88'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#4a6b5d', font: { family: "'JetBrains Mono', monospace", size: 10 } } } }
        }
    });
}
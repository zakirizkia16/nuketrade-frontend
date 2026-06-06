// ==========================================
// CONTOH FETCH DATA HARGA (PRICE)
// ==========================================
async function fetchRealPrices() {
    try {
        // 1. Ambil Token dari Supabase
        const { data: { session } } = await supabaseClient.auth.getSession();
        const token = session?.access_token;
        if (!token) return; // Kalau belum login, batalkan

        // 2. Fetch ke Vercel Backend sambil bawa Token
        const res = await fetch(`${API_BASE}/data?endpoint=price`, {
            headers: { 'Authorization': `Bearer ${token}` } // <--- INI PENTING!
        });

        if (res.ok) {
            const data = await res.json();
            if (data.bitcoin) { 
                // Update DOM lo di sini (contoh)
                // bB = data.bitcoin.usd; 
                // bC = data.bitcoin.usd_24h_change; 
            }
        }
    } catch(e) { 
        console.warn('Gagal ambil harga'); 
    }
}

// ==========================================
// CONTOH FETCH MEMPOOL
// ==========================================
async function fetchMempoolData() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch(`${API_BASE}/data?endpoint=mempool`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            // Update DOM Mempool lo di sini (contoh: data.count, data.vsize, dll)
            console.log("Mempool Data:", data);
        }
    } catch(e) { 
        console.warn('Gagal ambil mempool'); 
    }
}

// ==========================================
// CONTOH FETCH BLOCKS
// ==========================================
async function fetchBlocksData() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch(`${API_BASE}/data?endpoint=blocks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            // Update DOM Blocks lo di sini (data itu array of objects)
            console.log("Blocks Data:", data);
        }
    } catch(e) { 
        console.warn('Gagal ambil blocks'); 
    }
}

// ==========================================
// CONTOH FETCH FEES
// ==========================================
async function fetchFeesData() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch(`${API_BASE}/data?endpoint=fees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            // Update DOM Fees lo di sini (data.minimumFee, data.economyFee, data.fastestFee, dll)
            console.log("Fees Data:", data);
        }
    } catch(e) { 
        console.warn('Gagal ambil fees'); 
    }
}
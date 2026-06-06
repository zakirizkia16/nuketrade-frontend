async function fetchRealPrices() {
    try {
        // Ambil token Supabase
        const { data: { session } } = await supabaseClient.auth.getSession();
        const token = session?.access_token;
        
        const res = await fetch(`${API_BASE}/data?endpoint=price`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.bitcoin) { bB = data.bitcoin.usd; bC = data.bitcoin.usd_24h_change; }
            if (data.ethereum) { eB = data.ethereum.usd; eC = data.ethereum.usd_24h_change; }
            document.getElementById('btcP').textContent='$'+Math.round(bB).toLocaleString();
            document.getElementById('ethP').textContent='$'+Math.round(eB).toLocaleString();
        }
    } catch(e) { console.warn('Gagal ambil harga real, pakai simulasi'); }
}
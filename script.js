/**
 * NEXUS122 - OFFICIAL JAVASCRIPT LOGIC
 * V7.0 - Final Fix Navigation & Provider System
 */

/* --- 1. CONFIGURATION --- */
const ADMIN_ACCOUNTS = {
    "DANA": { no: "0895327650818", name: "TRIO DHARMA PUTRA" },
    "GOPAY": { no: "0895326307111", name: "RIZKI ADITYA" },
    "SEABANK": { no: "901182575933", name: "LILIS ALISAH" },
    "QRIS": { type: "image", src: "assets/Qris.png" }
};

const CONTACT_INFO = {
    wa: "6283173037016", 
    tele: "https://t.me/NEXUSBOOSTJB"
};

let usersDB = JSON.parse(localStorage.getItem('nexusUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('nexusSession')) || null;

/* --- 2. INITIALIZATION --- */
window.onload = function() {
    checkLoginStatus();
    
    // Default buka Home
    if(typeof switchCategory === "function") {
        const homeTab = document.querySelector('.cat-item');
        if(homeTab) switchCategory('home', homeTab);
    }
    
    if(document.getElementById('depoMethod')) updateAdminBank();
};

/* --- 3. NAVIGATION LOGIC (FIXED) --- */
function switchCategory(categoryName, element) {
    // 1. Sembunyikan semua halaman
    const allViews = document.querySelectorAll('.category-view');
    allViews.forEach(view => {
        view.style.display = 'none';
        view.style.opacity = '0'; // Reset opacity for fade effect
    });

    // 2. Munculkan halaman target
    const targetView = document.getElementById('view-' + categoryName);
    if (targetView) {
        targetView.style.display = 'block';
        setTimeout(() => targetView.style.opacity = '1', 50);
        
        // FITUR BARU: Kalau buka menu Slot, reset ke pilihan provider
        if(categoryName === 'slot') {
            backToProvider();
        }
    }

    // 3. Update warna menu aktif (Navigasi Atas)
    const allNavItems = document.querySelectorAll('.cat-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    if (element) {
        element.classList.add('active');
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    
    // 4. Update warna menu aktif (Navigasi Bawah)
    const bottomItems = document.querySelectorAll('.bottom-bar .b-item');
    bottomItems.forEach(item => item.classList.remove('active'));
    
    // Highlight icon bawah sesuai kategori
    if(categoryName === 'home') bottomItems[0].classList.add('active');
    // Slot gak punya menu bawah khusus, jadi biarkan netral atau highlight home
}

/* --- 4. SLOT PROVIDER SYSTEM (LOGIKA PENTING) --- */
function openProvider(providerName) {
    // Sembunyikan Menu Utama Provider
    const mainMenu = document.getElementById('slot-main-menu');
    if(mainMenu) mainMenu.style.display = 'none';
    
    // Munculkan List Game Provider yang dipilih
    const targetID = 'games-' + providerName;
    const target = document.getElementById(targetID);
    
    if(target) {
        target.style.display = 'block';
        window.scrollTo(0,0); // Scroll ke paling atas
    } else {
        // Fallback jika div provider belum dibuat
        alert("Provider ini sedang maintenance (HTML belum dibuat).");
        if(mainMenu) mainMenu.style.display = 'block';
    }
}

function backToProvider() {
    // Sembunyikan semua list game
    const allGameLists = document.querySelectorAll('.provider-game-list');
    allGameLists.forEach(list => list.style.display = 'none');
    
    // Munculkan Menu Utama Provider
    const mainMenu = document.getElementById('slot-main-menu');
    if(mainMenu) mainMenu.style.display = 'block';
}

function searchGame() {
    let input = document.getElementById('searchGameInput');
    if(!input) return;
    
    let filter = input.value.toLowerCase();
    // Cari di provider yang sedang aktif (visible)
    let visibleList = document.querySelector('.provider-game-list[style*="block"]');
    
    if(visibleList) {
        let cards = visibleList.querySelectorAll('.game-card');
        cards.forEach(card => {
            let title = card.querySelector('.game-info').innerText.toLowerCase();
            if (title.includes(filter)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    }
}

/* --- 5. AUTH & UI FUNCTIONS --- */
function checkLoginStatus() {
    if (currentUser) updateUI(true); else updateUI(false);
}

function updateUI(isLoggedIn) {
    const guestItems = document.querySelectorAll('.guest-only');
    const memberItems = document.querySelectorAll('.member-only');
    const guestPanel = document.getElementById('guest-panel');
    const userPanel = document.getElementById('user-panel');
    const sbProfile = document.getElementById('sb-profile');

    if (isLoggedIn) {
        guestItems.forEach(el => el.style.display = 'none');
        if(guestPanel) guestPanel.style.display = 'none';
        memberItems.forEach(el => el.style.display = 'flex');
        if(userPanel) userPanel.style.display = 'flex';
        if(sbProfile) sbProfile.style.display = 'flex';
        refreshUserData();
    } else {
        guestItems.forEach(el => el.style.display = 'flex');
        if(guestPanel) guestPanel.style.display = 'flex';
        memberItems.forEach(el => el.style.display = 'none');
        if(userPanel) userPanel.style.display = 'none';
        if(sbProfile) sbProfile.style.display = 'none';
    }
}

/* --- FUNGSI UPDATE DATA USER (SALDO & NAMA) --- */
function refreshUserData() {
    if (!currentUser) return;
    
    // Format Saldo biar ada .00 nya (Contoh: 10.000.00)
    // Trik: Convert ke Rupiah biasa, buang "Rp", tambah ".00"
    let rawRupiah = currentUser.saldo.toLocaleString('id-ID'); 
    let displayFormat = rawRupiah + ".00";

    // 1. Update Tampilan Dashboard Baru (Peti & Saldo Hijau)
    const dispUser = document.getElementById('display-username');
    const dispSaldo = document.getElementById('display-saldo');
    
    if(dispUser) dispUser.innerText = currentUser.username;
    if(dispSaldo) dispSaldo.innerText = displayFormat;

    // 2. Update Header Atas (Kecil)
    const headerSaldo = document.getElementById('header-saldo');
    if(headerSaldo) headerSaldo.innerText = "Rp " + rawRupiah;

    // 3. Update Sidebar
    const sbUser = document.getElementById('sb-username-text');
    const sbSaldo = document.getElementById('sb-saldo-text');
    if(sbUser) sbUser.innerText = currentUser.username;
    if(sbSaldo) sbSaldo.innerText = "IDR " + rawRupiah;

    // 4. Update Modal WD
    const wdSaldo = document.getElementById('wd-user-saldo');
    const wdBank = document.getElementById('wd-user-bank');
    const wdName = document.getElementById('wd-user-name');
    if(wdSaldo) wdSaldo.innerText = "Rp " + rawRupiah;
    if(wdBank) wdBank.innerText = `${currentUser.bankName} - ${currentUser.accNum}`;
    if(wdName) wdName.innerText = currentUser.accName;

    // Efek putar icon refresh
    const icon = document.querySelector('.refresh-icon');
    if(icon) {
        icon.style.transition = "transform 0.5s";
        icon.style.transform = "rotate(360deg)";
        setTimeout(() => icon.style.transform = "rotate(0deg)", 500);
    }
}



/* --- 6. TRANSACTION FUNCTIONS --- */
function openTransaction(tab) {
    if (!currentUser) {
        alert("Silahkan Login dulu bosku!");
        openModal('loginModal');
        return;
    }
    openModal('transModal');
    setTransTab(tab);
}

function updateAdminBank() {
    const method = document.getElementById('depoMethod').value;
    const textInfo = document.getElementById('bank-text-info');
    const qrInfo = document.getElementById('bank-qr-info');
    const numDisplay = document.getElementById('admin-number');
    const nameDisplay = document.getElementById('admin-name');

    if (!ADMIN_ACCOUNTS[method]) return;

    if (method === 'QRIS') {
        textInfo.style.display = 'none';
        qrInfo.style.display = 'block';
    } else {
        qrInfo.style.display = 'none';
        textInfo.style.display = 'block';
        numDisplay.innerText = ADMIN_ACCOUNTS[method].no;
        nameDisplay.innerText = ADMIN_ACCOUNTS[method].name;
    }
}

function submitDeposit() {
    const amount = parseInt(document.getElementById('depoAmount').value);
    const proofInput = document.getElementById('depoProof');
    
    if (!amount || amount < 10000) { alert("Minimal Deposit Rp 10.000"); return; }
    if (proofInput && proofInput.files.length === 0) { alert("⚠️ Wajib upload bukti transfer!"); return; }

    const delayMs = Math.floor(Math.random() * (45000 - 25000 + 1) + 25000);
    const delaySec = Math.floor(delayMs / 1000);

    // Record Pending
    const trxId = Date.now();
    const newTrx = { id: trxId, type: 'DEPOSIT', amount: amount, status: 'PENDING', date: new Date().toLocaleString() };
    if (!currentUser.history) currentUser.history = [];
    currentUser.history.unshift(newTrx);
    saveDB();

    const btn = document.querySelector('#view-depo button.btn-primary');
    const oldText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses (${delaySec}s)...`;
    btn.disabled = true;

    alert(`Permintaan Diterima!\nEstimasi proses: ${delaySec} detik.\nSaldo akan masuk otomatis.`);
    closeModal('transModal');
    btn.innerHTML = oldText;
    btn.disabled = false;
    document.getElementById('depoAmount').value = '';

    // Auto Success Logic
    setTimeout(() => {
        if (currentUser) {
            currentUser.saldo += amount;
            const idx = currentUser.history.findIndex(t => t.id === trxId);
            if(idx !== -1) currentUser.history[idx].status = 'SUCCESS';
            saveDB();
            refreshUserData();
            alert(`✅ DEPOSIT SUKSES!\nSaldo Rp ${formatRupiah(amount)} masuk.`);
        }
    }, delayMs);
}

function submitWithdraw() {
    const amount = parseInt(document.getElementById('wdAmount').value);
    if (!amount || amount < 50000) { alert("Minimal WD Rp 50.000"); return; }
    if (amount > currentUser.saldo) { alert("Saldo kurang!"); return; }

    const btn = document.querySelector('#view-wd button.btn-primary');
    btn.innerHTML = "Mengirim..."; 
    btn.disabled = true;

    setTimeout(() => {
        currentUser.saldo -= amount;
        const newTrx = { id: Date.now(), type: 'WITHDRAW', amount: amount, status: 'SUCCESS', date: new Date().toLocaleString() };
        if (!currentUser.history) currentUser.history = [];
        currentUser.history.unshift(newTrx);
        saveDB();
        
        alert(`Penarikan Rp ${formatRupiah(amount)} Berhasil!`);
        btn.innerHTML = "CAIRKAN DANA"; btn.disabled = false;
        closeModal('transModal'); refreshUserData();
    }, 2000);
}

/* --- 7. HISTORY & HELPERS --- */
function openHistory() {
    if(!currentUser) return;
    openModal('historyModal');
    const container = document.getElementById('history-list');
    container.innerHTML = '';

    if (!currentUser.history || currentUser.history.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">Belum ada transaksi.</div>';
        return;
    }

    currentUser.history.forEach(trx => {
        let statusClass = trx.status === 'SUCCESS' ? 'status-success' : 'status-pending';
        let statusLabel = trx.status === 'SUCCESS' ? 'Berhasil' : 'Menunggu';
        const isDepo = trx.type === 'DEPOSIT';
        const icon = isDepo ? '<i class="fa-solid fa-arrow-down" style="color:#2ed573"></i>' : '<i class="fa-solid fa-arrow-up" style="color:#ff4757"></i>';
        
        const html = `
            <div class="history-item">
                <div class="hist-left"><div class="hist-type">${icon} ${trx.type}</div><div class="hist-date">${trx.date}</div></div>
                <div class="hist-right"><div class="hist-amount" style="color:${isDepo?'#2ed573':'#ff4757'}">${isDepo?'+':'-'} ${formatRupiah(trx.amount)}</div><div class="hist-status ${statusClass}">${statusLabel}</div></div>
            </div>`;
        container.innerHTML += html;
    });
}

function saveDB() {
    const index = usersDB.findIndex(u => u.username === currentUser.username);
    if (index !== -1) { usersDB[index] = currentUser; localStorage.setItem('nexusUsers', JSON.stringify(usersDB)); localStorage.setItem('nexusSession', JSON.stringify(currentUser)); }
}
function formatRupiah(n) { return "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function copyText() { navigator.clipboard.writeText(document.getElementById('admin-number').innerText).then(()=>alert("Disalin!")); }
function setAmount(v) { document.getElementById('depoAmount').value = v; }
function setTransTab(t) {
    if(t==='depo') { document.getElementById('view-depo').style.display='block'; document.getElementById('view-wd').style.display='none'; document.getElementById('tab-depo').classList.add('active'); document.getElementById('tab-wd').classList.remove('active'); updateAdminBank(); }
    else { document.getElementById('view-depo').style.display='none'; document.getElementById('view-wd').style.display='block'; document.getElementById('tab-depo').classList.remove('active'); document.getElementById('tab-wd').classList.add('active'); }
}
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); document.getElementById('overlay').style.display = document.getElementById('sidebar').classList.contains('active') ? 'block' : 'none'; }
function openModal(id) { document.getElementById(id).style.display='flex'; }
function closeModal(id) { document.getElementById(id).style.display='none'; }
function switchModal(f,t) { closeModal(f); openModal(t); }
function processRegister() { /* (Logic Register Standar) */ alert("Fitur Register aktif di HTML"); } 
/* --- 8. AUTHENTICATION (LOGIN & REGISTER FIXED) --- */

function processRegister() {
    // Ambil data dari form HTML
    const userVal = document.getElementById('regUser').value.trim();
    const passVal = document.getElementById('regPass').value.trim();
    const phoneVal = document.getElementById('regPhone').value.trim();
    const bankVal = document.getElementById('regBank').value;
    const accNumVal = document.getElementById('regAccNum').value.trim();
    const accNameVal = document.getElementById('regAccName').value.trim();

    // Validasi: Cek ada yang kosong gak?
    if (!userVal || !passVal || !phoneVal || !accNumVal || !accNameVal || bankVal === "") {
        alert("Mohon lengkapi semua data pendaftaran!");
        return;
    }

    // Validasi: Username minimal 6 huruf
    if (userVal.length < 6) {
        alert("Username minimal 6 karakter!");
        return;
    }

    // Cek Username Ganda
    const exists = usersDB.find(u => u.username.toLowerCase() === userVal.toLowerCase());
    if (exists) {
        alert("Username sudah terpakai! Silahkan pilih username lain.");
        return;
    }

    // Buat Data User Baru
    const newUser = {
        id: Date.now(),
        username: userVal,
        password: passVal,
        phone: phoneVal,
        bankName: bankVal,
        accNum: accNumVal,
        accName: accNameVal,
        saldo: 0,         // Saldo Awal
        history: []       // Riwayat Kosong
    };

    // Simpan ke Database Browser
    usersDB.push(newUser);
    localStorage.setItem('nexusUsers', JSON.stringify(usersDB));

    alert("✅ Pendaftaran BERHASIL! Silahkan Login akun anda.");
    closeModal('registerModal');
    openModal('loginModal');
}

function processLogin() {
    // Ambil input login
    const userVal = document.getElementById('logUser').value.trim();
    const passVal = document.getElementById('logPass').value.trim();

    // Cari user di database
    const foundUser = usersDB.find(u => u.username.toLowerCase() === userVal.toLowerCase() && u.password === passVal);

    if (foundUser) {
        // Kalau ketemu: Set user aktif
        currentUser = foundUser;
        localStorage.setItem('nexusSession', JSON.stringify(currentUser));
        
        // Update Tampilan jadi Mode Member
        updateUI(true); 
        
        closeModal('loginModal');
        alert(`Login Berhasil! Selamat datang, ${currentUser.username}.`);
    } else {
        // Kalau gak ketemu
        alert("❌ Username atau Password salah!");
    }
}
/* --- FITUR VIP MEMBER (FIXED) --- */
function openVip() {
    console.log("Mencoba membuka VIP..."); // Cek di console

    // 1. Cek Login Dulu
    if (!currentUser) {
        alert("🔒 Akses Ditolak!\nSilahkan Login atau Daftar dulu bosku.");
        openModal('loginModal');
        return;
    }

    // 2. Sembunyikan semua halaman lain
    const allViews = document.querySelectorAll('.category-view');
    allViews.forEach(view => {
        view.style.display = 'none';
    });

    // 3. Cari Halaman VIP
    const vipView = document.getElementById('view-vip');
    
    if (vipView) {
        // Kalau halaman ketemu -> Tampilkan
        vipView.style.display = 'block';
        
        // Animasi Fade In dikit biar alus
        vipView.style.opacity = '0';
        setTimeout(() => vipView.style.opacity = '1', 50);
        
        // Scroll ke atas
        window.scrollTo(0, 0);

        // Update Nama User di Kartu VIP
        const vipName = document.getElementById('vip-username');
        if(vipName) vipName.innerText = currentUser.username;
        
        console.log("VIP Terbuka!");
    } else {
        // Kalau halaman gak ketemu -> Berarti HTML VIP nya ilang/salah tempat
        alert("⚠️ Halaman VIP tidak ditemukan!\nCek apakah kode HTML <div id='view-vip'> sudah dipasang dengan benar?");
    }

    // 4. Reset navigasi menu biar gak ada yang nyala
    document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.bottom-bar .b-item').forEach(el => el.classList.remove('active'));

    // 5. Tutup Sidebar kalau lagi kebuka
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('active')) {
        toggleSidebar();
    }
}
/* --- AUTO GENERATE RANDOM RTP --- */
function generateRTP() {
    const games = document.querySelectorAll('.game-card');

    games.forEach(card => {
        // Cek dulu, udah ada RTP nya belum? Biar gak double
        if(card.querySelector('.rtp-box')) return;

        // 1. Acak Angka RTP (Antara 80% sampai 99%)
        // Rumus: Math.random() * (Max - Min) + Min
        let randomRTP = (Math.random() * (99 - 80) + 80).toFixed(1);
        
        // 2. Tentukan Warna (Hijau/Kuning/Merah)
        let color = '#2ed573'; // Hijau (Gacor)
        if(randomRTP < 90) color = '#f1c40f'; // Kuning (Sedang)
        if(randomRTP < 85) color = '#ff4757'; // Merah (Rungkad)

        // 3. Bikin HTML RTP nya
        const rtpDiv = document.createElement('div');
        rtpDiv.className = 'rtp-box';
        rtpDiv.innerHTML = `
            <div class="rtp-info">
                <span class="rtp-label"><span class="rtp-live-dot"></span>RTP Slot</span>
                <span style="color:${color}">${randomRTP}%</span>
            </div>
            <div class="rtp-progress-bg">
                <div class="rtp-progress-fill" style="width:${randomRTP}%; background:${color};"></div>
            </div>
        `;

        // 4. Masukin ke dalam Game Card (Di atas Nama Game)
        // Kita cari elemen '.game-info' (Judul game)
        const gameInfo = card.querySelector('.game-info');
        
        // Sisipkan RTP SEBELUM Judul Game
        if(gameInfo) {
            card.insertBefore(rtpDiv, gameInfo);
        } else {
            card.appendChild(rtpDiv);
        }
    });
}

// Jalankan script pas web selesai loading
window.addEventListener('load', generateRTP);

// Jalankan juga pas pindah kategori (biar game baru keload RTP nya)
// Kita "numpang" fungsi switchCategory yang udah ada
const originalSwitch = window.switchCategory;
window.switchCategory = function(cat, el) {
    if(originalSwitch) originalSwitch(cat, el); // Jalanin fungsi asli
    setTimeout(generateRTP, 100); // Jalanin RTP generator
};
const originalOpenProvider = window.openProvider;
window.openProvider = function(prov) {
    if(originalOpenProvider) originalOpenProvider(prov);
    setTimeout(generateRTP, 100);
};
/* --- BANNER SLIDER SYSTEM (AUTO + SWIPE + DOTS) --- */
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('bannerTrack');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.banner-slide');
    
    // Kalau elemen banner gak ada, stop script biar gak error
    if (!track || slides.length === 0) return;

    let currentSlide = 0;
    let slideInterval;
    const slideDelay = 3000; // Ganti gambar tiap 3 detik

    // 1. Fungsi Utama Geser
    function goToSlide(n) {
        currentSlide = n;
        
        // Loop balik ke awal/akhir
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;

        // Geser Track
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update Warna Titik
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    // 2. Fungsi Auto Jalan
    function startSlide() {
        stopSlide(); // Reset dulu biar gak double speed
        slideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, slideDelay);
    }

    function stopSlide() {
        clearInterval(slideInterval);
    }

    // 3. Event Listener buat Titik (Biar bisa diklik)
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlide();
            goToSlide(index);
            startSlide(); // Jalan lagi abis diklik
        });
    });

    // 4. Fitur Swipe (Geser Jari di HP)
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        stopSlide(); // Tahan slide pas disentuh
    }, {passive: true});

    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startSlide(); // Lepas slide jalan lagi
    }, {passive: true});

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            goToSlide(currentSlide + 1); // Geser Kiri (Next)
        }
        if (touchEndX > touchStartX + 50) {
            goToSlide(currentSlide - 1); // Geser Kanan (Prev)
        }
    }

    // Jalankan Pertama Kali
    startSlide();
});

/**
 * NEXUS122 - OFFICIAL JAVASCRIPT LOGIC
 * V6.0 - Transaction History & Deposit Delay
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
    
    if(typeof switchCategory === "function") {
        const homeTab = document.querySelector('.cat-item');
        if(homeTab) switchCategory('home', homeTab);
    }
    
    // Init deposit method
    if(document.getElementById('depoMethod')) updateAdminBank();
};

/* --- 3. CORE FUNCTIONS --- */
function checkLoginStatus() {
    if (currentUser) updateUI(true);
    else updateUI(false);
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

function refreshUserData() {
    if (!currentUser) return;
    const formattedSaldo = formatRupiah(currentUser.saldo);
    
    // Header
    const headerSaldo = document.getElementById('header-saldo');
    if(headerSaldo) headerSaldo.innerText = formattedSaldo;

    // Sidebar
    const sbUser = document.getElementById('sb-username-text');
    const sbSaldo = document.getElementById('sb-saldo-text');
    if(sbUser) sbUser.innerText = currentUser.username;
    if(sbSaldo) sbSaldo.innerText = formattedSaldo;

    // WD Form
    const wdSaldo = document.getElementById('wd-user-saldo');
    const wdBank = document.getElementById('wd-user-bank');
    const wdName = document.getElementById('wd-user-name');
    if(wdSaldo) wdSaldo.innerText = formattedSaldo;
    if(wdBank) wdBank.innerText = `${currentUser.bankName} - ${currentUser.accNum}`;
    if(wdName) wdName.innerText = currentUser.accName;
}

/* --- 4. TRANSACTION LOGIC (DEPO/WD/HISTORY) --- */

function openTransaction(tab) {
    if (!currentUser) {
        alert("Silahkan Login dulu bosku!");
        openModal('loginModal');
        return;
    }
    openModal('transModal');
    setTransTab(tab);
}

// === LOGIKA DEPOSIT DENGAN DELAY & HISTORY ===
function submitDeposit() {
    const amount = parseInt(document.getElementById('depoAmount').value);
    const proofInput = document.getElementById('depoProof');
    
    // Validasi
    if (!amount || amount < 10000) {
        alert("Minimal Deposit Rp 10.000");
        return;
    }
    // Cek file upload (Simulasi)
    if (proofInput && proofInput.files.length === 0) {
        alert("⚠️ Wajib upload bukti transfer agar diproses!");
        return;
    }

    // HITUNG DELAY RANDOM (25 - 45 Detik)
    // Rumus: Math.random() * (max - min + 1) + min
    const delayMs = Math.floor(Math.random() * (45000 - 25000 + 1) + 25000);
    const delaySec = Math.floor(delayMs / 1000);

    // 1. Catat Transaksi 'PENDING'
    const trxId = Date.now();
    const newTrx = {
        id: trxId,
        type: 'DEPOSIT',
        amount: amount,
        status: 'PENDING',
        date: new Date().toLocaleString()
    };

    // Pastikan array history ada
    if (!currentUser.history) currentUser.history = [];
    currentUser.history.unshift(newTrx); // Masukin ke paling atas
    saveDB(); // Simpan

    // Update UI Button
    const btn = document.querySelector('#view-depo button.btn-primary');
    const oldText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses (${delaySec}s)...`;
    btn.disabled = true;

    alert(`Permintaan Deposit Diterima!\nSistem sedang memverifikasi bukti anda.\nEstimasi waktu: ${delaySec} detik.\n\nMohon tunggu dan JANGAN tutup halaman ini.`);

    // Tutup modal biar user bisa liat web, tapi proses jalan di background
    closeModal('transModal');
    btn.innerHTML = oldText;
    btn.disabled = false;
    document.getElementById('depoAmount').value = '';
    if(proofInput) proofInput.value = '';

    // 2. TIMEOUT (Proses Delay)
    setTimeout(() => {
        // Cek user login session
        if (currentUser) {
            // Update Saldo
            currentUser.saldo += amount;

            // Cari transaksi pending tadi, ubah jadi SUCCESS
            const trxIndex = currentUser.history.findIndex(t => t.id === trxId);
            if(trxIndex !== -1) {
                currentUser.history[trxIndex].status = 'SUCCESS';
            }

            saveDB();
            refreshUserData();

            // Notifikasi Sukses
            alert(`✅ DEPOSIT BERHASIL!\nSaldo Rp ${formatRupiah(amount)} telah masuk.`);
        }
    }, delayMs);
}

// === LOGIKA WITHDRAW ===
function submitWithdraw() {
    const amount = parseInt(document.getElementById('wdAmount').value);
    
    if (!amount || amount < 50000) {
        alert("Minimal Penarikan Rp 50.000");
        return;
    }
    if (amount > currentUser.saldo) {
        alert("Saldo tidak cukup!");
        return;
    }

    const btn = document.querySelector('#view-wd button.btn-primary');
    btn.innerHTML = "Sedang Mengirim...";
    btn.disabled = true;

    setTimeout(() => {
        currentUser.saldo -= amount;
        
        // Catat History WD
        const newTrx = {
            id: Date.now(),
            type: 'WITHDRAW',
            amount: amount,
            status: 'SUCCESS', // Anggap langsung sukses
            date: new Date().toLocaleString()
        };
        if (!currentUser.history) currentUser.history = [];
        currentUser.history.unshift(newTrx);

        saveDB();
        
        alert(`Penarikan Rp ${formatRupiah(amount)} BERHASIL!`);
        
        btn.innerHTML = "CAIRKAN DANA";
        btn.disabled = false;
        document.getElementById('wdAmount').value = '';
        closeModal('transModal');
        refreshUserData();
    }, 2000);
}

// === LOGIKA MEMBUKA RIWAYAT ===
function openHistory() {
    if(!currentUser) return;
    openModal('historyModal');
    renderHistoryList();
}

function renderHistoryList() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';

    if (!currentUser.history || currentUser.history.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#666; padding:20px; font-size:12px;">Belum ada riwayat transaksi.</div>';
        return;
    }

    currentUser.history.forEach(trx => {
        // Styling Status
        let statusClass = 'status-pending';
        let statusLabel = 'Menunggu';
        
        if (trx.status === 'SUCCESS') {
            statusClass = 'status-success';
            statusLabel = 'Berhasil';
        } else if (trx.status === 'FAILED') {
            statusClass = 'status-failed';
            statusLabel = 'Gagal';
        }

        // Styling Tipe (Depo/WD)
        const isDepo = trx.type === 'DEPOSIT';
        const icon = isDepo ? '<i class="fa-solid fa-arrow-down" style="color:#2ed573"></i>' : '<i class="fa-solid fa-arrow-up" style="color:#ff4757"></i>';
        const amountColor = isDepo ? '#2ed573' : '#ff4757';
        const amountSign = isDepo ? '+' : '-';

        const html = `
            <div class="history-item">
                <div class="hist-left">
                    <div class="hist-type">${icon} ${trx.type}</div>
                    <div class="hist-date">${trx.date}</div>
                </div>
                <div class="hist-right">
                    <div class="hist-amount" style="color:${amountColor}">${amountSign} ${formatRupiah(trx.amount)}</div>
                    <div class="hist-status ${statusClass}">${statusLabel}</div>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

/* --- 5. UTILITIES & HELPERS --- */
function saveDB() {
    const index = usersDB.findIndex(u => u.username === currentUser.username);
    if (index !== -1) {
        usersDB[index] = currentUser;
        localStorage.setItem('nexusUsers', JSON.stringify(usersDB));
        localStorage.setItem('nexusSession', JSON.stringify(currentUser));
    }
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

function copyText() {
    const num = document.getElementById('admin-number').innerText;
    navigator.clipboard.writeText(num).then(() => alert("Nomor berhasil disalin!"));
}

function setAmount(val) { document.getElementById('depoAmount').value = val; }
function setTransTab(tab) {
    const viewDepo = document.getElementById('view-depo');
    const viewWd = document.getElementById('view-wd');
    const tabDepo = document.getElementById('tab-depo');
    const tabWd = document.getElementById('tab-wd');

    if (tab === 'depo') {
        viewDepo.style.display = 'block';
        viewWd.style.display = 'none';
        tabDepo.classList.add('active');
        tabWd.classList.remove('active');
        updateAdminBank();
    } else {
        viewDepo.style.display = 'none';
        viewWd.style.display = 'block';
        tabDepo.classList.remove('active');
        tabWd.classList.add('active');
    }
}

function switchCategory(categoryName, element) {
    const allViews = document.querySelectorAll('.category-view');
    allViews.forEach(view => view.style.display = 'none');
    const targetView = document.getElementById('view-' + categoryName);
    if (targetView) targetView.style.display = 'block';
    const allNavItems = document.querySelectorAll('.cat-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        overlay.style.display = 'none';
    } else {
        sidebar.classList.add('active');
        overlay.style.display = 'block';
    }
}

function openModal(id) { 
    document.querySelectorAll(`#${id} input`).forEach(i => i.value = '');
    document.getElementById(id).style.display = 'flex'; 
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function switchModal(from, to) { closeModal(from); openModal(to); }
function formatRupiah(n) { return "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

// Auth Functions (Login/Reg/Logout/Profile) - Tetap sama
function processRegister() { /* Gunakan logic register sebelumnya */ 
    const user = document.getElementById('regUser').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    const bank = document.getElementById('regBank').value;
    const accNum = document.getElementById('regAccNum').value;
    const accName = document.getElementById('regAccName').value;

    if (!user || !pass || !accNum || !accName || bank === "") {
        alert("Data belum lengkap!"); return;
    }
    const exists = usersDB.find(u => u.username.toLowerCase() === user.toLowerCase());
    if (exists) { alert("Username sudah dipakai!"); return; }

    const newUser = {
        id: Date.now(), username: user, password: pass,
        bankName: bank, accNum: accNum, accName: accName,
        saldo: 0, history: [] 
    };
    usersDB.push(newUser);
    localStorage.setItem('nexusUsers', JSON.stringify(usersDB));
    alert("Daftar Berhasil!"); closeModal('registerModal'); openModal('loginModal');
}

function processLogin() {
    const user = document.getElementById('logUser').value.trim();
    const pass = document.getElementById('logPass').value.trim();
    const found = usersDB.find(u => u.username.toLowerCase() === user.toLowerCase() && u.password === pass);
    if(found) {
        currentUser = found;
        localStorage.setItem('nexusSession', JSON.stringify(currentUser));
        updateUI(true); closeModal('loginModal');
        alert("Login Sukses!");
    } else { alert("Username/Password Salah!"); }
}

function handleLogout() {
    if(confirm("Keluar akun?")) {
        localStorage.removeItem('nexusSession');
        window.location.reload();
    }
}

function saveProfile() {
    alert("Fitur Edit Profil Tersimpan (Simulasi)");
    closeModal('profileModal');
}

// Contact Functions
function openLiveChat() {
    const url = `https://wa.me/${CONTACT_INFO.wa}?text=Halo%20Admin,%20bantu%20deposit`;
    window.open(url, '_blank');
}
function openTelegram() { window.open(CONTACT_INFO.tele, '_blank'); }

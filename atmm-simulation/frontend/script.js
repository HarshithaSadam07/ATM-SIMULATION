const API_URL = 'http://127.0.0.1:3000/api';
let token = null;

// Utility Functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.background = isError ? '#dc3545' : '#28a745';
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
}

// Navigation Functions
function showDashboard() {
    showScreen('dashboardScreen');
    updateBalance();
}

function showWithdraw() {
    showScreen('withdrawScreen');
}

function showDeposit() {
    showScreen('depositScreen');
}

function showTransactions() {
    showScreen('transactionsScreen');
    fetchTransactions();
}

function showTransfer() {
    showScreen('transferScreen');
}

// API Functions
async function login(event) {
    event.preventDefault();
    const cardNumber = document.getElementById('cardNumber').value;
    const pin = document.getElementById('pin').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardNumber, pin })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        token = data.token;
        showDashboard();
        showNotification('Login successful');
    } catch (error) {
        showNotification(error.message, true);
    }
}

async function updateBalance() {
    try {
        const response = await fetch(`${API_URL}/account/balance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        document.getElementById('balance').textContent = `₹${data.balance.toFixed(2)}`;
    } catch (error) {
        showNotification(error.message, true);
    }
}

async function withdraw(event) {
    event.preventDefault();
    const amount = document.getElementById('withdrawAmount').value;

    try {
        const response = await fetch(`${API_URL}/account/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: parseFloat(amount) })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        document.getElementById('withdrawForm').reset();
        showDashboard();
        showNotification('Withdrawal successful');
    } catch (error) {
        showNotification(error.message, true);
    }
}

async function deposit(event) {
    event.preventDefault();
    const amount = document.getElementById('depositAmount').value;

    try {
        const response = await fetch(`${API_URL}/account/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: parseFloat(amount) })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        document.getElementById('depositForm').reset();
        showDashboard();
        showNotification('Deposit successful');
    } catch (error) {
        showNotification(error.message, true);
    }
}

async function fetchTransactions() {
    try {
        const response = await fetch(`${API_URL}/account/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        const transactionsList = document.getElementById('transactionsList');
        transactionsList.innerHTML = data.transactions
            .map(t => {
                let sign = '';
                let label = '';
                if (t.type === 'deposit') { sign = '+'; label = 'Deposit'; }
                else if (t.type === 'withdraw') { sign = '-'; label = 'Withdraw'; }
                else if (t.type === 'transfer') {
                    label = t.fromCardNumber ? `Received from ${t.fromCardNumber}` : `Sent to ${t.toCardNumber}`;
                    sign = t.fromCardNumber ? '+' : '-';
                }
                return `
                    <div class="transaction-item">
                        <span>${new Date(t.date).toLocaleString()} — ${label}</span>
                        <span class="amount ${t.type}">${sign}₹${Number(t.amount).toFixed(2)}</span>
                    </div>
                `;
            })
            .join('');
    } catch (error) {
        showNotification(error.message, true);
    }
}

async function transfer(event) {
    event.preventDefault();
    const toCardNumber = document.getElementById('toCardNumber').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);

    try {
        const response = await fetch(`${API_URL}/account/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ toCardNumber, amount })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Transfer failed');

        document.getElementById('transferForm').reset();
        showDashboard();
        showNotification('Transfer successful');
    } catch (error) {
        showNotification(error.message, true);
    }
}

function logout() {
    token = null;
    showScreen('loginScreen');
    document.getElementById('loginForm').reset();
    showNotification('Logged out successfully');
}

// Event Listeners
document.getElementById('loginForm').addEventListener('submit', login);
document.getElementById('withdrawForm').addEventListener('submit', withdraw);
document.getElementById('depositForm').addEventListener('submit', deposit);
document.getElementById('transferForm').addEventListener('submit', transfer);
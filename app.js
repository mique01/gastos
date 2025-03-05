// Configuración de Firebase (reemplaza con tu propia configuración)
const firebaseConfig = {
  apiKey: "AIzaSyAQxA-ZU7fcWehR91boKzSkX32qGLIBqW4",
  authDomain: "control-gastos-54f2a.firebaseapp.com",
  projectId: "control-gastos-54f2a",
  storageBucket: "control-gastos-54f2a.firebasestorage.app",
  messagingSenderId: "936076380258",
  appId: "1:936076380258:web:c4bb45c9a866745754293b",
  measurementId: "G-RRN68VR5ZV"
};
// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Elementos del DOM
const authDiv = document.getElementById('auth');
const appDiv = document.getElementById('app');
const googleLogin = document.getElementById('googleLogin');
const emailLogin = document.getElementById('emailLogin');
const register = document.getElementById('register');
const logout = document.getElementById('logout');
const email = document.getElementById('email');
const password = document.getElementById('password');
const addExpense = document.getElementById('addExpense');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const newCategory = document.getElementById('newCategory');
const paymentMethod = document.getElementById('paymentMethod');
const livesYes = document.getElementById('livesYes');
const livesNo = document.getElementById('livesNo');
const peopleSection = document.getElementById('peopleSection');
const people = document.getElementById('people');
const expenseList = document.getElementById('expenseList');
const timeFilter = document.getElementById('timeFilter');
const stats = document.getElementById('stats');
const exportCsv = document.getElementById('exportCsv');
const categoryChart = document.getElementById('categoryChart').getContext('2d');
const peopleChart = document.getElementById('peopleChart').getContext('2d');
const methodChart = document.getElementById('methodChart').getContext('2d');

// Estado del usuario y gráficos
let userId = null;
let categoryChartInstance, peopleChartInstance, methodChartInstance;

// Autenticación
googleLogin.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => alert(error.message));
});

emailLogin.addEventListener('click', () => {
    auth.signInWithEmailAndPassword(email.value, password.value).catch(error => alert(error.message));
});

register.addEventListener('click', () => {
    auth.createUserWithEmailAndPassword(email.value, password.value).catch(error => alert(error.message));
});

logout.addEventListener('click', () => auth.signOut());

auth.onAuthStateChanged(user => {
    if (user) {
        userId = user.uid;
        authDiv.classList.add('hidden');
        appDiv.classList.remove('hidden');
        loadCategories();
        loadExpenses();
        loadStats('day');
    } else {
        userId = null;
        authDiv.classList.remove('hidden');
        appDiv.classList.add('hidden');
    }
});

// Mostrar/Ocultar sección de personas
livesYes.addEventListener('change', () => peopleSection.classList.add('hidden'));
livesNo.addEventListener('change', () => peopleSection.classList.remove('hidden'));

// Cargar categorías
function loadCategories() {
    db.collection('users').doc(userId).collection('categories').get().then(snapshot => {
        category.innerHTML = '<option value="">Seleccionar Categoría</option>';
        snapshot.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data().name;
            category.appendChild(option);
        });
    });
}

// Agregar gasto
addExpense.addEventListener('click', () => {
    const expenseData = {
        amount: parseFloat(amount.value),
        category: category.value,
        paymentMethod: paymentMethod.value,
        livesAlone: livesYes.checked,
        people: livesNo.checked ? people.value.split(',').map(p => p.trim()) : [],
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (newCategory.value) {
        db.collection('users').doc(userId).collection('categories').add({ name: newCategory.value })
            .then(docRef => {
                expenseData.category = docRef.id;
                addExpenseToDb(expenseData);
            });
    } else {
        addExpenseToDb(expenseData);
    }
});

function addExpenseToDb(data) {
    db.collection('users').doc(userId).collection('expenses').add(data)
        .then(() => {
            amount.value = '';
            newCategory.value = '';
            people.value = '';
            loadExpenses();
            loadStats(timeFilter.value);
        })
        .catch(error => alert(error.message));
}

// Cargar gastos
function loadExpenses() {
    db.collection('users').doc(userId).collection('expenses')
        .orderBy('timestamp', 'desc').limit(10).get()
        .then(snapshot => {
            expenseList.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const li = document.createElement('li');
                li.className = 'p-2 bg-gray-50 rounded';
                li.textContent = `${data.amount} - ${data.category} - ${data.paymentMethod}${data.people.length ? ' (con: ' + data.people.join(', ') + ')' : ''}`;
                expenseList.appendChild(li);
            });
        });
}

// Estadísticas y Gráficos
timeFilter.addEventListener('change', (e) => loadStats(e.target.value));

function loadStats(period) {
    const now = new Date();
    let start;
    if (period === 'day') start = new Date(now.setHours(0, 0, 0, 0));
    else if (period === 'week') start = new Date(now.setDate(now.getDate() - now.getDay()));
    else start = new Date(now.getFullYear(), now.getMonth(), 1);

    db.collection('users').doc(userId).collection('expenses')
        .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(start))
        .get().then(async snapshot => {
            const totals = { total: 0, byCategory: {}, byMethod: {}, byPeople: {} };
            snapshot.forEach(doc => {
                const data = doc.data();
                totals.total += data.amount;
                totals.byCategory[data.category] = (totals.byCategory[data.category] || 0) + data.amount;
                totals.byMethod[data.paymentMethod] = (totals.byMethod[data.paymentMethod] || 0) + data.amount;
                data.people.forEach(person => {
                    totals.byPeople[person] = (totals.byPeople[person] || 0) + (data.amount / data.people.length);
                });
            });

            // Actualizar texto de estadísticas
            stats.innerHTML = `
                <div class="p-4 bg-blue-100 rounded">
                    <h3 class="font-semibold">Total: $${totals.total.toFixed(2)}</h3>
                </div>
            `;

            // Actualizar gráficos
            updateChart(categoryChartInstance, categoryChart, 'Por Categoría', totals.byCategory);
            updateChart(peopleChartInstance, peopleChart, 'Por Persona', totals.byPeople);
            updateChart(methodChartInstance, methodChart, 'Por Método', totals.byMethod);
        });
}

function updateChart(instance, ctx, label, data) {
    if (instance) instance.destroy();
    instance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: label }
            }
        }
    });
    if (ctx === categoryChart) categoryChartInstance = instance;
    else if (ctx === peopleChart) peopleChartInstance = instance;
    else methodChartInstance = instance;
}

// Exportar a CSV
exportCsv.addEventListener('click', () => {
    db.collection('users').doc(userId).collection('expenses')
        .orderBy('timestamp', 'desc').get()
        .then(snapshot => {
            const csvRows = ['Monto,Categoría,Método de Pago,Personas,Fecha'];
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp.toDate().toISOString();
                const people = data.people.join(';');
                csvRows.push(`${data.amount},${data.category},${data.paymentMethod},${people},${date}`);
            });
            const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'gastos.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
});

// Configuración de Firebase
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

// Estado del usuario
let userId = null;

// Autenticación con Google
googleLogin.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log('Usuario autenticado con Google:', result.user);
        })
        .catch((error) => {
            console.error('Error al autenticar con Google:', error);
            alert(error.message);
        });
});

// Autenticación con Email y Contraseña
emailLogin.addEventListener('click', () => {
    const userEmail = email.value;
    const userPassword = password.value;
    auth.signInWithEmailAndPassword(userEmail, userPassword)
        .then((userCredential) => {
            console.log('Usuario autenticado con email:', userCredential.user);
        })
        .catch((error) => {
            console.error('Error al autenticar con email:', error);
            alert(error.message);
        });
});

// Registro de nuevo usuario
register.addEventListener('click', () => {
    const userEmail = email.value;
    const userPassword = password.value;
    auth.createUserWithEmailAndPassword(userEmail, userPassword)
        .then((userCredential) => {
            console.log('Usuario registrado:', userCredential.user);
        })
        .catch((error) => {
            console.error('Error al registrar usuario:', error);
            alert(error.message);
        });
});

// Cerrar sesión
logout.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log('Sesión cerrada');
        })
        .catch((error) => {
            console.error('Error al cerrar sesión:', error);
        });
});

// Observador de estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        userId = user.uid;
        authDiv.classList.add('hidden');
        appDiv.classList.remove('hidden');
        console.log('Usuario autenticado:', userId);
        // Aquí puedes agregar lógica adicional, como cargar datos de Firestore
    } else {
        userId = null;
        authDiv.classList.remove('hidden');
        appDiv.classList.add('hidden');
        console.log('No hay usuario autenticado');
    }
});

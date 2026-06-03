import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCdNqq_HVlUmy6QfFnsdFPitvw_bKcH5-w",
    authDomain: "portifolio-online-38b15.firebaseapp.com",
    projectId: "portifolio-online-38b15",
    storageBucket: "portifolio-online-38b15.firebasestorage.app",
    messagingSenderId: "567635929938",
    appId: "1:567635929938:web:df519db3fd0044dc0aa88b",
    measurementId: "G-G8TFYG2BY1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default class FirebaseService {

    // ==========================================
    // FIRESTORE — Currículos
    // ==========================================

    async obterTodosOsMembros() {
        const snapshot = await getDocs(collection(db, "curriculos"));
        const membros = {};
        snapshot.forEach(doc => {
            membros[doc.id] = doc.data();
        });
        return membros;
    }

    async obterMembroPorId(id) {
        const ref = doc(db, "curriculos", id);
        const snapshot = await getDoc(ref);
        return snapshot.exists() ? snapshot.data() : null;
    }

    async atualizarMembro(id, novosDados) {
        const ref = doc(db, "curriculos", id);
        await setDoc(ref, novosDados);
    }

    // ==========================================
    // AUTH — Login e Sessão
    // ==========================================

    async login(email, senha) {
        const credencial = await signInWithEmailAndPassword(auth, email, senha);
        return credencial.user;
    }

    async logout() {
        await signOut(auth);
    }

    // Observa mudanças de estado do login em tempo real
    // Chama o callback sempre que o usuário loga ou desloga
    observarAuth(callback) {
        onAuthStateChanged(auth, callback);
    }

    // Retorna o usuário logado no momento (ou null)
    obterUsuarioAtual() {
        return auth.currentUser;
    }
}
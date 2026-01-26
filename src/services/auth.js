import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export const entrarAdmin = (email, senha) => signInWithEmailAndPassword(auth, email, senha);
export const sairAdmin = () => signOut(auth);
export const observarAuth = (callback) => onAuthStateChanged(auth, callback);

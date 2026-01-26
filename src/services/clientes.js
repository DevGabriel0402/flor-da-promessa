import {
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
  updateDoc,
  collection,
  getDocs,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from './firebase';

export const buscarClientePorCpfId = async (cpfNormalizado) => {
  const snap = await getDoc(doc(db, 'clientes', cpfNormalizado));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const upsertClientePorCpf = async ({ nome, cpfNormalizado, cpfMascarado, contato, endereco }) => {
  const ref = doc(db, 'clientes', cpfNormalizado);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      nome,
      cpfNormalizado,
      cpfMascarado,
      contato,
      endereco,
      totalPedidos: 0,
      criadoEm: serverTimestamp(),
      ultimoPedidoEm: serverTimestamp()
    }, { merge: false });
  } else {
    await updateDoc(ref, {
      nome,
      contato,
      endereco,
      ultimoPedidoEm: serverTimestamp()
    });
  }
  return cpfNormalizado;
};

export const incrementarTotalPedidosCliente = async (cpfNormalizado) => {
  const ref = doc(db, 'clientes', cpfNormalizado);
  await updateDoc(ref, { totalPedidos: increment(1), ultimoPedidoEm: serverTimestamp() });
};

export const listarClientesAdmin = async () => {
  const q = query(collection(db, 'clientes'));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.ultimoPedidoEm?.seconds || 0) - (a.ultimoPedidoEm?.seconds || 0));
};

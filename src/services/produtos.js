import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

const col = () => collection(db, 'produtos');

export const listarProdutosAtivos = async () => {
  const q = query(col(), where('ativo', '==', true));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  // Ordenação manual simples para não quebrar o layout por categorias
  return data.sort((a, b) => {
    const catA = a.categoria || '';
    const catB = b.categoria || '';
    if (catA !== catB) return catA.localeCompare(catB);
    return (a.nome || '').localeCompare(b.nome || '');
  });
}; export const ouvirProdutosAtivos = (callback) => {
  const q = query(col(), where('ativo', '==', true));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data.sort((a, b) => {
      const catA = a.categoria || '';
      const catB = b.categoria || '';
      if (catA !== catB) return catA.localeCompare(catB);
      return (a.nome || '').localeCompare(b.nome || '');
    }));
  }, (err) => {
    console.error('Erro ao ouvir produtos ativos:', err);
  });
};

export const listarProdutosAdmin = async () => {
  const q = query(col());
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.atualizadoEm?.seconds || 0) - (a.atualizadoEm?.seconds || 0));
};
export const ouvirProdutosAdmin = (callback) => {
  const q = query(col());
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log('Produtos Admin carregados:', data.length);
    callback(data.sort((a, b) => (b.atualizadoEm?.seconds || 0) - (a.atualizadoEm?.seconds || 0)));
  }, (err) => {
    console.error('Erro ao ouvir produtos admin:', err);
  });
};
export const buscarProdutoPorId = async (id) => {
  const snap = await getDoc(doc(db, 'produtos', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const criarProduto = async (dados) => {
  console.log('Criando produto...', dados);
  const payload = {
    ...dados,
    ativo: Boolean(dados.ativo),
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp()
  };
  const ref = await addDoc(col(), payload);
  console.log('Produto criado com ID:', ref.id);
  return ref.id;
};

export const atualizarProduto = async (id, dados) => {
  await updateDoc(doc(db, 'produtos', id), { ...dados, atualizadoEm: serverTimestamp() });
};

export const excluirProduto = async (id) => {
  await deleteDoc(doc(db, 'produtos', id));
};

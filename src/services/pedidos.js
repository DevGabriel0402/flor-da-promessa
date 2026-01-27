import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

const idConsulta = (cpfNormalizado, codigoConsulta) => `${cpfNormalizado}_${codigoConsulta}`;

export const criarPedido = async (pedido) => {
  const payload = {
    ...pedido,
    status: pedido.status || 'recebido',
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp()
  };

  const refPedido = await addDoc(collection(db, 'pedidos'), payload);

  // Consulta pública (para acompanhar pedido sem login)
  const consultaId = idConsulta(pedido.cliente.cpfNormalizado, pedido.codigoConsulta);
  await setDoc(doc(db, 'consultas', consultaId), {
    pedidoId: refPedido.id,
    cpfNormalizado: pedido.cliente.cpfNormalizado,
    codigoConsulta: pedido.codigoConsulta,
    status: payload.status,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp()
  }, { merge: false });

  return refPedido.id;
};

export const listarPedidosAdmin = async ({ status, tipo } = {}) => {
  let q = query(collection(db, 'pedidos'));

  if (status && status !== 'todos') {
    q = query(collection(db, 'pedidos'), where('status', '==', status));
  } else if (tipo === 'ativos') {
    // Busca apenas pedidos em andamento
    q = query(collection(db, 'pedidos'), where('status', 'not-in', ['entregue', 'cancelado']));
  } else if (tipo === 'arquivados') {
    // Busca apenas pedidos finalizados ou cancelados
    q = query(collection(db, 'pedidos'), where('status', 'in', ['entregue', 'cancelado']));
  }

  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
};

export const atualizarStatusPedido = async (pedidoId, novoStatus, cpfNormalizado, codigoConsulta) => {
  await updateDoc(doc(db, 'pedidos', pedidoId), { status: novoStatus, atualizadoEm: serverTimestamp() });

  // Mantém consulta sincronizada
  if (cpfNormalizado && codigoConsulta) {
    await updateDoc(doc(db, 'consultas', idConsulta(cpfNormalizado, codigoConsulta)), {
      status: novoStatus,
      atualizadoEm: serverTimestamp()
    });
  }
};

export const buscarConsultaPorCpfECodigo = async (cpfNormalizado, codigoConsulta) => {
  const snap = await getDoc(doc(db, 'consultas', idConsulta(cpfNormalizado, codigoConsulta)));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// (admin / debug) buscar pedidos com query dupla
export const buscarPedidoPorCpfECodigoAdmin = async (cpfNormalizado, codigoConsulta) => {
  const q = query(
    collection(db, 'pedidos'),
    where('cliente.cpfNormalizado', '==', cpfNormalizado),
    where('codigoConsulta', '==', codigoConsulta),
    limit(1)
  );
  const snap = await getDocs(q);
  const doc0 = snap.docs[0];
  return doc0 ? { id: doc0.id, ...doc0.data() } : null;
};

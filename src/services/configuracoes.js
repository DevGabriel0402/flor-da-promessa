import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const CONFIG_PADRAO = {
  nomeLoja: '',
  logoUrl: 'https://res.cloudinary.com/dxs92g9nu/image/upload/v1769405033/Design_sem_nome_agtrto.png',
  corPrimaria: '#B57EDC',
  mensagemTopo: 'Doces feitos com carinho, como uma promessa em flor 🌸',
  taxaEntrega: 8,
  funcionamento: {
    diasAtivos: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    horarioAbertura: '09:00',
    horarioFechamento: '21:00',
    mensagemFechado: 'Estamos fechados no momento 🌙 Retornamos em breve!'
  }
};

const refApp = () => doc(db, 'configuracoes', 'app');

export const buscarConfiguracoesApp = async () => {
  const snap = await getDoc(refApp());
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const ouvirConfiguracoesApp = (callback) => {
  return onSnapshot(refApp(), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
};

export const salvarConfiguracoesApp = async (dados) => {
  await setDoc(refApp(), { ...dados, atualizadoEm: serverTimestamp() }, { merge: true });
};

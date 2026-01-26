import { normalizarCpf } from './cpf';

export const mascararCpf = (cpf) => {
  const clean = normalizarCpf(cpf);
  if (clean.length !== 11) return String(cpf || '');
  return `***.***.${clean.substring(6, 9)}-${clean.substring(9, 11)}`;
};

export const formatarMoeda = (valor = 0) => {
  const numero = Number(valor) || 0;
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

import { normalizarCpf } from './cpf';

export const mascararCpf = (cpf) => {
  const clean = normalizarCpf(cpf);
  if (clean.length !== 11) return String(cpf || '');
  return `***.***.${clean.substring(6, 9)}-${clean.substring(9, 11)}`;
};

export const aplicarMascaraCpf = (valor) => {
  return valor
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os primeiros 3 dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os segundos 3 dígitos
    .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca hífen após os terceiros 3 dígitos
    .replace(/(-\d{2})\d+?$/, '$1'); // Impede mais de 11 dígitos
};

export const aplicarMascaraTelefone = (valor) => {
  return valor
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/(\d{2})(\d)/, '($1) $2') // Coloca parênteses no DDD
    .replace(/(\d{5})(\d)/, '$1-$2') // Coloca hífen no número
    .replace(/(-\d{4})\d+?$/, '$1'); // Impede mais de 11 dígitos
};

export const formatarMoeda = (valor = 0) => {
  const numero = Number(valor) || 0;
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

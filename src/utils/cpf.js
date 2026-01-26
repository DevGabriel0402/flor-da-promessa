export const normalizarCpf = (cpf = '') => String(cpf).replace(/\D/g, '');

export const validarCpf = (cpf) => {
  const clean = normalizarCpf(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  let soma = 0;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(clean.substring(i - 1, i), 10) * (11 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(clean.substring(9, 10), 10)) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(clean.substring(i - 1, i), 10) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(clean.substring(10, 11), 10)) return false;

  return true;
};

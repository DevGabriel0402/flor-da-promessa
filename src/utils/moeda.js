export const formatarMoeda = (valor = 0) => {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

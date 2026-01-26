export const STATUS_PEDIDO = ['recebido', 'em_preparo', 'saiu_para_entrega', 'entregue', 'cancelado'];

export const statusParaLabel = (status) => {
  const labels = {
    recebido: 'Recebido',
    em_preparo: 'Em preparo',
    saiu_para_entrega: 'Saiu para entrega',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
  };
  return labels[status] || status;
};

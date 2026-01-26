export const STATUS_PEDIDO = {
  recebido: 'Recebido',
  em_preparo: 'Em preparo',
  saiu_para_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

export const statusParaLabel = (status) => STATUS_PEDIDO[status] || status;

export const ORDEM_TIMELINE = ['recebido', 'em_preparo', 'saiu_para_entrega', 'entregue'];

// Mapeamento de ícones (nomes dos ícones do react-icons/hi2)
export const STATUS_ICONES = {
  recebido: 'HiOutlineClipboardDocumentList',
  em_preparo: 'HiOutlineFire',
  saiu_para_entrega: 'HiOutlineTruck',
  entregue: 'HiOutlineCheckCircle',
  cancelado: 'HiOutlineXCircle'
};

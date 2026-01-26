const mapaDia = {
  0: 'dom',
  1: 'seg',
  2: 'ter',
  3: 'qua',
  4: 'qui',
  5: 'sex',
  6: 'sab'
};

const paraMinutos = (hhmm) => {
  if (!hhmm || typeof hhmm !== 'string') return 0;
  const [h, m] = hhmm.split(':');
  const total = (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
  return total;
};

export const lojaEstaAberta = (funcionamento, agora = new Date()) => {
  if (!funcionamento || !funcionamento.diasAtivos) {
    return true;
  }

  const dia = mapaDia[agora.getDay()];
  const diasAtivos = funcionamento.diasAtivos || [];

  if (!diasAtivos.includes(dia)) {
    return false;
  }

  const aberto = paraMinutos(funcionamento.horarioAbertura);
  const fechado = paraMinutos(funcionamento.horarioFechamento);
  const atual = agora.getHours() * 60 + agora.getMinutes();

  let isAberto = false;

  if (aberto <= fechado) {
    // Horário normal (ex: 09:00 - 18:00)
    isAberto = atual >= aberto && atual <= fechado;
  } else {
    // Horário atravessando a meia-noite (ex: 22:00 - 02:00)
    isAberto = atual >= aberto || atual <= fechado;
  }

  return isAberto;
};

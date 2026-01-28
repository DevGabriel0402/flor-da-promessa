import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveToStorage } from '../../utils/persistence';
import toast from 'react-hot-toast';
import { useTheme } from 'styled-components';

import { useCarrinho } from '../../contexto/CarrinhoContexto';
import { validarCpf, normalizarCpf } from '../../utils/cpf';
import { mascararCpf, formatarMoeda, aplicarMascaraCpf, aplicarMascaraTelefone } from '../../utils/mascaras';
import { gerarCodigoConsulta } from '../../utils/gerarCodigo';
import { lojaEstaAberta } from '../../utils/datas';
import { useConfig } from '../../contexto/ConfigContexto';
import { upsertClientePorCpf, incrementarTotalPedidosCliente, buscarClientePorCpfId } from '../../services/clientes';
import { criarPedido } from '../../services/pedidos';

import { Container, Card, Row } from '../../components/ui/Base.jsx';
import { Botao } from '../../components/ui/Botoes.jsx';
import { Campo, Grupo, Grid2, Rotulo } from '../../components/ui/Form.jsx';
import { Select } from '../../components/ui/Dropdown.jsx';

export default function Checkout() {
  const navigate = useNavigate();
  const { itens, subtotal, limparCarrinho } = useCarrinho();
  const { config, carregando: carregandoCfg } = useConfig();
  const [enviando, setEnviando] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    contato: '',
    rua: '',
    numero: '',
    bairro: '',
    complemento: '',
    referencia: '',
    pagamento: 'pix',
    tipoPedido: 'delivery' // nova opção: delivery ou retirada
  });

  useEffect(() => {
    const cpfLimpo = normalizarCpf(form.cpf);
    if (cpfLimpo.length === 11) {
      (async () => {
        try {
          const cliente = await buscarClientePorCpfId(cpfLimpo);
          if (cliente) {
            toast.success('Bem-vindo de volta! Endereço carregado.');
            setForm(p => ({
              ...p,
              nome: cliente.nome || p.nome,
              contato: cliente.contato ? aplicarMascaraTelefone(cliente.contato) : p.contato,
              rua: cliente.endereco?.rua || p.rua,
              numero: cliente.endereco?.numero || p.numero,
              bairro: cliente.endereco?.bairro || p.bairro,
              complemento: cliente.endereco?.complemento || p.complemento,
              referencia: cliente.endereco?.referencia || p.referencia
            }));
          }
        } catch (e) {
          console.error('Erro ao buscar cliente:', e);
        }
      })();
    }
  }, [form.cpf]);

  const onChange = (campo) => (e) => {
    let valor = e.target.value;
    if (campo === 'cpf') valor = aplicarMascaraCpf(valor);
    if (campo === 'contato') valor = aplicarMascaraTelefone(valor);

    setForm((p) => ({ ...p, [campo]: valor }));
  };
  const taxaEntrega = form.tipoPedido === 'delivery' ? Number(config?.taxaEntrega ?? 8) : 0;
  const total = subtotal + taxaEntrega;
  const aberto = lojaEstaAberta(config?.funcionamento);

  // Diagnóstico para o usuário no console
  console.log('Checkout diagnostic:', {
    agora: `${new Date().getHours()}:${new Date().getMinutes()}`,
    diaSemana: new Date().getDay(),
    abertoCalculado: aberto,
    config: config?.funcionamento
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (itens.length === 0) {
      toast.error('Seu carrinho está vazio.');
      return;
    }
    if (!aberto) {
      toast.error(config?.funcionamento?.mensagemFechado || 'Estamos fechados no momento.');
      return;
    }
    if (!validarCpf(form.cpf)) {
      toast.error('CPF inválido!');
      return;
    }

    setEnviando(true);
    try {
      const cpfNormalizado = normalizarCpf(form.cpf);
      const cpfMascarado = mascararCpf(form.cpf);

      const enderecoData = form.tipoPedido === 'delivery' ? {
        rua: form.rua,
        numero: form.numero,
        bairro: form.bairro,
        complemento: form.complemento,
        referencia: form.referencia
      } : null;

      await upsertClientePorCpf({
        nome: form.nome,
        cpfNormalizado,
        cpfMascarado,
        contato: form.contato,
        endereco: enderecoData
      });

      const codigoConsulta = gerarCodigoConsulta();

      await criarPedido({
        cliente: {
          nome: form.nome,
          cpfNormalizado,
          cpfMascarado,
          contato: form.contato
        },
        endereco: enderecoData,
        tipoPedido: form.tipoPedido,
        itens: itens.map(i => ({
          produtoId: i.produtoId,
          nome: i.nome,
          preco: i.preco,
          quantidade: i.quantidade,
          observacao: i.observacao || '',
          imagem: i.fotoUrl || ''
        })),
        subtotal,
        taxaEntrega,
        total,
        pagamento: form.pagamento,
        codigoConsulta
      });

      await incrementarTotalPedidosCliente(cpfNormalizado);

      toast.success(`Pedido criado! Código: ${codigoConsulta}`, { duration: 6000 });
      limparCarrinho();

      const dadosPedido = {
        total,
        codigoConsulta,
        cliente: { cpfNormalizado, nome: form.nome, contato: form.contato },
        itens: itens.map(i => ({ nome: i.nome, quantidade: i.quantidade, preco: i.preco })),
        pagamento: form.pagamento,
        tipoPedido: form.tipoPedido
      };

      if (form.pagamento === 'pix') {
        saveToStorage('pedido_em_pagamento', dadosPedido);
        navigate('/pagamento', { state: { pedido: dadosPedido } });
      } else {
        navigate('/acompanhar', { state: { cpf: cpfNormalizado, codigo: codigoConsulta } });
      }
    } catch (err) {
      toast.error('Não foi possível finalizar o pedido.');
    } finally {
      setEnviando(false);
    }
  };

  const theme = useTheme();

  if (carregandoCfg) {
    return <Container><Card>Carregando...</Card></Container>;
  }

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 28 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Finalizar pedido</h1>

      {!aberto && (
        <Card style={{ borderColor: theme.cores.primaria, background: theme.cores.primariaClara }}>
          <strong style={{ color: theme.cores.secundaria }}>Estamos fechados no momento.</strong>
          <div style={{ marginTop: 6, fontSize: 13 }}>
            Horário: {config?.funcionamento?.horarioAbertura} às {config?.funcionamento?.horarioFechamento}
          </div>
          <div style={{ marginTop: 4, fontSize: 13 }}>{config?.funcionamento?.mensagemFechado || 'Retornamos em breve!'}</div>
        </Card>
      )}

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <strong>Sua sacola</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {itens.map((item) => (
            <div key={item.produtoId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
              <div>
                <span style={{ fontWeight: 900 }}>{item.quantidade}x</span> {item.nome}
                {item.observacao && <div style={{ fontSize: 12, color: '#6B7280' }}>Obs: {item.observacao}</div>}
              </div>
              <div style={{ fontWeight: 700 }}>{formatarMoeda(item.preco * item.quantidade)}</div>
            </div>
          ))}
          {itens.length === 0 && <div style={{ color: '#6B7280', textAlign: 'center' }}>Sua sacola está vazia.</div>}
        </div>
      </Card>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <strong>Tipo de Pedido</strong>
          <Select value={form.tipoPedido} onChange={onChange('tipoPedido')}>
            <option value="delivery">Delivery (Entrega)</option>
            <option value="retirada">Retirada na Loja</option>
          </Select>
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <strong>Seus dados</strong>
          <Grupo>
            <Rotulo>CPF</Rotulo>
            <Campo value={form.cpf} onChange={onChange('cpf')} required placeholder="CPF (apenas números)" />
          </Grupo>
          <Grupo>
            <Rotulo>Nome</Rotulo>
            <Campo value={form.nome} onChange={onChange('nome')} required placeholder="Nome completo" />
          </Grupo>
          <Grupo>
            <Rotulo>WhatsApp</Rotulo>
            <Campo value={form.contato} onChange={onChange('contato')} required placeholder="(DDD) 99999-9999" />
          </Grupo>
        </Card>

        {form.tipoPedido === 'delivery' && (
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <strong>Endereço de entrega</strong>
            <Grupo>
              <Rotulo>Rua</Rotulo>
              <Campo value={form.rua} onChange={onChange('rua')} required />
            </Grupo>
            <Grid2>
              <Grupo>
                <Rotulo>Número</Rotulo>
                <Campo value={form.numero} onChange={onChange('numero')} required />
              </Grupo>
              <Grupo>
                <Rotulo>Bairro</Rotulo>
                <Campo value={form.bairro} onChange={onChange('bairro')} required />
              </Grupo>
            </Grid2>
            <Grupo>
              <Rotulo>Complemento</Rotulo>
              <Campo value={form.complemento} onChange={onChange('complemento')} placeholder="Apto, bloco..." />
            </Grupo>
            <Grupo>
              <Rotulo>Referência</Rotulo>
              <Campo value={form.referencia} onChange={onChange('referencia')} placeholder="Ex: perto da padaria" />
            </Grupo>
          </Card>
        )}

        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <strong>Pagamento</strong>
          <Select value={form.pagamento} onChange={onChange('pagamento')}>
            <option value="pix">PIX</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
          </Select>
        </Card>

        <Card>
          <Row>
            <strong>Total ({form.tipoPedido === 'delivery' ? 'com entrega' : 'retirada'})</strong>
            <strong style={{ color: theme.cores.primaria, fontSize: 18 }}>{formatarMoeda(total)}</strong>
          </Row>
          <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
            Subtotal: {formatarMoeda(subtotal)} {form.tipoPedido === 'delivery' && `· Entrega: ${formatarMoeda(taxaEntrega)}`}
          </div>
        </Card>

        <Botao type="submit" disabled={enviando || (!aberto && !carregandoCfg)}>
          {enviando ? 'Processando...' : aberto ? 'Confirmar pedido' : 'Loja Fechada'}
        </Botao>
      </form>
    </Container>
  );
}

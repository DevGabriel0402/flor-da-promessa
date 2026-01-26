import React, { useEffect, useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardDocumentList,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineShoppingBag,
  HiOutlineClock
} from 'react-icons/hi2';

import { listarPedidosAdmin, atualizarStatusPedido } from '../../services/pedidos';
import { listarProdutosAdmin } from '../../services/produtos';
import { listarClientesAdmin } from '../../services/clientes';
import { statusParaLabel, STATUS_PEDIDO } from '../../utils/pedidos';
import { formatarMoeda } from '../../utils/mascaras';
import { Container, Card, Row, Badge, Overlay, ModalConteudo } from '../../components/ui/Base.jsx';
import { safeString } from '../../utils/geral';
import { Campo, Grupo, Grid2, Rotulo } from '../../components/ui/Form.jsx';
import { Select } from '../../components/ui/Dropdown.jsx';
import { UploadImagem } from '../../components/ui/UploadImagem.jsx';

const KanbanContainer = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
  margin-top: 20px;
  
  /* Garante que o scroll horizontal só apareça quando realmente necessário no desktop */
  -webkit-overflow-scrolling: touch;

  @media (max-width: 900px) {
    display: none;
  }
`;

const KanbanColuna = styled.div`
  min-width: 280px;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TituloColuna = styled.div`
  font-weight: 900;
  font-size: 13px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.cores.cinza};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
`;

const Contador = styled.span`
  background: ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
`;

const KanbanCard = styled(Card)`
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.sombras.media};
    border-color: ${({ theme }) => theme.cores.primariaClara};
  }
`;

const MobileView = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }
`;

const BadgeStatus = styled.span`
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  background: ${({ $status }) => {
    if ($status === 'recebido') return '#E0E7FF';
    if ($status === 'em_preparo') return '#FEF3C7';
    if ($status === 'saiu_para_entrega') return '#D1FAE5';
    if ($status === 'entregue') return '#DBEAFE';
    return '#F3F4F6';
  }};
  color: ${({ $status }) => {
    if ($status === 'recebido') return '#4338CA';
    if ($status === 'em_preparo') return '#B45309';
    if ($status === 'saiu_para_entrega') return '#047857';
    if ($status === 'entregue') return '#1E40AF';
    return '#4B5563';
  }};
`;

const STATUS_KANBAN = ['recebido', 'em_preparo', 'saiu_para_entrega', 'entregue', 'cancelado'];

export default function Dashboard() {
  const [carregando, setCarregando] = useState(true);
  const [stats, setStats] = useState({ pedidosTotal: 0, pendentes: 0, produtosAtivos: 0, clientes: 0 });
  const [pedidos, setPedidos] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const theme = useTheme();

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [listaPedidos, listaProdutos, listaClientes] = await Promise.all([
        listarPedidosAdmin({ status: 'todos' }),
        listarProdutosAdmin(),
        listarClientesAdmin()
      ]);

      setPedidos(listaPedidos);

      const pendentes = listaPedidos.filter(p => p.status !== 'entregue' && p.status !== 'cancelado').length;
      const ativos = listaProdutos.filter(p => p.ativo).length;

      setStats({
        pedidosTotal: listaPedidos.length,
        pendentes,
        produtosAtivos: ativos,
        clientes: listaClientes.length
      });
    } catch (e) {
      toast.error('Erro ao carregar dashboard.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const alterarStatus = async (pedido, novoStatus) => {
    try {
      await atualizarStatusPedido(pedido.id, novoStatus, pedido.cliente?.cpfNormalizado, pedido.codigoConsulta);
      toast.success('Status atualizado!');
      setPedidos((prev) => prev.map(p => p.id === pedido.id ? { ...p, status: novoStatus } : p));

      const novosPedidos = pedidos.map(p => p.id === pedido.id ? { ...p, status: novoStatus } : p);
      const pendentes = novosPedidos.filter(p => p.status !== 'entregue' && p.status !== 'cancelado').length;
      setStats(s => ({ ...s, pendentes }));
    } catch (e) {
      toast.error('Erro ao atualizar pedido.');
    }
  };

  const pedidosPorStatus = useMemo(() => {
    const map = {};
    STATUS_KANBAN.forEach(s => map[s] = pedidos.filter(p => p.status === s));
    return map;
  }, [pedidos]);

  const pedidosFiltradosMobile = useMemo(() => {
    if (statusFiltro === 'todos') return pedidos;
    return pedidos.filter(p => p.status === statusFiltro);
  }, [pedidos, statusFiltro]);

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Início</h1>
          <p style={{ margin: '2px 0 0', color: theme.cores.cinza, fontSize: 13 }}>Resumo da sua loja hoje.</p>
        </div>
      </Row>

      {carregando ? (
        <Card>Carregando informações...</Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <Card style={{ borderLeft: `4px solid ${theme.cores.primaria}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, color: theme.cores.cinza, fontWeight: 700 }}>PEDIDOS TOTAIS</div>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{stats.pedidosTotal}</div>
                </div>
                <HiOutlineShoppingBag size={24} color={theme.cores.primaria} />
              </div>
            </Card>
            <Card style={{ borderLeft: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, color: theme.cores.cinza, fontWeight: 700 }}>PENDENTES</div>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{stats.pendentes}</div>
                </div>
                <HiOutlineClock size={24} color="#F59E0B" />
              </div>
            </Card>
            <Card style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, color: theme.cores.cinza, fontWeight: 700 }}>PRODUTOS ATIVOS</div>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{stats.produtosAtivos}</div>
                </div>
                <HiOutlineTag size={24} color="#10B981" />
              </div>
            </Card>
            <Card style={{ borderLeft: `4px solid ${theme.cores.secundaria}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, color: theme.cores.cinza, fontWeight: 700 }}>CLIENTES</div>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{stats.clientes}</div>
                </div>
                <HiOutlineUsers size={24} color={theme.cores.secundaria} />
              </div>
            </Card>
          </div>

          <hr style={{ border: 0, borderTop: `1px solid ${theme.cores.borda}`, margin: '10px 0' }} />

          {/* Kanban Section Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Fluxo de Pedidos</h2>
            <div className="mob-only" style={{ width: 160 }}>
              <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} style={{ padding: '8px 12px', fontSize: 12 }}>
                <option value="todos">Todos os Status</option>
                {STATUS_KANBAN.map(s => <option key={s} value={s}>{statusParaLabel(s)}</option>)}
              </Select>
            </div>
          </div>

          {/* Desktop: Kanban */}
          <KanbanContainer>
            {STATUS_KANBAN.map(s => (
              <KanbanColuna key={s}>
                <TituloColuna>
                  {statusParaLabel(s)}
                  <Contador>{pedidosPorStatus[s]?.length || 0}</Contador>
                </TituloColuna>

                {pedidosPorStatus[s]?.map(p => (
                  <KanbanCard key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, overflow: 'hidden' }}>
                      <strong style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{safeString(p.codigoConsulta)}
                      </strong>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>
                      {safeString(p.cliente?.nome).split(' ')[0]}
                    </div>

                    <div style={{ fontSize: 11, color: theme.cores.cinza, marginBottom: 10 }}>
                      {formatarMoeda(p.total)} · {safeString(p.pagamento).toUpperCase()}
                    </div>

                    <Select
                      value={p.status}
                      onChange={(e) => alterarStatus(p, e.target.value)}
                    >
                      {STATUS_KANBAN.map(opt => (
                        <option key={opt} value={opt}>{statusParaLabel(opt)}</option>
                      ))}
                    </Select>
                  </KanbanCard>
                ))}

                {pedidosPorStatus[s]?.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: 16,
                    fontSize: 11,
                    color: theme.cores.cinza,
                    background: '#F9FAFB',
                    borderRadius: 12,
                    border: '1px dashed #E5E7EB'
                  }}>
                    Nada aqui
                  </div>
                )}
              </KanbanColuna>
            ))}
          </KanbanContainer>

          {/* Mobile: Lista */}
          <MobileView>
            {pedidosFiltradosMobile.map(p => (
              <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 900, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      #{safeString(p.codigoConsulta)}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{safeString(p.cliente?.nome)}</div>
                  </div>
                  <BadgeStatus $status={p.status}>{statusParaLabel(p.status)}</BadgeStatus>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: theme.cores.cinza }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HiOutlineCurrencyDollar /> <strong>{formatarMoeda(p.total)}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HiOutlineUser /> {safeString(p.cliente?.contato)}
                  </div>
                </div>

                <Select value={p.status} onChange={(e) => alterarStatus(p, e.target.value)}>
                  {STATUS_KANBAN.map(opt => (
                    <option key={opt} value={opt}>{statusParaLabel(opt)}</option>
                  ))}
                </Select>
              </Card>
            ))}
            {pedidosFiltradosMobile.length === 0 && <Card>Nenhum pedido recente.</Card>}
          </MobileView>
        </>
      )
      }

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 900px) {
          .desk-only { display: none; }
        }
        @media (min-width: 901px) {
          .mob-only { display: none; }
        }
      `}} />
    </Container>
  );
}

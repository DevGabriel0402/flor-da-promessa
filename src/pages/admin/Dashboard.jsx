import React, { useEffect, useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardDocumentList,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineEye
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

const ListaPedidos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
`;

const PedidoItem = styled(Card)`
  display: grid;
  grid-template-columns: 60px 100px 1fr 100px 140px 60px;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.cores.primariaClara};
    transform: translateX(4px);
  }

  @media (max-width: 900px) {
    grid-template-columns: 50px 1fr auto;
    gap: 10px;
    padding: 12px;
  }
`;

const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  background: ${({ theme }) => theme.cores.fundo};
`;

const InfoPrincipal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Codigo = styled.span`
  font-weight: 900;
  font-size: 14px;
  color: ${({ theme }) => theme.cores.primaria};
`;

const NomeCliente = styled.span`
  font-weight: 700;
  font-size: 15px;
`;

const QtdItens = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.cores.cinza};
  font-weight: 600;
`;

const ValorTotal = styled.span`
  font-weight: 900;
  font-size: 16px;
  text-align: right;
  color: ${({ theme }) => theme.cores.texto};
`;

export default function Dashboard() {
  const [carregando, setCarregando] = useState(true);
  const [stats, setStats] = useState({ pedidosTotal: 0, pendentes: 0, produtosAtivos: 0, clientes: 0 });
  const [pedidos, setPedidos] = useState([]);
  const theme = useTheme();

  const carregarDados = async () => {
    setCarregando(true);
    try {
      // Carrega apenas os pedidos ativos para o dashboard
      const [listaPedidos, listaProdutos, listaClientes] = await Promise.all([
        listarPedidosAdmin({ tipo: 'ativos' }),
        listarProdutosAdmin(),
        listarClientesAdmin()
      ]);

      setPedidos(listaPedidos.slice(0, 10)); // Mostra os 10 mais recentes

      const pendentes = listaPedidos.length;
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

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Painel Geral</h1>
          <p style={{ margin: '2px 0 0', color: theme.cores.cinza, fontSize: 13 }}>Seus pedidos ativos e estatísticas.</p>
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
                  <div style={{ fontSize: 13, color: theme.cores.cinza, fontWeight: 700 }}>PEDIDOS ATIVOS</div>
                  <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{stats.pendentes}</div>
                </div>
                <HiOutlineShoppingBag size={24} color={theme.cores.primaria} />
              </div>
            </Card>
            <Card style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, color: theme.cores.cinza, fontWeight: 700 }}>PRODUTOS</div>
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

          <div style={{ marginTop: 20 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900 }}>Pedidos Recentes</h2>

            <ListaPedidos>
              {pedidos.map(p => {
                const primeiraImg = p.itens?.[0]?.imagem || 'https://via.placeholder.com/150?text=Sem+Imagem';
                const totalItens = p.itens?.reduce((acc, current) => acc + (current.quantidade || 1), 0) || 0;

                return (
                  <PedidoItem key={p.id}>
                    <Thumbnail src={primeiraImg} alt="Produto" />

                    <Codigo>#{safeString(p.codigoConsulta)}</Codigo>

                    <InfoPrincipal>
                      <NomeCliente>{safeString(p.cliente?.nome)}</NomeCliente>
                      <div style={{ fontSize: 11, color: theme.cores.cinza, fontWeight: 800 }}>
                        {statusParaLabel(p.status).toUpperCase()}
                      </div>
                    </InfoPrincipal>

                    <QtdItens>{totalItens} {totalItens === 1 ? 'item' : 'itens'}</QtdItens>

                    <div style={{ fontSize: 13, color: theme.cores.cinza, fontWeight: 600 }}>
                      {p.criadoEm?.seconds ? new Date(p.criadoEm.seconds * 1000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </div>

                    <ValorTotal>{formatarMoeda(p.total)}</ValorTotal>

                    <Link to="/admin/pedidos" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      color: theme.cores.primaria,
                      textDecoration: 'none'
                    }}>
                      <HiOutlineEye size={16} /> Ver
                    </Link>
                  </PedidoItem>
                );
              })}

              {pedidos.length === 0 && (
                <Card style={{ textAlign: 'center', padding: 40, border: '2px dashed #E5E7EB', background: 'transparent' }}>
                  Nenhum pedido ativo no momento.
                </Card>
              )}
            </ListaPedidos>
          </div>
        </>
      )}
    </Container>
  );
}

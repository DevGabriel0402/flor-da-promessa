import React, { useEffect, useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineMapPin,
  HiChevronDown,
  HiChevronUp,
  HiOutlineArchiveBox,
  HiOutlineArrowLeft
} from 'react-icons/hi2';

import { listarPedidosAdmin, atualizarStatusPedido } from '../../services/pedidos';
import { statusParaLabel, STATUS_PEDIDO, ORDEM_TIMELINE, STATUS_ICONES } from '../../utils/pedidos';
import { mascararCpf, formatarMoeda } from '../../utils/mascaras';
import { Container, Card, Row, Badge } from '../../components/ui/Base.jsx';
import { safeString } from '../../utils/geral';
import { Select } from '../../components/ui/Dropdown.jsx';

const ListaPedidos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  

`;

const AccordionItem = styled(Card)`
  padding: 0;
  overflow: hidden;
  border: 1px solid ${({ theme, $aberto }) => $aberto ? theme.cores.primaria : theme.cores.borda};
  transition: all 0.3s ease;
 width: 100%;
`;

const AccordionHeader = styled.div`
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme, $aberto }) => $aberto ? theme.cores.fundo : 'transparent'};
  
  &:hover {
    background: ${({ theme }) => theme.cores.fundo};
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const AccordionContent = styled.div`
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.branco};
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
`;

const SecaoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TituloSecao = styled.h4`
  margin: 0 0 4px;
  font-size: 13px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.cores.cinza};
  letter-spacing: 0.5px;
`;

const DetalheTexto = styled.div`
  font-size: 14px;
  line-height: 1.5;
`;

const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
`;

const TotalContainer = styled.div`
  background: ${({ theme }) => theme.cores.fundo};
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const TotalLinha = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  ${({ $total }) => $total && `
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #E5E7EB;
    font-weight: 900;
    font-size: 18px;
  `}
`;

const NativeSelect = styled.select`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background-color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.cores.primaria};
  }

  &:disabled {
    background-color: #F3F4F6;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const STATUS_ORDER = ['recebido', 'em_preparo', 'saiu_para_entrega', 'entregue'];
const TODOS_STATUS = ['recebido', 'em_preparo', 'saiu_para_entrega', 'entregue', 'cancelado'];

const Codigo = styled.span`
  font-weight: 900;
  font-size: 14px;
  color: ${({ theme }) => theme.cores.primaria};
`;

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pedidosAbertos, setPedidosAbertos] = useState({});
  const theme = useTheme();

  const carregar = async () => {
    setCarregando(true);
    try {
      const lista = await listarPedidosAdmin({ tipo: 'ativos' });
      setPedidos(lista);
    } catch (e) {
      toast.error('Erro ao carregar pedidos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const toggleAccordion = (id) => {
    setPedidosAbertos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const alterarStatus = async (pedido, novoStatus) => {
    try {
      await atualizarStatusPedido(pedido.id, novoStatus, pedido.cliente?.cpfNormalizado, pedido.codigoConsulta);
      toast.success('Status atualizado!');

      if (['entregue', 'cancelado'].includes(novoStatus)) {
        setPedidos((prev) => prev.filter(p => p.id !== pedido.id));
      } else {
        setPedidos((prev) => prev.map(p => p.id === pedido.id ? { ...p, status: novoStatus } : p));
      }
    } catch (e) {
      toast.error('Erro ao atualizar status.');
    }
  };

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Gerenciar Pedidos</h1>
          <Badge>{pedidos.length} ativos</Badge>
        </div>
        <Link to="/admin/pedidos/arquivados" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          borderRadius: 10,
          background: theme.cores.fundo,
          color: theme.cores.texto,
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 700,
          border: `1px solid ${theme.cores.borda}`
        }}>
          <HiOutlineArchiveBox size={18} /> Ver Arquivados
        </Link>
      </Row>

      {carregando && <Card>Carregando painel...</Card>}

      {!carregando && (
        <ListaPedidos>
          {pedidos.map(p => {
            const aberto = pedidosAbertos[p.id];
            const primeiraImg = p.itens?.[0]?.imagem || 'https://via.placeholder.com/150?text=Sem+Imagem';
            const statusAtualIndex = STATUS_ORDER.indexOf(p.status);
            const dataHora = p.criadoEm?.seconds
              ? new Date(p.criadoEm.seconds * 1000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
              : '-';

            return (
              <AccordionItem key={p.id} $aberto={aberto}>
                <AccordionHeader onClick={() => toggleAccordion(p.id)} $aberto={aberto}>
                  <HeaderInfo>
                    <Thumbnail src={primeiraImg} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Codigo>#{safeString(p.codigoConsulta)}</Codigo>
                      <Badge $status={p.status}>{statusParaLabel(p.status)}</Badge>
                      <div style={{ fontSize: 13, color: theme.cores.cinza, fontWeight: 700 }}>{dataHora}</div>
                    </div>
                  </HeaderInfo>
                  {aberto ? <HiChevronUp size={24} /> : <HiChevronDown size={24} />}
                </AccordionHeader>

                {aberto && (
                  <AccordionContent>
                    <InfoGrid>
                      <SecaoInfo>
                        <TituloSecao><HiOutlineUser size={14} /> Cliente & Contato</TituloSecao>
                        <DetalheTexto>
                          <strong>{safeString(p.cliente?.nome)}</strong><br />
                          CPF: {mascararCpf(p.cliente?.cpfMascarado || '')}<br />
                          WhatsApp: {safeString(p.cliente?.contato)}
                        </DetalheTexto>
                      </SecaoInfo>

                      <SecaoInfo>
                        <TituloSecao><HiOutlineMapPin size={14} /> Endereço de Entrega</TituloSecao>
                        <DetalheTexto>
                          {safeString(p.endereco?.rua)}, {safeString(p.endereco?.numero)}<br />
                          {safeString(p.endereco?.bairro)} - {safeString(p.endereco?.complemento)}<br />
                          Ref: {safeString(p.endereco?.referencia)}
                        </DetalheTexto>
                      </SecaoInfo>

                      <SecaoInfo>
                        <TituloSecao><HiOutlineClock size={14} /> Ciclo do Pedido</TituloSecao>
                        <Select
                          value={p.status}
                          onChange={(e) => alterarStatus(p, e.target.value)}
                          accordion
                        >
                          {TODOS_STATUS.map((opt) => {
                            const optIndexFull = STATUS_ORDER.indexOf(opt);
                            const desabilitado = p.status !== 'cancelado' && optIndexFull !== -1 && optIndexFull < statusAtualIndex;
                            return (
                              <option key={opt} value={opt} disabled={desabilitado}>
                                {statusParaLabel(opt)} {desabilitado ? '(Indisponível)' : ''}
                              </option>
                            );
                          })}
                        </Select>
                        <p style={{ fontSize: 11, color: theme.cores.cinza, marginTop: 4 }}>
                          * Status anteriores à etapa atual ficam bloqueados.
                        </p>
                      </SecaoInfo>
                    </InfoGrid>

                    <SecaoInfo>
                      <TituloSecao>Itens do Pedido</TituloSecao>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {p.itens?.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                            <span>{item.quantidade}x {item.nome}</span>
                            <span>{formatarMoeda(item.preco * item.quantidade)}</span>
                          </div>
                        ))}
                      </div>
                    </SecaoInfo>

                    <TotalContainer>
                      <TotalLinha>
                        <span>Subtotal</span>
                        <span>{formatarMoeda(p.subtotal)}</span>
                      </TotalLinha>
                      <TotalLinha>
                        <span>Frete / Entrega</span>
                        <span>{formatarMoeda(p.taxaEntrega)}</span>
                      </TotalLinha>
                      <TotalLinha $total>
                        <span>Total do Pedido</span>
                        <span>{formatarMoeda(p.total)}</span>
                      </TotalLinha>
                    </TotalContainer>
                  </AccordionContent>
                )}
              </AccordionItem>
            );
          })}
        </ListaPedidos>
      )}
    </Container>
  );
}

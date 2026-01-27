import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiPlus } from 'react-icons/hi2';
import toast from 'react-hot-toast';

import { ouvirProdutosAtivos } from '../../services/produtos';
import { buscarConfiguracoesApp } from '../../services/configuracoes';
import { lojaEstaAberta } from '../../utils/datas';
import { formatarMoeda } from '../../utils/mascaras';
import { useCarrinho } from '../../contexto/CarrinhoContexto';
import { useConfig } from '../../contexto/ConfigContexto';
import { Container, Card } from '../../components/ui/Base.jsx';

const Banner = styled(Card)`
  background: ${({ theme }) => theme.cores.primariaClara};
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Titulo = styled.h2`
  margin: 0;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  font-size: 24px;
  color: ${({ theme }) => theme.cores.secundaria};
`;

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.cores.secundaria};
  opacity: 0.85;
  font-style: italic;
`;

const BuscaWrap = styled.div`
  position: relative;
`;

const Busca = styled.input`
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 16px;
  outline: none;
  background: ${({ theme }) => theme.cores.branco};
  &:focus { border-color: ${({ theme }) => theme.cores.primaria}; box-shadow: 0 0 0 4px ${({ theme }) => theme.cores.primariaClara}; }
`;

const IconBusca = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.cores.cinza};
`;

const Categorias = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const CatBtn = styled.button`
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ $ativa, theme }) => ($ativa ? theme.cores.primaria : theme.cores.branco)};
  color: ${({ $ativa, theme }) => ($ativa ? theme.cores.branco : theme.cores.texto)};
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
`;

const Lista = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  @media (min-width: 780px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ProdutoCard = styled(Link)`
  background: ${({ theme }) => theme.cores.branco};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.bordas.raioGrande};
  padding: 12px;
  display: flex;
  gap: 12px;
  box-shadow: ${({ theme }) => theme.sombras.suave};
`;

const Foto = styled.img`
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 16px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0; /* Essencial para que o flex respeite o texto interno */
`;

const NomeProd = styled.div`
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Desc = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.cores.cinza};
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
`;

const Rodape = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Preco = styled.div`
  font-weight: 900;
  color: ${({ theme }) => theme.cores.primaria};
`;

const Add = styled.button`
  border: 0;
  background: ${({ theme }) => theme.cores.primariaClara};
  color: ${({ theme }) => theme.cores.primaria};
  width: 40px;
  height: 40px;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvisoFechado = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.cores.texto};
  opacity: 0.9;
`;

export default function Cardapio() {
  const [produtos, setProdutos] = useState([]);
  const { config, carregando: carregandoConfig } = useConfig();
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [busca, setBusca] = useState('');
  const { adicionarItem } = useCarrinho();

  useEffect(() => {
    const unsub = ouvirProdutosAtivos((prods) => {
      setProdutos(prods);
      setCarregandoProdutos(false);
    });
    return () => unsub();
  }, []);

  const categorias = useMemo(() => {
    const set = new Set(produtos.map(p => p.categoria).filter(Boolean));
    return Array.from(set).sort();
  }, [produtos]);

  const produtosPorCategoria = useMemo(() => {
    // Se tiver busca, não agrupa, manda tudo filtrado
    if (busca.trim()) {
      return {
        todos: produtos.filter(p => p.nome?.toLowerCase().includes(busca.toLowerCase()))
      };
    }

    // Se nçao tiver busca, agrupa
    const grupos = {};
    const semCategoria = [];

    produtos.forEach(p => {
      if (p.categoria) {
        if (!grupos[p.categoria]) grupos[p.categoria] = [];
        grupos[p.categoria].push(p);
      } else {
        semCategoria.push(p);
      }
    });

    if (semCategoria.length > 0) {
      grupos['Outros'] = semCategoria;
    }

    // Ordena as chaves (categorias)
    return Object.keys(grupos).sort().reduce((obj, key) => {
      obj[key] = grupos[key];
      return obj;
    }, {});
  }, [produtos, busca]);

  // Se agrupa, gera array de seções. Se busca, só 1 seção.
  const secoes = useMemo(() => {
    if (busca.trim()) return Object.entries(produtosPorCategoria);
    return Object.entries(produtosPorCategoria);
  }, [produtosPorCategoria, busca]);

  const aberto = lojaEstaAberta(config?.funcionamento);
  const temBusca = !!busca.trim();

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 28 }}>
      <Banner>
        <Titulo>{config?.nomeLoja || 'Flor da Promessa'}</Titulo>
        <Sub>{config?.mensagemTopo || 'Doces feitos com carinho, como uma promessa em flor 🌸'}</Sub>
        {!aberto && (
          <AvisoFechado>
            <strong>Estamos fechados agora.</strong> {config?.funcionamento?.mensagemFechado || 'Retornamos em breve!'}
          </AvisoFechado>
        )}
      </Banner>

      <BuscaWrap>
        <IconBusca><HiOutlineMagnifyingGlass size={20} /></IconBusca>
        <Busca value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="O que você deseja hoje?" />
      </BuscaWrap>

      {/* Atalhos para categorias (opcional, scroll to section) */}
      {!temBusca && categorias.length > 0 && (
        <Categorias>
          {categorias.map((c) => (
            /* Aqui poderia rolar até a seção, mas por simplicidade no momento só exibimos */
            <CatBtn key={c} $ativa={false} onClick={() => {
              const el = document.getElementById(`cat-${c}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} type="button">{c}</CatBtn>
          ))}
        </Categorias>
      )}

      {carregandoProdutos ? (
        <Card>Carregando doces...</Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {secoes.map(([nomeSecao, listaProdutos]) => (
            listaProdutos.length > 0 && (
              <div key={nomeSecao} id={`cat-${nomeSecao}`}>
                {/* Só mostra título se não for busca ou se tiver agrupado */}
                {!temBusca && (
                  <h3 style={{ margin: '0 0 16px 4px', fontSize: 20, color: '#4B5563', borderLeft: '4px solid #B57EDC', paddingLeft: 12 }}>
                    {nomeSecao}
                  </h3>
                )}
                <Lista>
                  {listaProdutos.map((p) => (
                    <ProdutoCard key={p.id} to={`/produto/${p.id}`}>
                      <Foto src={p.fotoUrl || 'https://picsum.photos/seed/flor/400/400'} alt={p.nome} />
                      <Content>
                        <div>
                          <NomeProd title={p.nome}>{p.nome}</NomeProd>
                          <Desc>{p.descricao}</Desc>
                        </div>
                        <Rodape>
                          <Preco>{formatarMoeda(p.preco)}</Preco>
                          <Add
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              adicionarItem(p, 1);
                              toast.success('Adicionado ao carrinho!');
                            }}
                            aria-label="Adicionar"
                          >
                            <HiPlus size={18} />
                          </Add>
                        </Rodape>
                      </Content>
                    </ProdutoCard>
                  ))}
                </Lista>
              </div>
            )
          ))}

          {secoes.length === 0 && (
            <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 28, color: '#6B7280' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🍬</div>
              Nenhum doce encontrado.
            </Card>
          )}
        </div>
      )}
    </Container>
  );
}

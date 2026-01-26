import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import toast from 'react-hot-toast';
import { HiMinus, HiPlus, HiArrowLeft } from 'react-icons/hi2';

import { buscarProdutoPorId } from '../../services/produtos';
import { formatarMoeda } from '../../utils/mascaras';
import { useCarrinho } from '../../contexto/CarrinhoContexto';
import { Container, Card } from '../../components/ui/Base.jsx';
import { Botao } from '../../components/ui/Botoes.jsx';
import { Campo } from '../../components/ui/Form.jsx';

const Foto = styled.img`
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.bordas.raioGrande};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.branco};
`;

const Titulo = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 900;
`;

const Desc = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.cores.cinza};
  font-size: 14px;
`;

const Quantidade = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.branco};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();
  const theme = useTheme();

  const [produto, setProduto] = useState(null);
  const [qtd, setQtd] = useState(1);
  const [obs, setObs] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await buscarProdutoPorId(id);
        setProduto(p);
      } catch (e) {
        toast.error('Não foi possível carregar o produto.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [id]);

  if (carregando) {
    return <Container><Card>Carregando...</Card></Container>;
  }

  if (!produto) {
    return <Container><Card>Produto não encontrado.</Card></Container>;
  }

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 28 }}>
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', color: '#6B7280', fontWeight: 900 }}
      >
        <HiArrowLeft /> Voltar
      </button>

      <Foto src={produto.fotoUrl || 'https://res.cloudinary.com/dxs92g9nu/image/upload/v1769399355/flor-da-promessa/produtos/dhtqbroegyzchutfmoid.png'} alt={produto.nome} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'baseline' }}>
        <Titulo>{produto.nome}</Titulo>
        <div style={{ fontWeight: 900, color: theme.cores.primaria, fontSize: 18 }}>{formatarMoeda(produto.preco)}</div>
      </div>
      <Desc>{produto.descricao}</Desc>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <strong>Observação</strong>
        <Campo value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: sem granulado, bem gelado..." />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Quantidade>
            <QBtn type="button" onClick={() => setQtd(q => Math.max(1, q - 1))}><HiMinus /></QBtn>
            <strong>{qtd}</strong>
            <QBtn type="button" onClick={() => setQtd(q => q + 1)}><HiPlus /></QBtn>
          </Quantidade>

          <Botao
            type="button"
            onClick={() => {
              adicionarItem(produto, qtd, obs);
              toast.success('Adicionado ao carrinho!');
              navigate('/carrinho');
            }}
          >
            Adicionar
          </Botao>
        </div>
      </Card>
    </Container>
  );
}

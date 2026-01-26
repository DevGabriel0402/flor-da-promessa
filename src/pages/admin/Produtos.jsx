import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';

import {
  criarProduto,
  atualizarProduto,
  excluirProduto,
  ouvirProdutosAdmin
} from '../../services/produtos';
import { formatarMoeda } from '../../utils/mascaras';
import { Container, Card, Row, Badge, Overlay, ModalConteudo } from '../../components/ui/Base.jsx';
import { safeString } from '../../utils/geral';
import { Botao, BotaoPerigo, BotaoSecundario } from '../../components/ui/Botoes.jsx';
import { Campo, Grupo, Grid2, Rotulo } from '../../components/ui/Form.jsx';
import { Select } from '../../components/ui/Dropdown.jsx';
import { UploadImagem } from '../../components/ui/UploadImagem.jsx';

const DescricaoTexto = styled.div`
max-width: 200px;
  font-size: 12px;
  color: ${({ theme }) => theme.cores.cinza};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

const FotoMini = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.cores.borda};
`;

const vazio = {
  nome: '',
  descricao: '',
  preco: '',
  categoria: '',
  fotoUrl: 'https://res.cloudinary.com/dxs92g9nu/image/upload/v1769399355/flor-da-promessa/produtos/dhtqbroegyzchutfmoid.png',
  fotoPublicId: '',
  ativo: true
};

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(vazio);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    const unsub = ouvirProdutosAdmin((lista) => {
      setProdutos(lista);
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  const onChange = (campo) => (e) => setForm((p) => ({ ...p, [campo]: e.target.value }));

  const iniciarNovo = () => {
    setEditandoId(null);
    setForm(vazio);
    setModalAberto(true);
  };

  const iniciarEdicao = (p) => {
    setEditandoId(p.id);
    setForm({
      nome: p.nome || '',
      descricao: p.descricao || '',
      preco: String(p.preco ?? ''),
      categoria: p.categoria || '',
      fotoUrl: p.fotoUrl || '',
      fotoPublicId: p.fotoPublicId || '',
      ativo: Boolean(p.ativo)
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditandoId(null);
    setForm(vazio);
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.preco) {
      toast.error('Informe nome e preço.');
      return;
    }

    try {
      const dados = {
        nome: form.nome,
        descricao: form.descricao,
        preco: Number(form.preco),
        categoria: form.categoria,
        fotoUrl: form.fotoUrl,
        fotoPublicId: form.fotoPublicId,
        ativo: Boolean(form.ativo)
      };

      if (editandoId) {
        await atualizarProduto(editandoId, dados);
        toast.success('Produto atualizado.');
      } else {
        await criarProduto(dados);
        toast.success('Produto criado.');
      }
      fecharModal();
    } catch (err) {
      toast.error('Falha ao salvar produto.');
    }
  };

  const remover = async (id) => {
    if (!confirm('Excluir este produto?')) return;
    try {
      await excluirProduto(id);
      toast.success('Produto excluído.');
    } catch (e) {
      toast.error('Não foi possível excluir.');
    }
  };

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Produtos</h1>
        <Botao onClick={iniciarNovo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HiOutlinePlus size={20} />
          Novo Produto
        </Botao>
      </Row>

      {carregando ? (
        <Card>Carregando...</Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {produtos.map((p) => (
            <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <FotoMini src={p.fotoUrl || 'https://picsum.photos/seed/flor/200/200'} alt={safeString(p.nome)} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{safeString(p.nome)}</div>
                    <Badge>{p.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 700, marginTop: 2 }}>
                    {safeString(p.categoria) || 'Sem categoria'} · <span style={{ color: '#B57EDC' }}>{formatarMoeda(p.preco)}</span>
                  </div>
                  <DescricaoTexto>{safeString(p.descricao) || 'Sem descrição.'}</DescricaoTexto>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <BotaoSecundario
                  style={{ flex: 1, padding: '8px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={() => iniciarEdicao(p)}
                >
                  <HiOutlinePencilSquare size={16} /> Editar
                </BotaoSecundario>
                <BotaoPerigo
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => remover(p.id)}
                >
                  <HiOutlineTrash size={16} />
                </BotaoPerigo>
              </div>
            </Card>
          ))}

          {produtos.length === 0 && <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>Nenhum produto cadastrado.</Card>}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {modalAberto && (
        <Overlay onClick={(e) => e.target === e.currentTarget && fecharModal()}>
          <ModalConteudo>
            <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
                {editandoId ? 'Editar Produto' : 'Novo Produto'}
              </h2>

              <Grid2>
                <Grupo>
                  <Rotulo>Nome</Rotulo>
                  <Campo value={form.nome} onChange={onChange('nome')} placeholder="Ex: Brigadeiro Belga" required />
                </Grupo>
                <Grupo>
                  <Rotulo>Categoria</Rotulo>
                  <Campo value={form.categoria} onChange={onChange('categoria')} placeholder="Ex: Brigadeiros" />
                </Grupo>
              </Grid2>

              <Grupo>
                <Rotulo>Descrição (máx. 2 linhas visíveis)</Rotulo>
                <Campo value={form.descricao} onChange={onChange('descricao')} placeholder="Descreva brevemente o produto" />
              </Grupo>

              <Grid2>
                <Grupo>
                  <Rotulo>Preço (R$)</Rotulo>
                  <Campo type="number" step="0.01" value={form.preco} onChange={onChange('preco')} required />
                </Grupo>
                <Grupo>
                  <Rotulo>Disponibilidade</Rotulo>
                  <Select value={form.ativo ? 'sim' : 'nao'} onChange={(e) => setForm(p => ({ ...p, ativo: e.target.value === 'sim' }))}>
                    <option value="sim">Ativo (Visível)</option>
                    <option value="nao">Inativo (Oculto)</option>
                  </Select>
                </Grupo>
              </Grid2>

              <UploadImagem
                titulo="Foto do Produto"
                valorAtual={form.fotoUrl}
                pasta="flor-da-promessa/produtos"
                onUploadConcluido={async (res) => {
                  setForm((p) => ({ ...p, fotoUrl: res.url, fotoPublicId: res.publicId }));
                  toast.success('Foto carregada!');
                }}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <BotaoSecundario type="button" onClick={fecharModal} style={{ flex: 1 }}>Cancelar</BotaoSecundario>
                <Botao type="submit" style={{ flex: 2 }}>Salvar Produto</Botao>
              </div>
            </form>
          </ModalConteudo>
        </Overlay>
      )}
    </Container>
  );
}

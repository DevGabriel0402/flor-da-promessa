import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import toast from 'react-hot-toast';

import { buscarConfiguracoesApp, salvarConfiguracoesApp, CONFIG_PADRAO } from '../../services/configuracoes';
import { Container, Card } from '../../components/ui/Base.jsx';
import { Botao } from '../../components/ui/Botoes.jsx';
import { Campo, Grupo, Grid2, Rotulo } from '../../components/ui/Form.jsx';

import { UploadImagem } from '../../components/ui/UploadImagem.jsx';

export default function AdminConfiguracoes() {
  const [form, setForm] = useState(CONFIG_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await buscarConfiguracoesApp();
        if (cfg) setForm((p) => ({ ...CONFIG_PADRAO, ...cfg, funcionamento: { ...CONFIG_PADRAO.funcionamento, ...cfg.funcionamento } }));
      } catch (e) {
        toast.error('Não foi possível carregar configurações.');
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const onChange = (campo) => (e) => setForm((p) => ({ ...p, [campo]: e.target.value }));
  const onChangeFunc = (campo) => (e) => setForm((p) => ({ ...p, funcionamento: { ...p.funcionamento, [campo]: e.target.value } }));

  const toggleDia = (dia) => {
    setForm((p) => {
      const atual = p.funcionamento.diasAtivos || [];
      const tem = atual.includes(dia);
      return {
        ...p,
        funcionamento: {
          ...p.funcionamento,
          diasAtivos: tem ? atual.filter(d => d !== dia) : [...atual, dia]
        }
      };
    });
  };

  const salvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await salvarConfiguracoesApp({ ...form, taxaEntrega: Number(form.taxaEntrega) });

      toast.success('Configurações salvas.');
    } catch (err) {
      toast.error('Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <Container><Card>Carregando...</Card></Container>;
  }

  const dias = [
    { k: 'seg', l: 'Seg' },
    { k: 'ter', l: 'Ter' },
    { k: 'qua', l: 'Qua' },
    { k: 'qui', l: 'Qui' },
    { k: 'sex', l: 'Sex' },
    { k: 'sab', l: 'Sáb' },
    { k: 'dom', l: 'Dom' }
  ];

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Configurações</h1>

      <Card>
        <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Grid2>
            <Grupo>
              <Rotulo>Nome da loja</Rotulo>
              <Campo value={form.nomeLoja} onChange={onChange('nomeLoja')} />
            </Grupo>
            <Grupo>
              <Rotulo>Cor primária (Configuração)</Rotulo>
              <Campo value={form.corPrimaria} onChange={onChange('corPrimaria')} placeholder="#B57EDC" />
            </Grupo>
          </Grid2>

          <Grupo>
            <UploadImagem
              titulo="Logo da loja"
              valorAtual={form.logoUrl}
              pasta="flor-da-promessa/logo"
              onUploadConcluido={async (res) => {
                const novoForm = { ...form, logoUrl: res.url, logoPublicId: res.publicId };
                setForm(novoForm);
                await salvarConfiguracoesApp({ ...novoForm, taxaEntrega: Number(novoForm.taxaEntrega) });
                toast.success('Logo atualizada e salva!');
              }}
            />
          </Grupo>

          <Grupo>
            <Rotulo>Mensagem do topo</Rotulo>
            <Campo value={form.mensagemTopo} onChange={onChange('mensagemTopo')} />
          </Grupo>

          <Grid2>
            <Grupo>
              <Rotulo>Taxa de entrega (R$)</Rotulo>
              <Campo type="number" step="0.01" value={form.taxaEntrega} onChange={onChange('taxaEntrega')} />
            </Grupo>
            <Grupo>
              <Rotulo>Mensagem quando fechado</Rotulo>
              <Campo value={form.funcionamento.mensagemFechado} onChange={onChangeFunc('mensagemFechado')} />
            </Grupo>
          </Grid2>

          <Card style={{ background: '#F6F6F6' }}>
            <strong>Funcionamento</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {dias.map(({ k, l }) => {
                const ativo = form.funcionamento.diasAtivos?.includes(k);
                // Usando cor primária fixa do tema para o preview ou fallback
                const corPrimaria = '#B57EDC';
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleDia(k)}
                    style={{
                      border: '1px solid #E5E7EB',
                      background: ativo ? corPrimaria : '#FFFFFF',
                      color: ativo ? '#FFFFFF' : '#2E2E2E',
                      borderRadius: 999,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontWeight: 900,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>

            <Grid2 style={{ marginTop: 12 }}>
              <Grupo>
                <Rotulo>Abertura</Rotulo>
                <Campo value={form.funcionamento.horarioAbertura} onChange={onChangeFunc('horarioAbertura')} placeholder="09:00" />
              </Grupo>
              <Grupo>
                <Rotulo>Fechamento</Rotulo>
                <Campo value={form.funcionamento.horarioFechamento} onChange={onChangeFunc('horarioFechamento')} placeholder="21:00" />
              </Grupo>
            </Grid2>
          </Card>

          <Botao type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar configurações'}</Botao>
        </form>
      </Card>
    </Container>
  );
}

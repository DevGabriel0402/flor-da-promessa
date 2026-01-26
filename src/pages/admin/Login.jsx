import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { entrarAdmin } from '../../services/auth';
import { Card } from '../../components/ui/Base.jsx';
import { Botao } from '../../components/ui/Botoes.jsx';
import { Campo, Grupo, Rotulo } from '../../components/ui/Form.jsx';
import { useConfig } from '../../contexto/ConfigContexto';

const Wrap = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
`;

const Marca = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const { config } = useConfig();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await entrarAdmin(email, senha);
      toast.success('Bem-vindo(a) ao painel!');
      navigate('/admin');
    } catch (err) {
      toast.error('Login inválido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrap>
      <Card style={{ width: 'min(420px, 100%)', padding: 20 }}>
        <Marca>
          <img src={config?.logoUrl || "/logo-lirio.svg"} alt={config?.nomeLoja || "Lírio"} width={30} height={30} />
          <strong style={{ color: config?.corPrimaria || '#8E5DB7' }}>{config?.nomeLoja || "Flor da Promessa"}</strong>
        </Marca>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Login do Admin</h1>
        <p style={{ marginTop: 6, marginBottom: 16, color: '#6B7280', fontSize: 13 }}>
          Acesso restrito.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Grupo>
            <Rotulo>Email</Rotulo>
            <Campo type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Grupo>
          <Grupo>
            <Rotulo>Senha</Rotulo>
            <Campo type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </Grupo>
          <Botao type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Botao>
        </form>
      </Card>
    </Wrap>
  );
}

import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import toast from 'react-hot-toast';

import { listarClientesAdmin } from '../../services/clientes';
import { mascararCpf } from '../../utils/mascaras';
import { Container, Card, Row, Badge } from '../../components/ui/Base.jsx';
import { safeString } from '../../utils/geral';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const lista = await listarClientesAdmin();
        setClientes(lista);
      } catch (e) {
        toast.error('Não foi possível carregar clientes.');
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  return (
    <Container style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Clientes</h1>

      {carregando ? (
        <Card>Carregando...</Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clientes.map((c) => (
            <Card key={c.id} style={{ padding: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Row>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{safeString(c.nome)}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      CPF: {safeString(c.cpfMascarado || mascararCpf(c.cpfNormalizado))} · Contato: {safeString(c.contato)}
                    </div>
                  </div>
                  <Badge>{safeString(c.totalPedidos) || 0} pedidos</Badge>
                </Row>

                {c.endereco && (
                  <div style={{
                    fontSize: 13,
                    padding: '10px 12px',
                    background: '#F9FAFB',
                    borderRadius: 10,
                    border: '1px solid #F1F5F9',
                    color: '#4B5563'
                  }}>
                    <strong style={{ fontSize: 11, color: theme.cores.cinza, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Endereço</strong>
                    {safeString(c.endereco.rua)}, {safeString(c.endereco.numero)}
                    {c.endereco.bairro && ` · ${safeString(c.endereco.bairro)}`}
                    {c.endereco.complemento && ` (${safeString(c.endereco.complemento)})`}
                    {c.endereco.referencia && <div style={{ fontSize: 12, marginTop: 4, color: theme.cores.cinza }}>Ref: {safeString(c.endereco.referencia)}</div>}
                  </div>
                )}
              </div>
            </Card>
          ))}

          {clientes.length === 0 && <Card>Nenhum cliente ainda.</Card>}
        </div>
      )}
    </Container>
  );
}

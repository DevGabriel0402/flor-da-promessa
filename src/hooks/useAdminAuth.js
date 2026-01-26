import { useEffect, useState } from 'react';
import { observarAuth } from '../services/auth';

export const useAdminAuth = () => {
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsub = observarAuth((u) => {
      console.log('User status changed:', u ? `Logged in as ${u.email} (UID: ${u.uid})` : 'Logged out');
      setUsuario(u || null);
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  return { carregando, usuario };
};

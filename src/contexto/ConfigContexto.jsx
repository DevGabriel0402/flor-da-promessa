import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { ouvirConfiguracoesApp, CONFIG_PADRAO } from '../services/configuracoes';
import { tema as temaPadrao } from '../styles/tema';
import Loading from '../components/ui/Loading.jsx';

const ConfigContexto = createContext();

export function ProvedorConfig({ children }) {
    const [config, setConfig] = useState(CONFIG_PADRAO);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const unsub = ouvirConfiguracoesApp((dados) => {
            if (dados) {
                setConfig({ ...CONFIG_PADRAO, ...dados, funcionamento: { ...CONFIG_PADRAO.funcionamento, ...dados.funcionamento } });
            } else {
                setConfig(CONFIG_PADRAO);
            }
            setCarregando(false);
        });
        return () => unsub();
    }, []);

    // O usuário deseja cores fixas (Lírio/Flor da Promessa), 
    // então ignoramos cores do banco no tema direto do styled-components.
    const temaDinamico = {
        ...temaPadrao
    };

    return (
        <ConfigContexto.Provider value={{ config, carregando }}>
            <ThemeProvider theme={temaDinamico}>
                {carregando ? <Loading /> : children}
            </ThemeProvider>
        </ConfigContexto.Provider>
    );
}

export const useConfig = () => useContext(ConfigContexto);

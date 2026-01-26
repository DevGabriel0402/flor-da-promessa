import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "styled-components";
import { uploadImagemCloudinary } from "../../services/cloudinaryServico";
import { Botao } from "./Botoes";

export function UploadImagem({
    titulo = "Imagem",
    valorAtual = "",
    pasta = "flor-da-promessa",
    onUploadConcluido, // (resultado) => {}
    tamanhoMaxMB = 2,
}) {
    const [arquivo, setArquivo] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [arrastando, setArrastando] = useState(false);
    const theme = useTheme();

    const preview = useMemo(() => {
        if (arquivo) return URL.createObjectURL(arquivo);
        return valorAtual || "";
    }, [arquivo, valorAtual]);

    function validarEGravar(file) {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Selecione uma imagem.");
            return;
        }

        const maxBytes = tamanhoMaxMB * 1024 * 1024;
        if (file.size > maxBytes) {
            toast.error(`Imagem muito grande. Máximo ${tamanhoMaxMB}MB.`);
            return;
        }

        setArquivo(file);
    }

    function onSelecionar(e) {
        const file = e.target.files?.[0];
        validarEGravar(file);
    }

    function onDragOver(e) {
        e.preventDefault();
        setArrastando(true);
    }

    function onDragLeave() {
        setArrastando(false);
    }

    function onDrop(e) {
        e.preventDefault();
        setArrastando(false);
        const file = e.dataTransfer.files?.[0];
        validarEGravar(file);
    }

    async function enviar() {
        if (!arquivo) {
            toast.error("Selecione uma imagem antes de enviar.");
            return;
        }

        try {
            setEnviando(true);
            const res = await uploadImagemCloudinary(arquivo, pasta);
            await onUploadConcluido?.(res);
            toast.success("Imagem enviada com sucesso!");
            setArquivo(null);
        } catch (err) {
            toast.error(err?.message || "Erro ao enviar imagem.");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div style={{ display: "grid", gap: 10 }}>
            <strong>{titulo}</strong>

            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                style={{
                    border: `2px dashed ${arrastando ? theme.cores.primaria : theme.cores.borda}`,
                    borderRadius: 20,
                    padding: 20,
                    background: arrastando ? theme.cores.primariaClara : theme.cores.branco,
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                    textAlign: "center",
                    cursor: "pointer"
                }}
                onClick={() => document.getElementById(`input-file-${titulo}`).click()}
            >
                <div
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 16,
                        border: "1px solid #E5E7EB",
                        background: "#fff",
                        overflow: "hidden",
                        display: "grid",
                        placeItems: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                    }}
                >
                    {preview ? (
                        <img src={preview} alt={titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <span style={{ fontSize: 40, opacity: 0.3 }}>🖼️</span>
                    )}
                </div>

                <div>
                    <div style={{ fontWeight: 800, color: "#2E2E2E" }}>
                        {arquivo ? arquivo.name : "Arraste uma imagem ou clique para selecionar"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                        PNG, JPG ou WebP até {tamanhoMaxMB}MB
                    </div>
                </div>

                <input
                    id={`input-file-${titulo}`}
                    type="file"
                    accept="image/*"
                    onChange={onSelecionar}
                    style={{ display: "none" }}
                />
            </div>

            {arquivo && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <Botao type="button" onClick={(e) => { e.stopPropagation(); enviar(); }} disabled={enviando} style={{ flex: 1 }}>
                        {enviando ? "Enviando..." : "Confirmar Envio"}
                    </Botao>

                    <Botao
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setArquivo(null); }}
                        disabled={enviando}
                        style={{ background: "#F3F4F6", color: "#4B5563", border: "1px solid #E5E7EB" }}
                    >
                        Cancelar
                    </Botao>
                </div>
            )}
        </div>
    );
}

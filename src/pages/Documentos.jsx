import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { podePublicar } from '../utils/roles'
import { useDocumentos } from '../hooks/useDocumentos'
import { FileText, Download, Trash2 } from 'lucide-react'

export default function Documentos() {
  const { perfil } = useAuth()
  const { documentos, loading } = useDocumentos()
  const [enviando, setEnviando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({
    nome: '',
    categoria: 'geral',
    url: '',
    tamanho: '',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSalvar(e) {
    e.preventDefault()
    if (!form.nome || !form.url) return
    setEnviando(true)
    try {
      await addDoc(collection(db, 'documentos'), {
        nome: form.nome,
        categoria: form.categoria,
        url: form.url,
        tamanho: form.tamanho,
        autor: perfil?.nome || 'Desconhecido',
        criadoEm: serverTimestamp(),
      })
      setForm({ nome: '', categoria: 'geral', url: '', tamanho: '' })
      setMostrarForm(false)
    } catch (err) {
      console.error('Erro ao salvar documento:', err)
    } finally {
      setEnviando(false)
    }
  }

  async function handleDeletar(id) {
    try {
      await deleteDoc(doc(db, 'documentos', id))
      setConfirmDelete(null)
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
  }

  return (
    <div>

      <div style={styles.cabecalho}>
        <div>
          <h2 style={styles.titulo}>Documentos</h2>
          <p style={styles.subtitulo}>Arquivos e documentos institucionais</p>
        </div>
        {podePublicar(perfil?.role) && (
          <button
            style={styles.botaoNovo}
            onClick={() => setMostrarForm(prev => !prev)}
          >
            {mostrarForm ? 'Cancelar' : '+ Adicionar Documento'}
          </button>
        )}
      </div>

      {mostrarForm && (
        <div style={styles.card}>
          <h3 style={styles.cardTitulo}>Adicionar Documento</h3>
          <p style={styles.cardDica}>
            Faça o upload no Google Drive, copie o link de compartilhamento e cole abaixo.
          </p>
          <form onSubmit={handleSalvar} style={styles.form}>
            <div style={styles.campo}>
              <label style={styles.label}>Nome do documento</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Calendário Escolar 2026"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Categoria</label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="geral">Geral</option>
                <option value="calendario">Calendário</option>
                <option value="autorizacao">Autorização</option>
                <option value="regimento">Regimento</option>
                <option value="horario">Horário</option>
                <option value="militar">Militar</option>
              </select>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Link do documento</label>
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                required
                style={styles.input}
              />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Tamanho (opcional)</label>
              <input
                name="tamanho"
                value={form.tamanho}
                onChange={handleChange}
                placeholder="Ex: 412 KB"
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={enviando} style={styles.botaoEnviar}>
              {enviando ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={styles.vazio}>Carregando documentos...</div>
      ) : documentos.length === 0 ? (
        <div style={styles.vazio}>Nenhum documento disponível ainda.</div>
      ) : (
        <div style={styles.grid}>
          {documentos.map(doc => (
            <div key={doc.id} style={styles.docCard}>
              <div style={styles.docIcone}>
                <FileText size={22} color="var(--vinho)" />
              </div>
              <div style={styles.docInfo}>
                <span style={styles.docNome}>{doc.nome}</span>
                <span style={styles.docMeta}>
                  {doc.categoria} {doc.tamanho ? `· ${doc.tamanho}` : ''} · {doc.autor}
                </span>
                <span style={styles.docData}>
                  {doc.criadoEm?.toDate().toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div style={styles.docAcoes}>
                <a href={doc.url} target="_blank" rel="noreferrer" style={styles.botaoDownload} title="Abrir documento">
                  <Download size={15} color="var(--vinho)" />
                </a>
                {podePublicar(perfil?.role) && (
                  confirmDelete === doc.id ? (
                    <div style={styles.confirmArea}>
                      <button style={styles.botaoSim} onClick={() => handleDeletar(doc.id)}>Sim</button>
                      <button style={styles.botaoNao} onClick={() => setConfirmDelete(null)}>Não</button>
                    </div>
                  ) : (
                    <button
                      style={styles.botaoDeletar}
                      onClick={() => setConfirmDelete(doc.id)}
                      title="Excluir"
                    >
                      <Trash2 size={15} color="#e24b4a" />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

const styles = {
  cabecalho: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  titulo: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  subtitulo: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  botaoNovo: {
    background: 'var(--vinho)',
    color: 'white',
    padding: '10px 18px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '0.5px solid var(--border)',
    padding: '20px',
    marginBottom: '20px',
  },
  cardTitulo: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  cardDica: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    background: 'var(--surface)',
    outline: 'none',
    width: '100%',
  },
  botaoEnviar: {
    background: 'var(--vinho)',
    color: 'white',
    padding: '11px 24px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    border: 'none',
  },
  vazio: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    padding: '40px 0',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  docCard: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '0.5px solid var(--border)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  docIcone: {
    width: '40px',
    height: '40px',
    background: '#f9f0f0',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  docNome: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  docMeta: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize',
  },
  docData: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  docAcoes: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  botaoDownload: {
    width: '34px',
    height: '34px',
    borderRadius: 'var(--radius-md)',
    background: '#f9f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDeletar: {
    width: '34px',
    height: '34px',
    borderRadius: 'var(--radius-md)',
    background: '#fcebeb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
  },
  confirmArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  botaoSim: {
    background: '#e24b4a',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
  botaoNao: {
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    border: '1px solid var(--border)',
  },
}
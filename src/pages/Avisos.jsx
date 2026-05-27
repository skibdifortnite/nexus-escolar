import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { useAvisos } from '../hooks/useAvisos'
import { podePublicar } from '../utils/roles'
import { Bell, X, AlertTriangle, Calendar, Shield, FileText, Info, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const tipoConfig = {
  geral:    { cor: '#8a9bb0', bg: '#f2f2f2', texto: '#444',    Icone: Info,          label: 'Geral' },
  urgente:  { cor: '#e24b4a', bg: '#fcebeb', texto: '#a32d2d', Icone: AlertTriangle, label: 'Urgente' },
  evento:   { cor: '#C9A84C', bg: '#fdf6e3', texto: '#7a5c00', Icone: Calendar,      label: 'Evento' },
  militar:  { cor: '#6B1A1A', bg: '#f9f0f0', texto: '#6B1A1A', Icone: Shield,        label: 'Militar' },
  documento:{ cor: '#1a3a6b', bg: '#e6edf8', texto: '#1a3a6b', Icone: FileText,      label: 'Documento' },
}

const filtros = ['todos', 'urgente', 'evento', 'militar', 'documento', 'geral']

export default function Avisos() {
  const { perfil } = useAuth()
  const { avisos, loading } = useAvisos(perfil?.role)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [filtroAtivo, setFiltroAtivo] = useState('todos')
  const [expandido, setExpandido] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({ titulo: '', conteudo: '', tipo: 'geral' })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function toggleExpandido(id) {
    setExpandido(prev => prev === id ? null : id)
  }

  async function handlePublicar(e) {
  e.preventDefault()
  if (!form.titulo || !form.conteudo) return
  setEnviando(true)
  try {
    await addDoc(collection(db, 'comunicados'), {
      titulo: form.titulo,
      conteudo: form.conteudo,
      tipo: form.tipo,
      autor: perfil?.nome || 'Desconhecido',
      autorRole: perfil?.role || '',
      criadoEm: serverTimestamp(),
      // Marca para notificar se for urgente
      notificar: form.tipo === 'urgente',
    })
    setForm({ titulo: '', conteudo: '', tipo: 'geral' })
    setMostrarForm(false)
  } catch (err) {
    console.error('Erro ao publicar:', err)
  } finally {
    setEnviando(false)
  }
}

  async function handleDeletar(id) {
    try {
      await deleteDoc(doc(db, 'comunicados', id))
      setConfirmDelete(null)
      if (expandido === id) setExpandido(null)
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
  }

  const avisosFiltrados = filtroAtivo === 'todos'
    ? avisos
    : avisos.filter(a => a.tipo === filtroAtivo)

  return (
    <div>

      {/* Cabeçalho */}
      <div style={styles.cabecalho}>
        <div style={styles.cabecalhoEsquerda}>
          <div style={styles.cabecalhoIcone}>
            <Bell size={18} color="white" />
          </div>
          <div>
            <h2 style={styles.titulo}>Comunicados</h2>
            <p style={styles.subtitulo}>{avisos.length} publicações institucionais</p>
          </div>
        </div>
        {podePublicar(perfil?.role) && (
          <button
            style={mostrarForm ? styles.botaoCancelar : styles.botaoNovo}
            onClick={() => setMostrarForm(prev => !prev)}
          >
            {mostrarForm
              ? <><X size={14} /> Cancelar</>
              : <><Bell size={14} /> Novo Comunicado</>
            }
          </button>
        )}
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div style={styles.formCard}>
          <div style={styles.formCabecalho}>
            <span style={styles.formTitulo}>Novo Comunicado</span>
          </div>
          <form onSubmit={handlePublicar} style={styles.form}>
            <div style={styles.campo}>
              <label style={styles.label}>Título</label>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Título do comunicado"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} style={styles.input}>
                <option value="geral">Geral</option>
                <option value="urgente">Urgente</option>
                <option value="evento">Evento</option>
                <option value="militar">Militar</option>
                <option value="documento">Documento</option>
              </select>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Conteúdo</label>
              <textarea
                name="conteudo"
                value={form.conteudo}
                onChange={handleChange}
                placeholder="Escreva o comunicado aqui..."
                required
                rows={4}
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>
            <button type="submit" disabled={enviando} style={styles.botaoEnviar}>
              {enviando ? 'Publicando...' : 'Publicar'}
            </button>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div style={styles.filtros}>
        {filtros.map(f => (
          <button
            key={f}
            onClick={() => setFiltroAtivo(f)}
            style={{
              ...styles.filtroBotao,
              ...(filtroAtivo === f ? styles.filtroAtivo : {})
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={styles.vazio}>Carregando comunicados...</div>
      ) : avisosFiltrados.length === 0 ? (
        <div style={styles.vazio}>Nenhum comunicado encontrado.</div>
      ) : (
        <div style={styles.lista}>
          {avisosFiltrados.map(aviso => {
            const config = tipoConfig[aviso.tipo] || tipoConfig.geral
            const { Icone } = config
            const estaExpandido = expandido === aviso.id
            const confirmando = confirmDelete === aviso.id

            return (
              <div key={aviso.id} style={{
                ...styles.avisoCard,
                borderLeft: `4px solid ${config.cor}`,
              }}>

                {/* Topo clicável */}
                <div
                  style={styles.avisoTopo}
                  onClick={() => toggleExpandido(aviso.id)}
                >
                  <div style={styles.avisoTopoEsquerda}>
                    <div style={{ ...styles.avisoIcone, background: config.bg }}>
                      <Icone size={14} color={config.cor} />
                    </div>
                    <span style={{ ...styles.badge, background: config.bg, color: config.texto }}>
                      {config.label.toUpperCase()}
                    </span>
                    <span style={styles.avisoTitulo}>{aviso.titulo}</span>
                  </div>
                  <div style={styles.avisoTopoDireita}>
                    <span style={styles.avisoData}>
                      {aviso.criadoEm?.toDate().toLocaleDateString('pt-BR')}
                    </span>
                    {estaExpandido
                      ? <ChevronUp size={16} color="var(--text-muted)" />
                      : <ChevronDown size={16} color="var(--text-muted)" />
                    }
                  </div>
                </div>

                {/* Conteúdo expandido */}
                {estaExpandido && (
                  <div style={styles.avisoExpandido}>
                    <p style={styles.avisoConteudo}>{aviso.conteudo}</p>
                    <div style={styles.avisoRodape}>
                      <div style={styles.avisoAutorArea}>
                        <div style={styles.avisoAvatar}>
                          {aviso.autor?.charAt(0).toUpperCase()}
                        </div>
                        <span style={styles.avisoAutor}>{aviso.autor}</span>
                        <span style={styles.avisoHora}>
                          {aviso.criadoEm?.toDate().toLocaleTimeString('pt-BR', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Botão deletar só para quem pode publicar */}
                      {podePublicar(perfil?.role) && (
                        <div>
                          {confirmando ? (
                            <div style={styles.confirmArea}>
                              <span style={styles.confirmTexto}>Confirmar exclusão?</span>
                              <button
                                style={styles.botaoSim}
                                onClick={() => handleDeletar(aviso.id)}
                              >
                                Sim
                              </button>
                              <button
                                style={styles.botaoNao}
                                onClick={() => setConfirmDelete(null)}
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              style={styles.botaoDeletar}
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmDelete(aviso.id)
                              }}
                            >
                              <Trash2 size={14} />
                              Excluir
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )
          })}
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
    marginBottom: '20px',
  },
  cabecalhoEsquerda: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cabecalhoIcone: {
    width: '40px',
    height: '40px',
    background: 'var(--vinho)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(107,26,26,0.3)',
  },
  titulo: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '2px',
  },
  subtitulo: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  botaoNovo: {
    background: 'var(--vinho)',
    color: 'white',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(107,26,26,0.3)',
  },
  botaoCancelar: {
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid var(--border)',
  },
  formCard: {
    background: 'white',
    borderRadius: '10px',
    border: '0.5px solid var(--border)',
    marginBottom: '20px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  formCabecalho: {
    background: 'var(--vinho)',
    padding: '12px 18px',
  },
  formTitulo: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
  },
  form: {
    padding: '18px',
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
    borderRadius: '8px',
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
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  filtros: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  filtroBotao: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid var(--border)',
    background: 'white',
    color: 'var(--text-secondary)',
  },
  filtroAtivo: {
    background: 'var(--vinho)',
    color: 'white',
    border: '1px solid var(--vinho)',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  avisoCard: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  avisoTopo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  avisoTopoEsquerda: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    overflow: 'hidden',
  },
  avisoTopoDireita: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
    marginLeft: '10px',
  },
  avisoIcone: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  avisoTitulo: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  avisoData: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  avisoExpandido: {
    padding: '0 16px 16px',
    borderTop: '0.5px solid var(--border)',
    paddingTop: '14px',
  },
  avisoConteudo: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    marginBottom: '14px',
  },
  avisoRodape: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '0.5px solid var(--border)',
  },
  avisoAutorArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avisoAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--vinho)',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avisoAutor: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  avisoHora: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  botaoDeletar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#e24b4a',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #fcebeb',
    background: '#fcebeb',
  },
  confirmArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  confirmTexto: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  botaoSim: {
    background: '#e24b4a',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  botaoNao: {
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid var(--border)',
  },
  vazio: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    padding: '40px 0',
  },
}
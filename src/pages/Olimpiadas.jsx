import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { useOlimpiadas } from '../hooks/useOlimpiadas'
import { podeAcessarAreaMilitar } from '../utils/roles'
import { useNavigate } from 'react-router-dom'
import { Trophy, Plus, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const STATUS = {
  aberta: { label: 'Aberta', cor: '#2e7d5e', bg: '#e6f4ef', texto: '#1a4d38' },
  encerrada: { label: 'Encerrada', cor: '#8a9bb0', bg: '#f2f2f2', texto: '#444' },
}

export default function Olimpiadas() {
  const { perfil, user } = useAuth()
  const { olimpiadas, loading } = useOlimpiadas()
  const navigate = useNavigate()
  const podeGerenciar = podeAcessarAreaMilitar(perfil?.role)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [campos, setCampos] = useState([{ id: Date.now(), label: '' }])
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    status: 'aberta',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function adicionarCampo() {
    setCampos(prev => [...prev, { id: Date.now(), label: '' }])
  }

  function removerCampo(id) {
    setCampos(prev => prev.filter(c => c.id !== id))
  }

  function handleCampoChange(id, valor) {
    setCampos(prev => prev.map(c => c.id === id ? { ...c, label: valor } : c))
  }

  async function handleCriar(e) {
    e.preventDefault()
    if (!form.titulo) return
    const camposValidos = campos.filter(c => c.label.trim() !== '')
    if (camposValidos.length === 0) return
    setEnviando(true)

    try {
      await addDoc(collection(db, 'olimpiadas'), {
        titulo: form.titulo,
        descricao: form.descricao,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        status: form.status,
        campos: camposValidos.map(c => c.label.trim()),
        autorId: user?.uid,
        autorNome: perfil?.nome,
        criadoEm: serverTimestamp(),
      })
      setForm({ titulo: '', descricao: '', dataInicio: '', dataFim: '', status: 'aberta' })
      setCampos([{ id: Date.now(), label: '' }])
      setMostrarForm(false)
    } catch (err) {
      console.error('Erro ao criar olimpíada:', err)
    } finally {
      setEnviando(false)
    }
  }

  async function handleDeletar(id) {
    try {
      await deleteDoc(doc(db, 'olimpiadas', id))
      setConfirmDelete(null)
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
  }

  return (
    <div>

      {/* Cabeçalho */}
      <div style={styles.cabecalho}>
        <div style={styles.cabecalhoEsquerda}>
          <div style={styles.cabecalhoIcone}>
            <Trophy size={18} color="white" />
          </div>
          <div>
            <h2 style={styles.titulo}>Olimpíadas</h2>
            <p style={styles.subtitulo}>{olimpiadas.length} olimpíada(s) cadastrada(s)</p>
          </div>
        </div>
        {podeGerenciar && (
          <button
            style={mostrarForm ? styles.botaoCancelar : styles.botaoNovo}
            onClick={() => setMostrarForm(prev => !prev)}
          >
            {mostrarForm
              ? <><X size={14} /> Cancelar</>
              : <><Plus size={14} /> Nova Olimpíada</>
            }
          </button>
        )}
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div style={styles.formCard}>
          <div style={styles.formCabecalho}>
            <span style={styles.formTitulo}>Nova Olimpíada</span>
          </div>
          <form onSubmit={handleCriar} style={styles.form}>

            <div style={styles.campo}>
              <label style={styles.label}>Título</label>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ex: Olimpíada de Matemática 2026"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Descrição</label>
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Descreva a olimpíada, regras e objetivos..."
                rows={3}
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div style={styles.gridDois}>
              <div style={styles.campo}>
                <label style={styles.label}>Data de início</label>
                <input
                  type="date"
                  name="dataInicio"
                  value={form.dataInicio}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Data de encerramento</label>
                <input
                  type="date"
                  name="dataFim"
                  value={form.dataFim}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="aberta">Aberta</option>
                <option value="encerrada">Encerrada</option>
              </select>
            </div>

            {/* Campos personalizados */}
            <div style={styles.camposArea}>
              <div style={styles.camposCabecalho}>
                <label style={styles.label}>Campos do formulário de inscrição</label>
                <button
                  type="button"
                  style={styles.botaoAddCampo}
                  onClick={adicionarCampo}
                >
                  <Plus size={12} /> Adicionar campo
                </button>
              </div>
              <div style={styles.camposLista}>
                {campos.map((campo, idx) => (
                  <div key={campo.id} style={styles.campoItem}>
                    <span style={styles.campoNum}>{idx + 1}</span>
                    <input
                      value={campo.label}
                      onChange={e => handleCampoChange(campo.id, e.target.value)}
                      placeholder="Ex: Nome completo, CPF, Turma..."
                      style={{ ...styles.input, flex: 1 }}
                    />
                    {campos.length > 1 && (
                      <button
                        type="button"
                        style={styles.botaoRemoverCampo}
                        onClick={() => removerCampo(campo.id)}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p style={styles.camposDica}>
                Esses campos aparecerão no formulário de inscrição do aluno. Os dados serão exportados em Excel.
              </p>
            </div>

            <button type="submit" disabled={enviando} style={styles.botaoEnviar}>
              {enviando ? 'Criando...' : 'Criar Olimpíada'}
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={styles.vazio}>Carregando olimpíadas...</div>
      ) : olimpiadas.length === 0 ? (
        <div style={styles.vazio}>Nenhuma olimpíada cadastrada ainda.</div>
      ) : (
        <div style={styles.lista}>
          {olimpiadas.map(olimpiada => {
            const statusConfig = STATUS[olimpiada.status] || STATUS.aberta
            const confirmando = confirmDelete === olimpiada.id

            return (
              <div
                key={olimpiada.id}
                style={styles.olimpiadaCard}
                onClick={() => navigate(`/olimpiadas/${olimpiada.id}`)}
              >
                <div style={styles.olimpiadaTopo}>
                  <div style={styles.olimpiadaTopoEsquerda}>
                    <div style={styles.olimpiadaIcone}>
                      <Trophy size={18} color="var(--gold)" />
                    </div>
                    <div>
                      <div style={styles.olimpiadaTitulo}>{olimpiada.titulo}</div>
                      <div style={styles.olimpiadaMeta}>
                        {olimpiada.dataInicio && (
                          <span>
                            {new Date(olimpiada.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                            {olimpiada.dataFim && ` → ${new Date(olimpiada.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={styles.olimpiadaTopoDireita}>
                    <span style={{
                      ...styles.statusBadge,
                      background: statusConfig.bg,
                      color: statusConfig.texto,
                      border: `1px solid ${statusConfig.cor}`,
                    }}>
                      <div style={{
                        width: '6px', height: '6px',
                        borderRadius: '50%',
                        background: statusConfig.cor,
                      }} />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {olimpiada.descricao && (
                  <p style={styles.olimpiadaDesc}>
                    {olimpiada.descricao.length > 100
                      ? olimpiada.descricao.slice(0, 100) + '...'
                      : olimpiada.descricao}
                  </p>
                )}

                <div style={styles.olimpiadaRodape}>
                  <span style={styles.olimpiadaCampos}>
                    {olimpiada.campos?.length || 0} campo(s) no formulário
                  </span>
                  {podeGerenciar && (
                    <div onClick={e => e.stopPropagation()}>
                      {confirmando ? (
                        <div style={styles.confirmArea}>
                          <span style={styles.confirmTexto}>Excluir?</span>
                          <button style={styles.botaoSim} onClick={() => handleDeletar(olimpiada.id)}>Sim</button>
                          <button style={styles.botaoNao} onClick={() => setConfirmDelete(null)}>Não</button>
                        </div>
                      ) : (
                        <button
                          style={styles.botaoDeletar}
                          onClick={() => setConfirmDelete(olimpiada.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
    background: 'linear-gradient(135deg, #7a5c00, #C9A84C)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
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
    background: 'linear-gradient(135deg, #7a5c00, #C9A84C)',
    color: 'white',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
    border: 'none',
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
    background: 'linear-gradient(135deg, #7a5c00, #C9A84C)',
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
  gridDois: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
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
  camposArea: {
    background: 'var(--surface)',
    borderRadius: '8px',
    padding: '14px',
    border: '1px solid var(--border)',
  },
  camposCabecalho: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  botaoAddCampo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'white',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  camposLista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '10px',
  },
  campoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  campoNum: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'var(--gold)',
    color: 'var(--preto)',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  botaoRemoverCampo: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: '#fcebeb',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#e24b4a',
    flexShrink: 0,
  },
  camposDica: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  botaoEnviar: {
    background: 'linear-gradient(135deg, #7a5c00, #C9A84C)',
    color: 'white',
    padding: '11px 24px',
    borderRadius: '8px',
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
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  olimpiadaCard: {
    background: 'white',
    borderRadius: '10px',
    border: '0.5px solid var(--border)',
    padding: '16px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderLeft: '4px solid var(--gold)',
  },
  olimpiadaTopo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  olimpiadaTopoEsquerda: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  olimpiadaIcone: {
    width: '36px',
    height: '36px',
    background: '#fdf6e3',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  olimpiadaTitulo: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '3px',
  },
  olimpiadaMeta: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  olimpiadaTopoDireita: {
    flexShrink: 0,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '10px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '20px',
  },
  olimpiadaDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  olimpiadaRodape: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '0.5px solid var(--border)',
  },
  olimpiadaCampos: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  botaoDeletar: {
    color: '#e24b4a',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    background: '#fcebeb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
  },
  confirmArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  confirmTexto: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  botaoSim: {
    background: '#e24b4a',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
  botaoNao: {
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
    border: '1px solid var(--border)',
  },
}
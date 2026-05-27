import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { podePublicar } from '../utils/roles'
import { useEventos } from '../hooks/useEventos'
import { Calendar, Users, Plus, X, Trash2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

export default function Eventos() {
  const { perfil } = useAuth()
  const { eventos, loading } = useEventos()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [expandido, setExpandido] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [inscricaoEvento, setInscricaoEvento] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [formEvento, setFormEvento] = useState({
    titulo: '',
    descricao: '',
    data: '',
    horario: '',
    local: '',
    vagas: '',
    formLink: '',
  })
  const [formInscricao, setFormInscricao] = useState({
    nome: '',
    turma: '',
    responsavel: '',
  })

  function handleChangeEvento(e) {
    setFormEvento(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleChangeInscricao(e) {
    setFormInscricao(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function toggleExpandido(id) {
    setExpandido(prev => prev === id ? null : id)
    setInscricaoEvento(null)
  }

  async function handleCriarEvento(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await addDoc(collection(db, 'eventos'), {
        ...formEvento,
        vagas: Number(formEvento.vagas) || 0,
        inscritos: [],
        autor: perfil?.nome || 'Desconhecido',
        criadoEm: serverTimestamp(),
      })
      setFormEvento({
        titulo: '', descricao: '', data: '',
        horario: '', local: '', vagas: '', formLink: '',
      })
      setMostrarForm(false)
    } catch (err) {
      console.error('Erro ao criar evento:', err)
    } finally {
      setEnviando(false)
    }
  }

  async function handleInscrever(e, eventoId) {
    e.preventDefault()
    if (!formInscricao.nome || !formInscricao.turma) return
    setEnviando(true)
    try {
      await addDoc(collection(db, 'eventos', eventoId, 'inscritos'), {
        nome: formInscricao.nome,
        turma: formInscricao.turma,
        responsavel: formInscricao.responsavel,
        inscritoEm: serverTimestamp(),
      })
      setFormInscricao({ nome: '', turma: '', responsavel: '' })
      setInscricaoEvento(null)
    } catch (err) {
      console.error('Erro ao inscrever:', err)
    } finally {
      setEnviando(false)
    }
  }

  async function handleDeletar(id) {
    try {
      await deleteDoc(doc(db, 'eventos', id))
      setConfirmDelete(null)
      if (expandido === id) setExpandido(null)
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
            <Calendar size={18} color="white" />
          </div>
          <div>
            <h2 style={styles.titulo}>Eventos</h2>
            <p style={styles.subtitulo}>{eventos.length} evento(s) cadastrado(s)</p>
          </div>
        </div>
        {podePublicar(perfil?.role) && (
          <button
            style={mostrarForm ? styles.botaoCancelar : styles.botaoNovo}
            onClick={() => setMostrarForm(prev => !prev)}
          >
            {mostrarForm
              ? <><X size={14} /> Cancelar</>
              : <><Plus size={14} /> Novo Evento</>
            }
          </button>
        )}
      </div>

      {/* Formulário de criação */}
      {mostrarForm && (
        <div style={styles.formCard}>
          <div style={styles.formCabecalho}>
            <span style={styles.formTitulo}>Criar Novo Evento</span>
          </div>
          <form onSubmit={handleCriarEvento} style={styles.form}>
            <div style={styles.campo}>
              <label style={styles.label}>Título do evento</label>
              <input
                name="titulo"
                value={formEvento.titulo}
                onChange={handleChangeEvento}
                placeholder="Ex: Desfile de 7 de Setembro"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Descrição</label>
              <textarea
                name="descricao"
                value={formEvento.descricao}
                onChange={handleChangeEvento}
                placeholder="Detalhes sobre o evento..."
                rows={3}
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>
            <div style={styles.gridDois}>
              <div style={styles.campo}>
                <label style={styles.label}>Data</label>
                <input
                  type="date"
                  name="data"
                  value={formEvento.data}
                  onChange={handleChangeEvento}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Horário</label>
                <input
                  type="time"
                  name="horario"
                  value={formEvento.horario}
                  onChange={handleChangeEvento}
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.gridDois}>
              <div style={styles.campo}>
                <label style={styles.label}>Local</label>
                <input
                  name="local"
                  value={formEvento.local}
                  onChange={handleChangeEvento}
                  placeholder="Ex: Pátio principal"
                  style={styles.input}
                />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Vagas (0 = ilimitado)</label>
                <input
                  type="number"
                  name="vagas"
                  value={formEvento.vagas}
                  onChange={handleChangeEvento}
                  placeholder="0"
                  min="0"
                  style={styles.input}
                />
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Link do Google Forms (opcional)</label>
              <input
                name="formLink"
                value={formEvento.formLink}
                onChange={handleChangeEvento}
                placeholder="https://forms.google.com/..."
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={enviando} style={styles.botaoEnviar}>
              {enviando ? 'Criando...' : 'Criar Evento'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de eventos */}
      {loading ? (
        <div style={styles.vazio}>Carregando eventos...</div>
      ) : eventos.length === 0 ? (
        <div style={styles.vazio}>Nenhum evento cadastrado ainda.</div>
      ) : (
        <div style={styles.lista}>
          {eventos.map(evento => {
            const estaExpandido = expandido === evento.id
            const inscricaoAberta = inscricaoEvento === evento.id
            const confirmando = confirmDelete === evento.id

            // Evita bug de fuso horário definindo meio-dia (T12:00:00)
            const dataObjeto = evento.data ? new Date(evento.data + 'T12:00:00') : null

            const dataFormatada = dataObjeto
              ? dataObjeto.toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })
              : 'Data não definida'

            return (
              <div key={evento.id} style={styles.eventoCard}>

                {/* Topo */}
                <div style={styles.eventoTopo} onClick={() => toggleExpandido(evento.id)}>
                  <div style={styles.eventoTopoEsquerda}>
                    <div style={styles.eventoData}>
                      <span style={styles.eventoDataDia}>
                        {dataObjeto ? dataObjeto.getDate() : '--'}
                      </span>
                      <span style={styles.eventoDataMes}>
                        {dataObjeto
                          ? dataObjeto.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
                          : '---'}
                      </span>
                    </div>
                    <div style={styles.eventoInfo}>
                      <span style={styles.eventoTitulo}>{evento.titulo}</span>
                      <span style={styles.eventoMeta}>
                        {evento.horario && `${evento.horario} · `}
                        {evento.local || 'Local não definido'}
                        {evento.vagas > 0 && ` · ${evento.vagas} vagas`}
                      </span>
                    </div>
                  </div>
                  <div style={styles.eventoTopoDireita}>
                    {estaExpandido
                      ? <ChevronUp size={16} color="var(--text-muted)" />
                      : <ChevronDown size={16} color="var(--text-muted)" />
                    }
                  </div>
                </div>

                {/* Expandido */}
                <div style={{
                  ...styles.eventoExpandivel,
                  maxHeight: estaExpandido ? '800px' : '0px',
                  opacity: estaExpandido ? 1 : 0,
                }}>
                  <div style={styles.eventoExpandidoInner}>

                    {evento.descricao && (
                      <p style={styles.eventoDescricao}>{evento.descricao}</p>
                    )}

                    <div style={styles.eventoDetalhes}>
                      <span style={styles.eventoDetalhe}>📅 {dataFormatada}</span>
                      {evento.horario && <span style={styles.eventoDetalhe}>🕐 {evento.horario}</span>}
                      {evento.local && <span style={styles.eventoDetalhe}>📍 {evento.local}</span>}
                      {evento.vagas > 0 && (
                        <span style={styles.eventoDetalhe}>
                          <Users size={13} /> {evento.vagas} vagas disponíveis
                        </span>
                      )}
                    </div>

                    {/* Botões de ação */}
                    <div style={styles.eventoAcoes}>

                      {/* Link externo Google Forms (CORRIGIDO AQUI) */}
                      {evento.formLink ? (
                        <a
                          href={evento.formLink}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.botaoForms}
                        >
                          <ExternalLink size={14} />
                          Inscrever pelo Google Forms
                        </a>
                      ) : (
                        <button
                          style={styles.botaoInscrever}
                          onClick={() => setInscricaoEvento(
                            inscricaoAberta ? null : evento.id
                          )}
                        >
                          <Users size={14} />
                          {inscricaoAberta ? 'Cancelar inscrição' : 'Inscrever-se'}
                        </button>
                      )}

                      {/* Deletar */}
                      {podePublicar(perfil?.role) && (
                        confirmando ? (
                          <div style={styles.confirmArea}>
                            <span style={styles.confirmTexto}>Confirmar exclusão?</span>
                            <button style={styles.botaoSim} onClick={() => handleDeletar(evento.id)}>Sim</button>
                            <button style={styles.botaoNao} onClick={() => setConfirmDelete(null)}>Não</button>
                          </div>
                        ) : (
                          <button
                            style={styles.botaoDeletar}
                            onClick={() => setConfirmDelete(evento.id)}
                          >
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        )
                      )}
                    </div>

                    {/* Formulário de inscrição interna */}
                    {inscricaoAberta && !evento.formLink && (
                      <form
                        onSubmit={(e) => handleInscrever(e, evento.id)}
                        style={styles.inscricaoForm}
                      >
                        <div style={styles.inscricaoCabecalho}>
                          <span style={styles.inscricaoTitulo}>Inscrição no evento</span>
                        </div>
                        <div style={styles.inscricaoCorpo}>
                          <div style={styles.campo}>
                            <label style={styles.label}>Nome completo do aluno</label>
                            <input
                              name="nome"
                              value={formInscricao.nome}
                              onChange={handleChangeInscricao}
                              placeholder="Nome do aluno"
                              required
                              style={styles.input}
                            />
                          </div>
                          <div style={styles.gridDois}>
                            <div style={styles.campo}>
                              <label style={styles.label}>Turma</label>
                              <input
                                name="turma"
                                value={formInscricao.turma}
                                onChange={handleChangeInscricao}
                                placeholder="Ex: 9º A"
                                required
                                style={styles.input}
                              />
                            </div>
                            <div style={styles.campo}>
                              <label style={styles.label}>Nome do responsável</label>
                              <input
                                name="responsavel"
                                value={formInscricao.responsavel}
                                onChange={handleChangeInscricao}
                                placeholder="Nome do responsável"
                                style={styles.input}
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={enviando}
                            style={styles.botaoEnviar}
                          >
                            {enviando ? 'Inscrevendo...' : 'Confirmar Inscrição'}
                          </button>
                        </div>
                      </form>
                    )}

                  </div>
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
    background: 'var(--gold)',
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
    background: 'var(--gold)',
    color: 'var(--preto)',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
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
    background: 'var(--gold)',
    padding: '12px 18px',
  },
  formTitulo: {
    color: 'var(--preto)',
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
  eventoCard: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderLeft: '4px solid var(--gold)',
  },
  eventoTopo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  eventoTopoEsquerda: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flex: 1,
  },
  eventoData: {
    width: '44px',
    height: '44px',
    background: 'var(--gold)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eventoDataDia: {
    color: 'var(--preto)',
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: 1,
  },
  eventoDataMes: {
    color: 'var(--preto)',
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  eventoInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  eventoTitulo: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  eventoMeta: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  eventoTopoDireita: {
    flexShrink: 0,
    marginLeft: '10px',
  },
  eventoExpandivel: {
    overflow: 'hidden',
    transition: 'max-height 0.35s ease, opacity 0.3s ease',
  },
  eventoExpandidoInner: {
    padding: '0 16px 16px',
    borderTop: '0.5px solid var(--border)',
    paddingTop: '14px',
  },
  eventoDescricao: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    marginBottom: '14px',
  },
  eventoDetalhes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },
  eventoDetalhe: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'var(--surface)',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  eventoAcoes: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  botaoInscrever: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--vinho)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  botaoForms: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#1a73e8',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none', // Remove o sublinhado padrão de links
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
    cursor: 'pointer',
    border: '1px solid var(--border)',
  },
  inscricaoForm: {
    background: 'var(--surface)',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border)',
    marginTop: '4px',
  },
  inscricaoCabecalho: {
    background: 'var(--vinho)',
    padding: '10px 14px',
  },
  inscricaoTitulo: {
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
  },
  inscricaoCorpo: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
}
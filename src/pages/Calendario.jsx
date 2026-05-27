import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { podePublicar } from '../utils/roles'
import { useCalendario, categorias, feriados2026 } from '../hooks/useCalendario'
import { ChevronLeft, ChevronRight, X, Plus, Trash2 } from 'lucide-react'

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default function Calendario() {
  const { perfil } = useAuth()
  const { loading, getItensDoDia, getDatasComItens } = useCalendario()
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [diaSelecionado, setDiaSelecionado] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({
    nome: '',
    tipo: 'evento',
    data: '',
    descricao: '',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function mesAnterior() {
    if (mes === 0) { setMes(11); setAno(a => a - 1) }
    else setMes(m => m - 1)
    setDiaSelecionado(null)
  }

  function proximoMes() {
    if (mes === 11) { setMes(0); setAno(a => a + 1) }
    else setMes(m => m + 1)
    setDiaSelecionado(null)
  }

  function handleClicarDia(dataStr) {
    setDiaSelecionado(prev => prev === dataStr ? null : dataStr)
    setMostrarForm(false)
  }

  async function handleSalvar(e) {
    e.preventDefault()
    if (!form.nome || !form.data) return
    setEnviando(true)
    try {
      await addDoc(collection(db, 'calendario'), {
        nome: form.nome,
        tipo: form.tipo,
        data: form.data,
        descricao: form.descricao,
        autor: perfil?.nome || 'Desconhecido',
        criadoEm: serverTimestamp(),
      })
      setForm({ nome: '', tipo: 'evento', data: diaSelecionado || '', descricao: '' })
      setMostrarForm(false)
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setEnviando(false)
    }
  }

  async function handleDeletar(id) {
    try {
      await deleteDoc(doc(db, 'calendario', id))
      setConfirmDelete(null)
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
  }

  // Monta os dias do mês
  function getDiasMes() {
    const primeiroDia = new Date(ano, mes, 1).getDay()
    const totalDias = new Date(ano, mes + 1, 0).getDate()
    const dias = []

    for (let i = 0; i < primeiroDia; i++) {
      dias.push(null)
    }
    for (let d = 1; d <= totalDias; d++) {
      dias.push(d)
    }
    return dias
  }

  function formatarData(dia) {
    const m = String(mes + 1).padStart(2, '0')
    const d = String(dia).padStart(2, '0')
    return `${ano}-${m}-${d}`
  }

  const datasComItens = getDatasComItens()
  const dias = getDiasMes()
  const itensDiaSelecionado = diaSelecionado ? getItensDoDia(diaSelecionado) : []

  // Pega a cor mais prioritária do dia para o destaque
  function getCorDia(dataStr) {
    const itens = getItensDoDia(dataStr)
    if (itens.length === 0) return null
    const prioridade = ['federal', 'estadual', 'militar', 'prova', 'reuniao', 'evento']
    for (const tipo of prioridade) {
      if (itens.some(i => i.tipo === tipo)) return categorias[tipo]
    }
    return null
  }

  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`

  return (
    <div>

      {/* Cabeçalho */}
      <div style={styles.cabecalho}>
        <div style={styles.cabecalhoEsquerda}>
          <div style={styles.cabecalhoIcone}>
            <span style={{ fontSize: '18px' }}>📅</span>
          </div>
          <div>
            <h2 style={styles.titulo}>Calendário Escolar</h2>
            <p style={styles.subtitulo}>Feriados, eventos e atividades — {ano}</p>
          </div>
        </div>
        {podePublicar(perfil?.role) && (
          <button
            style={styles.botaoNovo}
            onClick={() => {
              setMostrarForm(prev => !prev)
              if (!mostrarForm && diaSelecionado) {
                setForm(f => ({ ...f, data: diaSelecionado }))
              }
            }}
          >
            {mostrarForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Adicionar</>}
          </button>
        )}
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div style={styles.formCard}>
          <div style={styles.formCabecalho}>
            <span style={styles.formTitulo}>Adicionar ao Calendário</span>
          </div>
          <form onSubmit={handleSalvar} style={styles.form}>
            <div style={styles.gridDois}>
              <div style={styles.campo}>
                <label style={styles.label}>Data</label>
                <input
                  type="date"
                  name="data"
                  value={form.data}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Categoria</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="evento">Evento Escolar</option>
                  <option value="prova">Prova / Avaliação</option>
                  <option value="reuniao">Reunião</option>
                  <option value="militar">Atividade Militar</option>
                </select>
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Nome</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Prova de Matemática — 9º A"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Descrição (opcional)</label>
              <input
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Detalhes adicionais..."
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={enviando} style={styles.botaoEnviar}>
              {enviando ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </div>
      )}

      {/* Legenda */}
      <div style={styles.legenda}>
        {Object.entries(categorias).map(([key, val]) => (
          <div key={key} style={styles.legendaItem}>
            <div style={{ ...styles.legendaDot, background: val.cor }} />
            <span style={styles.legendaTexto}>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Calendário */}
      <div style={styles.calCard}>

        {/* Navegação do mês */}
        <div style={styles.calNav}>
          <button style={styles.calNavBtn} onClick={mesAnterior}>
            <ChevronLeft size={18} />
          </button>
          <span style={styles.calMes}>{MESES[mes]} {ano}</span>
          <button style={styles.calNavBtn} onClick={proximoMes}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dias da semana */}
        <div style={styles.calGrid}>
          {DIAS_SEMANA.map(d => (
            <div key={d} style={styles.calDiaSemana}>{d}</div>
          ))}

          {/* Dias do mês */}
          {dias.map((dia, idx) => {
            if (!dia) return <div key={`vazio-${idx}`} />

            const dataStr = formatarData(dia)
            const corDia = getCorDia(dataStr)
            const isHoje = dataStr === hojeStr
            const isSelecionado = dataStr === diaSelecionado
            const temItens = datasComItens.has(dataStr)

            return (
              <div
                key={dataStr}
                onClick={() => handleClicarDia(dataStr)}
                style={{
                  ...styles.calDia,
                  ...(isHoje ? styles.calDiaHoje : {}),
                  ...(isSelecionado ? styles.calDiaSelecionado : {}),
                  ...(corDia && !isHoje && !isSelecionado ? {
                    background: corDia.bg,
                    color: corDia.texto,
                  } : {}),
                }}
              >
                <span style={styles.calDiaNum}>{dia}</span>
                {temItens && (
                  <div style={styles.calPontosContainer}>
                    {getItensDoDia(dataStr).slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.calPonto,
                          background: categorias[item.tipo]?.cor || '#8a9bb0',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Painel do dia selecionado */}
      {diaSelecionado && (
        <div style={styles.painelDia}>
          <div style={styles.painelCabecalho}>
            <span style={styles.painelTitulo}>
              {new Date(diaSelecionado + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
            <button style={styles.painelFechar} onClick={() => setDiaSelecionado(null)}>
              <X size={16} color="var(--text-secondary)" />
            </button>
          </div>

          {itensDiaSelecionado.length === 0 ? (
            <div style={styles.painelVazio}>
              Nenhum evento neste dia.
            </div>
          ) : (
            <div style={styles.painelLista}>
              {itensDiaSelecionado.map((item, idx) => {
                const config = categorias[item.tipo] || categorias.evento
                const isFeriado = item.tipo === 'federal' || item.tipo === 'estadual'

                return (
                  <div key={item.id || idx} style={{
                    ...styles.painelItem,
                    borderLeft: `4px solid ${config.cor}`,
                  }}>
                    <div style={styles.painelItemTopo}>
                      <span style={{
                        ...styles.painelBadge,
                        background: config.bg,
                        color: config.texto,
                      }}>
                        {config.label}
                      </span>
                      {!isFeriado && podePublicar(perfil?.role) && (
                        confirmDelete === item.id ? (
                          <div style={styles.confirmArea}>
                            <span style={styles.confirmTexto}>Excluir?</span>
                            <button style={styles.botaoSim} onClick={() => handleDeletar(item.id)}>Sim</button>
                            <button style={styles.botaoNao} onClick={() => setConfirmDelete(null)}>Não</button>
                          </div>
                        ) : (
                          <button
                            style={styles.botaoDeletar}
                            onClick={() => setConfirmDelete(item.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )
                      )}
                    </div>
                    <div style={styles.painelItemNome}>{item.nome}</div>
                    {item.descricao && (
                      <div style={styles.painelItemDesc}>{item.descricao}</div>
                    )}
                    {item.autor && (
                      <div style={styles.painelItemAutor}>Adicionado por {item.autor}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Botão rápido para adicionar neste dia */}
          {podePublicar(perfil?.role) && !mostrarForm && (
            <button
              style={styles.botaoAdicionarDia}
              onClick={() => {
                setForm(f => ({ ...f, data: diaSelecionado }))
                setMostrarForm(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <Plus size={14} />
              Adicionar neste dia
            </button>
          )}
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
    marginBottom: '16px',
  },
  cabecalhoEsquerda: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cabecalhoIcone: {
    width: '40px',
    height: '40px',
    background: 'var(--azul-light)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  formCard: {
    background: 'white',
    borderRadius: '10px',
    border: '0.5px solid var(--border)',
    marginBottom: '16px',
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
  legenda: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '14px',
  },
  legendaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendaDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendaTexto: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  calCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: '16px',
  },
  calNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  calNavBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  calMes: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  calGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  calDiaSemana: {
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    padding: '6px 0',
    letterSpacing: '0.5px',
  },
  calDia: {
    borderRadius: '8px',
    padding: '6px 4px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    minHeight: '48px',
    transition: 'all 0.15s',
    border: '1px solid transparent',
  },
  calDiaHoje: {
    background: 'var(--vinho)',
    color: 'white',
  },
  calDiaSelecionado: {
    border: '1px solid var(--vinho)',
    background: '#f9f0f0',
  },
  calDiaNum: {
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: 1,
  },
  calPontosContainer: {
    display: 'flex',
    gap: '2px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calPonto: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
  },
  painelDia: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: '16px',
  },
  painelCabecalho: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '0.5px solid var(--border)',
    background: 'var(--surface)',
  },
  painelTitulo: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    textTransform: 'capitalize',
  },
  painelFechar: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  painelVazio: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    padding: '24px 0',
  },
  painelLista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '14px 16px',
  },
  painelItem: {
    background: 'var(--surface)',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  painelItemTopo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  painelBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '20px',
    letterSpacing: '0.5px',
  },
  painelItemNome: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '3px',
  },
  painelItemDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  painelItemAutor: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  botaoAdicionarDia: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--vinho)',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '12px 16px',
    borderTop: '0.5px solid var(--border)',
    width: '100%',
    background: 'transparent',
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
import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { useAvisos } from '../hooks/useAvisos'
import { Shield, FileText, Bell } from 'lucide-react'

export default function AreaMilitar() {
  const { perfil } = useAuth()
  const { avisos } = useAvisos(perfil?.role)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [form, setForm] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'militar',
    publico: 'todos',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handlePublicar(e) {
    e.preventDefault()
    if (!form.titulo || !form.conteudo) return
    setEnviando(true)
    setSucesso(false)

    try {
      await addDoc(collection(db, 'comunicados'), {
        titulo: form.titulo,
        conteudo: form.conteudo,
        tipo: form.tipo,
        publico: form.publico,
        autor: perfil?.nome || 'Militar',
        autorRole: perfil?.role || 'militar',
        criadoEm: serverTimestamp(),
      })
      setForm({ titulo: '', conteudo: '', tipo: 'militar', publico: 'todos' })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      console.error('Erro ao publicar:', err)
    } finally {
      setEnviando(false)
    }
  }

  const comunicadosMilitares = avisos.filter(a => a.autorRole === 'militar' || a.tipo === 'militar')
  const totalComunicados = avisos.length
  const totalUrgentes = avisos.filter(a => a.tipo === 'urgente').length
  const totalMilitares = comunicadosMilitares.length

  return (
    <div>

      <div style={styles.cabecalho}>
        <div style={styles.cabecalhoEsquerda}>
          <div style={styles.cabecalhoIcone}>
            <Shield size={20} color="var(--gold)" />
          </div>
          <div>
            <h2 style={styles.titulo}>Área Militar</h2>
            <p style={styles.subtitulo}>Acesso restrito — {perfil?.nome}</p>
          </div>
        </div>
        <div style={styles.badgeRestrito}>Acesso Restrito</div>
      </div>

      <div style={styles.gridStats}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total de Comunicados</span>
          <span style={styles.statValor}>{totalComunicados}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Urgentes</span>
          <span style={{ ...styles.statValor, color: 'var(--danger)' }}>{totalUrgentes}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Militares</span>
          <span style={{ ...styles.statValor, color: 'var(--gold)' }}>{totalMilitares}</span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardCabecalho}>
          <Bell size={16} color="var(--vinho)" />
          <h3 style={styles.cardTitulo}>Publicar Comunicado Oficial</h3>
        </div>

        {sucesso && (
          <div style={styles.sucessoMsg}>
            Comunicado publicado com sucesso!
          </div>
        )}

        <form onSubmit={handlePublicar} style={styles.form}>
          <div style={styles.campo}>
            <label style={styles.label}>Título</label>
            <input
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Título do comunicado oficial"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.gridDois}>
            <div style={styles.campo}>
              <label style={styles.label}>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} style={styles.input}>
                <option value="militar">Militar</option>
                <option value="urgente">Urgente</option>
                <option value="evento">Evento</option>
                <option value="geral">Geral</option>
              </select>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Público-alvo</label>
              <select name="publico" value={form.publico} onChange={handleChange} style={styles.input}>
                <option value="todos">Todos</option>
                <option value="aluno">Alunos</option>
                <option value="responsavel">Responsáveis</option>
                <option value="professor">Professores</option>
                <option value="militar">Militares</option>
              </select>
            </div>
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Conteúdo</label>
            <textarea
              name="conteudo"
              value={form.conteudo}
              onChange={handleChange}
              placeholder="Escreva o comunicado oficial aqui..."
              required
              rows={5}
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>
          <button type="submit" disabled={enviando} style={styles.botaoPublicar}>
            {enviando ? 'Publicando...' : 'Publicar Comunicado'}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={styles.cardCabecalho}>
          <FileText size={16} color="var(--vinho)" />
          <h3 style={styles.cardTitulo}>Histórico Militar</h3>
        </div>
        {comunicadosMilitares.length === 0 ? (
          <div style={styles.vazio}>Nenhum comunicado militar publicado ainda.</div>
        ) : (
          <div style={styles.lista}>
            {comunicadosMilitares.map(aviso => (
              <div key={aviso.id} style={styles.historicoItem}>
                <div style={styles.historicoTopo}>
                  <span style={styles.historicoBadge}>{aviso.tipo.toUpperCase()}</span>
                  <span style={styles.historicoData}>
                    {aviso.criadoEm?.toDate().toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <div style={styles.historicoTitulo}>{aviso.titulo}</div>
                <div style={styles.historicoAutor}>
                  Publicado por {aviso.autor}
                  {aviso.publico && aviso.publico !== 'todos' ? ` · Para: ${aviso.publico}` : ' · Para: todos'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
  cabecalhoEsquerda: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cabecalhoIcone: {
    width: '40px',
    height: '40px',
    background: 'var(--vinho)',
    borderRadius: 'var(--radius-md)',
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
  badgeRestrito: {
    background: '#f9f0f0',
    color: 'var(--vinho)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(107,26,26,0.2)',
    letterSpacing: '0.5px',
  },
  gridStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  statCard: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '0.5px solid var(--border)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValor: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'var(--vinho)',
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '0.5px solid var(--border)',
    padding: '20px',
    marginBottom: '16px',
  },
  cardCabecalho: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '0.5px solid var(--border)',
  },
  cardTitulo: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  sucessoMsg: {
    background: 'var(--success-bg)',
    color: 'var(--success)',
    fontSize: '13px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '16px',
  },
  form: {
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
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    background: 'var(--surface)',
    outline: 'none',
    width: '100%',
  },
  botaoPublicar: {
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
    padding: '24px 0',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  historicoItem: {
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface)',
    borderLeft: '3px solid var(--vinho)',
  },
  historicoTopo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  historicoBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '20px',
    background: '#f9f0f0',
    color: 'var(--vinho)',
    letterSpacing: '0.5px',
  },
  historicoData: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  historicoTitulo: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  historicoAutor: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
}
import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { useClubes, TIPOS_CLUBE, CATEGORIAS_CLUBE } from '../hooks/useClubes'
import { podeCriarClube } from '../utils/roles'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, X, Search } from 'lucide-react'

export default function Clubes() {
  const { perfil, user } = useAuth()
  const { clubes, loading } = useClubes()
  const navigate = useNavigate()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    categoria: 'Outros',
    tipo: 'aberto',
    local: '',
    horario: '',
    vagas: '',
    responsavelNome: '',
    responsavelId: '',
    bannerUrl: '',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleCriar(e) {
    e.preventDefault()
    if (!form.nome) return
    setEnviando(true)

    try {
      await addDoc(collection(db, 'clubes'), {
        nome: form.nome,
        descricao: form.descricao,
        categoria: form.categoria,
        tipo: form.tipo,
        local: form.local,
        horario: form.horario,
        vagas: Number(form.vagas) || 0,
        responsavelNome: form.responsavelNome || perfil?.nome,
        responsavelId: form.responsavelId || user?.uid,
        bannerUrl: form.bannerUrl,
        autorId: user?.uid,
        autorNome: perfil?.nome,
        totalMembros: 0,
        criadoEm: serverTimestamp(),
      })
      setForm({
        nome: '', descricao: '', categoria: 'Outros',
        tipo: 'aberto', local: '', horario: '',
        vagas: '', responsavelNome: '', responsavelId: '', bannerUrl: '',
      })
      setMostrarForm(false)
    } catch (err) {
      console.error('Erro ao criar clube:', err)
    } finally {
      setEnviando(false)
    }
  }

  const clubesFiltrados = clubes.filter(c => {
    const matchBusca = c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      c.descricao?.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = filtroCategoria === 'todos' || c.categoria === filtroCategoria
    const matchTipo = filtroTipo === 'todos' || c.tipo === filtroTipo
    return matchBusca && matchCategoria && matchTipo
  })

  return (
    <div>

      <div style={styles.cabecalho}>
        <div style={styles.cabecalhoEsquerda}>
          <div style={styles.cabecalhoIcone}>
            <Users size={18} color="white" />
          </div>
          <div>
            <h2 style={styles.titulo}>Clubes e Projetos</h2>
            <p style={styles.subtitulo}>{clubes.length} clube(s) ativo(s)</p>
          </div>
        </div>
        {podeCriarClube(perfil?.role) && (
          <button
            style={mostrarForm ? styles.botaoCancelar : styles.botaoNovo}
            onClick={() => setMostrarForm(prev => !prev)}
          >
            {mostrarForm
              ? <><X size={14} /> Cancelar</>
              : <><Plus size={14} /> Novo Clube</>
            }
          </button>
        )}
      </div>

      {mostrarForm && (
        <div style={styles.formCard}>
          <div style={styles.formCabecalho}>
            <span style={styles.formTitulo}>Criar Novo Clube</span>
          </div>
          <form onSubmit={handleCriar} style={styles.form}>
            <div style={styles.gridDois}>
              <div style={styles.campo}>
                <label style={styles.label}>Nome do clube</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Ex: Clube de Xadrez"
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
                  {CATEGORIAS_CLUBE.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Descrição</label>
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Descreva o clube, objetivos e atividades..."
                rows={3}
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div style={styles.gridTres}>
              <div style={styles.campo}>
                <label style={styles.label}>Tipo</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="aberto">Aberto</option>
                  <option value="seletivo">Seletivo</option>
                  <option value="fechado">Fechado</option>
                </select>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Vagas (0 = ilimitado)</label>
                <input
                  type="number"
                  name="vagas"
                  value={form.vagas}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  style={styles.input}
                />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Local</label>
                <input
                  name="local"
                  value={form.local}
                  onChange={handleChange}
                  placeholder="Ex: Sala 12"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.gridDois}>
              <div style={styles.campo}>
                <label style={styles.label}>Horário</label>
                <input
                  name="horario"
                  value={form.horario}
                  onChange={handleChange}
                  placeholder="Ex: Terças e Quintas, 14h"
                  style={styles.input}
                />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Responsável (nome)</label>
                <input
                  name="responsavelNome"
                  value={form.responsavelNome}
                  onChange={handleChange}
                  placeholder="Deixe vazio para usar seu nome"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Link do banner (opcional)</label>
              <input
                name="bannerUrl"
                value={form.bannerUrl}
                onChange={handleChange}
                placeholder="https://... (link de imagem do Google Drive)"
                style={styles.input}
              />
            </div>

            <div style={{
              ...styles.dica,
              borderLeft: `3px solid ${TIPOS_CLUBE[form.tipo]?.cor}`,
              background: TIPOS_CLUBE[form.tipo]?.bg,
              color: TIPOS_CLUBE[form.tipo]?.texto,
            }}>
              <strong>{TIPOS_CLUBE[form.tipo]?.label}:</strong> {TIPOS_CLUBE[form.tipo]?.descricao}
            </div>

            <button type="submit" disabled={enviando} style={styles.botaoEnviar}>
              {enviando ? 'Criando...' : 'Criar Clube'}
            </button>
          </form>
        </div>
      )}

      <div style={styles.filtrosArea}>
        <div style={styles.buscaBox}>
          <Search size={14} color="var(--text-muted)" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar clube..."
            style={styles.buscaInput}
          />
        </div>
        <div style={styles.filtros}>
          {['todos', 'aberto', 'seletivo', 'fechado'].map(t => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              style={{
                ...styles.filtroBotao,
                ...(filtroTipo === t ? styles.filtroAtivo : {})
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.categorias}>
        <button
          onClick={() => setFiltroCategoria('todos')}
          style={{
            ...styles.categoriaBotao,
            ...(filtroCategoria === 'todos' ? styles.categoriaAtiva : {})
          }}
        >
          Todos
        </button>
        {CATEGORIAS_CLUBE.map(c => (
          <button
            key={c}
            onClick={() => setFiltroCategoria(c)}
            style={{
              ...styles.categoriaBotao,
              ...(filtroCategoria === c ? styles.categoriaAtiva : {})
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.vazio}>Carregando clubes...</div>
      ) : clubesFiltrados.length === 0 ? (
        <div style={styles.vazio}>Nenhum clube encontrado.</div>
      ) : (
        <div style={styles.grid}>
          {clubesFiltrados.map(clube => {
            const tipoConfig = TIPOS_CLUBE[clube.tipo] || TIPOS_CLUBE.aberto
            return (
              <div
                key={clube.id}
                style={styles.clubeCard}
                onClick={() => navigate(`/clubes/${clube.id}`)}
              >
                <div style={{
                  ...styles.clubeBanner,
                  background: clube.bannerUrl
                    ? `url(${clube.bannerUrl}) center/cover`
                    : 'linear-gradient(135deg, #1a3a2a, #1a2e45)',
                }}>
                  <div style={{
                    ...styles.tipoBadge,
                    background: tipoConfig.bg,
                    color: tipoConfig.texto,
                    border: `1px solid ${tipoConfig.cor}`,
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: tipoConfig.cor,
                      flexShrink: 0,
                    }} />
                    {tipoConfig.label}
                  </div>
                  <div style={styles.categoriaBadge}>
                    {clube.categoria}
                  </div>
                </div>
                <div style={styles.clubeInfo}>
                  <div style={styles.clubeNome}>{clube.nome}</div>
                  {clube.descricao && (
                    <div style={styles.clubeDesc}>
                      {clube.descricao.length > 80
                        ? clube.descricao.slice(0, 80) + '...'
                        : clube.descricao}
                    </div>
                  )}
                  <div style={styles.clubeMeta}>
                    {clube.horario && (
                      <span style={styles.clubeMetaItem}>🕐 {clube.horario}</span>
                    )}
                    {clube.local && (
                      <span style={styles.clubeMetaItem}>📍 {clube.local}</span>
                    )}
                  </div>
                  <div style={styles.clubeRodape}>
                    <div style={styles.clubeResponsavel}>
                      <div style={styles.clubeAvatar}>
                        {clube.responsavelNome?.charAt(0).toUpperCase()}
                      </div>
                      <span style={styles.clubeResponsavelNome}>
                        {clube.responsavelNome}
                      </span>
                    </div>
                    <div style={styles.clubeMembros}>
                      <Users size={12} color="var(--text-muted)" />
                      <span style={styles.clubeMembrosNum}>
                        {clube.totalMembros || 0}
                        {clube.vagas > 0 && ` / ${clube.vagas}`}
                      </span>
                    </div>
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
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(26,58,107,0.3)',
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
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
    color: 'white',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(26,58,107,0.3)',
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
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
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
  gridTres: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
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
  dica: {
    fontSize: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    lineHeight: '1.6',
  },
  botaoEnviar: {
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
    color: 'white',
    padding: '11px 24px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    border: 'none',
  },
  filtrosArea: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  buscaBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'white',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px 12px',
    flex: 1,
    minWidth: '200px',
  },
  buscaInput: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    color: 'var(--text-primary)',
    background: 'transparent',
    width: '100%',
  },
  filtros: {
    display: 'flex',
    gap: '6px',
  },
  filtroBotao: {
    padding: '7px 14px',
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
  categorias: {
    display: 'flex',
    gap: '6px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  categoriaBotao: {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid var(--border)',
    background: 'white',
    color: 'var(--text-secondary)',
  },
  categoriaAtiva: {
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
    color: 'white',
    border: 'none',
  },
  vazio: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    padding: '40px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  clubeCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '0.5px solid var(--border)',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  clubeBanner: {
    height: '120px',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '10px',
  },
  tipoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '10px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '20px',
    letterSpacing: '0.3px',
  },
  categoriaBadge: {
    fontSize: '10px',
    fontWeight: '500',
    padding: '4px 8px',
    borderRadius: '20px',
    background: 'rgba(0,0,0,0.4)',
    color: 'white',
    backdropFilter: 'blur(4px)',
  },
  clubeInfo: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  clubeNome: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  clubeDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  clubeMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  clubeMetaItem: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  clubeRodape: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '0.5px solid var(--border)',
    marginTop: '4px',
  },
  clubeResponsavel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  clubeAvatar: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
    color: 'white',
    fontSize: '10px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubeResponsavelNome: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  clubeMembros: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  clubeMembrosNum: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
}
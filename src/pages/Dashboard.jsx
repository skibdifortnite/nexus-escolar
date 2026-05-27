import { useAuth } from '../context/AuthContext'
import { useAvisos } from '../hooks/useAvisos'
import { useNavigate } from 'react-router-dom'
import { Bell, FileText, AlertTriangle, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const tipoEstilo = {
  geral:    { cor: '#8a9bb0', bg: '#f2f2f2', texto: '#444' },
  urgente:  { cor: '#e24b4a', bg: '#fcebeb', texto: '#a32d2d' },
  evento:   { cor: '#C9A84C', bg: '#fdf6e3', texto: '#7a5c00' },
  militar:  { cor: '#6B1A1A', bg: '#f9f0f0', texto: '#6B1A1A' },
  documento:{ cor: '#1a3a6b', bg: '#e6edf8', texto: '#1a3a6b' },
}

export default function Dashboard() {
  const { perfil } = useAuth()
  const { avisos, loading } = useAvisos(perfil?.role)
  const navigate = useNavigate()
  const [expandido, setExpandido] = useState(null)

  const recentes = avisos.slice(0, 4)
  const totalUrgentes = avisos.filter(a => a.tipo === 'urgente').length
  const totalEventos = avisos.filter(a => a.tipo === 'evento').length

  function toggleExpandido(id) {
    setExpandido(prev => prev === id ? null : id)
  }

  return (
    <div>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroGlass} />
        <div style={styles.heroCirculo1} />
        <div style={styles.heroCirculo2} />
        <div style={styles.heroConteudo}>
          <div style={styles.heroEsquerda}>
            <span style={styles.heroLabel}>Painel Institucional</span>
            <h2 style={styles.heroTitulo}>
              Olá, {perfil?.nome?.split(' ')[0] || 'Usuário'} 👋
            </h2>
            <p style={styles.heroSub}>
              Colégio da Polícia Militar de Alagoas — Tiradentes
            </p>
          </div>
          <div style={styles.heroBrasao}>
            <span style={styles.heroBrasaoTexto}>CPM</span>
            <span style={styles.heroBrasaoSub}>AL</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.gridStats}>
        <div style={{ ...styles.statCard, borderTop: '3px solid #2e7d5e' }}>
          <div style={{ ...styles.statIcone, background: '#e6f4ef' }}>
            <Bell size={18} color="#2e7d5e" />
          </div>
          <span style={{ ...styles.statValor, color: '#2e7d5e' }}>{avisos.length}</span>
          <span style={styles.statLabel}>Comunicados</span>
        </div>
        <div style={{ ...styles.statCard, borderTop: '3px solid #e24b4a' }}>
          <div style={{ ...styles.statIcone, background: '#fcebeb' }}>
            <AlertTriangle size={18} color="#e24b4a" />
          </div>
          <span style={{ ...styles.statValor, color: '#e24b4a' }}>{totalUrgentes}</span>
          <span style={styles.statLabel}>Urgentes</span>
        </div>
        <div style={{ ...styles.statCard, borderTop: '3px solid #1a3a6b' }}>
          <div style={{ ...styles.statIcone, background: '#e6edf8' }}>
            <FileText size={18} color="#1a3a6b" />
          </div>
          <span style={{ ...styles.statValor, color: '#1a3a6b' }}>{totalEventos}</span>
          <span style={styles.statLabel}>Eventos</span>
        </div>
      </div>

      {/* Comunicados recentes */}
      <div style={styles.card}>
        <div style={styles.cardCabecalho}>
          <div style={styles.cardCabecalhoEsquerda}>
            <div style={styles.cardIcone}>
              <Bell size={15} color="white" />
            </div>
            <span style={styles.cardTitulo}>Comunicados Recentes</span>
          </div>
          <button style={styles.verTodos} onClick={() => navigate('/avisos')}>
            Ver todos <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={styles.vazio}>Carregando...</div>
        ) : recentes.length === 0 ? (
          <div style={styles.vazio}>Nenhum comunicado publicado ainda.</div>
        ) : (
          <div style={styles.lista}>
            {recentes.map(aviso => {
              const estilo = tipoEstilo[aviso.tipo] || tipoEstilo.geral
              const estaExpandido = expandido === aviso.id

              return (
                <div key={aviso.id} style={{
                  ...styles.avisoItem,
                  borderLeft: `4px solid ${estilo.cor}`,
                }}>
                  <div style={styles.avisoTopo} onClick={() => toggleExpandido(aviso.id)}>
                    <div style={styles.avisoTopoEsquerda}>
                      <span style={{ ...styles.badge, background: estilo.bg, color: estilo.texto }}>
                        {aviso.tipo.toUpperCase()}
                      </span>
                      <span style={styles.avisoTitulo}>{aviso.titulo}</span>
                    </div>
                    <div style={styles.avisoTopoDireita}>
                      <span style={styles.avisoData}>
                        {aviso.criadoEm?.toDate().toLocaleDateString('pt-BR')}
                      </span>
                      {estaExpandido
                        ? <ChevronUp size={15} color="var(--text-muted)" />
                        : <ChevronDown size={15} color="var(--text-muted)" />
                      }
                    </div>
                  </div>

                  <div style={{
                    ...styles.avisoExpandivel,
                    maxHeight: estaExpandido ? '400px' : '0px',
                    opacity: estaExpandido ? 1 : 0,
                  }}>
                    <div style={styles.avisoExpandidoInner}>
                      <p style={styles.avisoConteudo}>{aviso.conteudo}</p>
                      <span style={styles.avisoAutor}>
                        Por {aviso.autor} · {aviso.criadoEm?.toDate().toLocaleTimeString('pt-BR', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Atalhos rápidos */}
      <div style={styles.atalhos}>
        <button style={{ ...styles.atalho, borderTop: '3px solid #2e7d5e' }} onClick={() => navigate('/avisos')}>
          <Bell size={20} color="#2e7d5e" />
          <span style={styles.atalhoTexto}>Comunicados</span>
        </button>
        <button style={{ ...styles.atalho, borderTop: '3px solid #C9A84C' }} onClick={() => navigate('/eventos')}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <span style={styles.atalhoTexto}>Eventos</span>
        </button>
        <button style={{ ...styles.atalho, borderTop: '3px solid #1a3a6b' }} onClick={() => navigate('/calendario')}>
          <span style={{ fontSize: '20px' }}>📅</span>
          <span style={styles.atalhoTexto}>Calendário</span>
        </button>
        <button style={{ ...styles.atalho, borderTop: '3px solid #6B1A1A' }} onClick={() => navigate('/documentos')}>
          <FileText size={20} color="#6B1A1A" />
          <span style={styles.atalhoTexto}>Documentos</span>
        </button>
      </div>

      {/* Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerLinha} />
        <div style={styles.bannerTexto}>
          <span style={styles.bannerTitulo}>Disciplina · Ordem · Educação</span>
          <span style={styles.bannerSub}>Comunicação institucional oficial do CPM Alagoas</span>
        </div>
        <div style={styles.bannerLinha} />
      </div>

    </div>
  )
}

const styles = {
  hero: {
    borderRadius: '14px',
    padding: '28px',
    marginBottom: '20px',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1a3a2a 0%, #1a2e45 50%, #2a1520 100%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    minHeight: '130px',
  },
  heroGlass: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(46,125,94,0.3) 0%, rgba(26,58,107,0.2) 50%, rgba(107,26,26,0.3) 100%)',
    backdropFilter: 'blur(1px)',
    pointerEvents: 'none',
  },
  heroCirculo1: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    border: '1px solid rgba(201,168,76,0.15)',
    top: '-60px',
    right: '60px',
    pointerEvents: 'none',
  },
  heroCirculo2: {
    position: 'absolute',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.05)',
    bottom: '-40px',
    right: '20px',
    pointerEvents: 'none',
  },
  heroConteudo: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroEsquerda: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  heroLabel: {
    color: 'var(--gold)',
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  heroTitulo: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '600',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '12px',
  },
  heroBrasao: {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    border: '1.5px solid rgba(201,168,76,0.6)',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
  },
  heroBrasaoTexto: {
    color: 'var(--gold)',
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '2px',
  },
  heroBrasaoSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '10px',
    letterSpacing: '1px',
  },
  gridStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  statCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statIcone: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValor: {
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '18px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardCabecalho: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '0.5px solid var(--border)',
  },
  cardCabecalhoEsquerda: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardIcone: {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(135deg, #2e7d5e, #1a3a6b)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitulo: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  verTodos: {
    fontSize: '12px',
    color: '#2e7d5e',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    background: 'none',
    border: 'none',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  avisoItem: {
    borderRadius: '8px',
    background: 'var(--surface)',
    overflow: 'hidden',
  },
  avisoTopo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
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
    gap: '8px',
    flexShrink: 0,
    marginLeft: '10px',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
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
  avisoExpandivel: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease, opacity 0.3s ease',
  },
  avisoExpandidoInner: {
    padding: '0 14px 14px',
    borderTop: '0.5px solid var(--border)',
    paddingTop: '12px',
  },
  avisoConteudo: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    marginBottom: '8px',
  },
  avisoAutor: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  vazio: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    padding: '24px 0',
  },
  atalhos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '16px',
  },
  atalho: {
    background: 'white',
    borderRadius: '10px',
    padding: '16px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: 'none',
  },
  atalhoTexto: {
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
  },
  bannerLinha: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, #2e7d5e, #1a3a6b)',
    opacity: 0.4,
  },
  bannerTexto: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  bannerTitulo: {
    color: '#1a3a2a',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  bannerSub: {
    color: 'var(--text-muted)',
    fontSize: '11px',
  },
}
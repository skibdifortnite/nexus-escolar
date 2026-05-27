import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  doc, addDoc, deleteDoc, updateDoc, collection, serverTimestamp
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import {
  useClube, useSolicitacoes, useMembros,
  verificarMembroClube, verificarSolicitacaoPendente,
  podeGerenciarClube, TIPOS_CLUBE
} from '../hooks/useClubes'
import {
  ChevronLeft, Users, MapPin, Clock, Shield,
  Check, X, Trash2, UserPlus, UserCheck, Lock
} from 'lucide-react'

export default function ClubeDetalhe() {
  const { clubeId } = useParams()
  const { perfil, user } = useAuth()
  const navigate = useNavigate()
  const { clube, loading } = useClube(clubeId)
  const { solicitacoes } = useSolicitacoes(clubeId)
  const { membros } = useMembros(clubeId)
  const [statusUsuario, setStatusUsuario] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const gerenciar = clube ? podeGerenciarClube(perfil, clube) : false

  // Verifica status do usuário no clube
  useEffect(() => {
    if (!user || !clubeId) return

    async function verificar() {
      const eMembro = await verificarMembroClube(clubeId, user.uid)
      if (eMembro) { setStatusUsuario('membro'); return }

      const solicitacao = await verificarSolicitacaoPendente(clubeId, user.uid)
      if (solicitacao) { setStatusUsuario('pendente'); return }

      setStatusUsuario('nenhum')
    }

    verificar()
  }, [user, clubeId, membros, solicitacoes])

  async function handleSolicitar() {
    if (!user || !perfil) return
    setEnviando(true)

    try {
      await addDoc(collection(db, 'clubes', clubeId, 'solicitacoes'), {
        userId: user.uid,
        nome: perfil.nome,
        role: perfil.role,
        criadoEm: serverTimestamp(),
        status: 'pendente',
      })
      setStatusUsuario('pendente')
    } catch (err) {
      console.error('Erro ao solicitar:', err)
    } finally {
      setEnviando(false)
    }
  }

  async function handleCancelarSolicitacao() {
    setEnviando(true)
    try {
      await deleteDoc(doc(db, 'clubes', clubeId, 'solicitacoes', user.uid))
      setStatusUsuario('nenhum')
    } catch (err) {
      console.error('Erro ao cancelar:', err)
    } finally {
      setEnviando(false)
    }
  }

  async function handleAprovar(solicitacao) {
    try {
      // Adiciona como membro
      await addDoc(collection(db, 'clubes', clubeId, 'membros'), {
        userId: solicitacao.userId,
        nome: solicitacao.nome,
        role: solicitacao.role,
        entradoEm: serverTimestamp(),
      })
      // Remove a solicitação
      await deleteDoc(doc(db, 'clubes', clubeId, 'solicitacoes', solicitacao.id))
      // Atualiza contador
      await updateDoc(doc(db, 'clubes', clubeId), {
        totalMembros: (clube.totalMembros || 0) + 1,
      })
    } catch (err) {
      console.error('Erro ao aprovar:', err)
    }
  }

  async function handleRecusar(solicitacaoId) {
    try {
      await deleteDoc(doc(db, 'clubes', clubeId, 'solicitacoes', solicitacaoId))
    } catch (err) {
      console.error('Erro ao recusar:', err)
    }
  }

  async function handleRemoverMembro(membroId) {
    try {
      await deleteDoc(doc(db, 'clubes', clubeId, 'membros', membroId))
      await updateDoc(doc(db, 'clubes', clubeId), {
        totalMembros: Math.max((clube.totalMembros || 1) - 1, 0),
      })
    } catch (err) {
      console.error('Erro ao remover membro:', err)
    }
  }

  async function handleDeletarClube() {
    try {
      await deleteDoc(doc(db, 'clubes', clubeId))
      navigate('/clubes')
    } catch (err) {
      console.error('Erro ao deletar clube:', err)
    }
  }

  async function handleMudarTipo(novoTipo) {
    try {
      await updateDoc(doc(db, 'clubes', clubeId), { tipo: novoTipo })
    } catch (err) {
      console.error('Erro ao mudar tipo:', err)
    }
  }

  if (loading) return <div style={styles.vazio}>Carregando clube...</div>
  if (!clube) return <div style={styles.vazio}>Clube não encontrado.</div>

  const tipoConfig = TIPOS_CLUBE[clube.tipo] || TIPOS_CLUBE.aberto
  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'pendente')

  return (
    <div>

      {/* Botão voltar */}
      <button style={styles.botaoVoltar} onClick={() => navigate('/clubes')}>
        <ChevronLeft size={16} />
        Voltar para Clubes
      </button>

      {/* Banner do clube */}
      <div style={{
        ...styles.banner,
        background: clube.bannerUrl
          ? `url(${clube.bannerUrl}) center/cover`
          : 'linear-gradient(135deg, #1a3a2a, #1a2e45)',
      }}>
        <div style={styles.bannerOverlay} />
        <div style={styles.bannerConteudo}>
          <div style={{
            ...styles.tipoBadge,
            background: tipoConfig.bg,
            color: tipoConfig.texto,
            border: `1px solid ${tipoConfig.cor}`,
          }}>
            <div style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: tipoConfig.cor,
            }} />
            {tipoConfig.label}
          </div>
          <h1 style={styles.bannerTitulo}>{clube.nome}</h1>
          <p style={styles.bannerCategoria}>{clube.categoria}</p>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={styles.conteudo}>

        {/* Coluna esquerda */}
        <div style={styles.colunaEsquerda}>

          {/* Sobre */}
          <div style={styles.card}>
            <div style={styles.cardTitulo}>Sobre o Clube</div>
            <p style={styles.descricao}>
              {clube.descricao || 'Nenhuma descrição disponível.'}
            </p>
            <div style={styles.detalhes}>
              {clube.horario && (
                <div style={styles.detalheItem}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span style={styles.detalheTexto}>{clube.horario}</span>
                </div>
              )}
              {clube.local && (
                <div style={styles.detalheItem}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span style={styles.detalheTexto}>{clube.local}</span>
                </div>
              )}
              <div style={styles.detalheItem}>
                <Users size={14} color="var(--text-muted)" />
                <span style={styles.detalheTexto}>
                  {clube.totalMembros || 0} membro(s)
                  {clube.vagas > 0 && ` · ${clube.vagas} vagas`}
                </span>
              </div>
              <div style={styles.detalheItem}>
                <Shield size={14} color="var(--text-muted)" />
                <span style={styles.detalheTexto}>
                  Responsável: {clube.responsavelNome}
                </span>
              </div>
            </div>
          </div>

          {/* Botão de participação */}
          {statusUsuario === 'nenhum' && clube.tipo !== 'fechado' && (
            <button
              style={styles.botaoParticipar}
              onClick={handleSolicitar}
              disabled={enviando}
            >
              <UserPlus size={16} />
              {clube.tipo === 'aberto' ? 'Participar do Clube' : 'Solicitar Participação'}
            </button>
          )}

          {statusUsuario === 'pendente' && (
            <div style={styles.pendenteArea}>
              <div style={styles.pendenteMsg}>
                <Clock size={14} color="#7a5c00" />
                Solicitação enviada — aguardando aprovação
              </div>
              <button
                style={styles.botaoCancelarSol}
                onClick={handleCancelarSolicitacao}
                disabled={enviando}
              >
                Cancelar solicitação
              </button>
            </div>
          )}

          {statusUsuario === 'membro' && (
            <div style={styles.membroMsg}>
              <UserCheck size={14} color="#1a4d38" />
              Você é membro deste clube
            </div>
          )}

          {clube.tipo === 'fechado' && statusUsuario === 'nenhum' && (
            <div style={styles.fechadoMsg}>
              <Lock size={14} color="#444" />
              Este clube não está aceitando novos membros
            </div>
          )}

          {/* Membros */}
          <div style={styles.card}>
            <div style={styles.cardTitulo}>
              Membros ({membros.length})
            </div>
            {membros.length === 0 ? (
              <div style={styles.vazioCard}>Nenhum membro ainda.</div>
            ) : (
              <div style={styles.membroLista}>
                {membros.map(membro => (
                  <div key={membro.id} style={styles.membroItem}>
                    <div style={styles.membroAvatar}>
                      {membro.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.membroInfo}>
                      <span style={styles.membroNome}>{membro.nome}</span>
                      <span style={styles.membroRole}>{membro.role}</span>
                    </div>
                    {gerenciar && (
                      <button
                        style={styles.botaoRemover}
                        onClick={() => handleRemoverMembro(membro.id)}
                        title="Remover membro"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Coluna direita — só para gerenciadores */}
        {gerenciar && (
          <div style={styles.colunaDireita}>

            {/* Solicitações pendentes */}
            <div style={styles.card}>
              <div style={styles.cardTitulo}>
                Solicitações ({solicitacoesPendentes.length})
              </div>
              {solicitacoesPendentes.length === 0 ? (
                <div style={styles.vazioCard}>Nenhuma solicitação pendente.</div>
              ) : (
                <div style={styles.solicitacaoLista}>
                  {solicitacoesPendentes.map(sol => (
                    <div key={sol.id} style={styles.solicitacaoItem}>
                      <div style={styles.membroAvatar}>
                        {sol.nome?.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.membroInfo}>
                        <span style={styles.membroNome}>{sol.nome}</span>
                        <span style={styles.membroRole}>{sol.role}</span>
                      </div>
                      <div style={styles.solicitacaoBotoes}>
                        <button
                          style={styles.botaoAprovar}
                          onClick={() => handleAprovar(sol)}
                          title="Aprovar"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          style={styles.botaoRecusar}
                          onClick={() => handleRecusar(sol.id)}
                          title="Recusar"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Configurações do clube */}
            <div style={styles.card}>
              <div style={styles.cardTitulo}>Configurações</div>
              <div style={styles.campo}>
                <label style={styles.label}>Status do clube</label>
                <select
                  value={clube.tipo}
                  onChange={e => handleMudarTipo(e.target.value)}
                  style={styles.input}
                >
                  <option value="aberto">Aberto</option>
                  <option value="seletivo">Seletivo</option>
                  <option value="fechado">Fechado</option>
                </select>
              </div>
              <div style={styles.deletarArea}>
                {confirmDelete ? (
                  <div style={styles.confirmArea}>
                    <span style={styles.confirmTexto}>Confirmar exclusão do clube?</span>
                    <button style={styles.botaoSim} onClick={handleDeletarClube}>Sim</button>
                    <button style={styles.botaoNao} onClick={() => setConfirmDelete(false)}>Não</button>
                  </div>
                ) : (
                  <button
                    style={styles.botaoDeletar}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} />
                    Excluir clube
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  )
}

const styles = {
  botaoVoltar: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '8px',
    background: 'white',
    border: '1px solid var(--border)',
    marginBottom: '16px',
  },
  banner: {
    borderRadius: '12px',
    height: '160px',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'flex-end',
  },
  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1))',
  },
  bannerConteudo: {
    position: 'relative',
    zIndex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  tipoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '10px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '20px',
    alignSelf: 'flex-start',
    marginBottom: '4px',
  },
  bannerTitulo: {
    color: 'white',
    fontSize: '22px',
    fontWeight: '700',
  },
  bannerCategoria: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
  },
  conteudo: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '16px',
    alignItems: 'flex-start',
  },
  colunaEsquerda: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  colunaDireita: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    border: '0.5px solid var(--border)',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitulo: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '0.5px solid var(--border)',
  },
  descricao: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    marginBottom: '14px',
  },
  detalhes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detalheItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  detalheTexto: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  botaoParticipar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
    color: 'white',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    boxShadow: '0 4px 12px rgba(26,58,107,0.3)',
  },
  pendenteArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pendenteMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fdf6e3',
    color: '#7a5c00',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
  },
  botaoCancelarSol: {
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    border: '1px solid var(--border)',
    width: '100%',
  },
  membroMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#e6f4ef',
    color: '#1a4d38',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
  },
  fechadoMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f2f2f2',
    color: '#444',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  membroLista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  membroItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '0.5px solid var(--border)',
  },
  membroAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  membroInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  membroNome: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  membroRole: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
  },
  botaoRemover: {
    color: '#e24b4a',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    background: '#fcebeb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    flexShrink: 0,
  },
  solicitacaoLista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  solicitacaoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '0.5px solid var(--border)',
  },
  solicitacaoBotoes: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
  },
  botaoAprovar: {
    color: '#1a4d38',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    background: '#e6f4ef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
  },
  botaoRecusar: {
    color: '#e24b4a',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    background: '#fcebeb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '14px',
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
  deletarArea: {
    paddingTop: '12px',
    borderTop: '0.5px solid var(--border)',
  },
  botaoDeletar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#e24b4a',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #fcebeb',
    background: '#fcebeb',
  },
  confirmArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  confirmTexto: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    flex: 1,
  },
  botaoSim: {
    background: '#e24b4a',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
  botaoNao: {
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    border: '1px solid var(--border)',
  },
  vazio: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    padding: '40px 0',
  },
  vazioCard: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '12px',
    padding: '16px 0',
  },
}
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { useOlimpiada, useInscricoes } from '../hooks/useOlimpiadas'
import { podeAcessarAreaMilitar } from '../utils/roles'
import { ChevronLeft, Trophy, Download, Users, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function OlimpiadaDetalhe() {
  const { olimpiadaId } = useParams()
  const { perfil, user } = useAuth()
  const navigate = useNavigate()
  const { olimpiada, loading } = useOlimpiada(olimpiadaId)
  const { inscricoes } = useInscricoes(olimpiadaId)
  const podeGerenciar = podeAcessarAreaMilitar(perfil?.role)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [jaInscrito, setJaInscrito] = useState(false)
  const [verificado, setVerificado] = useState(false)
  const [respostas, setRespostas] = useState({})

  // Verifica se já está inscrito
  async function verificarInscricao() {
    if (verificado || !user) return
    const q = query(
      collection(db, 'olimpiadas', olimpiadaId, 'inscricoes'),
      where('uid', '==', user.uid)
    )
    const snap = await getDocs(q)
    setJaInscrito(!snap.empty)
    setVerificado(true)
  }

  if (!verificado && user) verificarInscricao()

  function handleRespostaChange(campo, valor) {
    setRespostas(prev => ({ ...prev, [campo]: valor }))
  }

  async function handleInscrever(e) {
    e.preventDefault()
    if (!user || !perfil) return

    // Verifica se todos os campos foram preenchidos
    const camposVazios = olimpiada.campos.filter(c => !respostas[c]?.trim())
    if (camposVazios.length > 0) return

    setEnviando(true)
    try {
      await addDoc(collection(db, 'olimpiadas', olimpiadaId, 'inscricoes'), {
        uid: user.uid,
        nome: perfil.nome,
        matricula: perfil.matricula || '',
        turma: perfil.turma || '',
        respostas,
        criadoEm: serverTimestamp(),
      })
      setSucesso(true)
      setJaInscrito(true)
    } catch (err) {
      console.error('Erro ao inscrever:', err)
    } finally {
      setEnviando(false)
    }
  }

  async function handleMudarStatus(novoStatus) {
    try {
      await updateDoc(doc(db, 'olimpiadas', olimpiadaId), { status: novoStatus })
    } catch (err) {
      console.error('Erro ao mudar status:', err)
    }
  }

  function exportarExcel() {
    if (!olimpiada || inscricoes.length === 0) return

    // Monta os dados para o Excel
    const dados = inscricoes.map((inscricao, idx) => {
      const linha = { '#': idx + 1 }

      // Campos padrão
      linha['Nome'] = inscricao.nome || ''
      linha['Matrícula'] = inscricao.matricula || ''
      linha['Turma'] = inscricao.turma || ''

      // Campos personalizados
      olimpiada.campos.forEach(campo => {
        linha[campo] = inscricao.respostas?.[campo] || ''
      })

      // Data de inscrição
      linha['Data de Inscrição'] = inscricao.criadoEm?.toDate
        ? inscricao.criadoEm.toDate().toLocaleDateString('pt-BR')
        : ''

      return linha
    })

    // Cria a planilha
    const ws = XLSX.utils.json_to_sheet(dados)

    // Ajusta largura das colunas
    const colunas = Object.keys(dados[0] || {})
    ws['!cols'] = colunas.map(col => ({
      wch: Math.max(col.length, 15)
    }))

    // Cria o workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inscrições')

    // Baixa o arquivo
    XLSX.writeFile(wb, `${olimpiada.titulo} — Inscrições.xlsx`)
  }

  if (loading) return <div style={styles.vazio}>Carregando...</div>
  if (!olimpiada) return <div style={styles.vazio}>Olimpíada não encontrada.</div>

  const estaAberta = olimpiada.status === 'aberta'
  const isAluno = perfil?.role === 'aluno'

  return (
    <div>

      {/* Botão voltar */}
      <button style={styles.botaoVoltar} onClick={() => navigate('/olimpiadas')}>
        <ChevronLeft size={16} />
        Voltar para Olimpíadas
      </button>

      {/* Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerOverlay} />
        <div style={styles.bannerConteudo}>
          <div style={{
            ...styles.statusBadge,
            background: estaAberta ? '#e6f4ef' : '#f2f2f2',
            color: estaAberta ? '#1a4d38' : '#444',
            border: `1px solid ${estaAberta ? '#2e7d5e' : '#8a9bb0'}`,
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: estaAberta ? '#2e7d5e' : '#8a9bb0',
            }} />
            {estaAberta ? 'Inscrições abertas' : 'Encerrada'}
          </div>
          <h1 style={styles.bannerTitulo}>{olimpiada.titulo}</h1>
          <div style={styles.bannerMeta}>
            {olimpiada.dataInicio && (
              <span>
                {new Date(olimpiada.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}
                {olimpiada.dataFim && ` → ${new Date(olimpiada.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
              </span>
            )}
            <span>Publicado por {olimpiada.autorNome}</span>
          </div>
        </div>
      </div>

      <div style={styles.conteudo}>

        {/* Coluna esquerda */}
        <div style={styles.colunaEsquerda}>

          {/* Descrição */}
          {olimpiada.descricao && (
            <div style={styles.card}>
              <div style={styles.cardTitulo}>Sobre a Olimpíada</div>
              <p style={styles.descricao}>{olimpiada.descricao}</p>
            </div>
          )}

          {/* Formulário de inscrição */}
          {isAluno && estaAberta && (
            <div style={styles.card}>
              <div style={styles.cardTitulo}>Formulário de Inscrição</div>

              {sucesso || jaInscrito ? (
                <div style={styles.sucessoMsg}>
                  <CheckCircle size={18} color="#2e7d5e" />
                  <div>
                    <div style={styles.sucessoTitulo}>Inscrição realizada!</div>
                    <div style={styles.sucessoSub}>Sua inscrição foi registrada com sucesso.</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInscrever} style={styles.form}>
                  {olimpiada.campos?.map(campo => (
                    <div key={campo} style={styles.campo}>
                      <label style={styles.label}>{campo}</label>
                      <input
                        value={respostas[campo] || ''}
                        onChange={e => handleRespostaChange(campo, e.target.value)}
                        placeholder={`Digite ${campo.toLowerCase()}...`}
                        required
                        style={styles.input}
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={enviando}
                    style={styles.botaoInscrever}
                  >
                    {enviando ? 'Enviando...' : 'Confirmar Inscrição'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Mensagem para não alunos */}
          {!isAluno && !podeGerenciar && (
            <div style={styles.infoMsg}>
              Apenas alunos podem se inscrever nesta olimpíada.
            </div>
          )}

          {/* Olimpíada encerrada */}
          {isAluno && !estaAberta && !jaInscrito && (
            <div style={styles.encerradaMsg}>
              As inscrições para esta olimpíada estão encerradas.
            </div>
          )}

        </div>

        {/* Coluna direita — admin/militar */}
        {podeGerenciar && (
          <div style={styles.colunaDireita}>

            {/* Inscritos */}
            <div style={styles.card}>
              <div style={styles.cardCabecalho}>
                <div style={styles.cardTitulo}>
                  Inscritos ({inscricoes.length})
                </div>
                {inscricoes.length > 0 && (
                  <button
                    style={styles.botaoExcel}
                    onClick={exportarExcel}
                  >
                    <Download size={13} />
                    Excel
                  </button>
                )}
              </div>

              {inscricoes.length === 0 ? (
                <div style={styles.vazioCard}>Nenhuma inscrição ainda.</div>
              ) : (
                <div style={styles.inscritoLista}>
                  {inscricoes.map((inscricao, idx) => (
                    <div key={inscricao.id} style={styles.inscritoItem}>
                      <div style={styles.inscritoAvatar}>
                        {inscricao.nome?.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.inscritoInfo}>
                        <span style={styles.inscritoNome}>{inscricao.nome}</span>
                        <span style={styles.inscritoMeta}>
                          {inscricao.matricula && `Mat: ${inscricao.matricula}`}
                          {inscricao.turma && ` · ${inscricao.turma}`}
                        </span>
                        {/* Respostas dos campos */}
                        {olimpiada.campos?.map(campo => (
                          inscricao.respostas?.[campo] && (
                            <span key={campo} style={styles.inscritoResposta}>
                              <strong>{campo}:</strong> {inscricao.respostas[campo]}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Configurações */}
            <div style={styles.card}>
              <div style={styles.cardTitulo}>Configurações</div>
              <div style={styles.campo}>
                <label style={styles.label}>Status das inscrições</label>
                <select
                  value={olimpiada.status}
                  onChange={e => handleMudarStatus(e.target.value)}
                  style={styles.input}
                >
                  <option value="aberta">Aberta</option>
                  <option value="encerrada">Encerrada</option>
                </select>
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
    background: 'linear-gradient(135deg, #3d2e00, #7a5c00)',
  },
  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1))',
  },
  bannerConteudo: {
    position: 'relative',
    zIndex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '10px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '20px',
    alignSelf: 'flex-start',
  },
  bannerTitulo: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
  },
  bannerMeta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  bannerMetaItem: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
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
  cardCabecalho: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '0.5px solid var(--border)',
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
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    background: 'var(--surface)',
    outline: 'none',
    width: '100%',
  },
  botaoInscrever: {
    background: 'linear-gradient(135deg, #7a5c00, #C9A84C)',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
  },
  botaoExcel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#e6f4ef',
    color: '#1a4d38',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    border: '1px solid #2e7d5e',
  },
  sucessoMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#e6f4ef',
    padding: '14px',
    borderRadius: '8px',
  },
  sucessoTitulo: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a4d38',
  },
  sucessoSub: {
    fontSize: '12px',
    color: '#2e7d5e',
  },
  infoMsg: {
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center',
    border: '1px solid var(--border)',
  },
  encerradaMsg: {
    background: '#f2f2f2',
    color: '#444',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center',
    border: '1px solid #8a9bb0',
  },
  inscritoLista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  inscritoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '0.5px solid var(--border)',
  },
  inscritoAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7a5c00, #C9A84C)',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inscritoInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  inscritoNome: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  inscritoMeta: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  inscritoResposta: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  vazioCard: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '12px',
    padding: '16px 0',
  },
  vazio: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    padding: '40px 0',
  },
}
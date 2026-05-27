import { useState } from 'react'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { podeAcessarAreaMilitar } from '../utils/roles'
import { useAlbuns, buscarFotosDrive } from '../hooks/useGaleria'
import { Images, Plus, X, Trash2, Download, ExternalLink, ChevronLeft } from 'lucide-react'

export default function Galeria() {
  const { perfil } = useAuth()
  const { albuns, loading } = useAlbuns()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [albumAberto, setAlbumAberto] = useState(null)
  const [fotos, setFotos] = useState([])
  const [carregandoFotos, setCarregandoFotos] = useState(false)
  const [fotoExpandida, setFotoExpandida] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    pastaId: '',
    data: '',
  })

  const podeGerenciar = podeAcessarAreaMilitar(perfil?.role)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function extrairIdDaPasta(valor) {
    const match = valor.match(/folders\/([a-zA-Z0-9_-]+)/)
    if (match) setForm(prev => ({ ...prev, pastaId: match[1] }))
    else setForm(prev => ({ ...prev, pastaId: valor }))
  }

  async function handleCriarAlbum(e) {
    e.preventDefault()
    if (!form.titulo || !form.pastaId) return
    setEnviando(true)
    setErro('')

    try {
      const fotosTeste = await buscarFotosDrive(form.pastaId)
      await addDoc(collection(db, 'galeria'), {
        titulo: form.titulo,
        descricao: form.descricao,
        pastaId: form.pastaId,
        data: form.data,
        totalFotos: fotosTeste.length,
        autor: perfil?.nome || 'Desconhecido',
        criadoEm: serverTimestamp(),
      })
      setForm({ titulo: '', descricao: '', pastaId: '', data: '' })
      setMostrarForm(false)
    } catch (err) {
      setErro('Não foi possível acessar a pasta. Verifique se ela está compartilhada publicamente.')
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  async function handleAbrirAlbum(album) {
    setAlbumAberto(album)
    setCarregandoFotos(true)
    setFotos([])
    try {
      const resultado = await buscarFotosDrive(album.pastaId)
      setFotos(resultado)
    } catch (err) {
      console.error('Erro ao carregar fotos:', err)
    } finally {
      setCarregandoFotos(false)
    }
  }

  async function handleDeletar(id) {
    try {
      await deleteDoc(doc(db, 'galeria', id))
      setConfirmDelete(null)
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
  }

  // Tela do álbum aberto
  if (albumAberto) {
    return (
      <div>
        <div style={styles.cabecalho}>
          <div style={styles.cabecalhoEsquerda}>
            <button
              style={styles.botaoVoltar}
              onClick={() => { setAlbumAberto(null); setFotos([]) }}
            >
              <ChevronLeft size={16} />
              Voltar
            </button>
            <div>
              <h2 style={styles.titulo}>{albumAberto.titulo}</h2>
              <p style={styles.subtitulo}>
                {albumAberto.descricao || 'Galeria de fotos'}
                {albumAberto.data && ` · ${new Date(albumAberto.data + 'T00:00:00').toLocaleDateString('pt-BR')}`}
              </p>
            </div>
          </div>
        </div>

        {carregandoFotos ? (
          <div style={styles.vazio}>Carregando fotos...</div>
        ) : fotos.length === 0 ? (
          <div style={styles.vazio}>Nenhuma foto encontrada nesta pasta.</div>
        ) : (
          <div style={styles.gridFotos}>
            {fotos.map(foto => (
              <div
                key={foto.id}
                style={styles.fotoCard}
                onClick={() => setFotoExpandida(foto)}
              >
                <img
                  src={foto.url}
                  alt={foto.nome}
                  style={styles.fotoImg}
                  loading="lazy"
                />
                <div style={styles.fotoOverlay}>
                  <ExternalLink size={16} color="white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {fotoExpandida && (
          <div style={styles.modalOverlay} onClick={() => setFotoExpandida(null)}>
            <div style={styles.modalConteudo} onClick={e => e.stopPropagation()}>
              <button style={styles.modalFechar} onClick={() => setFotoExpandida(null)}>
                <X size={20} color="white" />
              </button>
              <img
                src={fotoExpandida.url.replace('w400', 'w1200')}
                alt={fotoExpandida.nome}
                style={styles.modalImg}
              />
              <div style={styles.modalRodape}>
                <span style={styles.modalNome}>{fotoExpandida.nome}</span>
                <a
                  href={fotoExpandida.urlVisualizar}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.botaoDownload}
                >
                  <Download size={14} />
                  Baixar
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Tela principal
  return (
    <div>

      <div style={styles.cabecalho}>
        <div style={styles.cabecalhoEsquerda}>
          <div style={styles.cabecalhoIcone}>
            <Images size={18} color="white" />
          </div>
          <div>
            <h2 style={styles.titulo}>Galeria</h2>
            <p style={styles.subtitulo}>{albuns.length} álbum(ns) institucional(is)</p>
          </div>
        </div>
        {podeGerenciar && (
          <button
            style={mostrarForm ? styles.botaoCancelar : styles.botaoNovo}
            onClick={() => setMostrarForm(prev => !prev)}
          >
            {mostrarForm
              ? <><X size={14} /> Cancelar</>
              : <><Plus size={14} /> Novo Álbum</>
            }
          </button>
        )}
      </div>

      {mostrarForm && (
        <div style={styles.formCard}>
          <div style={styles.formCabecalho}>
            <span style={styles.formTitulo}>Novo Álbum</span>
          </div>
          <form onSubmit={handleCriarAlbum} style={styles.form}>
            {erro && <div style={styles.erroMsg}>{erro}</div>}
            <div style={styles.campo}>
              <label style={styles.label}>Título do álbum</label>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ex: Formatura 2026"
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
                placeholder="Breve descrição do evento"
                style={styles.input}
              />
            </div>
            <div style={styles.gridDois}>
              <div style={styles.campo}>
                <label style={styles.label}>Data do evento (opcional)</label>
                <input
                  type="date"
                  name="data"
                  value={form.data}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Link ou ID da pasta do Drive</label>
                <input
                  name="pastaId"
                  value={form.pastaId}
                  onChange={handleChange}
                  placeholder="Cole o link ou ID da pasta"
                  required
                  style={styles.input}
                  onBlur={e => extrairIdDaPasta(e.target.value)}
                />
              </div>
            </div>
            <div style={styles.dica}>
              <strong>Como obter o link:</strong> Abra a pasta no Google Drive → botão direito → Compartilhar → mude para "Qualquer pessoa com o link" → copie e cole acima.
            </div>
            <button type="submit" disabled={enviando} style={styles.botaoEnviar}>
              {enviando ? 'Criando...' : 'Criar Álbum'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={styles.vazio}>Carregando álbuns...</div>
      ) : albuns.length === 0 ? (
        <div style={styles.vazio}>Nenhum álbum criado ainda.</div>
      ) : (
        <div style={styles.gridAlbuns}>
          {albuns.map(album => (
            <div key={album.id} style={styles.albumCard}>
              <div
                style={styles.albumCapa}
                onClick={() => handleAbrirAlbum(album)}
              >
                <div style={styles.albumCapaPlaceholder}>
                  <Images size={32} color="rgba(255,255,255,0.3)" />
                </div>
                <div style={styles.albumOverlay}>
                  <span style={styles.albumOverlayTexto}>Ver fotos</span>
                </div>
              </div>
              <div style={styles.albumInfo}>
                <div style={styles.albumInfoTopo}>
                  <span style={styles.albumTitulo}>{album.titulo}</span>
                  {podeGerenciar && (
                    confirmDelete === album.id ? (
                      <div style={styles.confirmArea}>
                        <button style={styles.botaoSim} onClick={() => handleDeletar(album.id)}>Sim</button>
                        <button style={styles.botaoNao} onClick={() => setConfirmDelete(null)}>Não</button>
                      </div>
                    ) : (
                      <button style={styles.botaoDeletar} onClick={() => setConfirmDelete(album.id)}>
                        <Trash2 size={13} />
                      </button>
                    )
                  )}
                </div>
                {album.descricao && (
                  <span style={styles.albumDesc}>{album.descricao}</span>
                )}
                <div style={styles.albumMeta}>
                  {album.data && (
                    <span style={styles.albumMetaItem}>
                      📅 {new Date(album.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  {album.totalFotos > 0 && (
                    <span style={styles.albumMetaItem}>
                      🖼️ {album.totalFotos} foto(s)
                    </span>
                  )}
                </div>
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
    background: 'linear-gradient(135deg, #2e7d5e, #1a3a6b)',
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
    background: 'linear-gradient(135deg, #2e7d5e, #1a3a6b)',
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
  botaoVoltar: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '8px',
    background: 'var(--surface)',
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
    background: 'linear-gradient(135deg, #2e7d5e, #1a3a6b)',
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
  dica: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'var(--surface)',
    padding: '10px 14px',
    borderRadius: '8px',
    lineHeight: '1.6',
    border: '1px solid var(--border)',
  },
  erroMsg: {
    background: 'var(--danger-bg)',
    color: 'var(--danger-text)',
    fontSize: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
  },
  botaoEnviar: {
    background: 'linear-gradient(135deg, #2e7d5e, #1a3a6b)',
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
  gridAlbuns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  albumCard: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '0.5px solid var(--border)',
  },
  albumCapa: {
    height: '160px',
    background: 'linear-gradient(135deg, #1a3a2a, #1a2e45)',
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumCapaPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  albumOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumOverlayTexto: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    background: 'rgba(0,0,0,0.4)',
    padding: '6px 14px',
    borderRadius: '20px',
    backdropFilter: 'blur(4px)',
  },
  albumInfo: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  albumInfoTopo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  albumTitulo: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  albumDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  albumMeta: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  albumMetaItem: {
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
  gridFotos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '10px',
  },
  fotoCard: {
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative',
    aspectRatio: '1',
    background: '#f0f0f0',
  },
  fotoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  fotoOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '20px',
  },
  modalConteudo: {
    background: '#1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
    maxWidth: '800px',
    width: '100%',
    position: 'relative',
  },
  modalFechar: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    zIndex: 1,
  },
  modalImg: {
    width: '100%',
    maxHeight: '70vh',
    objectFit: 'contain',
    display: 'block',
  },
  modalRodape: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalNome: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  botaoDownload: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
}
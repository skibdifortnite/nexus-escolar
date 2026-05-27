import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { useEventos } from '../hooks/useEventos'
import { ScanLine, X, CheckCircle, AlertCircle } from 'lucide-react'

export default function Scanner() {
  const { perfil } = useAuth()
  const { eventos } = useEventos()
  const [scanning, setScanning] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [eventoSelecionado, setEventoSelecionado] = useState('')
  const [registrando, setRegistrando] = useState(false)
  const [sucesso, setSucesso] = useState(null)
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)

  // Eventos futuros ou de hoje
  const eventosAtivos = eventos.filter(e => {
    if (!e.data) return true
    const hoje = new Date().toISOString().split('T')[0]
    return e.data >= hoje
  })

  async function iniciarScan() {
    if (!eventoSelecionado) {
      setErro('Selecione um evento antes de escanear.')
      return
    }
    setErro('')
    setResultado(null)
    setSucesso(null)
    setScanning(true)
  }

  useEffect(() => {
    if (!scanning) return

    const html5Qr = new Html5Qrcode('qr-reader')
    html5QrRef.current = html5Qr

    html5Qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (texto) => {
        try {
          const dados = JSON.parse(texto)
          setResultado(dados)
          await pararScan()
        } catch {
          setErro('QR Code inválido ou não reconhecido.')
          await pararScan()
        }
      },
      () => {}
    ).catch(err => {
      setErro('Não foi possível acessar a câmera.')
      setScanning(false)
      console.error(err)
    })

    return () => {
      pararScan()
    }
  }, [scanning])

  async function pararScan() {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop()
        html5QrRef.current.clear()
      } catch {}
    }
    setScanning(false)
  }

  async function handleRegistrarPresenca() {
    if (!resultado || !eventoSelecionado) return
    setRegistrando(true)

    try {
      // Verifica se já foi registrado
      const q = query(
        collection(db, 'presencas'),
        where('uid', '==', resultado.uid),
        where('eventoId', '==', eventoSelecionado)
      )
      const snap = await getDocs(q)

      if (!snap.empty) {
        setSucesso({
          tipo: 'duplicado',
          msg: `${resultado.nome} já teve presença registrada neste evento.`
        })
        setRegistrando(false)
        return
      }

      // Registra a presença
      await addDoc(collection(db, 'presencas'), {
        uid: resultado.uid,
        nome: resultado.nome,
        matricula: resultado.matricula,
        turma: resultado.turma,
        role: resultado.role,
        eventoId: eventoSelecionado,
        eventoNome: eventos.find(e => e.id === eventoSelecionado)?.titulo || '',
        registradoPor: perfil?.nome,
        registradoEm: serverTimestamp(),
      })

      setSucesso({
        tipo: 'ok',
        msg: `Presença de ${resultado.nome} registrada com sucesso!`
      })
      setResultado(null)
    } catch (err) {
      console.error('Erro ao registrar presença:', err)
      setErro('Erro ao registrar presença.')
    } finally {
      setRegistrando(false)
    }
  }

  function handleNovaScan() {
    setResultado(null)
    setSucesso(null)
    setErro('')
  }

  return (
    <div>

      {/* Cabeçalho */}
      <div style={styles.cabecalho}>
        <div style={styles.cabecalhoEsquerda}>
          <div style={styles.cabecalhoIcone}>
            <ScanLine size={18} color="white" />
          </div>
          <div>
            <h2 style={styles.titulo}>Scanner de Presença</h2>
            <p style={styles.subtitulo}>Leitura de QR Code institucional</p>
          </div>
        </div>
        <div style={styles.badgeRestrito}>
          Área Militar
        </div>
      </div>

      {/* Seleção de evento */}
      <div style={styles.card}>
        <div style={styles.cardTitulo}>Selecionar Evento</div>
        <select
          value={eventoSelecionado}
          onChange={e => setEventoSelecionado(e.target.value)}
          style={styles.select}
        >
          <option value="">Selecione o evento...</option>
          {eventosAtivos.map(evento => (
            <option key={evento.id} value={evento.id}>
              {evento.titulo} {evento.data ? `· ${new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Erro */}
      {erro && (
        <div style={styles.erroMsg}>
          <AlertCircle size={16} color="#a32d2d" />
          {erro}
        </div>
      )}

      {/* Sucesso */}
      {sucesso && (
        <div style={{
          ...styles.sucessoMsg,
          background: sucesso.tipo === 'ok' ? '#e6f4ef' : '#fdf6e3',
          borderColor: sucesso.tipo === 'ok' ? '#2e7d5e' : '#C9A84C',
          color: sucesso.tipo === 'ok' ? '#1a4d38' : '#7a5c00',
        }}>
          <CheckCircle size={16} />
          {sucesso.msg}
          <button style={styles.novaScanBtn} onClick={handleNovaScan}>
            Nova leitura
          </button>
        </div>
      )}

      {/* Resultado do scan */}
      {resultado && !sucesso && (
        <div style={styles.resultadoCard}>
          <div style={styles.resultadoCabecalho}>
            <CheckCircle size={18} color="#2e7d5e" />
            <span style={styles.resultadoTitulo}>QR Code lido com sucesso</span>
          </div>
          <div style={styles.resultadoInfo}>
            <div style={styles.resultadoAvatar}>
              {resultado.nome?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.resultadoDados}>
              <span style={styles.resultadoNome}>{resultado.nome}</span>
              <div style={styles.resultadoGrid}>
                <div style={styles.resultadoItem}>
                  <span style={styles.resultadoLabel}>Matrícula</span>
                  <span style={styles.resultadoValor}>{resultado.matricula}</span>
                </div>
                <div style={styles.resultadoItem}>
                  <span style={styles.resultadoLabel}>Turma</span>
                  <span style={styles.resultadoValor}>{resultado.turma || '—'}</span>
                </div>
                <div style={styles.resultadoItem}>
                  <span style={styles.resultadoLabel}>Perfil</span>
                  <span style={styles.resultadoValor}>{resultado.role}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.resultadoBotoes}>
            <button
              style={styles.botaoConfirmar}
              onClick={handleRegistrarPresenca}
              disabled={registrando}
            >
              {registrando ? 'Registrando...' : '✓ Confirmar Presença'}
            </button>
            <button style={styles.botaoCancelar} onClick={handleNovaScan}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Scanner */}
      {!resultado && !sucesso && (
        <div style={styles.scannerArea}>
          <div id="qr-reader" ref={scannerRef} style={{
            ...styles.qrReader,
            display: scanning ? 'block' : 'none',
          }} />

          {!scanning && (
            <div style={styles.scannerPlaceholder}>
              <div style={styles.scannerIcone}>
                <ScanLine size={48} color="rgba(255,255,255,0.4)" />
              </div>
              <p style={styles.scannerTexto}>
                Selecione um evento e clique em iniciar para escanear o QR Code do aluno
              </p>
              <button
                style={styles.botaoIniciar}
                onClick={iniciarScan}
              >
                <ScanLine size={16} />
                Iniciar Scanner
              </button>
            </div>
          )}

          {scanning && (
            <button style={styles.botaoParar} onClick={pararScan}>
              <X size={14} />
              Parar Scanner
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
  badgeRestrito: {
    background: '#f9f0f0',
    color: 'var(--vinho)',
    fontSize: '11px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(107,26,26,0.2)',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    border: '0.5px solid var(--border)',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitulo: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '10px',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    background: 'var(--surface)',
    outline: 'none',
  },
  erroMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fcebeb',
    color: '#a32d2d',
    fontSize: '13px',
    padding: '12px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #e24b4a',
  },
  sucessoMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    padding: '12px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid',
    flexWrap: 'wrap',
  },
  novaScanBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'inherit',
    textDecoration: 'underline',
  },
  resultadoCard: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #2e7d5e',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  resultadoCabecalho: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
    paddingBottom: '12px',
    borderBottom: '0.5px solid var(--border)',
  },
  resultadoTitulo: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2e7d5e',
  },
  resultadoInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  resultadoAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultadoDados: {
    flex: 1,
  },
  resultadoNome: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    display: 'block',
    marginBottom: '8px',
  },
  resultadoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
  },
  resultadoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  resultadoLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  resultadoValor: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  resultadoBotoes: {
    display: 'flex',
    gap: '10px',
  },
  botaoConfirmar: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
    color: 'white',
    padding: '11px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
  botaoCancelar: {
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    padding: '11px 20px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    border: '1px solid var(--border)',
  },
  scannerArea: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '0.5px solid var(--border)',
  },
  qrReader: {
    width: '100%',
  },
  scannerPlaceholder: {
    background: 'linear-gradient(135deg, #1a3a2a, #1a2e45)',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  scannerIcone: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    textAlign: 'center',
    lineHeight: '1.6',
    maxWidth: '280px',
  },
  botaoIniciar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--gold)',
    color: 'var(--preto)',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 12px rgba(201,168,76,0.4)',
  },
  botaoParar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    background: '#fcebeb',
    color: '#a32d2d',
    padding: '12px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
}
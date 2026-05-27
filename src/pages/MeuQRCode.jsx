import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import QRCode from 'qrcode'

export default function MeuQRCode() {
  const { perfil, user } = useAuth()
  const canvasRef = useRef(null)

  const dadosQR = JSON.stringify({
    uid: user?.uid,
    nome: perfil?.nome || '',
    matricula: perfil?.matricula || 'sem-matricula',
    turma: perfil?.turma || '',
    role: perfil?.role || '',
  })

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, dadosQR, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0d1b2a',
        light: '#ffffff',
      },
    })
  }, [dadosQR])

  return (
    <div>

      <div style={styles.cabecalho}>
        <div style={styles.cabecalhoIcone}>
          <span style={{ fontSize: '18px' }}>🪪</span>
        </div>
        <div>
          <h2 style={styles.titulo}>Meu QR Code</h2>
          <p style={styles.subtitulo}>Identificação digital institucional</p>
        </div>
      </div>

      <div style={styles.card}>

        <div style={styles.cardTopo}>
          <div style={styles.cardTopoEsquerda}>
            <span style={styles.cardInstituto}>CPM · ALAGOAS</span>
            <span style={styles.cardLabel}>Identificação Institucional</span>
          </div>
          <div style={styles.cardSelo}>
            <span style={styles.cardSeloTexto}>NEXUS</span>
          </div>
        </div>

        <div style={styles.qrArea}>
          <canvas ref={canvasRef} style={styles.qrCanvas} />
        </div>

        <div style={styles.infoArea}>
          <div style={styles.infoNome}>{perfil?.nome || 'Nome não cadastrado'}</div>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Matrícula</span>
              <span style={styles.infoValor}>
                {perfil?.matricula || 'Não cadastrada'}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Turma</span>
              <span style={styles.infoValor}>
                {perfil?.turma || 'Não cadastrada'}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Perfil</span>
              <span style={styles.infoValor}>
                {perfil?.role || ''}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.cardRodape}>
          <span style={styles.rodapeTexto}>
            Apresente este código ao responsável para confirmação de presença
          </span>
        </div>

      </div>

      <div style={styles.aviso}>
        <span style={styles.avisoIcone}>⚠️</span>
        <span style={styles.avisoTexto}>
          Não compartilhe seu QR Code. Ele é pessoal e intransferível.
        </span>
      </div>

    </div>
  )
}

const styles = {
  cabecalho: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  cabecalhoIcone: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #1a3a6b, #2e7d5e)',
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
  card: {
    background: 'white',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    border: '0.5px solid var(--border)',
    maxWidth: '360px',
    margin: '0 auto 16px',
  },
  cardTopo: {
    background: 'linear-gradient(135deg, #1a3a2a, #1a2e45)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTopoEsquerda: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  cardInstituto: {
    color: 'var(--gold)',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2px',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '10px',
    letterSpacing: '0.5px',
  },
  cardSelo: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid var(--gold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSeloTexto: {
    color: 'var(--gold)',
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  qrArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'white',
  },
  qrCanvas: {
    borderRadius: '8px',
    display: 'block',
  },
  infoArea: {
    padding: '16px 20px',
    background: 'var(--surface)',
    borderTop: '0.5px solid var(--border)',
  },
  infoNome: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '12px',
    textAlign: 'center',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValor: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    textAlign: 'center',
  },
  cardRodape: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #1a3a2a, #1a2e45)',
  },
  rodapeTexto: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '10px',
    textAlign: 'center',
    display: 'block',
    lineHeight: '1.5',
  },
  aviso: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fdf6e3',
    border: '1px solid #C9A84C',
    borderRadius: '8px',
    padding: '10px 14px',
    maxWidth: '360px',
    margin: '0 auto',
  },
  avisoIcone: {
    fontSize: '14px',
    flexShrink: 0,
  },
  avisoTexto: {
    fontSize: '11px',
    color: '#7a5c00',
    lineHeight: '1.5',
  },
}
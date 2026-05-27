import { useAuth } from '../../context/AuthContext'
import { Menu } from 'lucide-react'

export default function Topbar({ abrirMenu }) {
  const { perfil } = useAuth()

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div style={styles.topbar}>
      <div style={styles.esquerda}>
        {/* Botão hambúrguer — só aparece no mobile */}
        <button
          style={styles.menuBtn}
          onClick={abrirMenu}
          aria-label="Abrir menu"
        >
          <Menu size={20} color="var(--text-primary)" />
        </button>
        <div>
          <div style={styles.titulo}>Painel Principal</div>
          <div style={styles.data}>{hoje}</div>
        </div>
      </div>
      <div style={styles.bemVindo}>
        Olá, {perfil?.nome?.split(' ')[0] || 'Usuário'}
      </div>
    </div>
  )
}

const styles = {
  topbar: {
    background: 'white',
    borderBottom: '0.5px solid var(--border)',
    padding: '0 24px',
    height: 'var(--topbar-height)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  esquerda: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  menuBtn: {
    display: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    // Vai aparecer só no mobile via media query no index.css
  },
  titulo: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  data: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize',
  },
  bemVindo: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
}
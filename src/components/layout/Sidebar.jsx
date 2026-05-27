import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { LayoutDashboard, Bell, Calendar, FileText, Shield, LogOut, Star, Images, Users, X, QrCode, ScanLine, Trophy, Info } from 'lucide-react'
import { auth } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { podeAcessarAreaMilitar, nomeDoRole } from '../../utils/roles'

const navItems = [
  { to: '/',           label: 'Dashboard',   Icon: LayoutDashboard, exact: true },
  { to: '/avisos',     label: 'Comunicados', Icon: Bell },
  { to: '/eventos',    label: 'Eventos',     Icon: Star },
  { to: '/clubes',     label: 'Clubes',      Icon: Users },
  { to: '/calendario', label: 'Calendário',  Icon: Calendar },
  { to: '/galeria',    label: 'Galeria',     Icon: Images },
  { to: '/documentos', label: 'Documentos',  Icon: FileText },
  { to: '/qrcode',     label: 'Meu QR Code', Icon: QrCode },
  { to: '/olimpiadas', label: 'Olimpiadas',  Icon: Trophy },
  { to: '/sobre', label: 'Sobre o Sistema', Icon: Info },
]

export default function Sidebar({ menuAberto, fecharMenu }) {
  const { perfil } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login')
  }

  const iniciais = perfil?.nome
    ? perfil.nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : '?'

  return (
    <aside style={{...styles.sidebar}} className={`sidebar ${menuAberto ? 'sidebar-aberta' : ''}`}>

      <div style={styles.glassOverlay} />

      <button style={styles.fecharBtn} onClick={fecharMenu} className="sidebar-fechar">
        <X size={18} color="rgba(255,255,255,0.6)" />
      </button>

      {/* Logo */}
      <div style={styles.brand}>
        <div style={styles.brandIcone}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a1a">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/>
          </svg>
        </div>
        <div>
          <div style={styles.brandNome}>Nexus</div>
          <div style={styles.brandSub}>CPM Alagoas</div>
        </div>
      </div>

      {/* Navegação */}
      <nav style={styles.nav}>
        <div style={styles.secao}>
          <span style={styles.secaoLabel}>Principal</span>
          {navItems.map(({ to, label, Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={fecharMenu}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemAtivo : {})
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Área restrita */}
        {podeAcessarAreaMilitar(perfil?.role) && (
          <div style={styles.secao}>
            <span style={styles.secaoLabel}>Restrito</span>
            <NavLink
              to="/militar"
              onClick={fecharMenu}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemAtivo : {})
              })}
            >
              <Shield size={16} />
              Área Militar
            </NavLink>
            <NavLink
              to="/scanner"
              onClick={fecharMenu}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemAtivo : {})
              })}
            >
              <ScanLine size={16} />
              Scanner
            </NavLink>
          </div>
        )}
      </nav>

      {/* Usuário */}
      <div style={styles.usuarioArea}>
        <div style={styles.avatar}>{iniciais}</div>
        <div style={styles.usuarioInfo}>
          <span style={styles.usuarioNome}>{perfil?.nome || 'Usuário'}</span>
          <span style={styles.usuarioRole}>{nomeDoRole[perfil?.role] || ''}</span>
        </div>
        <button onClick={handleLogout} style={styles.sairBtn} title="Sair">
          <LogOut size={15} color="rgba(255,255,255,0.4)" />
        </button>
      </div>

    </aside>
  )
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    background: 'linear-gradient(160deg, #1a3a2a 0%, #0d1b2a 50%, #2a1520 100%)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 100,
    borderRight: '1px solid rgba(255,255,255,0.08)',
  },
  glassOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, rgba(46,125,94,0.15) 0%, rgba(26,58,107,0.1) 50%, rgba(107,26,26,0.15) 100%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  fecharBtn: {
    display: 'none',
    position: 'absolute',
    top: '14px',
    right: '14px',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
    border: 'none',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '18px 16px',
    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
    position: 'relative',
    zIndex: 1,
  },
  brandIcone: {
    width: '32px',
    height: '32px',
    background: 'var(--gold)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(201,168,76,0.4)',
  },
  brandNome: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.3px',
  },
  brandSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '10px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  nav: {
    flex: 1,
    padding: '14px 10px',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 1,
  },
  secao: {
    marginBottom: '20px',
  },
  secaoLabel: {
    display: 'block',
    color: 'rgba(255,255,255,0.2)',
    fontSize: '9px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '0 8px',
    marginBottom: '6px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 10px',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    fontWeight: '400',
    marginBottom: '2px',
    transition: 'all 0.15s',
    border: '1px solid transparent',
  },
  navItemAtivo: {
    background: 'rgba(201,168,76,0.9)',
    color: '#1a1a1a',
    fontWeight: '500',
    border: '1px solid rgba(201,168,76,0.3)',
    boxShadow: '0 2px 8px rgba(201,168,76,0.25)',
  },
  usuarioArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderTop: '0.5px solid rgba(255,255,255,0.08)',
    position: 'relative',
    zIndex: 1,
    background: 'rgba(0,0,0,0.15)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid var(--gold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--gold)',
    fontSize: '11px',
    fontWeight: '600',
    flexShrink: 0,
  },
  usuarioInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  usuarioNome: {
    display: 'block',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  usuarioRole: {
    display: 'block',
    color: 'rgba(255,255,255,0.35)',
    fontSize: '10px',
  },
  sairBtn: {
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
}
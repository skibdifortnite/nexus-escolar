import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div style={styles.shell}>

      {menuAberto && (
        <div
          style={styles.overlay}
          onClick={() => setMenuAberto(false)}
        />
      )}

      <Sidebar
        menuAberto={menuAberto}
        fecharMenu={() => setMenuAberto(false)}
      />

      <div style={styles.main}>
        <Topbar abrirMenu={() => setMenuAberto(true)} />
        <main style={styles.conteudo}>
          <Outlet />
        </main>
      </div>

    </div>
  )
}

const styles = {
  shell: {
    display: 'flex',
    height: '100dvh',
    width: '100vw',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 99,
    backdropFilter: 'blur(2px)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  },
  conteudo: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '20px 24px',
    WebkitOverflowScrolling: 'touch',
  },
}
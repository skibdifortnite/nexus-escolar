import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      await signInWithEmailAndPassword(auth, email, senha)
      navigate('/')
    } catch (err) {
      setErro('E-mail ou senha incorretos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={styles.pagina}>
      <div style={styles.caixa}>

        {/* Logo */}
        <div style={styles.topo}>
          <div style={styles.icone}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#1a1a1a">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/>
            </svg>
          </div>
          <h1 style={styles.titulo}>Nexus Escolar</h1>
          <p style={styles.subtitulo}>CPM</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.campo}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div style={styles.erro}>
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            style={styles.botao}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={styles.rodape}>
          Problemas para acessar? Entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}

const styles = {
  pagina: {
    minHeight: '100vh',
    background: 'var(--vinho)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  caixa: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '380px',
  },
  topo: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  icone: {
    width: '56px',
    height: '56px',
    background: 'var(--gold)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  titulo: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--vinho)',
    marginBottom: '4px',
  },
  subtitulo: {
    fontSize: '10px',
    letterSpacing: '1.5px',
    color: 'var(--text-secondary)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  input: {
    padding: '11px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    outline: 'none',
    background: 'var(--surface)',
  },
  erro: {
    background: 'var(--danger-bg)',
    color: 'var(--danger-text)',
    fontSize: '12px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
  },
  botao: {
    background: 'var(--vinho)',
    color: 'white',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
    letterSpacing: '0.5px',
  },
  rodape: {
    textAlign: 'center',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '24px',
  },
}
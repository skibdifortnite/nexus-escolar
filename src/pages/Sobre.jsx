import { useNavigate } from 'react-router-dom'
import { Shield, Bell, Calendar, Users, Trophy, QrCode, Images, FileText, ChevronRight } from 'lucide-react'

const funcionalidades = [
  { icone: Bell,     cor: '#6B1A1A', bg: '#f9f0f0', titulo: 'Comunicados',     desc: 'Avisos institucionais com filtro por público-alvo. Professores, militares e administradores publicam. Alunos e responsáveis recebem.' },
  { icone: Calendar, cor: '#1a3a6b', bg: '#e6edf8', titulo: 'Calendário',       desc: 'Calendário escolar completo com feriados federais e estaduais de Alagoas pré-cadastrados e eventos adicionados pela escola.' },
  { icone: Users,    cor: '#2e7d5e', bg: '#e6f4ef', titulo: 'Clubes',           desc: 'Espaço para clubes e projetos extracurriculares. Alunos solicitam participação. Responsáveis aprovam ou recusam.' },
  { icone: Trophy,   cor: '#C9A84C', bg: '#fdf6e3', titulo: 'Olimpíadas',       desc: 'Olimpíadas escolares com formulário de inscrição personalizado e exportação de dados em planilha Excel.' },
  { icone: QrCode,   cor: '#6B1A1A', bg: '#f9f0f0', titulo: 'QR Code',         desc: 'Cada usuário possui um QR Code único com nome e matrícula para identificação institucional e registro de presença.' },
  { icone: Images,   cor: '#1a3a6b', bg: '#e6edf8', titulo: 'Galeria',         desc: 'Fotos de eventos e cerimônias organizadas em álbuns institucionais, integradas ao Google Drive da escola.' },
  { icone: FileText, cor: '#2e7d5e', bg: '#e6f4ef', titulo: 'Documentos',      desc: 'Repositório de documentos institucionais: autorizações, regimentos, calendários e circulares sempre acessíveis.' },
  { icone: Shield,   cor: '#C9A84C', bg: '#fdf6e3', titulo: 'Área Militar',    desc: 'Painel exclusivo para militares com publicação de comunicados oficiais, histórico e controle de presença em eventos.' },
]

const comparacao = [
  { item: 'Comunicados organizados por categoria',  nexus: true,  instagram: false },
  { item: 'Filtro por público-alvo',                nexus: true,  instagram: false },
  { item: 'Acesso sem conta em rede social',        nexus: true,  instagram: false },
  { item: 'Controle de permissões por cargo',       nexus: true,  instagram: false },
  { item: 'Calendário com feriados de Alagoas',     nexus: true,  instagram: false },
  { item: 'Documentos sempre disponíveis',          nexus: true,  instagram: false },
  { item: 'Galeria institucional organizada',       nexus: true,  instagram: false },
  { item: 'Identificação por QR Code',              nexus: true,  instagram: false },
  { item: 'Registro de presença em eventos',        nexus: true,  instagram: false },
  { item: 'Sem elementos viciantes',                nexus: true,  instagram: false },
  { item: 'Adequado para crianças',                 nexus: true,  instagram: false },
  { item: 'Informação permanente e organizada',     nexus: true,  instagram: false },
]

export default function Sobre() {
  const navigate = useNavigate()

  return (
    <div>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroCirculo1} />
        <div style={styles.heroCirculo2} />
        <div style={styles.heroConteudo}>
          <div style={styles.heroSelo}>
            <Shield size={28} color="var(--gold)" />
          </div>
          <h1 style={styles.heroTitulo}>Nexus Escolar</h1>
          <p style={styles.heroSub}>
            Plataforma institucional do Colégio da Polícia Militar de Alagoas
          </p>
          <div style={styles.heroBadges}>
            <span style={styles.heroBadge}>Disciplina</span>
            <span style={styles.heroBadge}>Ordem</span>
            <span style={styles.heroBadge}>Educação</span>
          </div>
        </div>
      </div>

      {/* O problema */}
      <div style={styles.card}>
        <div style={styles.cardCabecalho}>
          <div style={styles.cardIcone} />
          <h2 style={styles.cardTitulo}>O Problema que Resolvemos</h2>
        </div>
        <p style={styles.cardTexto}>
          O CPM Alagoas utiliza atualmente o Instagram como principal canal de comunicação institucional. Isso cria um problema sério: muitos alunos, especialmente os mais jovens, não possuem — e não deveriam ter — conta em redes sociais. Pais e responsáveis precisam de uma conta no Instagram apenas para acompanhar avisos da escola.
        </p>
        <p style={styles.cardTexto}>
          Além disso, comunicados importantes se perdem em meio a conteúdo de entretenimento. Informações não ficam organizadas, não há controle de acesso e qualquer pessoa pode ver publicações institucionais sem filtro.
        </p>
        <div style={styles.destaque}>
          <span style={styles.destaqueTexto}>
            "Crianças não deveriam depender do Instagram para acompanhar a própria escola."
          </span>
        </div>
      </div>

      {/* A solução */}
      <div style={styles.card}>
        <div style={styles.cardCabecalho}>
          <div style={styles.cardIcone} />
          <h2 style={styles.cardTitulo}>Nossa Solução</h2>
        </div>
        <p style={styles.cardTexto}>
          O Nexus Escolar é uma plataforma institucional própria, desenvolvida especificamente para o CPM Alagoas. Ela centraliza toda a comunicação escolar em um ambiente seguro, organizado e acessível para toda a comunidade — alunos, responsáveis, professores e militares.
        </p>
        <p style={styles.cardTexto}>
          O sistema foi projetado para transmitir os valores do colégio: disciplina, organização e clareza. Não é uma rede social. É uma ferramenta institucional séria, moderna e acessível.
        </p>
      </div>

      {/* Funcionalidades */}
      <div style={styles.card}>
        <div style={styles.cardCabecalho}>
          <div style={styles.cardIcone} />
          <h2 style={styles.cardTitulo}>Funcionalidades</h2>
        </div>
        <div style={styles.gridFuncionalidades}>
          {funcionalidades.map(({ icone: Icone, cor, bg, titulo, desc }) => (
            <div key={titulo} style={styles.funcCard}>
              <div style={{ ...styles.funcIcone, background: bg }}>
                <Icone size={20} color={cor} />
              </div>
              <div style={styles.funcInfo}>
                <div style={styles.funcTitulo}>{titulo}</div>
                <div style={styles.funcDesc}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparação */}
      <div style={styles.card}>
        <div style={styles.cardCabecalho}>
          <div style={styles.cardIcone} />
          <h2 style={styles.cardTitulo}>Nexus Escolar vs Instagram</h2>
        </div>
        <div style={styles.tabelaWrapper}>
          <div style={styles.tabelaCabecalho}>
            <div style={styles.tabelaItem}>Funcionalidade</div>
            <div style={{ ...styles.tabelaColuna, background: 'linear-gradient(135deg, #1a3a2a, #1a2e45)' }}>
              <span style={styles.tabelaColunaTexto}>Nexus</span>
            </div>
            <div style={{ ...styles.tabelaColuna, background: '#e8e8e8' }}>
              <span style={{ ...styles.tabelaColunaTexto, color: '#666' }}>Instagram</span>
            </div>
          </div>
          {comparacao.map(({ item, nexus, instagram }) => (
            <div key={item} style={styles.tabelaLinha}>
              <div style={styles.tabelaItem}>{item}</div>
              <div style={styles.tabelaCelula}>
                <span style={nexus ? styles.sim : styles.nao}>{nexus ? '✓' : '✗'}</span>
              </div>
              <div style={styles.tabelaCelula}>
                <span style={instagram ? styles.sim : styles.nao}>{instagram ? '✓' : '✗'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Níveis de acesso */}
      <div style={styles.card}>
        <div style={styles.cardCabecalho}>
          <div style={styles.cardIcone} />
          <h2 style={styles.cardTitulo}>Níveis de Acesso</h2>
        </div>
        <div style={styles.nivelLista}>
          {[
            { role: 'Administrador',         cor: '#6B1A1A', desc: 'Acesso total ao sistema. Gerencia usuários, publica comunicados e acessa todas as áreas.' },
            { role: 'Militar Institucional',  cor: '#1a3a6b', desc: 'Publica comunicados oficiais, acessa área restrita, usa scanner QR e gerencia eventos.' },
            { role: 'Professor',              cor: '#2e7d5e', desc: 'Publica comunicados, adiciona eventos ao calendário e gerencia clubes.' },
            { role: 'Aluno',                  cor: '#C9A84C', desc: 'Visualiza comunicados, se inscreve em eventos e olimpíadas, participa de clubes.' },
            { role: 'Responsável',            cor: '#8a9bb0', desc: 'Visualiza comunicados direcionados, documentos e eventos da escola.' },
          ].map(({ role, cor, desc }) => (
            <div key={role} style={{ ...styles.nivelItem, borderLeft: `4px solid ${cor}` }}>
              <div style={{ ...styles.nivelRole, color: cor }}>{role}</div>
              <div style={styles.nivelDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filosofia */}
      <div style={styles.filosofia}>
        <div style={styles.filosofiaOverlay} />
        <div style={styles.filosofiaConteudo}>
          <h2 style={styles.filosofiaTitulo}>Tecnologia a Serviço da Educação</h2>
          <p style={styles.filosofiaTexto}>
            O Nexus Escolar foi desenvolvido seguindo o princípio da "tecnologia calma" — sistemas que informam sem criar dependência, que servem ao usuário sem elementos viciantes, que fortalecem a comunicação institucional sem substituir a relação humana.
          </p>
          <p style={styles.filosofiaTexto}>
            A plataforma é acessível, leve e funciona em qualquer dispositivo — desde celulares simples até computadores antigos. Foi pensada para que nenhum aluno fique sem acesso à informação por limitações tecnológicas.
          </p>
          <div style={styles.filosofiaBadges}>
            <span style={styles.filosofiaBadge}>Sem anúncios</span>
            <span style={styles.filosofiaBadge}>Sem algoritmos</span>
            <span style={styles.filosofiaBadge}>Sem vício digital</span>
            <span style={styles.filosofiaBadge}>100% institucional</span>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div style={styles.rodape}>
        <div style={styles.rodapeLinha} />
        <div style={styles.rodapeTexto}>
          <span style={styles.rodapeTitulo}>Nexus Escolar — CPM Alagoas</span>
          <span style={styles.rodapeSub}>Disciplina · Ordem · Educação</span>
          <span style={styles.rodapeVersao}>Versão 1.0 — 2026</span>
        </div>
        <div style={styles.rodapeLinha} />
      </div>

    </div>
  )
}

const styles = {
  hero: {
    borderRadius: '14px',
    padding: '40px 28px',
    marginBottom: '20px',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1a3a2a 0%, #0d1b2a 50%, #2a1520 100%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    textAlign: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(46,125,94,0.2) 0%, rgba(26,58,107,0.15) 50%, rgba(107,26,26,0.2) 100%)',
    pointerEvents: 'none',
  },
  heroCirculo1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: '1px solid rgba(201,168,76,0.1)',
    top: '-100px',
    right: '-50px',
    pointerEvents: 'none',
  },
  heroCirculo2: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.04)',
    bottom: '-80px',
    left: '-40px',
    pointerEvents: 'none',
  },
  heroConteudo: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  heroSelo: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '2px solid rgba(201,168,76,0.6)',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  heroTitulo: {
    color: 'white',
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    maxWidth: '400px',
    lineHeight: '1.6',
  },
  heroBadges: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroBadge: {
    background: 'rgba(201,168,76,0.15)',
    color: 'var(--gold)',
    border: '1px solid rgba(201,168,76,0.3)',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    border: '0.5px solid var(--border)',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardCabecalho: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    paddingBottom: '14px',
    borderBottom: '0.5px solid var(--border)',
  },
  cardIcone: {
    width: '4px',
    height: '20px',
    background: 'linear-gradient(to bottom, #6B1A1A, #C9A84C)',
    borderRadius: '2px',
    flexShrink: 0,
  },
  cardTitulo: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  cardTexto: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.8',
    marginBottom: '12px',
  },
  destaque: {
    background: 'linear-gradient(135deg, #1a3a2a, #1a2e45)',
    borderRadius: '10px',
    padding: '16px 20px',
    marginTop: '8px',
  },
  destaqueTexto: {
    color: 'var(--gold)',
    fontSize: '14px',
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: '1.6',
  },
  gridFuncionalidades: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  funcCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px',
    background: 'var(--surface)',
    borderRadius: '10px',
    border: '0.5px solid var(--border)',
  },
  funcIcone: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  funcInfo: {
    flex: 1,
  },
  funcTitulo: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  funcDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  tabelaWrapper: {
    borderRadius: '10px',
    overflow: 'hidden',
    border: '0.5px solid var(--border)',
  },
  tabelaCabecalho: {
    display: 'grid',
    gridTemplateColumns: '1fr 100px 100px',
    background: 'var(--surface)',
  },
  tabelaColuna: {
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabelaColunaTexto: {
    color: 'white',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  tabelaLinha: {
    display: 'grid',
    gridTemplateColumns: '1fr 100px 100px',
    borderTop: '0.5px solid var(--border)',
  },
  tabelaItem: {
    padding: '11px 14px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
  },
  tabelaCelula: {
    padding: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: '0.5px solid var(--border)',
  },
  sim: {
    color: '#2e7d5e',
    fontSize: '16px',
    fontWeight: '700',
  },
  nao: {
    color: '#e24b4a',
    fontSize: '16px',
    fontWeight: '700',
  },
  nivelLista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  nivelItem: {
    padding: '12px 16px',
    borderRadius: '8px',
    background: 'var(--surface)',
  },
  nivelRole: {
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '4px',
    letterSpacing: '0.3px',
  },
  nivelDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  filosofia: {
    borderRadius: '12px',
    padding: '32px 28px',
    marginBottom: '16px',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0d1b2a, #1a3a2a)',
  },
  filosofiaOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(26,58,107,0.2), rgba(46,125,94,0.2))',
    pointerEvents: 'none',
  },
  filosofiaConteudo: {
    position: 'relative',
    zIndex: 1,
  },
  filosofiaTitulo: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  filosofiaTexto: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '13px',
    lineHeight: '1.8',
    marginBottom: '12px',
  },
  filosofiaBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  filosofiaBadge: {
    background: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
  },
  rodape: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
  },
  rodapeLinha: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, #6B1A1A, #C9A84C)',
    opacity: 0.4,
  },
  rodapeTexto: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  rodapeTitulo: {
    color: 'var(--vinho)',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  rodapeSub: {
    color: 'var(--gold)',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  rodapeVersao: {
    color: 'var(--text-muted)',
    fontSize: '10px',
  },
}
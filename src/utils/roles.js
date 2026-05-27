// Define os papéis disponíveis no sistema
export const ROLES = {
  ADMIN: 'admin',
  MILITAR: 'militar',
  PROFESSOR: 'professor',
  ALUNO: 'aluno',
  RESPONSAVEL: 'responsavel',
}

// Quem pode publicar comunicados
export const podePublicar = (role) =>
  [ROLES.ADMIN, ROLES.MILITAR, ROLES.PROFESSOR].includes(role)

// Quem pode acessar a área militar
export const podeAcessarAreaMilitar = (role) =>
  [ROLES.ADMIN, ROLES.MILITAR].includes(role)

// Quem pode gerenciar usuários
export const podeGerenciarUsuarios = (role) =>
  role === ROLES.ADMIN

// Nome legível de cada papel
export const nomeDoRole = {
  admin: 'Administrador',
  militar: 'Militar Institucional',
  professor: 'Professor',
  aluno: 'Aluno',
  responsavel: 'Responsável',
}

// Quem pode criar clubes
export const podeCriarClube = (role) =>
  ['admin', 'militar', 'professor'].includes(role)

// Quem pode tornar um aluno responsável de clube
export const podeElegivelResponsavel = (role) =>
  ['admin', 'militar'].includes(role)
import { useState, useEffect } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '../services/firebase'

// Tipos de clube
export const TIPOS_CLUBE = {
  aberto: {
    label: 'Aberto',
    cor: '#2e7d5e',
    bg: '#e6f4ef',
    texto: '#1a4d38',
    descricao: 'Qualquer aluno pode solicitar participação',
  },
  seletivo: {
    label: 'Seletivo',
    cor: '#1a3a6b',
    bg: '#e6edf8',
    texto: '#1a3a6b',
    descricao: 'Exige aprovação do responsável',
  },
  fechado: {
    label: 'Fechado',
    cor: '#8a9bb0',
    bg: '#f2f2f2',
    texto: '#444',
    descricao: 'Não está aceitando novos membros',
  },
}

// Categorias de clubes
export const CATEGORIAS_CLUBE = [
  'Esportes',
  'Artes',
  'Tecnologia',
  'Ciências',
  'Literatura',
  'Música',
  'Militar',
  'Olimpíadas',
  'Outros',
]

// Hook principal — lista todos os clubes
export function useClubes() {
  const [clubes, setClubes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'clubes'),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const dados = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      setClubes(dados)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { clubes, loading }
}

// Hook para um clube específico
export function useClube(clubeId) {
  const [clube, setClube] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clubeId) return

    const unsubscribe = onSnapshot(doc(db, 'clubes', clubeId), (snap) => {
      if (snap.exists()) {
        setClube({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    })

    return unsubscribe
  }, [clubeId])

  return { clube, loading }
}

// Hook para solicitações de um clube
export function useSolicitacoes(clubeId) {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clubeId) return

    const q = query(
      collection(db, 'clubes', clubeId, 'solicitacoes'),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const dados = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      setSolicitacoes(dados)
      setLoading(false)
    })

    return unsubscribe
  }, [clubeId])

  return { solicitacoes, loading }
}

// Hook para membros de um clube
export function useMembros(clubeId) {
  const [membros, setMembros] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!clubeId) return

    const q = query(
      collection(db, 'clubes', clubeId, 'membros'),
      orderBy('entradoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const dados = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      setMembros(dados)
      setLoading(false)
    })

    return unsubscribe
  }, [clubeId])

  return { membros, loading }
}

// Verifica se o usuário já é membro de um clube
export async function verificarMembroClube(clubeId, userId) {
  const snap = await getDoc(doc(db, 'clubes', clubeId, 'membros', userId))
  return snap.exists()
}

// Verifica se o usuário já tem solicitação pendente
export async function verificarSolicitacaoPendente(clubeId, userId) {
  const snap = await getDoc(doc(db, 'clubes', clubeId, 'solicitacoes', userId))
  return snap.exists() ? snap.data() : null
}

// Verifica se o usuário pode gerenciar o clube
export function podeGerenciarClube(perfil, clube) {
  if (!perfil || !clube) return false

  // Admin e militar podem gerenciar qualquer clube
  if (['admin', 'militar'].includes(perfil.role)) return true

  // Professor pode gerenciar clubes que criou ou é responsável
  if (perfil.role === 'professor') {
    return clube.autorId === perfil.uid || clube.responsavelId === perfil.uid
  }

  // Aluno elegível pode gerenciar se for responsável do clube
  if (perfil.role === 'aluno') {
    return clube.responsavelId === perfil.uid
  }

  return false
}
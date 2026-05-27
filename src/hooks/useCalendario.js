import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

// Feriados fixos de 2026 — federais e estaduais de Alagoas
export const feriados2026 = [
  // Federais
  { data: '2026-01-01', nome: 'Confraternização Universal',      tipo: 'federal' },
  { data: '2026-02-16', nome: 'Carnaval',                        tipo: 'federal' },
  { data: '2026-02-17', nome: 'Carnaval',                        tipo: 'federal' },
  { data: '2026-02-18', nome: 'Quarta-feira de Cinzas',          tipo: 'federal' },
  { data: '2026-04-03', nome: 'Sexta-feira Santa',               tipo: 'federal' },
  { data: '2026-04-05', nome: 'Páscoa',                          tipo: 'federal' },
  { data: '2026-04-21', nome: 'Tiradentes',                      tipo: 'federal' },
  { data: '2026-05-01', nome: 'Dia do Trabalho',                 tipo: 'federal' },
  { data: '2026-06-04', nome: 'Corpus Christi',                  tipo: 'federal' },
  { data: '2026-09-07', nome: 'Independência do Brasil',         tipo: 'federal' },
  { data: '2026-10-12', nome: 'Nossa Sra. Aparecida',            tipo: 'federal' },
  { data: '2026-11-02', nome: 'Finados',                         tipo: 'federal' },
  { data: '2026-11-15', nome: 'Proclamação da República',        tipo: 'federal' },
  { data: '2026-11-20', nome: 'Consciência Negra',               tipo: 'federal' },
  { data: '2026-12-25', nome: 'Natal',                           tipo: 'federal' },

  // Estaduais — Alagoas
  { data: '2026-06-24', nome: 'São João (AL)',                   tipo: 'estadual' },
  { data: '2026-06-29', nome: 'São Pedro (AL)',                  tipo: 'estadual' },
  { data: '2026-09-16', nome: 'Emancipação Política de AL',      tipo: 'estadual' },
  { data: '2026-11-20', nome: 'Consciência Negra (AL)',          tipo: 'estadual' },
  { data: '2026-12-08', nome: 'Nossa Sra. da Conceição (AL)',    tipo: 'estadual' },
]

export const categorias = {
  federal:  { cor: '#e24b4a', bg: '#fcebeb', texto: '#a32d2d', label: 'Feriado Federal' },
  estadual: { cor: '#e8872a', bg: '#fef0e6', texto: '#9a4e0f', label: 'Feriado Estadual' },
  evento:   { cor: '#C9A84C', bg: '#fdf6e3', texto: '#7a5c00', label: 'Evento Escolar' },
  prova:    { cor: '#1a3a6b', bg: '#e6edf8', texto: '#1a3a6b', label: 'Prova / Avaliação' },
  reuniao:  { cor: '#2e7d5e', bg: '#e6f4ef', texto: '#1a4d38', label: 'Reunião' },
  militar:  { cor: '#6B1A1A', bg: '#f9f0f0', texto: '#6B1A1A', label: 'Atividade Militar' },
}

export function useCalendario() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'calendario'),
      orderBy('data', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const dados = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setItens(dados)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Junta feriados fixos com itens do Firestore
  function getItensDoDia(dataStr) {
    const feriadosDoDia = feriados2026.filter(f => f.data === dataStr)
    const itensDoDia = itens.filter(i => i.data === dataStr)
    return [...feriadosDoDia, ...itensDoDia]
  }

  // Retorna todas as datas que têm alguma coisa
  function getDatasComItens() {
    const datas = new Set()
    feriados2026.forEach(f => datas.add(f.data))
    itens.forEach(i => datas.add(i.data))
    return datas
  }

  return { itens, loading, getItensDoDia, getDatasComItens }
}
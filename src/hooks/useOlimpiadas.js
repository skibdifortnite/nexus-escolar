import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore'
import { db } from '../services/firebase'

export function useOlimpiadas() {
  const [olimpiadas, setOlimpiadas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'olimpiadas'),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const dados = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      setOlimpiadas(dados)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { olimpiadas, loading }
}

export function useOlimpiada(olimpiadaId) {
  const [olimpiada, setOlimpiada] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!olimpiadaId) return

    const unsubscribe = onSnapshot(doc(db, 'olimpiadas', olimpiadaId), (snap) => {
      if (snap.exists()) setOlimpiada({ id: snap.id, ...snap.data() })
      setLoading(false)
    })

    return unsubscribe
  }, [olimpiadaId])

  return { olimpiada, loading }
}

export function useInscricoes(olimpiadaId) {
  const [inscricoes, setInscricoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!olimpiadaId) return

    const q = query(
      collection(db, 'olimpiadas', olimpiadaId, 'inscricoes'),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const dados = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      setInscricoes(dados)
      setLoading(false)
    })

    return unsubscribe
  }, [olimpiadaId])

  return { inscricoes, loading }
}
import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

export function useAvisos(role) {
  const [avisos, setAvisos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'comunicados'),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const todos = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Filtra por público
      const filtrados = todos.filter(aviso => {
        if (!aviso.publico || aviso.publico === 'todos') return true
        if (role === 'admin' || role === 'militar') return true
        return aviso.publico === role
      })

      setAvisos(filtrados)
      setLoading(false)
    })

    return unsubscribe
  }, [role])

  return { avisos, loading }
}
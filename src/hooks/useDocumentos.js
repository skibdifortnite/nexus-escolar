import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

export function useDocumentos() {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'documentos'),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const dados = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setDocumentos(dados)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { documentos, loading }
}
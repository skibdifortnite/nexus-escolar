import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

export async function buscarFotosDrive(pastaId) {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
  const url = `https://www.googleapis.com/drive/v3/files?q='${pastaId}'+in+parents+and+mimeType+contains+'image/'&fields=files(id,name,mimeType,createdTime)&key=${apiKey}`

  const res = await fetch(url)
  const data = await res.json()

  console.log('Resposta Drive API:', data)

  if (!data.files) return []

  return data.files.map(f => ({
    id: f.id,
    nome: f.name,
    url: `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
    urlGrande: `https://drive.google.com/uc?export=download&id=${f.id}`,
    urlVisualizar: `https://drive.google.com/file/d/${f.id}/view`,
  }))
}

export function useAlbuns() {
  const [albuns, setAlbuns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'galeria'),
      orderBy('criadoEm', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      console.log('Total de álbuns:', snap.docs.length)
      const dados = snap.docs.map(d => {
        console.log('Álbum:', d.id, d.data())
        return { id: d.id, ...d.data() }
      })
      setAlbuns(dados)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return { albuns, loading }
}
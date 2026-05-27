/**
 * Firebase Cloud Function — Notificações Push Automáticas
 * 
 * Quando um comunicado for publicado no Firestore, esta função
 * dispara notificações push para todos os usuários com tokens FCM ativos.
 * 
 * Para fazer deploy:
 *   1. Instale o Firebase CLI: npm install -g firebase-tools
 *   2. Faça login: firebase login
 *   3. Navegue até a pasta functions: cd functions
 *   4. Instale as dependências: npm install
 *   5. Faça deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

/**
 * Triggers quando um novo documento é criado na coleção 'comunicados'
 * Envia push notification para todos os usuários com tokens FCM ativos
 */
exports.notificarNovoComunicado = functions.firestore
  .document('comunicados/{comunicadoId}')
  .onCreate(async (snap, context) => {
    const dados = snap.data()
    const { titulo, tipo, conteudo, autor } = dados

    // Define o título da notificação baseado no tipo
    let tituloNotificacao = `📢 ${titulo}`
    if (tipo === 'urgente') {
      tituloNotificacao = `🚨 URGENTE: ${titulo}`
    } else if (tipo === 'evento') {
      tituloNotificacao = `🎯 ${titulo}`
    } else if (tipo === 'militar') {
      tituloNotificacao = `🛡️ ${titulo}`
    }

    // Corpo da notificação (limita a 100 caracteres)
    const corpo = conteudo
      ? conteudo.substring(0, 100) + (conteudo.length > 100 ? '...' : '')
      : `Publicado por ${autor || 'Desconhecido'}`

    console.log(`📨 Nova notificação: ${tituloNotificacao}`)

    // Busca todos os tokens FCM ativos
    const usuariosSnap = await admin.firestore().collection('usuarios').get()
    
    const tokens = []
    usuariosSnap.forEach(doc => {
      const data = doc.data()
      if (data.fcmToken && data.notificacoesAtivas) {
        tokens.push(data.fcmToken)
      }
    })

    if (tokens.length === 0) {
      console.log('⚠️  Nenhum usuário com notificações ativas.')
      return null
    }

    console.log(`👥 Enviando para ${tokens.length} dispositivo(s)...`)

    // Prepara a mensagem
    const message = {
      notification: {
        title: tituloNotificacao,
        body: corpo,
      },
      data: {
        click_action: '/avisos',
        tipo: tipo || 'geral',
        comunicadoId: context.params.comunicadoId,
      },
      webpush: {
        fcm_options: {
          link: '/avisos',
        },
      },
    }

    // Envia para todos os tokens
    const results = await admin.messaging().sendEachForMulticast({
      ...message,
      tokens,
    })

    console.log(`✅ Sucesso: ${results.successCount}`)
    console.log(`❌ Falhas: ${results.failureCount}`)

    // Remove tokens inválidos
    if (results.failureCount > 0) {
      const invalidTokens = []
      results.responses.forEach((resp, idx) => {
        if (!resp.success && 
            (resp.error.code === 'messaging/invalid-registration-token' ||
             resp.error.code === 'messaging/registration-token-not-registered')) {
          invalidTokens.push(tokens[idx])
        }
      })

      // Limpa tokens inválidos do Firestore
      for (const token of invalidTokens) {
        const docs = await admin.firestore()
          .collection('usuarios')
          .where('fcmToken', '==', token)
          .get()
        
        docs.forEach(async d => {
          await d.ref.update({ fcmToken: null, notificacoesAtivas: false })
        })
      }

      console.log(`🧹 ${invalidTokens.length} token(s) inválido(s) removidos`)
    }

    return results
  })

/**
 * Função HTTP alternativa — permite enviar notificações manualmente via POST
 * Exemplo: curl -X POST https://us-central1-nexus-escolar-efe32.cloudfunctions.net/enviarNotificacaoPush
 *   -H "Content-Type: application/json"
 *   -d '{"titulo":"Teste","mensagem":"Teste push"}'
 */
exports.enviarNotificacaoPush = functions.https.onCall(async (data, context) => {
  // Verifica se é admin/militar
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Você precisa estar logado.'
    )
  }

  const { titulo, mensagem } = data
  if (!titulo || !mensagem) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Título e mensagem são obrigatórios.'
    )
  }

  const usuariosSnap = await admin.firestore().collection('usuarios').get()
  const tokens = []
  
  usuariosSnap.forEach(doc => {
    const userData = doc.data()
    if (userData.fcmToken && userData.notificacoesAtivas) {
      tokens.push(userData.fcmToken)
    }
  })

  if (tokens.length === 0) {
    return { sucesso: false, mensagem: 'Nenhum usuário com notificações ativas.' }
  }

  const message = {
    notification: {
      title: titulo,
      body: mensagem,
    },
    data: { click_action: '/' },
    tokens,
  }

  const results = await admin.messaging().sendEachForMulticast(message)

  return {
    sucesso: true,
    sucessos: results.successCount,
    falhas: results.failureCount,
    total: tokens.length,
  }
})
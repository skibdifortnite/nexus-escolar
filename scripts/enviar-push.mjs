/**
 * Script para enviar notificações push via FCM V1 API
 * Usa apenas Node.js nativo (fetch + crypto) — sem dependências externas
 * 
 * Como usar: node scripts/enviar-push.mjs "Título" "Mensagem"
 * Exemplo: node scripts/enviar-push.mjs "🔔 Teste" "Notificação de teste"
 */

import { readFileSync, existsSync } from 'fs'
import crypto from 'crypto'

// ============================================
// PASSO 1: Carregar credenciais
// ============================================

const SERVICE_ACCOUNT_PATH = './service-account.json'
let clientEmail, privateKey, projectId

if (existsSync(SERVICE_ACCOUNT_PATH)) {
  const sa = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'))
  clientEmail = sa.client_email
  privateKey = sa.private_key
  projectId = sa.project_id
} else {
  const envPath = './.env'
  if (existsSync(envPath)) {
    const env = readFileSync(envPath, 'utf-8')
    clientEmail = env.match(/VITE_FIREBASE_CLIENT_EMAIL=(.+)/)?.[1]?.trim()
    let pk = env.match(/VITE_FIREBASE_PRIVATE_KEY="(.+?)"/)?.[1]?.trim()
    if (!pk) pk = env.match(/VITE_FIREBASE_PRIVATE_KEY=(.+)/)?.[1]?.trim()
    if (pk) {
      pk = pk.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1')
    }
    privateKey = pk
    projectId = env.match(/VITE_FIREBASE_PROJECT_ID=(.+)/)?.[1]?.trim()
  }
}

if (!clientEmail || !privateKey || !projectId) {
  console.error('\n❌ Erro: Credenciais não encontradas!')
  console.error('   Certifique-se de que o arquivo service-account.json existe na raiz do projeto.')
  process.exit(1)
}

// ============================================
// PASSO 2: Gerar token OAuth2
// ============================================

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function gerarAccessToken() {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const headerEncoded = base64url(JSON.stringify(header))
  const payloadEncoded = base64url(JSON.stringify(payload))
  const signatureInput = `${headerEncoded}.${payloadEncoded}`

  // Assina com a chave privada RSA
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(signatureInput)
  const signature = sign.sign(privateKey, 'base64')
  const signatureEncoded = base64url(Buffer.from(signature, 'base64').toString('binary'))

  const jwt = `${signatureInput}.${signatureEncoded}`

  // Troca o JWT por um Access Token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Erro ao obter token OAuth: ${err}`)
  }

  const data = await response.json()
  return data.access_token
}

// ============================================
// PASSO 3: Buscar tokens FCM no Firestore
// ============================================

async function buscarTokensFCM(accessToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/usuarios`
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Erro ao buscar usuários: ${err}`)
  }

  const data = await response.json()
  const tokens = []

  if (data.documents) {
    for (const doc of data.documents) {
      const fields = doc.fields || {}
      const fcmToken = fields.fcmToken?.stringValue
      const notificacoesAtivas = fields.notificacoesAtivas?.booleanValue

      if (fcmToken && notificacoesAtivas) {
        tokens.push(fcmToken)
      }
    }
  }

  return tokens
}

// ============================================
// PASSO 4: Enviar push
// ============================================

async function enviarPush(titulo, mensagem) {
  console.log(`\n📨 Enviando: "${titulo}"\n`)

  // Gera access token
  console.log('🔑 Gerando token OAuth2...')
  const accessToken = await gerarAccessToken()
  console.log('✅ Token obtido!\n')

  // Busca tokens FCM
  console.log('👥 Buscando tokens dos usuários...')
  const tokens = await buscarTokensFCM(accessToken)
  
  if (tokens.length === 0) {
    console.log('⚠️  Nenhum usuário com notificações ativas.')
    return
  }

  console.log(`   → ${tokens.length} dispositivo(s) encontrado(s)\n`)

  // Envia para cada dispositivo
  let sucessos = 0
  let erros = 0

  for (const token of tokens) {
    try {
      const message = {
        message: {
          token,
          notification: { title: titulo, body: mensagem },
          data: { click_action: '/' },
          webpush: { fcm_options: { link: '/' } },
        },
      }

      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(message),
        }
      )

      if (response.ok) {
        sucessos++
        process.stdout.write('✅')
      } else {
        erros++
        process.stdout.write('❌')
      }
    } catch {
      erros++
      process.stdout.write('❌')
    }
  }

  console.log('\n')
  console.log('═'.repeat(30))
  console.log(`✅ ${sucessos} enviada(s) com sucesso`)
  if (erros > 0) console.log(`❌ ${erros} falha(s)`)
  console.log('═'.repeat(30))
}

// ============================================
// EXECUTAR
// ============================================

const args = process.argv.slice(2)
const titulo = args[0] || '🔔 Notificação do Nexus Escolar'
const mensagem = args[1] || 'Novo comunicado publicado no CPM Alagoas'

enviarPush(titulo, mensagem).catch(err => {
  console.error(`\n❌ Erro: ${err.message}`)
  console.error('   Verifique sua conexão com a internet.')
  process.exit(1)
})
// Middleware de logging de requisições
// Registra todas as requisições com data/hora no horário de Brasília

function getBrasiliaTime() {
  const now = new Date()
  // Horário de Brasília é UTC-3
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  return brasiliaTime
}

function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}.${milliseconds}`
}

function requestLogger(req, res, next) {
  const timestamp = formatDateTime(getBrasiliaTime())
  const method = req.method
  const url = req.originalUrl || req.url
  const ip = req.ip || req.connection.remoteAddress
  const userAgent = req.get('user-agent') || 'N/A'
  
  // Log básico da requisição
  console.log('\n' + '='.repeat(80))
  console.log(`[${timestamp}] ${method} ${url}`)
  console.log(`IP: ${ip}`)
  console.log(`User-Agent: ${userAgent}`)
  
  // Log de headers relevantes
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization
    const tokenPreview = authHeader.length > 20 
      ? authHeader.substring(0, 20) + '...' 
      : authHeader
    console.log(`Authorization: ${tokenPreview}`)
  }
  
  if (req.headers['content-type']) {
    console.log(`Content-Type: ${req.headers['content-type']}`)
  }
  
  // Log do body (se existir e não for muito grande)
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body)
    if (bodyStr.length > 500) {
      console.log(`Body: ${bodyStr.substring(0, 500)}... (truncated, total: ${bodyStr.length} chars)`)
    } else {
      console.log(`Body:`, req.body)
    }
  }
  
  // Log de query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`Query:`, req.query)
  }
  
  // Log de parâmetros da URL
  if (req.params && Object.keys(req.params).length > 0) {
    console.log(`Params:`, req.params)
  }
  
  // Capturar o tempo de resposta
  const startTime = Date.now()
  
  // Interceptar o fim da resposta
  const originalSend = res.send
  res.send = function(data) {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode
    
    console.log(`Response: ${statusCode} (${duration}ms)`)
    
    // Log da resposta (se não for muito grande)
    if (data) {
      try {
        const responseStr = typeof data === 'string' ? data : JSON.stringify(data)
        if (responseStr.length > 500) {
          console.log(`Response Body: ${responseStr.substring(0, 500)}... (truncated, total: ${responseStr.length} chars)`)
        } else {
          console.log(`Response Body:`, typeof data === 'string' ? JSON.parse(data) : data)
        }
      } catch (e) {
        // Se não conseguir parsear, apenas mostrar preview
        const preview = typeof data === 'string' 
          ? data.substring(0, 200) 
          : String(data).substring(0, 200)
        console.log(`Response Body: ${preview}...`)
      }
    }
    
    console.log('='.repeat(80) + '\n')
    
    // Chamar o método original
    return originalSend.call(this, data)
  }
  
  next()
}

export default requestLogger


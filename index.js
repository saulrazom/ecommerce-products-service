require('dotenv').config()
const express = require('express')
const { ListTablesCommand } = require('@aws-sdk/client-dynamodb')
const { ScanCommand } = require('@aws-sdk/lib-dynamodb')
const { client, docClient } = require('./utils/dynamoClient')

const app = express() // <- debe existir antes de usar app.get(...)
app.use(express.json())

const setupSwaggerDocs = require('./utils/swagger')
setupSwaggerDocs(app)

// Serve UI Interface for Test Coverage
const path = require('path')
app.use('/coverage', express.static(path.join(__dirname, 'coverage/lcov-report')))

app.get('/health/db', async (_req, res) => {
  try {
    const out = await client.send(new ListTablesCommand({ Limit: 10 }))
    return res.json({ ok: true, db: 'connected', tables: out.TableNames || [] })
  } catch (error) {
    console.error('[DB CONNECT ERROR]', {
      name: error?.name,
      message: error?.message,
      metadata: error?.$metadata,
      stack: error?.stack,
    })
    return res.status(500).json({ ok: false, db: 'error', error: error?.name || 'UnknownError' })
  }
})

app.get('/health/db/table', async (_req, res) => {
  try {
    await docClient.send(new ScanCommand({ TableName: process.env.PRODUCTS_TABLE, Limit: 1 }))
    return res.json({ ok: true, table: process.env.PRODUCTS_TABLE })
  } catch (error) {
    console.error('[DB TABLE ERROR]', {
      name: error?.name,
      message: error?.message,
      metadata: error?.$metadata,
    })
    return res.status(500).json({ ok: false, table: process.env.PRODUCTS_TABLE, error: error?.name || 'UnknownError' })
  }
})

const productRoutes = require('./routes/product.routes')
app.use('/products', productRoutes)

if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

module.exports = app;

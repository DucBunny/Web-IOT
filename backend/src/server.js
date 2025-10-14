const express = require('express')
const cors = require('cors')
require('dotenv').config({ quiet: true })
const router = require('./routes/api')
const { connectDB } = require('./config/db')

const port = process.env.PORT || 8080
const app = express()
app.use(cors())
app.use(express.json())

connectDB()

app.use('/api-v1', router)

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
})

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const app = express()

// Middleware
app.use(cors())
app.use(helmet());
app.use(morgan('common'));
app.use(express.json())
app.use(express.urlencoded({ extended:false }))

const posts = require('./routes/api/url')

app.use('/api', posts)

// Handle production
if(process.env.NODE_ENV === 'production') {
  // Static folder
  app.use(express.static(__dirname + '/public/'))

  // Hande SPA (single page application)
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'))
}

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server started on port ${port}`))
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import debug from 'debug'
import busboy from 'connect-busboy'
import config from './config'

mongoose.Promise = global.Promise

const debugError = debug('App:Error>>>')
const debugInfo = debug('App:Info>>>')

// app
const app = express()

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
  app.use(require('morgan')('dev'))
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-access-token')
  res.setHeader('Content-Type', 'application/json')
  next()
})

// parse Content-Type: application/json
app.use(bodyParser.json())

// parse Content-Type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse Content-Type: application/x-www-form-urlencoded or starts with "multipart/*"
app.use(busboy())
app.use((req, res, next) => {
  if (req.busboy) {
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      if (!filename) return file.resume()
      let fileRead = []
      file.on('data', (chunk) => fileRead.push(chunk))
      file.on('error', next)
      file.on('end', () => {
        let fileBuffer = Buffer.concat(fileRead)
        if (!req.body) req.body = {}
        if (!req.body[fieldname]) req.body[fieldname] = []
        req.body[fieldname].push({ fileBuffer, file, filename, encoding, mimetype })
        return file.resume()
      })
    })
    req.busboy.on('field', function (key, value) {
      // we config bodyParser.urlencoded will parse application/x-www-form-urlencoded
      // ==> this handler will be ignore if Content-Type is application/x-www-form-urlencoded
      // all field is not file will be JSON.stringify and set value for jsonData field
      if (!req.body) req.body = {}
      if (key === 'jsonData') {
        let otherData = JSON.parse(value)
        for (let field in otherData) req.body[field] = otherData[field]
      }
    })
    req.busboy.on('error', function (err) {
      debugError('Error while parsing the form: ', err)
      next(err)
    })
    req.busboy.on('finish', function () {
      debugInfo('Done parsing the form!')
      next()
    })
    // Start the parsing
    req.pipe(req.busboy)
  } else {
    next()
  }
})

app.get('/', (req, res) => res.status(200).send('TODO APIs'))

mongoose.connect(config.MONGO_URL)
const db = mongoose.connection
db.on('open', () => {
  debugInfo('DB connected')
  
  app.get('/v1', (req, res) => res.status(200).send('TODO APIs VERSION 1'))
  app.use('/v1/management', require('./routes/management').default)
  app.use('/v1/application', require('./routes/application').default)

  app.get('/v2', (req, res) => res.status(200).send('TODO APIs VERSION 2'))
})

db.on('error', (err) => debugError(err))

var httpServer = require('http').createServer(app)
httpServer.listen(config.PORT, '::', () => debugInfo(`TodoAPI runing on port ${config.PORT} - ${process.env.NODE_ENV}`))

// keep server running
process.on('uncaughtException', err => debugError('unhandledRejection', err))
process.on('unhandledRejection', err => debugError('unhandledRejection', err))

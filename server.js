const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')


const indexRouter = require('./routes/index')
const apiRouter = require('./routes/api')


const server = express()
const port = process.env.PORT || 8000

server.use(bodyParser.urlencoded({extended: false}))
server.use(bodyParser.json())


server.use('/', indexRouter)
server.use('/api', apiRouter)
server.use(methodOverride())
server.use(logErrors)
server.use(errorHandler)



server.listen(port, () => {
    console.log("xatkit-nlp.js-server running on port", port)
})

function logErrors (err, req, res, next) {
    console.error(err.stack)
    next(err)
}
function errorHandler (err, req, res, next) {
    res.status(err.status).json({ message: err.message })
}

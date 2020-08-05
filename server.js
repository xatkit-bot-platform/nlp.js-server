const express = require('express')
const bodyParser = require('body-parser')


const indexRouter = require('./routes/index')
const apiRouter = require('./routes/api')


const server = express()
const port = process.env.PORT || 8000

server.use(bodyParser.urlencoded({extended: false}))
server.use(bodyParser.json())


server.use('/', indexRouter)
server.use('/api', apiRouter)


server.listen(port, () => {
    console.log("xatkit-nlp.js-server running on port", port)
})

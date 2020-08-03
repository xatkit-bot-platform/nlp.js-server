const express = require('express')
const bodyParser = require('body-parser')



const indexRouter = require('./routes/index')
const apiRouter = require('./routes/api')


const app = express()
const port = process.env.PORT || 4041

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/', indexRouter)
app.use('/api', apiRouter)


app.listen(port, () => {
    console.log("Server is running on port", port)
})

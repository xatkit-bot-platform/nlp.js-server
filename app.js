const express = require('express')
const bodyParser = require('body-parser')



const indexRouter = require('./routes/index')
const processRouter = require('./routes/process')
const trainRouter = require('./routes/train')

const app = express()
const port = process.env.PORT || 4041

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/', indexRouter)
app.use('/train', trainRouter)
app.use('/process', processRouter)


app.listen(port, () => {
    console.log("Server is running on port", port)
})

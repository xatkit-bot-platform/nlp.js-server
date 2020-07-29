const express = require('express')
const bodyParser = require('body-parser')
const nlpjsTrainer = require('./trainers/nlpjs-trainer')



const indexRouter = require('./routes/index')

const app = express()
const port = process.env.PORT || 4041

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/', indexRouter)


app.post('/process', async (req, res, next) => {
    try {
        const { userMessage } = req.body
        const result = await nlpjsTrainer.process(userMessage)
        res.json(result)
    }

    catch (error) {
        return next(error);
    }

})


app.post('/train', async (req, res) => {
    try {
        const data = req.body
        const result = await nlpjsTrainer.train(data)
        res.json(result)
    }
    catch (error) {
        return next(error)
    }

})

app.listen(port, () => {
    console.log("Server is running on port", port)
})

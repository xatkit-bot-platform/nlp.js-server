const express = require('express')
const bodyParser = require('body-parser')
const nlpjsTrainer = require('./trainers/nlpjs-trainer')

const app = express()
const port = process.env.PORT || 4041

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())



app.get('/', (_,res) => {
res.send("Welcome to the nlp.js-server")
})

app.post('/process', async (req, res) => {
    const { userMessage } = req.body
    const result = await nlpjsTrainer.process(userMessage)
    res.json(result)
})
app.post('/train', async (req, res) => {
    const data = req.body
    const result = await nlpjsTrainer.train(data)
    res.json(result)
})

app.listen(port, () => {
    console.log("Server is running on port", port)
})

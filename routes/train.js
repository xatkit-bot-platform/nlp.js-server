const express = require('express')
const router = express.Router()
const nlpjsTrainer = require('../trainers/nlpjs-trainer')


router.post('/', async (req, res) => {
    try {
        const data = req.body
        const result = await nlpjsTrainer.train(data)
        res.json(result)
    }
    catch (error) {
        return next(error)
    }

})

module.exports = router
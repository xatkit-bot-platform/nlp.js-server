const express = require('express')
const router = express.Router()
const nlpjsTrainer = require('../trainers/nlpjs-trainer')

router.post('/', async (req, res, next) => {
    try {
        const { userMessage } = req.body
        const result = await nlpjsTrainer.process(userMessage)
        res.json(result)
    }

    catch (error) {
        return next(error);
    }

})


module.exports = router
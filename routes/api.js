const express = require('express')
const router = express.Router()
const nlpjsTrainer = require('../trainers/nlpjs-trainer')



router.post('/train', async (req, res, next) => {
    try {
        const data = req.body
        const result = await nlpjsTrainer.train(data)
        res.json(result)
    }
    catch (error) {
        return next(error)
    }

})

router.post('/:agentId/process', async (req, res, next) => {
    const { agentId } = req.params
    const { userMessage } = req.body
    try {
        const result = await nlpjsTrainer.process(agentId,userMessage)
        res.json(result)
    }

    catch (error) {
        if(error === 'Not found')
            res.status(404).json({message: `NLP agent with ID ${agentId} not found`})
        return next(error);
    }

})


module.exports = router

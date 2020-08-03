const express = require('express')
const router = express.Router()
const nlpjsTrainer = require('../trainers/nlpjs-trainer')

router.post('/:agentId', async (req, res, next) => {
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

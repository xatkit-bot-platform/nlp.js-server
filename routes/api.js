const express = require('express')
const router = express.Router()
const nlpjsTrainer = require('../trainers/nlpjs-trainer')

router.post('/agent', (req, res) => {
    const data = req.body
    if (!data.agentId) {
        res.status(400).json({message: "Field agentId missing."});
        return;
    }
    nlpjsTrainer.createAgent(data.agentId, data.language)
    res.sendStatus(201)
})

router.get('/agent/:agentId', (req, res) => {
    const { agentId } = req.params
    const agent = nlpjsTrainer.getAgent(agentId)
    if (!agent) {
        res.status(404).json({message: `NLP agent with ID ${agentId} not found`});
    } else {
        res.json(
            {
                status : agent.status,
                model : JSON.parse(agent.manager.export(true))
            });
    }
})

router.post('/agent/:agentId/train', (req, res, next) => {
    try {
        const { agentId } = req.params
        const agent = nlpjsTrainer.getAgent(agentId)
        if (!agent) {
            res.status(404).json({message: `NLP agent with ID ${agentId} not found`});
            return;
        }
        const data = req.body
        nlpjsTrainer.train(agentId, data)
        res.sendStatus(200)
    } catch (error) {
        return next(error)
    }
})

router.post('/agent/:agentId/process', async (req, res, next) => {
    const { agentId } = req.params
    const { message } = req.body
    try {
        const result = await nlpjsTrainer.process(agentId, message)
        res.json(result)
    } catch (error) {
        if (error === 'Not found') {
            res.status(404).json({message: `NLP agent with ID ${agentId} not found`});
        } else {
            return next(error);
        }
    }
})

module.exports = router

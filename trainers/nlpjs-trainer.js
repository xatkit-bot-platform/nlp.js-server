const { NlpManager } = require('node-nlp')
const childProcess = require('child_process')
const { DEFAULT_LANGUAGE } = require('../config')

/*
 * Adapted from NlpjsTrainer class located at https://github.com/axa-group/nlp.js-app.
 *
 */
class NlpjsTrainer {

    constructor() {
        this.agents = {}
        this.createAgent("default")
    }

    createAgent(agentId, language = DEFAULT_LANGUAGE) {
        const manager = new NlpManager({languages: [language]})
        this.agents[agentId] = {
            manager,
            status: 'new'
        }
    }

    getAgent(agentId) {
        return this.agents[agentId]
    }

    addEntities(manager, data) {
        const language = manager.settings.languages[0];
        data.entities && data.entities.forEach(entity => {
            const {entityName, type} = entity
            if (entity.type === 'enum') {
                for (let i = 0; i < entity.references.length; i++) {
                    const optionName = entity.references[i].value
                    manager.addNamedEntityText(entityName, optionName, [language], entity.references[i].synonyms)
                }
            } else if (type === 'trim') {
                const { afterLast, beforeLast, between } = entity
                if (afterLast && afterLast.length) {
                    manager.addAfterLastCondition(language, entityName, afterLast);
                }
                if (beforeLast && beforeLast.length) {
                    manager.nlp.addNerBeforeLastCondition(language, entityName, beforeLast)
                }
                if ( between ) {
                    const { left, right} = between
                    manager.addBetweenCondition(language, entityName, left, right)
                }
            } else if (type === 'regex') {
                manager.addRegexEntity(entityName, [language], entity.regex)
            }
        })
    }

    addIntents(manager, data) {
        const language = manager.settings.languages[0];
        data.intents.forEach(intent => {
            const {intentName, parameters, examples} = intent
            for (let i = 0; i < examples.length; i++) {
                const example = examples[i];
                const utterance = example.userSays;
                manager.addDocument(language, utterance, intentName);
            }
            if (parameters) {
                for (let i = 0; i < parameters.length; i++) {
                    const {slot} = parameters[i];
                    manager.nlp.slotManager.addSlot(intentName, slot, true);
                }
            }
        })
    }

    trainProcess(agent) {
        agent.status = 'training'
        const child = childProcess.fork('./trainers/nlpjs-process')
        child.on('message', managerResult => {
            child.kill();
            agent.manager.import(managerResult)
            agent.status = 'ready'
        })
        child.send(agent.manager.export())
    }

    train(agentId, data) {
        let agent = this.agents[agentId]
        if (!agent) {
            return new Error("Not found");
        }
        const { language, clean } = data.config
        if (clean || (language && (language !== agent.manager.settings.languages[0]))) {
            this.createAgent(agentId, language)
            agent = this.agents[agentId]
        }
        this.addEntities(agent.manager, data)
        this.addIntents(agent.manager, data)
        agent.manager.train().then(() => {
            agent.status = 'ready'
            console.log(agent.manager.export())
        })
        // this.trainProcess(agent);
    }

    process(agentId, text) {
        return new Promise((resolve, reject) => {
            const agent = this.agents[agentId]
            if (!agent) {
                return reject(`Not found`);
            }
            const language = agent.manager.settings.languages[0];
            return resolve(agent.manager.process(language, text))
        })
    }
}

const instance = new NlpjsTrainer();

module.exports = instance;

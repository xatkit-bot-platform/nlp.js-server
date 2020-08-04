const { NlpManager } = require('node-nlp')
const childProcess = require('child_process')
const { DEFAULT_LANGUAGE } = require('../config')

class NlpjsTrainer {

    constructor() {

        this.agents = {}

    }

    createAgent(agentId, language=DEFAULT_LANGUAGE) {
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
            const {entityName } = entity
            if(entity.type === 'enum') {
                for (let i = 0; i < entity.literals.length; i++) {
                    const optionName = entity.literals[i].value
                    manager.addNamedEntityText(entityName, optionName,[language], entity.literals[i].synonyms)
                }
            } else if (entity.type === 'regex') {
                manager.addRegexEntity(entityName, [language], entity.regex)
            }
        })
    }


    addIntents(manager, data) {
        const language = manager.settings.languages[0];
        data.intents.forEach(intent => {
            const { intentName, parameters, examples } = intent
            for (let i = 0; i < examples.length; i ++) {
                const example = examples[i];
                const utterance = example.userSays;
                manager.addDocument(language, utterance, intentName);
            }
            if (parameters) {
                for (let i = 0; i < parameters.length; i++) {
                    const { slot } = parameters[i];
                    // if (type === "any") {
                    //     manager.addAfterLastCondition(language, slot, 'from');
                    // }
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
        const agent = this.agents[agentId]
        if(!agent)
            return new Error("Not found")

        this.addEntities(agent.manager, data)
        this.addIntents(agent.manager, data)
        this.trainProcess(agent);

    }

    process(agentId, text){

        return new Promise((resolve, reject) => {
            const agent = this.agents[agentId]
            if(!agent)
                return reject(`Not found`)
            const language = agent.manager.settings.languages[0];
            return  resolve(agent.manager.process(language, text))
        })
    }

}

const instance = new NlpjsTrainer();

module.exports = instance;

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
        data.entities && data.entities.forEach(entity => {
            const {entityName } = entity
            if(entity.type === 'enum') {
                for (let i = 0; i < entity.examples.length; i++) {
                    const optionName = entity.examples[i].value
                    manager.addNamedEntityText(entityName, optionName,['en'], entity.examples[i].synonyms)
                }
            } else if (entity.type === 'regex') {
                manager.addRegexEntity(entityName, ['en'], entity.regex)
            }
        })
    }


    addIntents(manager, data) {
        data.intents.forEach(intent => {
            const { intentName, parameters, examples } = intent
            for (let i = 0; i < examples.length; i ++) {
                const example = examples[i];
                const utterance = example.userSays;
                manager.addDocument('en', utterance, intentName);
            }
            for(let i = 0; i < parameters.length; i++) {
                const { slot, type } = parameters[i];
                if (type === "any") {
                    manager.addAfterLastCondition('en', slot, 'from');
                }
                manager.nlp.slotManager.addSlot(intentName, slot, true);
            }
        })
    }



    trainProcess(manager) {
        return new Promise(resolve =>{
            const child = childProcess.fork('./trainers/nlpjs-process')
            child.on('message', managerResult => {
                child.kill();
                return resolve(managerResult)
            })
            child.send(manager)
        })

    }


    async train(agentId, data) {
        const agent = this.agents[agentId]
        if(!agent)
            return new Error("Not found")

        this.addEntities(agent.manager, data)
        this.addIntents(agent.manager, data)
        agent.status = 'training'
        const result = await this.trainProcess(agent.manager.export());
        agent.manager.import(result);
        agent.status= 'trained'
        console.log(result)
        return result;

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

const { NlpManager } = require('node-nlp')
const childProcess = require('child_process')
const { DEFAULT_LANGUAGE } = require('../config')
const { v4: uuidv4 } = require('uuid');

class NlpjsTrainer {

    constructor() {

        this.managers = {}

    }

    createAgent(agentId, language=DEFAULT_LANGUAGE) {
        const manager = new NlpManager({languages: [language]})
        this.managers[agentId] = {
            manager,
            status: 'new'
        }
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


    async train(data) {

        const language = (data.config && data.config.language)? data.config.language : DEFAULT_LANGUAGE;
        const agentId = (data.config && data.config.agentId)? data.config.agentId : uuidv4();
        const manager = new NlpManager({languages: [language]})


        this.managers[agentId] = manager

        this.addEntities(manager,data)
        this.addIntents(manager,data)
        const result = await this.trainProcess(manager.export());
        manager.import(result);
        console.log(result)
        return result;

    }

    process(agentId, text){

        return new Promise((resolve, reject) => {
            const manager = this.managers[agentId]
            if(!manager)
                return reject(`Not found`)
            const language = manager.settings.languages[0];
            return  resolve(manager.process(language, text))
        })
    }

}

const instance = new NlpjsTrainer();

module.exports = instance;

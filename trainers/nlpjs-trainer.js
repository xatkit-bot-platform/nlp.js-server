const { NlpManager } = require('node-nlp')
const childProcess = require('child_process')

class NlpjsTrainer {

    constructor() {

        this.managers = {}

    }

    addEntities(manager, data) {
        data.entities.forEach(entity => {
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
            const { intentName } = intent
            for (let i = 0; i < intent.examples.length; i ++) {
                const example = intent.examples[i];
                const utterance = example.userSays;
                manager.addDocument('en', utterance, intentName);
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

        const manager = new NlpManager({languages: ['en']})

        this.addEntities(manager,data)
        this.addIntents(manager,data)
        const result = await this.trainProcess(manager.export());
        manager.import(result);
        this.manager = manager
        return result;

    }

    async process(text){
        return await this.manager.process('en', text)
    }

}

const instance = new NlpjsTrainer();

module.exports = instance;

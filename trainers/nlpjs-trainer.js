const { NlpManager } = require('node-nlp')
const childProcess = require('child_process')

class NlpjsTrainer {

    constructor() {

        this.managers = {}

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

const { dockStart } = require('@nlpjs/basic')
const childProcess = require('child_process')

class NlpjsTrainer {

    constructor() {

    }


    addIntents(nlp, data) {
        data.intents.forEach(intent => {
            const { intentName } = intent
            for (let i = 0; i < intent.examples.length; i ++) {
                const example = intent.examples[i];
                const utterance = example.userSays;
                nlp.addDocument('en', utterance, intentName);
            }
        })
    }

    trainProcess(nlp) {
        return new Promise(resolve =>{
            const child = childProcess.fork('./trainers/nlpjs-process')
            child.on('message', dockResult => {
                child.kill();
                return resolve(dockResult)
            })
            child.send(nlp)
        })

    }


    async train(data) {

        const dock = await dockStart({ use: ['Basic']});

        const nlp = dock.get('nlp')
        nlp.addLanguage('en')
        this.addIntents(nlp,data)
        const result = await this.trainProcess(nlp.export());
        nlp.import(result);
        this.nlpAgent = nlp
        return result;

    }

    async process(text){
        return await this.nlpAgent.process('en', text)
    }

}

const instance = new NlpjsTrainer();

module.exports = instance;

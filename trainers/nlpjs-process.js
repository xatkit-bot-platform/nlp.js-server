const { dockStart } = require('@nlpjs/basic')



process.on('message', async json => {
	const dock = await dockStart({ use: ['Basic']});
	const nlp = dock.get('nlp')
	nlp.addLanguage('en')
	nlp.import(json)
	await nlp.train();
	process.send(nlp.export());
});

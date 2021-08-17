# NLP.js server
A server exposing a REST API for [NLP.js](https://github.com/axa-group/nlp.js).

## Running the server

### Using Docker:

**Requirement**: 
* Docker

The NLP.js server app is [available at Docker hub](https://hub.docker.com/r/xatkitdocker/xatkit-nlp.js-server). Execute the commands below to download it and run it.
```
docker pull xatkitdocker/xatkit-nlp.js-server:latest
docker run -p 8080:8080 -d xatkitdocker/xatkit-nlp.js-server
```
This will run the server on the port 8080. Check the installation at http://localhost:8080.
The server also exposes the API documentation using OpenAPI 3 which should be available at: http://localhost:8080/api-docs/

Change the -p option to run the server on a different port. For example to run the server on the port 4000, you should write:
```
docker run -p 4000:8080 -d xatkitdocker/xatkit-nlp.js-server
```
Check the docker documentation to learn more about docker networking.  


### Using Node and NPM

**Requirements:**

* Node.JS

Execute the commands below to build and run NLP.js server
```
git clone https://github.com/xatkit-bot-platform/nlp.js-server.git
cd nlp.js-server
npm install
npm start
```

This will run the server on the port 8080.

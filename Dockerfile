FROM node:12

WORKDIR /opt/xatkit/nodejs-server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "node", "server.js" ]

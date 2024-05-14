FROM node:18.18.0

RUN apt update

RUN apt install wait-for-it

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["wait-for-it", "db_auth:5432", "--", "node", "server.js"]
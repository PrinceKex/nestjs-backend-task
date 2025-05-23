FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

#COPY .env .env.development ./

EXPOSE 3000

CMD ["node", "src/main.js"]
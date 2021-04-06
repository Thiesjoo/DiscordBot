FROM node:12-alpine
WORKDIR /opt/discordbot

COPY package*.json ./
RUN npm install

COPY . .
CMD [ "npm", "start" ]
FROM node:12-alpine
WORKDIR /opt/discordbot

COPY package*.json ./
RUN npm ci --only=production



RUN chown node:node /opt/discordbot && \
  apk add --no-cache dumb-init 

USER node
COPY . . 

ENTRYPOINT ["dumb-init", "--"]
CMD ["./node_modules/.bin/forever", "index.js"]
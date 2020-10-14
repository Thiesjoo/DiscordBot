# Discord-bot

A simple discord bot which helps you meme Jacco.
This is just a meme, don't take this seriously

## Features

- Help message (!help)
- Purge messages
- Mock Jacco
- Water reminder
- Binas memes
- Rick roll everybody in a voice channel

### TODO:
- Add a mongodb database

## Requirements

- [Node](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/)

### Permissions
The bot checks some permissions to function correctly
*TEXT*
- SEND_MESSAGES
- MANAGE_MESSAGES
- ADD_REACTIONS

*VOICE*
- CONNECT
- SPEAK


## Getting started
First make sure you have all the required tools installed on your local machine then continue with these steps.

You need:
* Git
* Docker
* Docker-compose
* A discord bot token. (You can acquire one at: [Discord Developer Portal](https://discordapp.com/developers/applications/))

### Installation

```bash
# Clone the repository
git clone https://github.com/Thiesjoo/DiscordBot

# Enter into the directory
cd discordbot/

# If you want to work on the app while it's running, you have to start a docker compose container with: (Make sure you provide a token in the .env file)
docker-compose up --build

# If you want to build an image and run the image run:
docker build . -t th_discordbot_dev
docker build . -f Dockerfile.total -t th_discordbot

docker run --env TOKEN="<your token here>" th_discordbot

```


## Customization
In the ```config/index.js``` file you will find some configuration options


## Author
Thies Nieborg

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details
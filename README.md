# Discord-bot

A simple discord bot which helps you meme Jacco.
This is just a meme, don't take this seriously

## Features

- Fun
    - Help message (!help)
    - Water reminder
    - Binas memes
    - Rick roll everybody in a voice channel

- Admin
    - Purge messages
    - Create roles from bot
        - Add them to users
    - Certain commands only available to admins

- Games
    - Roulette system
    - Coinflip system
    - With an entire economy

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

### Adding new features
Every directory in ```./commands``` has an ```index.js``` file. That file exports 2 arrays.
1 with functions and 1 with events.
The layout of a function is like this:
```js
{
    name: "ping", //Name and command of the function
    alias: ["pong"], //Aliases of the command
    perms: ["admin"], //Which roles can access the command
    description: "returns pong", //Description for the help text
    admin: true, //If the command is admin, it will not show up in the helptext,
    execute(msg,args) {
        //your function
    }
}
```

#### Adding events
To add an event, simply add this to the events array:
```js
{
    name: "messageUpdate", //Name of the event. Found on discordjs website
    execute: async (msgOld, msgNew, bot) => { //Function to call when event is callend
    }
}


```

## Redis naming
During games users and their balance are stored in the redis cache
```disc:user:<user id> = {data}```
Data will be something like this:
```js
{
    _id: id,
    symbol: "<symbol of user>",
    balance: "<balance of user>",
    name: "<name of user>"
}
```
The rest of the data is not needed while in a game, and isn't accessed often.


## Author
Thies Nieborg

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details
const ytdl = require("ytdl-core")

const urls = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ","https://www.youtube.com/watch?v=xcf6k4_eyP8","https://www.youtube.com/watch?v=PfYnvDL0Qcw&list=PLtg6VBytbdL4O6cpBMbAoliCKLcddtHLF&index=4&t=0s" ]

let connection = null
module.exports = [{
    name: 'russian-roulette',
    alias: ["rr"],
    description: 'Give russian roulette a go!',
    async execute(msg, args) {
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel) {
            msg.channel.send(
                "You need to be in a voice channel to play music!"
            );
            return
        }
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            msg.channel.send(
                "I need the permissions to join and speak in your voice channel!"
            );
            return
        }
        if (!connection) {
            connection = await voiceChannel.join();
        }
        connection.play(ytdl(urls[Math.floor(Math.random() * urls.length)])).on("finish", () => {
            voiceChannel.leave()
        })
        msg.channel.send("Playing a random song")
    },
},
{
    name: 'stop',
    description: 'Stop the music player',
    async execute(msg, args) {
        if (connection) {
            connection.disconnect()
            msg.reply("Disconnected!")
        } else {
            msg.reply("Not connected")
        }
    },
}

]
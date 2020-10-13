const ytdl = require("ytdl-core-discord")

const urls = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/watch?v=xcf6k4_eyP8", "https://www.youtube.com/watch?v=PfYnvDL0Qcw"]

let connection = null
module.exports = {
    functions: [{
        name: 'russian-roulette',
        alias: ["rr"],
        description: 'Give russian roulette a go!',
        async execute(msg, args) {
            try {
                let voiceChannel = checkPerms(msg)
                if (!voiceChannel) return

                connection = await voiceChannel.join();
                console.error("[RR] Joined voicechannel")

                connection.play(await ytdl(urls[Math.floor(Math.random() * urls.length)]), { type: "opus" })
                    .on("error", (err) => {
                        console.error("[RR] voiceconnection got and error: ", err)
                        msg.channel.send("We got an error")
                        voiceChannel.leave()
                    })
                msg.channel.send("Playing a random song")
            } catch (err) {
                console.error("[RR] ", err)
                msg.channel.send("Something went wrong!")
            }
        },
    },
    {
        name: 'stop',
        description: 'Stop the music player',
        async execute(msg, args) {
            try {
                let voiceChannel = checkPerms(msg)
                if (!voiceChannel) return

                voiceChannel.leave()
                console.log("[RR_stop] Left a voicechannel")
            } catch (err) {
                console.error("[RR_stop] ", err)
                msg.channel.send("Something went wrong!")
            }
        },
    }, {
        name: 'play',
        description: 'Play a song from any youtube url. (Hides the thumbnail)',
        async execute(msg, args) {
            try {
                msg.suppressEmbeds(true)
                if (!args[0]) {
                    msg.channel.send("No url provided")
                    return
                }
                let voiceChannel = checkPerms(msg)
                if (!voiceChannel) return

                connection = await voiceChannel.join();
                connection.play(await ytdl(args[0]), { type: "opus" })

                msg.channel.send("Playing your song")
            } catch (err) {
                console.error("[PLAY] ", err)
                msg.channel.send("Something went wrong!")
            }
        },
    },
    ], events: [
        {
            name: "voiceStateUpdate",
            execute: (oldState, newState) => {
                console.log("Voicestate update")
            }
        }
    ]
}

function checkPerms(msg) {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
        msg.channel.send(
            "You need to be in a voice channel to play music!"
        );
        return false
    }

    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        msg.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
        return false
    }
    return voiceChannel
}
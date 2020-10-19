module.exports = {
    databaseType: "mongo", // Only 'local' is currently supported
    // databaseURL: "db/users.db", //Url to mongodb database or file location for local
    databaseURL: "mongodb://mongo:27017",


    redisURL: "redis://redis",

    commandDir: "./commands", // Directory where commands are stored


    adminUser: "299983320815763456", //Discord tag for the admin user. (Can add roles and mock jacco)
    bullyUser: "694164639709265930",
    waterDelay: 60_000, //Delay for water reminder

    globalChannels: ["testing", "gambling"], // Channels that the bot is active in


    ready: { "redis": 0, "database": 0, "discord": 0 }, //0 is working, 1 is active, -1 is broken
    //Redis is important for the internal messaging system and database caching
    //Database stores all the data about users and guilds,
    //Discord is the main bot integration

    statusIcons: { "-1": "🔴", 0: "🟡", 1: "🟢" },

    userExpiry: 60, // How long to store users for in the redis cache (Minutes)

    roulette: { //Settings for roulette game
        minimumBetInside: 500,  // Minimum Bet for single numbers
        minimumBetOutside: 1000, // Minimum bet for <even, odd, ...>
        duration: 50, // Duration in seconds of the game
        minTime: 10//Minium time between board-draws
    },

    perms: {
        admin: "lelijk" //Name of admin role in your server
    }
}
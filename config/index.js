module.exports = {
    databaseType: "mongo", // Only 'local' is currently supported
    // databaseURL: "db/users.db", //Url to mongodb database or file location for local
    databaseURL: "mongodb://mongo:27017",


    redisURL: "redis://redis",

    commandDir: "./commands", // Directory where commands are stored


    adminUser: "299983320815763456", //Discord tag for the admin user. (Can add roles and mock jacco)
    waterDelay: 60_000, //Delay for water reminder

    globalChannels: ["testing", "gambling"], // Channels that the bot is active in


    ready: {"redis": 0, "database": 0, "discord": 0}, //0 is working, 1 is active, -1 is broken
    //Redis is important for the internal messaging system and database caching
    //Database stores all the data about users and guilds,
    //Discord is the main bot integration

    statusIcons: {"-1": "🔴", 0: "🟡", 1: "🟢"},

    userExpiry: 60, // How long to store users for in the redis cache (Minutes)
}
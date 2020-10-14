module.exports = {
    databaseType: "local", // Only 'local' is currently supported
    databaseURL: "db/users.db", //Url to mongodb database or file location for local
    commandDir: "./commands", // Directory where commands are stored


    adminUser: "299983320815763456", //Discord tag for the admin user. (Can add roles and mock jacco)
    waterDelay: 60_000, //Delay for water reminder

    globalChannels: ["testing", "gambling"] // Channels that the bot is active in
}
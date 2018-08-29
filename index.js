const Eris = require('eris');
require("eris-additions")(Eris, {
    disabled: ["Channel.sendMessage", "Channel.sendCode", "Eris.Embed"]
});

//=================== Utils ===================//
require('./src/modules.js')();
global.webhook = require('./src/utils/webhook.js');
global.GB = require('./src/utils/gearbox.js');
global.DiscordOAuth = require("./src/website/DiscordOAuth.js").DiscordOAuth;
require("./src/website/discordauth.js");

//===================Init Bot===================//

async function initBot() {
    global.bot = new Eris.CommandClient(botconfig.token, {
        autoReconnect: true,
        disableEveryone: true,
        messageLimit: 250,
        largeThreshold: 500,
        getAllUsers: true,
        sequencerWait: 100,
        maxShards: "auto",
        defaultImageFormat: 'png'
    }, {
        owner: "Dev",
        prefix: botconfig.prefix,
        ignoreBots: false,
        ignoreSelf: false,
        defaultHelpCommand: false,
    });

    //-----------_-= Connect =-_-----------
    bot.connect();

};
initBot();

//===================Load Commands===================//
let files = fs.readdirSync('./src/bot/commands');
for (var i = 0; i < files.length; i++) {
    let filedir = './src/bot/commands/' + files[i]
    fs.readdir(filedir, (err, files) => {
        if (err) {
            console.log('Could\'nt Load the commands...', {
                attach: err
            });
        } else {
            files.forEach((file) => {
                try {
                    let c = require(filedir + '/' + file);
                    if (c.enabled && !c.isSubcommand) {
                        let cmd = bot.registerCommand(c.label ? c.label : file.replace(".js", ""), c.generator, c.options);
                        registerSubcommands(c, cmd);
                        console.log(chalk.bgHex("#2BBBAD")('[Command handler] || The Command ' + `${c.label ? c.label : file.replace(".js", "")}` + ' Was loaded successfully.'));

                        function registerSubcommands(cmd, parent) {
                            cmd.subcommands = cmd.subcommands || [];
                            cmd.subcommands.forEach((subcmd) => {
                                if (subcmd.enabled) {
                                    let c = parent.registerSubcommand(subcmd.label, subcmd.generator, subcmd.options);
                                    registerSubcommands(subcmd, c);
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.log('[Command handler] || Error while loading command ' + file, {
                        attach: e
                    })
                }
            });

        }
    });
}

//===================Load Events===================//
fs.readdir('./src/bot/events', (err, files) => {
    if (err) {
        console.log('[Event handler] || Could\'nt Load the events...', {
            attach: err
        });
        process.exit(1);
    } else {
        files.forEach((file) => {
            try {
                let f = require('./src/bot/events/' + file);
                if (f.enabled) {
                    bot[f.once ? 'once' : 'on'](f.event ? f.event : file.replace(".js", ""), f.handler);
                    console.log(chalk.bgHex("#2BBBAD")('[Event handler] || The ' + `${f.event ? f.event : file.replace(".js", "")}` + ' Event Was loaded successfully.'));
                }
            } catch (e) {
                console.log('[Event handler] || Error while loading event ' + file, {
                    attach: e
                })
            }
        });
    }
});
var admin = require("firebase-admin");

//.update()

var serviceAccount = require("./src/asteria-bot-list-185206-firebase-adminsdk-0ngdy-a25716353a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://asteria-bot-list-185206.firebaseio.com"
});

//===================Process handler===================//
process.on('unhandledRejection', function(reason, p) {

    console.log(chalk.green("//===================Error===================//"));
    console.log(chalk.red('Unhandled Rejection at: Promise \n', p, "\n\nReason:", reason.stack));
    GB.sendReport("Promise report", "Rejection: " + reason.stack, 0xE81123);
    console.log(chalk.green("//===================Error===================//"));

});

process.on('uncaughtException', function(err) {

    console.log(chalk.green("//===================Error===================//"));
    console.log(chalk.red('EXCEPTION: \n' + err));
    GB.sendReport("Exception report", "Rejection: " + err.stack, 0xE81123);
    console.log(chalk.red(err.stack));
    console.log(chalk.green("//===================Error===================//"));

});
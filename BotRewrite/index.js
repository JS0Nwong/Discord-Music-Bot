const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client(); //starts a new discord client

const Distube = require('distube');
const distube = new Distube(client, { searchSongs: false, emitNewSongsOnly: true });

const prefix = '!';
client.on("ready", () => {
    console.log("Bot is online!");
})

client.on("message", async(message) => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift();

    const bot = message.guild.members.cache.get(client.user.id);

    // Queue status template
    const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

    // DisTube event listeners, more in the documentation page
    distube
        .on("playSong", (message, queue, song) => message.channel.send(
            `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user.tag}\n${status(queue)}`
        ))
        .on("addSong", (message, queue, song) => message.channel.send(
            `Added ${song.name} - \`${song.formattedDuration}\` to the queue \n ${status(queue)}`
        ))
        .on("playList", (message, queue, playlist, song) => message.channel.send(
            `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user.tag}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
        ))
        .on("addList", (message, queue, playlist) => message.channel.send(
            `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
        ))
        // DisTubeOptions.searchSongs = true
        .on("searchResult", (message, result) => {
            let i = 0;
            message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
        })
        // DisTubeOptions.searchSongs = true
        .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
        .on("error", (message, e) => {
            console.error(e)
            message.channel.send("An error encountered: " + e);
        });

    switch(command)
    {
        case 'play':
            play(message, args);
            break;
        case 'p':
            play(message, args);
            break;
        case 'stop':
            stop(message);
            break;
        case 'skip':
            skip();
        case 's':
            skip();
        case 'pause':
            pause()
    }

    function play(message, args)
    {
        if(!message.member.voice.channel) return message.channel.send("You are not in a voice channel!");
        if(!args[0]) return message.channel.send("You must provide a link or keywords to search for!");
        distube.play(message, args.join(" "));
    }

    function pause()
    {
        if(!message.member.voice.channel) return message.channel.send("You are not in a voice channel!");
    }

    function stop(message)
    {
        if(!message.member.voice.channel) return message.channel.send("You are not in a voice channel!");
        if(bot.voice.channel != message.member.voice.channel) return message.channel.send("You are not in the same voice channel as the bot!");
        distube.stop(message);
        message.channel.send(" **You stopped playing music** ");
    }

    function skip(message)
    {
        if(!message.member.voice.channel) return message.channel.send("You are not in a voice channel!");
        if(bot.voice.channel != message.member.voice.channel) return message.channel.send("You are not in the same voice channel as the bot!");
        distube.skip(message);
        message.channel.send(`:fast_forward: **Skipped song** :thumbsup:`);
    }

    if (command == "queue" || command == "q") {
        if(!message.member.voice.channel) return message.channel.send("You are not in a voice channel!");
        if(bot.voice.channel != message.member.voice.channel) return message.channel.send("You are not in the same voice channel as the bot!");
        let queue = distube.getQueue(message);
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
            `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).slice(0, 10).join("\n"));
    }
})

client.login(process.env.DISCORD_TOKEN);
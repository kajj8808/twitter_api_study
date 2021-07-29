const Discord = require('discord.js');
const getFourCutManga = require('./twitter.js');
const { discord_id, discord_token } = require('./config.json');

const hook = new Discord.WebhookClient(discord_id, discord_token);

let oldId = '';

const discordEmbed = (id, title, image) =>
    new Discord.MessageEmbed()
        .setTitle(title)
        .setColor('#3498db')
        .setURL(`https://twitter.com/priconne_kr/status/${id}`)
        .setImage(image)
        .setTimestamp();

const main = async () => {
    const { id, title, images } = await getFourCutManga();
    if (oldId !== id) {
        oldId = id;
        hook.send({
            username: 'pricone bot',
            avatarURL:
                'https://pbs.twimg.com/profile_images/1049852539171033088/uPFAfPp1_200x200.jpg',
            embeds: [discordEmbed(id, title, images[0])],
        });
    }
};

setInterval(() => {
    const hours = new Date().getHours();
    if (hours <= 12) {
        main();
    }
}, 300000);

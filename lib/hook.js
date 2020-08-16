const webhook = require("webhook-discord");

const hook = new webhook.Webhook("https://discordapp.com/api/webhooks/643926621413310484/0w9xjvTNL3PTX-mwP3kMlwdvY-K8FTNOjC5vNDthD50SNaCR1tm6rtVtqUw2xhB_6ClR");

function sendToDiscord(module, pattern, result) {

    return new Promise((resolve) => {
        const { id, version } = pattern;
        const msg = new webhook.MessageBuilder()
        .setName('nerdjs-report')
        .setColor("#aabbcc")
        .addField("module_name", module, true)
        .addField("pattern id", id, true)
        .addField("pattern ver", version, true)
        .addField("result", result)
        .setTime();

        hook.send(msg).then(() => {
            resolve();
        });
    });

}

module.exports = sendToDiscord;
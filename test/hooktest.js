const webhook = require("webhook-discord");

const hook = new webhook.Webhook("https://discordapp.com/api/webhooks/649070982988038185/JqJMJa_ZXPhJf0cqOcWj59uwiJBAUp2XJ92Bsh5n9_-XmFhu7X1erncZBw-Gb5L5pp4j");

const sleep = r => new Promise(d=>setTimeout(d, r));

function sendToDiscord(module, pattern, result) {

    return new Promise(async (resolve) => {
        const { id, version } = pattern;
        const msg = new webhook.MessageBuilder()
        .setName('nerdjs-report')
        .setColor("#aabbcc")
        .addField("module_name", module, true)
        .addField("pattern id", id, true)
        .addField("pattern ver", version, true)
        .addField("result", result)
        .setTime();

        await sleep(5000);

        hook.send(msg).then(() => {
            resolve();
        });
    });

}

(async function() {
    console.log(1);
    console.log(await sendToDiscord('1', {id: '2', version: '3'}, '4'));
    console.log(3);
})();
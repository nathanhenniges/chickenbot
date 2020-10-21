let messageQueue = [];
let messagesSent = 0;
let rateLimit = process.env.RATE_LIMIT;

module.exports.addMessage = (twitch, isMsg, channel, message) => {
  if (messagesSent >= rateLimit - 5) {
    messageQueue.push({ twitch, isMsg, channel, message });
    return;
  }

  messagesSent++;
  twitch[isMsg ? "say" : "whisper"](channel, message);
};

setInterval(() => {
  messagesSent = 0;
  messageQueue.map(({ twitch, isMsg, channel, message }, i) => {
    messageQueue.splice(i, 1);
    module.exports.addMessage(twitch, isMsg, channel, message);
  });
}, 30000);

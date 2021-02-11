const tmi = require("tmi.js");
const axios = require("axios");
const addMessage = require("./utils/messageQueue").addMessage;

// Load environment variables from .env file, where API keys and passwords (should be) configured.
require("dotenv").config();

twitch = new tmi.client({
  options: {
    debug: true,
  },
  connection: {
    reconnect: true,
    secure: 443,
  },
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_BOT_OAUTH,
  },
  channels: process.env.CHANNELS.split(","),
});

/**
 * Twitch Bot Login
 */
try {
  twitch.connect();
  console.log("CONNECTED TO TWITCH CHAT");
} catch (error) {
  console.error(new Error(error));
}

// Starts listening to chat.
twitch.on("chat", async (channel, userstate, message, self) => {
  const options = {
    headers: {
      Authorization: process.env.TWITCH_OAUTH,
      "Client-Id": process.env.TWITCH_CLIENT_ID,
    },
  };

  const prefix = "!";
  //  Stops the bot from listening to its self.
  //   if (self) return;

  if (!message.startsWith(prefix)) {
    return;
  }
  const twitchChannel = channel.slice(1);
  const args = message.substring(prefix.length).split(" ");
  const command = args[0];
  switch (command) {
    case "chicken":
    case "chickens":
      try {
        console.log(twitchChannel);
        const streams = await axios.get(
          `https://api.twitch.tv/helix/streams?user_login=${"theprimeagen"}&user_login=${
            process.env.COMPARE_CHANNEL
          }`,
          options
        );

        if (
          streams.data.data[0].user_name.toLowerCase() ===
          twitchChannel.toLowerCase()
        ) {
          return addMessage(
            twitch,
            true,
            twitchChannel,
            `We are are destroying ${process.env.COMPARE_CHANNEL}.  Thanks for helping us ${process.env.EMOTES}`
          );
        }
        addMessage(
          twitch,
          true,
          twitchChannel,
          `The ${process.env.COMPARE_CHANNEL} are destroying us. Make sure to share the stream to help us beat them`
        );
      } catch (e) {
        addMessage(
          twitch,
          true,
          twitchChannel,
          `Damn it chat.  You broke me. ${process.env.EMOTE_FAIL}`
        );
      }
      break;
    default:
      break;
  }
});

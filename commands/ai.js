const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ai",
  description: "interact to google gemini",
  author: "developer",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    const userPrompt = args.join(" ").trim();

    if (!userPrompt && !imageUrl) {
      return sendMessage(
        senderId,
        {
          text: `❌ 𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗼𝗿 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗮𝗹𝗼𝗻𝗴 𝘄𝗶𝘁𝗵 𝗮 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 𝗳𝗼𝗿 𝗿𝗲𝗰𝗼𝗴𝗻𝗶𝘁𝗶𝗼𝗻.`
        },
        pageAccessToken
      );
    }

    sendMessage(
      senderId,
      {
        text: "⌛ 𝗔𝗻𝘀𝘄𝗲𝗿𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..."
      },
      pageAccessToken
    );

    try {
      if (!imageUrl) {
        if (event.message?.reply_to?.mid) {
          imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
        } else if (event.message?.attachments?.[0]?.type === "image") {
          imageUrl = event.message.attachments[0].payload.url;
        }
      }

      const apiUrl = "https://jerome-web.onrender.com/service/api/gemini";
      const response = await handleGeminiRequest(apiUrl, userPrompt, imageUrl);
      const result = response.vision || response.textResponse;

      const responseTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        hour12: true
      });

      const message = `${result}`;

      await sendConcatenatedMessage(senderId, message, pageAccessToken);

    } catch (error) {
      console.error("Error in Gemini command:", error);
      sendMessage(
        senderId,
        { text: `❌ Error: ${error.message || "Something went wrong."}` },
        pageAccessToken
      );
    }
  }
};

async function handleGeminiRequest(apiUrl, prompt, imageUrl) {
  const { data } = await axios.get(apiUrl, {
    params: {
      ask: prompt,
      imgurl: imageUrl || ""
    }
  });

  return data;
}

async function getRepliedImage(mid, pageAccessToken) {
  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: pageAccessToken }
  });

  if (data?.data?.[0]?.image_data?.url) {
    return data.data[0].image_data.url;
  }

  return "";
}

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

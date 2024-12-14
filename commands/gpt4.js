const gothicFont = {
  A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱",
  S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹", 
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫"
};

const convertToGothic = (hot) => {
  return hot.split('').map(ppgi => gothicFont[ppgi] || ppgi).join('');
};

const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const MAX_MESSAGE_LENGTH = 2000;
const DELAY_BETWEEN_MESSAGES = 500;

function sendLongMessage(senderId, text, pageAccessToken, sendMessage) {
  if (text.length > MAX_MESSAGE_LENGTH) {
    const messages = splitMessageIntoChunks(text, MAX_MESSAGE_LENGTH);

    // Combine all chunks into one message sent at intervals
    messages.forEach((messageGroup, index) => {
      setTimeout(() => sendMessage(senderId, { text: messageGroup }, pageAccessToken), index * DELAY_BETWEEN_MESSAGES);
    });
  } else {
    sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}

module.exports = {
  name: 'gpt4',
  description: 'Ask GPT-4 for a response to a given query',
  usage: 'gpt4 <query>',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a query for GPT-4.' }, pageAccessToken);
      return;
    }

    const query = args.join(' ');

    try {
      const apiUrl = `https://markdevs-last-api-2epw.onrender.com/api/v2/gpt4?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const gptResponse = response.data.respond;

      sendLongMessage(senderId, gptResponse, pageAccessToken, sendMessage);

    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Could not get a response from GPT-4.' }, pageAccessToken);
    }
  }
};

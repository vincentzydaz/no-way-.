const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'wiki',
  description: 'Get answer from wikipedia',
  usage: 'wiki [text or question]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {

    const prompt = args.join(' ');
    if (!prompt) return sendMessage(senderId, { text: "Usage: wiki <question or text>" }, pageAccessToken);

    try {
       const { data } = await axios.get(`https://ccproject10-df3227f754.onlitegix.com/api/wiki?q=${encodeURIComponent(prompt)}`);
      
      sendMessage(senderId, { text: data.extract }, pageAccessToken);
    } catch {
      sendMessage(senderId, { text: 'There was an error generating the content. Please try again later.' }, pageAccessToken);
    }
  }
};

const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'board',
  description: 'Generate a board image with custom text.',
  usage: 'board <text>\nExample: board KUPAL KABA',
  author: 'chilli',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide text for the board.\n\nUsage:\n board <text>\nExample: board KUPAL KABA'
      }, pageAccessToken);
      return;
    }

    const text = args.join(' ');
    const apiUrl = `https://api-canvass.vercel.app/board?text=${encodeURIComponent(text)}`;

    await sendMessage(senderId, { text: 'Generating board image... Please wait.' }, pageAccessToken);

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating board image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the board image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "nglspam",
  description: "Send spam messages using NGL API with the correct format.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const input = args.join(" ").split("|").map(item => item.trim());

    if (input.length !== 3) {
      return sendMessage(senderId, { text: "Invalid format. Usage: nglspam username | message | count" }, pageAccessToken);
    }

    const [username, message, count] = input;
    const total = parseInt(count, 10);

    if (isNaN(total) || total <= 0) {
      return sendMessage(senderId, { text: "The count must be a positive integer." }, pageAccessToken);
    }

    sendMessage(senderId, { text: `Sending ${total} messages to ${username}...` }, pageAccessToken);

    try {
      // Encode message to handle spaces and special characters
      const apiUrl = `https://markdevs69v2-679r.onrender.com/api/other/nglspam?username=${encodeURIComponent(username)}&message=${encodeURIComponent(message)}&total=${total}`;

      // Perform the API request
      const response = await axios.get(apiUrl);

      if (response.data && response.data.status === true) {
        const result = response.data.result;
        sendMessage(senderId, { text: result }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: "Failed to send messages. Please check the details and try again." }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error in NGL Spam command:", error);
      sendMessage(senderId, { text: "An error occurred while sending the messages. Please try again." }, pageAccessToken);
    }
  }
};

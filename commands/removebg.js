const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'removebg',
  description: 'Remove background from an image using the RemoveBG API.',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    if (!imageUrl) {
      if (event.message.reply_to && event.message.reply_to.mid) {
        try {
          imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
        } catch (error) {
          return sendMessage(senderId, {
            text: 'Failed to retrieve the image from the reply. Please try again.'
          }, pageAccessToken);
        }
      } else {
        return sendMessage(senderId, {
          text: `Usage Instructions:
To use the "removebg" command, you need to:
1. Reply to an image using **Messenger** (since Facebook Lite does not support reply features for page bots).
2. Type "removebg" as a reply to the image to remove its background.

Example:
- Reply to an image with the message: removebg`
        }, pageAccessToken);
      }
    }

    await sendMessage(senderId, { text: 'Removing bg in the image, please wait... 🖼️' }, pageAccessToken);

    try {
      const removeBgUrl = `https://appjonellccapis.zapto.org/api/removebg?url=${encodeURIComponent(imageUrl)}`;

      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: removeBgUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error removing background:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while processing the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};

async function getAttachments(mid, pageAccessToken) {
  if (!mid) {
    throw new Error("No message ID provided.");
  }

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pageAccessToken }
    });

    if (data && data.data.length > 0 && data.data[0].image_data) {
      return data.data[0].image_data.url;
    } else {
      throw new Error("No image found in the replied message.");
    }
  } catch (error) {
    console.error('Failed to fetch attachments:', error);
    throw new Error("Failed to retrieve the image.");
  }
      }

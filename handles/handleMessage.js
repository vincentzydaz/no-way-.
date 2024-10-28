const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const lastImageByUser = new Map();
const lastVideoByUser = new Map();

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  if (command.name && typeof command.name === 'string') {
    commands.set(command.name.toLowerCase(), command);
  }
}

async function handleMessage(event, pageAccessToken) {
  if (!event || !event.sender || !event.sender.id) return;
  
  const senderId = event.sender.id;
  let imageUrl = null;
  let videoUrl = null;

  // Check for image or video attachments and store them
  if (event.message && event.message.attachments) {
    const imageAttachment = event.message.attachments.find(att => att.type === 'image');
    const videoAttachment = event.message.attachments.find(att => att.type === 'video');

    if (imageAttachment) {
      imageUrl = imageAttachment.payload.url;
      lastImageByUser.set(senderId, imageUrl);
    }
    if (videoAttachment) {
      videoUrl = videoAttachment.payload.url;
      lastVideoByUser.set(senderId, videoUrl);
    }
  }

  // Check for text message and commands
  if (event.message && event.message.text) {
    const messageText = event.message.text.trim();
    const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s/?#]+\/?|https?:\/\/vt\.tiktok\.com\/[^\s/?#]+\/?/;

    if (tiktokRegex.test(messageText)) {
      await sendMessage(senderId, { text: 'Downloading your TikTok video, please wait...' }, pageAccessToken);
      try {
        const response = await axios.post(`https://www.tikwm.com/api/`, { url: messageText });
        const data = response.data.data;
        const shotiUrl = data.play;

        if (shotiUrl) {
          await sendMessage(senderId, {
            attachment: {
              type: 'video',
              payload: {
                url: shotiUrl,
                is_reusable: true
              }
            }
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: 'Failed to retrieve TikTok video URL. Please check the URL and try again.' }, pageAccessToken);
        }
      } catch (error) {
        console.error("Error fetching TikTok video:", error);
        await sendMessage(senderId, { text: 'An error occurred while downloading the TikTok video. Please try again later.' }, pageAccessToken);
      }
      return;
    }

    let commandName, args;
    if (messageText.startsWith('-')) {
      const argsArray = messageText.slice(1).trim().split(/\s+/);
      commandName = argsArray.shift().toLowerCase();
      args = argsArray;
    } else {
      const words = messageText.trim().split(/\s+/);
      commandName = words.shift().toLowerCase();
      args = words;
    }

    // Handle the Imgur command specifically
    if (commandName === 'imgur') {
      const lastImage = lastImageByUser.get(senderId);
      const lastVideo = lastVideoByUser.get(senderId);

      if (lastImage || lastVideo) {
        try {
          const mediaToUpload = lastImage || lastVideo;
          await commands.get('imgur').execute(senderId, args, pageAccessToken, mediaToUpload);

          // Clear the last image or video after use
          if (lastImage) lastImageByUser.delete(senderId);
          if (lastVideo) lastVideoByUser.delete(senderId);
        } catch (error) {
          await sendMessage(senderId, { text: 'An error occurred while uploading the media to Imgur.' }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: 'Please send an image or video first and then use the "imgur" command.' }, pageAccessToken);
      }
      return;
    }

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        let imageUrl = '';
        if (event.message.reply_to && event.message.reply_to.mid) {
          try {
            imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
          } catch (error) {
            imageUrl = '';
          }
        } else if (event.message.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }

        await command.execute(senderId, args, pageAccessToken, event, imageUrl);
      } catch (error) {
        sendMessage(senderId, { text: `There was an error executing the command "${commandName}". Please try again later.` }, pageAccessToken);
      }
    } else {
      sendMessage(senderId, {
        text: `Unknown command: "${commandName}". Type "help" for a list of available commands.`,
        quick_replies: [
          {
            content_type: "text",
            title: "Help",
            payload: "HELP_PAYLOAD"
          }
        ]
      }, pageAccessToken);
    }
  }
}

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
    throw new Error("Failed to fetch attachments.");
  }
}

module.exports = { handleMessage };

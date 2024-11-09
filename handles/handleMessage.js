const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const prefix = '-';

// Load command modules
fs.readdirSync(path.join(__dirname, '../commands'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(`../commands/${file}`);
    commands.set(command.name.toLowerCase(), command);
  });

async function handleMessage(event, pageAccessToken) {
  const senderId = event?.sender?.id;
  if (!senderId) return console.error('Invalid event object');

  const messageText = event?.message?.text?.trim();
  if (!messageText) return console.log('Received event without message text');

  const [commandName, ...args] = messageText.startsWith(prefix)
    ? messageText.slice(prefix.length).split(' ')
    : messageText.split(' ');

  try {
    if (commands.has(commandName.toLowerCase())) {
      await commands.get(commandName.toLowerCase()).execute(senderId, args, pageAccessToken, sendMessage);
    } else {
      await commands.get('ai').execute(senderId, [messageText], pageAccessToken);
    }
  } catch (error) {
    console.error(`Error executing command:`, error);
    await sendMessage(senderId, { text: error.message || 'There was an error executing that command.' }, pageAccessToken);
  }
}

// Handling "gemini" command
    if (messageText.startsWith('gemini')) {
      const lastImage = lastImageByUser.get(senderId);
      const args = messageText.split(/\+/).slice(1);

      try {
        await commands.get('gemini').execute(senderId, args, pageAccessToken, event, lastImage);
        lastImageByUser.delete(senderId);
      } catch (error) {
        await sendMessage(senderId, { text: 'An error occurred while processing the Gemini command.' }, pageAccessToken);
      }
      return;
    }

module.exports = { handleMessage };

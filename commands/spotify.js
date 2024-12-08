const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Read the token once at the top level
const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'spotify',
  description: 'search spotify track.',
  usage: 'spotify <song name>',
  author: 'developer',

  async execute(senderId, args) {
    const pageAccessToken = token;

    if (!Array.isArray(args) || args.length === 0) {
      return await sendError(senderId, 'Error: Please provide a song name.', pageAccessToken);
    }

    const songName = args.join(' ').trim();
    await handleSpotifySearch(senderId, songName, pageAccessToken);
  },
};

// Function to search for a Spotify track
const handleSpotifySearch = async (senderId, songName, pageAccessToken) => {
  try {
    const apiUrl = `https://hiroshi-api.onrender.com/tiktok/spotify?search=${encodeURIComponent(songName)}`;
    const { data } = await axios.get(apiUrl);

    if (data && data.length > 0) {
      const track = data[0];
      const trackName = track.name;
      const trackLink = track.track;
      const trackImage = track.image;
      const downloadUrl = track.download;

      // Send track details as the initial message
      const message = `🎶 | Spotify Track Found\n━━━━━━━━━━━━━━━\n🎧 Track: ${trackName}\n🔗 [Listen on Spotify]\n${trackLink}\n━━━━━━━━━━━━━━━`;
      await sendMessage(senderId, { text: message }, pageAccessToken);

      // Send the image attachment if available
      if (trackImage) {
        const imagePayload = getAttachmentPayload('image', trackImage);
        await sendMessage(senderId, { attachment: imagePayload }, pageAccessToken);
      }

      // Send the audio attachment if available
      if (downloadUrl) {
        const audioPayload = getAttachmentPayload('audio', downloadUrl);
        await sendMessage(senderId, { attachment: audioPayload }, pageAccessToken);
      }
    } else {
      await sendError(senderId, 'Error: No tracks found. Please try a different song name.', pageAccessToken);
    }
  } catch (error) {
    console.error('Error fetching Spotify track:', error);
    await sendError(senderId, 'Error: Unexpected error occurred while searching for the track.', pageAccessToken);
  }
};

// Function to get attachment payload based on type
const getAttachmentPayload = (type, url) => {
  const supportedTypes = {
    image: { type: 'image', payload: { url } },
    audio: { type: 'audio', payload: { url } },
  };

  return supportedTypes[type] || null;
};

// Centralized error handler for sending error messages
const sendError = async (senderId, errorMessage, pageAccessToken) => {
  await sendMessage(senderId, { text: errorMessage }, pageAccessToken);
};

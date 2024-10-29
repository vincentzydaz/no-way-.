const axios = require("axios");
const name = "music";

module.exports = {
  name,
  description: "Creates a music by AI, based how you prompt",
  async run({ api, send, args }){
    const prompt = args.join(" ");
    if (!prompt)
    return send(`Usage: ${api.prefix + name} [your desired prompt]`);
    send("This will take a few minutes, please wait...");
    try {
    const music = await axios.get(api.api_josh + "/api/aimusic", {
      params: {
        prompt
       }
    });
    if (!music) throw new Error();
    const url = music.data.result.audio;
    await send({
      attachment: {
        type: "audio",
        payload: {
          url,
          is_reusable: true
        }
      }
    });
    send(`${prompt} created successfully!\nDownload link: ${url}`);
    } catch (error){
    send("Error while generating your request. Please try again or try another prompt.\n" + error.message || error);
    }
  }
}

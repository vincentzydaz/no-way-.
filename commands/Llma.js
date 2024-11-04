const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

const gothicFont = {
  A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱",
  S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹", 
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫"
};

const convertToGothic = (text) => {
  return text.split('').map(char => gothicFont[char] || char).join('');
};

module.exports = {
  name: "ai",
  description: "Fetches an answer from the Meta AI API for the given question",
  author: "chilli",
  usage: "metaai <question>",

  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: "Please provide a question after the command. Example: ai What is vincent?"
      }, pageAccessToken);
      return;
    }

    try {
      const question = args.join(" ");
      const waitingMessage = await sendMessage(senderId, { text: `AI answering: ${question}` }, pageAccessToken);

      const apiUrl = `https://echavie3.nethprojects.workers.dev/ai?model=@cf/meta/llama-3.2-3b-instruct&q=${encodeURIComponent(question)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.success) {
        const answer = response.data.result;
        const gothicAnswer = convertToGothic(answer);
        await sendConcatenatedMessage(senderId, gothicAnswer, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: "Failed to retrieve a response from AI." }, pageAccessToken);
      }

      if (waitingMessage && waitingMessage.message_id) {
        await sendMessage(senderId, { message_id: waitingMessage.message_id, delete: true }, pageAccessToken);

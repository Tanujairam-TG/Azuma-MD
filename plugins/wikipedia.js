const axios = require('axios');

module.exports = (sock) => {
  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.key.fromMe && message.message.conversation) {
      const receivedText = message.message.conversation;
      if (receivedText.toLowerCase().startsWith('wiki ')) {
        const query = receivedText.substring(5);
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

        try {
          const response = await axios.get(url);
          const text = response.data.extract;
          await sock.sendMessage(message.key.remoteJid, { text });
        } catch (error) {
          await sock.sendMessage(message.key.remoteJid, { text: 'Sorry, I could not find information on that topic.' });
        }
      }
    }
  });
};

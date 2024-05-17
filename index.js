const { makeWASocket, useMultiFileAuthState, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');
const path = require('path');

// Path to your credentials.json file
const credentialsPath = path.join('Azuma session', 'credentials.json');

// Load credentials
const credentials = JSON.parse(fs.readFileSync(credentialsPath, { encoding: 'utf-8' }));

// Load plugins
const pluginsPath = path.join(__dirname, 'plugins');
const plugins = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));

// Initialize plugins
plugins.forEach(plugin => {
  require(path.join(pluginsPath, plugin))(sock);
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      // Reconnect if not logged out
      if ((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('Bot connected.');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.key.fromMe && message.message) {
      const messageType = Object.keys(message.message)[0];
      if (messageType === MessageType.text) {
        const receivedText = message.message.conversation;
        console.log('Received message:', receivedText);
        await sock.sendMessage(message.key.remoteJid, { text: 'Hello, I am your userbot!' });
      }
    }
  });
}

// Start the bot
startBot();

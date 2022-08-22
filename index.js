const express = require('express');
const cors = require('cors');
// const http = require('http');
// const bodyParser = require('body-parser');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
require('dotenv').config();
const path = require('path');

const qrcode = require('qrcode-terminal');

const PORT = process.env.PORT || 8001;

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.use(cors());
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

// app.use(
//   cors({
//     origin: 'https://iura-radulov.github.io/whatsapp-widget/',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//   })
// );
app.use(express.json());
// app.use(bodyParser.json());

let clients = [];

// app.get('/', (req, res) => {
//   res.end('<h1>Home page</>');
// });
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/api/createClient', async (req, res) => {
  const clientId = req.query.client;
  // const isClient = clients.find(x => x.clientId === clientId);
  if (typeof clientId === 'string') {
    // if (isClient) {
    //   try {
    //     isClient.client.destroy();
    //     const index = clients
    //       .map(x => {
    //         return x.clientId;
    //       })
    //       .indexOf(clientId);
    //     clients.splice(index, 1);
    //   } catch (err) {
    //     res.json({ err: 'server error' });
    //   }
    // }
    try {
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: clientId, dataPath: './sessions' }),
        // authStrategy: new LocalAuth(),
        // puppeteer: { executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox'] },
      });
      // client.initialize();
      clients.push({ clientId: clientId, client: client });
      console.log('client initializing...');
      client.on('qr', qr => {
        console.log('QR updated...');
        res.json({ qr: qr });
      });

      client.initialize();
      // qrcode.generate(qr, { small: true });
    } catch (err) {
      res.json({ err: 'server error' });
    }
  } else {
    res.json({ err: `${clientId} problem!` });
  }
});

app.get('/api/getClient', async (req, res) => {
  const clientId = req.query.client;
  const client = clients.find(x => x.clientId === clientId);
  if (client) {
    try {
      const clientInfo = await client.client.info;
      res.json(clientInfo);
    } catch (err) {
      res.json({ err: 'server error' });
    }
  } else {
    res.json({ err: `${client} not found!` });
  }
});

app.get('/api/logout', (req, res) => {
  const clientId = req.query.client;
  const client = clients.find(x => x.clientId === clientId);
  if (client) {
    try {
      client.client.destroy();
      const index = clients
        .map(x => {
          return x.clientId;
        })
        .indexOf(clientId);
      clients.splice(index, 1);
      res.json({ client: 'logged out' });
    } catch (err) {
      res.json({ err: 'server error' });
    }
  } else {
    res.json({ err: `${client} not found!` });
  }
});

app.get('/api/getChats', async (req, res) => {
  const clientId = req.query.client;
  const client = clients.find(x => x.clientId === clientId);
  if (client) {
    try {
      const chats = await client.client.getChats();
      res.json(chats);
    } catch (err) {
      res.json({ err: 'server error' });
    }
  } else {
    res.json({ err: `${client} not found!` });
  }
});

app.get('/api/sendmessage', async (req, res, next) => {
  const clientId = req.query.client;
  const client = clients.find(x => x.clientId === clientId);
  if (client) {
    try {
      const number = req.query.number;
      const message = req.query.message;
      const type = req.query.type;
      if (typeof number === 'string' && typeof message === 'string' && type === 'image/png') {
        const productPath = path.join(__dirname, message.name);
        const media = MessageMedia.fromFilePath(productPath);
        const chat = await client.client.getChats();
        chat.sendMessage(media);

        if (typeof number === 'string' && typeof message === 'string') {
          const msg = await client.client.sendMessage(`${number}@c.us`, message);
          res.json({ msg });
        }

        // const msg = await client.client.sendMessage(`${number}@c.us`, productPath);
        // res.json({ msg });
      }
    } catch (err) {
      res.json({ err: 'server error' });
    }
  } else {
    res.json({ err: `${client} not found!` });
  }
});

app.get('/api/getmessages', async (req, res, next) => {
  const clientId = req.query.client;
  const client = clients.find(x => x.clientId === clientId);
  if (client) {
    try {
      const chatId = req.query.chatId;
      if (typeof chatId === 'string') {
        const chat = await client.client.getChatById(chatId);
        const messages = await chat.fetchMessages({ limit: 30 });
        res.json(messages);
      } else {
        res.json({ error: 'Unknown chatId' });
      }
    } catch (err) {
      res.json({ err: 'server error' });
    }
  } else {
    res.json({ err: `${client} not found!` });
  }
});

app.get('/api/sendmedia', async (req, res, next) => {
  const clientId = req.query.client;
  const client = clients.find(x => x.clientId === clientId);
  if (client) {
    try {
      const number = req.query.number;
      const message = req.query.message;
      if (typeof number === 'string' && typeof message === 'string') {
        const productPath = path.join(__dirname, message.name);
        console.log(productPath);
        const media = MessageMedia.fromFilePath(productPath);
        const chat = await client.client.getChats();
        chat.sendMessage(media);
      }
    } catch (err) {
      res.json({ err: 'server error' });
    }
  } else {
    res.json({ err: `${client} not found!` });
  }
});

app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));

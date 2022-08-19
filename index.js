const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(bodyParser.json());

let clients = [];

app.get('/', res => {
  res.end('<h1>Home page</>');
});

app.get('/api/createClient', async (req, res) => {
  const clientId = req.query.client;
  const isClient = clients.find(x => x.clientId === clientId);
  if (typeof clientId === 'string') {
    if (isClient) {
      try {
        isClient.client.destroy();
        const index = clients
          .map(x => {
            return x.clientId;
          })
          .indexOf(clientId);
        clients.splice(index, 1);
      } catch (err) {
        res.send({ err: 'server error' });
      }
    }
    try {
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: clientId, dataPath: './sessions' }),
        // puppeteer: { executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox'] },
      });
      client.initialize();
      clients.push({ clientId: clientId, client: client });
      console.log('client initializing...');
      client.on('qr', qr => {
        console.log('QR updated...');
        res.send({ qr: qr });
      });
    } catch (err) {
      res.send({ err: 'server error' });
    }
  } else {
    res.send({ err: `${clientId} problem!` });
  }
});

app.get('/api/getClient', async (req, res) => {
  const clientId = req.query.client;
  const client = clients.find(x => x.clientId === clientId);
  if (client) {
    try {
      const clientInfo = await client.client.info;
      res.send(clientInfo);
    } catch (err) {
      res.send({ err: 'server error' });
    }
  } else {
    res.send({ err: `${client} not found!` });
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
      res.send({ client: 'logged out' });
    } catch (err) {
      res.send({ err: 'server error' });
    }
  } else {
    res.send({ err: `${client} not found!` });
  }
});

app.get('/api/getChats', async (req, res) => {
  const clientId = req.query.client;
  const client = clients.find(x => x.clientId === clientId);
  if (client) {
    try {
      const chats = await client.client.getChats();
      res.send(chats);
    } catch (err) {
      res.send({ err: 'server error' });
    }
  } else {
    res.send({ err: `${client} not found!` });
  }
});

app.get('/api/sendmessage', async (req, res, next) => {
  const clientId = req.query.client;
  const client = clients.find(x => x.clientId === clientId);
  if (client) {
    try {
      const number = req.query.number;
      const message = req.query.message;
      if (typeof number === 'string' && typeof message === 'string') {
        const msg = await client.client.sendMessage(`${number}@c.us`, message);
        res.send({ msg });
      }
    } catch (err) {
      res.send({ err: 'server error' });
    }
  } else {
    res.send({ err: `${client} not found!` });
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
        res.send(messages);
      } else {
        res.send({ error: 'Unknown chatId' });
      }
    } catch (err) {
      res.send({ err: 'server error' });
    }
  } else {
    res.send({ err: `${client} not found!` });
  }
});

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));

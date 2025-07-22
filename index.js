const express = require('express');
const app = express();

app.use(express.json());

// ✅ POST-запрос — сюда будут приходить события от WhatsApp
app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);

  // Тут ты будешь отправлять данные в TikTok Events API

  res.sendStatus(200);
});

// ✅ GET-запрос — Meta использует его для верификации Webhook при подключении
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'verify_me_123'; // <- Убедись, что этот токен совпадает с тем, что ты введёшь в Meta

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Просто проверка, что сервер работает
app.get('/', (req, res) => {
  res.send('Сервер работает!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

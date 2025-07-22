const express = require('express');
const app = express();

app.use(express.json());

// ✅ POST-запрос — сюда будут приходить события от WhatsApp
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Проверяем, что это событие от WhatsApp
  if (body.object && body.entry) {
    console.log('Получено событие webhook:');

    body.entry.forEach(entry => {
      if (entry.changes) {
        entry.changes.forEach(change => {
          const value = change.value;
          if (value && value.messages) {
            value.messages.forEach(message => {
              console.log(`Новое сообщение от ${message.from}: ${message.text?.body || '[нет текста]'}`);
            });
          }
        });
      }
    });

    // Отвечаем Meta 200, что приняли webhook
    res.sendStatus(200);
  } else {
    // Неизвестный формат webhook
    res.sendStatus(404);
  }
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

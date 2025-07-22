const axios = require('axios');
const express = require('express');
const app = express();

const TIKTOK_PIXEL_ID = 'D1VUHO3C77U1VHRJL60G';
const TIKTOK_ACCESS_TOKEN = '8bbe0d8a1d5af1cd089e088d63f044aed37e8c29';

app.use(express.json());

async function sendTikTokEvent(phoneNumber) {
  try {
    console.log('Отправляем токен в TikTok:', TIKTOK_ACCESS_TOKEN);
    console.log('Тип и значение TIKTOK_PIXEL_ID:', typeof TIKTOK_PIXEL_ID, TIKTOK_PIXEL_ID);

const payload = {
  event: "Lead",
  event_time: Math.floor(Date.now() / 1000),
  event_source: "web",
  event_source_id: TIKTOK_PIXEL_ID, // рекламный аккаунт TikTok, цифры как строка
    test_event_code: "TEST49852",  // <-- добавляем сюда
  context: {
    pixel_code: TIKTOK_PIXEL_ID, // твой пиксель, строка
    phone_number: phoneNumber,
    user_agent: "WhatsAppWebhook/1.0"
  }
};




    const response = await axios.post(
  'https://business-api.tiktok.com/open_api/v1.3/event/track/',
  payload,
  {
    headers: {
      'Access-Token': TIKTOK_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    }
  }
);


    console.log('TikTok event sent:', response.data);
  } catch (error) {
    console.error('Ошибка при отправке события в TikTok:', error.response?.data || error.message);
  }
}

// ✅ POST-запрос — сюда будут приходить события от WhatsApp
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object && body.entry) {
    console.log('Получено событие webhook:');
    body.entry.forEach(entry => {
      if (entry.changes) {
        entry.changes.forEach(change => {
          const value = change.value;
          if (value && value.messages) {
            value.messages.forEach(message => {
              console.log(`Новое сообщение от ${message.from}: ${message.text?.body || '[нет текста]'}`);
              sendTikTokEvent(message.from); // отправляем номер в TikTok
            });
          }
        });
      }
    });

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// ✅ GET-запрос — для верификации Webhook при подключении
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'verify_me_123';

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

// Проверка, что сервер работает
app.get('/', (req, res) => {
  res.send('Сервер работает!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

const axios = require('axios');
const express = require('express');
const crypto = require('crypto');
const app = express();

const TIKTOK_PIXEL_ID = 'D1VUHO3C77U1VHRJL60G';
const TIKTOK_ACCESS_TOKEN = '8bbe0d8a1d5af1cd089e088d63f044aed37e8c29';

function hashSHA256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

app.use(express.json());

async function sendTikTokEvent(phoneNumber) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const hashedPhone = hashSHA256(phoneNumber);
    const eventId = `wa-msg-${phoneNumber}-${timestamp}`;


    const payload = {
  event_source: "web",               
  event_source_id: TIKTOK_PIXEL_ID, 
  test_event_code: "TEST49852", 
  data: [
    {
      event: "Lead",
      event_time: timestamp,
      event_id: eventId,
      user: {
        phone: hashedPhone // телефон обязательно должен быть в sha256-хеше
      },
      properties: {
        source: "WhatsApp"
      // Можно добавить properties, page, event_id, но не обязательно
    }
        }  
  ]
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

// POST-запрос — сюда будут приходить события от WhatsApp
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

// GET-запрос — для верификации Webhook при подключении
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

const line = require('@line/bot-sdk');
const express = require('express');

const config = {
  channelAccessToken: 'KOXlNr3R9MHWr5GwstKZ983t8fre2S4FeGLlXvlxURGk2Irgh5EXZcyAt+lAi2lk7iL0TStqhaXWK1SedJT0vE5T7qaHIOzyVolh5Ny9dzP0CyTUYf1Pdun/R0BuZxNPTBbauPmTYARBGvHlgkgXYgdB04t89/1O/w1cDnyilFU=',
  channelSecret: '49defcac312cac2ff2d81f5948ab0bb8'
};

const app = express();

// Webhook 受信
app.post(
  '/webhook',
  line.middleware(config),
  (req, res) => {
    Promise
      .all(req.body.events.map(handleEvent))
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }
);

const client = new line.Client(config);

// ★ handleEvent（ここが重要）
function handleEvent(event) {
  console.log('=== 受信イベント ===');
  console.log(JSON.stringify(event, null, 2));

  if (event.type !== 'message' || event.message.type !== 'text') {
    console.log('テキストメッセージではありません');
    return Promise.resolve(null);
  }

  const text = event.message.text;
  console.log('受信テキスト:', text);

  // ★「メニュー」と送られたときだけクイックリプライ
  if (text === 'メニュー') {
    console.log('→ メニュー判定 OK（クイックリプライ送信）');
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'メニューはこちら',
      quickReply: {
        items: [
          {
            type: 'action',
            action: { type: 'message', label: 'りんご', text: 'りんご' }
          },
          {
            type: 'action',
            action: { type: 'message', label: 'みかん', text: 'みかん' }
          }
        ]
      }
    });
  }

  // ★それ以外のメッセージ
  console.log('→ 通常返信');
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: 'メッセージ受信しました'
  });
}

// サーバー起動
app.listen(3000, () => {
  console.log('Webhook running on http://localhost:3000');
});

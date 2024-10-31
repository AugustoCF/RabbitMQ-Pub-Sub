// Name: Vivianne Summers

const amqp = require('amqplib/callback_api');
const fs = require('fs');
const crypto = require('crypto');
const publicKey1 = fs.readFileSync('public_key_star_cross.pem', 'utf8');
const publicKey2 = fs.readFileSync('public_key_space_trip.pem', 'utf8');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    const exchange = 'topic_logs';
    channel.assertExchange(exchange, 'topic', { durable: false });

    channel.assertQueue('', { exclusive: true }, function(error2, q) {
      if (error2) {
        throw error2;
      }

      console.log(' [*] Waiting for promotions. To exit press CTRL+C');
      const bindingKeys = ['*.saturno','promocional.*'];

      bindingKeys.forEach(function(key) {
        channel.bindQueue(q.queue, exchange, key);
      });
      channel.consume(q.queue, function(msg) {
        if (msg.content) {
          const { msg: receivedMsg, signature } = JSON.parse(msg.content.toString());
          // Verf 1
          const verifier1 = crypto.createVerify('SHA256');
          verifier1.update(receivedMsg);
          verifier1.end();
          const isVerified1 = verifier1.verify(publicKey1, signature, 'base64');
          // Verf 2
          const verifier2 = crypto.createVerify('SHA256');
          verifier2.update(receivedMsg);
          verifier2.end();
          const isVerified2 = verifier2.verify(publicKey2, signature, 'base64');
          // Verf OR
          if (isVerified1 || isVerified2) {
            console.log(" [x] Signature verification successed: %s:'%s'", msg?.fields?.routingKey, receivedMsg);
          } else {
            console.log(" [!] Signature verification failed.");
          }
        }
      }, { noAck: true });
    });
  });
});

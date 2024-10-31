const amqp = require('amqplib/callback_api');
const fs = require('fs');
const crypto = require('crypto');
const privateKey = fs.readFileSync('private_key_star_cross.pem', 'utf8');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    const exchange = 'topic_logs';

    // Ofertas para Vênus e Saturno
    const destinos = [
      { key: 'promocional.venus', msg: 'Desconto especial para Vênus!' },
      { key: 'padrao.saturno', msg: 'Preços normais para Saturno!' }
    ];
    
    destinos.forEach(({ key, msg }) => {
      const signer = crypto.createSign('SHA256');
      signer.update(msg);
      signer.end();
      const signature = signer.sign(privateKey, 'base64');
      const signedMessage = JSON.stringify({ msg, signature });

      channel.assertExchange(exchange, 'topic', { durable: false });
      channel.publish(exchange, key, Buffer.from(signedMessage));
      console.log(" [x] Sent %s:'%s'", key, msg);
    });
  });

  setTimeout(function() {
    connection.close();
    process.exit(0);
  }, 500);
});

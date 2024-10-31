const amqp = require('amqplib/callback_api');
const fs = require('fs');
const crypto = require('crypto');
const privateKey = fs.readFileSync('private_key_space_trip.pem', 'utf8');

{/**
  tipo de preço: promocional, padrão
  destinos : saturno, venus, marte, urano, netuno, lua, sol   
*/}

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    const exchange = 'topic_logs';

    // Ofertas para Marte e Vênus
    const destinos = [
      { key: 'promocional.marte', msg: 'Desconto especial para Marte!' },
      { key: 'padrao.venus', msg: 'Preços normais para Vênus!' },
      { key: 'promocional.saturno', msg: 'Garanta sua viagem para Saturno!' }
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

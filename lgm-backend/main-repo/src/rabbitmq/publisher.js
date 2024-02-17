export async function send_message(msg, channel, connection) {
  const queue = "testQueue";
  const message = msg;

  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(message));

  // console.log(`Message sent: ${message}`);

  // setTimeout(() => {
  //   connection.close();
  // }, 500);
}

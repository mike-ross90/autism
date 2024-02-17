import FCM from 'fcm-node'
var serverKey =
  'AAAAsGVM8f0:APA91bEcq5DqlJVaE2Qd3deztoa4nJZXQkMlhse_17rW_hQ9sBMZPQcPyJfcUJr3kn6g6Mgg4gnOM5vLCDtX6FTYTEtkQsT9hke2uTXo-ZBkfwX5ebnnPQ0F2tFJ8bS4UzAg-VTryu7p' //put your server key here
var fcm = new FCM(serverKey)

export const send_notification_for_message = ({ token, title, body, data }) => {
  const message = {
    to: token,
    notification: {
      title: title,
      body: body,
    },
    data,
  }
  console.log('FCM Message:', message)
  fcm.send(message, function (err, response) {
    if (err) {
      console.log('Something has gone wrong!', err)
    } else {
      console.log('Successfully sent with response:', response)
    }
  })
}
const peer = new Peer(); // peerjs.com сервер
const myIdEl = document.getElementById('my-id');
const remoteIdInput = document.getElementById('remote-id');
const connectBtn = document.getElementById('connect');
const shareBtn = document.getElementById('share');
const fullscreenBtn = document.getElementById('fullscreen');
const video = document.getElementById('video');

let conn = null;
let call = null;

// При получении собственного ID
peer.on('open', id => {
  myIdEl.textContent = id;
});

// Подключение к другому пользователю
connectBtn.onclick = () => {
  const remoteId = remoteIdInput.value;
  conn = peer.connect(remoteId);
  conn.on('open', () => {
    alert("Подключено к " + remoteId);
  });
};

// Кнопка "Поделиться экраном"
shareBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 } });
  video.srcObject = stream;

  const remoteId = remoteIdInput.value;
  call = peer.call(remoteId, stream);
};

// Кнопка "На весь экран"
fullscreenBtn.onclick = () => {
  if (video.requestFullscreen) video.requestFullscreen();
  else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
};

// Обработка входящего вызова
peer.on('call', incomingCall => {
  const confirmResult = confirm(`Пользователь ${incomingCall.peer} хочет показать вам свой экран. Принять?`);
  
  if (confirmResult) {
    incomingCall.answer(); // Принимаем без отправки своего потока
    incomingCall.on('stream', stream => {
      video.srcObject = stream;
    });
  } else {
    console.log('Пользователь отказался принимать экран.');
  }
});

const peer = new Peer();
const myIdEl = document.getElementById('my-id');
const remoteIdInput = document.getElementById('remote-id');
const connectBtn = document.getElementById('connect');
const shareBtn = document.getElementById('share');
const fullscreenBtn = document.getElementById('fullscreen');
const video = document.getElementById('video');

let currentStream = null;
let currentCall = null;

// Получить свой ID
peer.on('open', id => {
  myIdEl.textContent = id;
});

// Входящий "инвайт"
peer.on('connection', conn => {
  conn.on('data', async data => {
    if (data.type === 'screen-invite') {
      const accept = confirm(`Пользователь ${conn.peer} хочет показать вам экран. Принять?`);
      if (accept) {
        // Отправим подтверждение
        conn.send({ type: 'invite-accepted' });
      } else {
        conn.send({ type: 'invite-declined' });
      }
    }
  });
});

// При входящем звонке (после подтверждения)
peer.on('call', call => {
  call.answer(); // Без потока, так как мы только смотрим
  call.on('stream', stream => {
    video.srcObject = stream;
  });
});

// Кнопка подключения — отправка инвайта
connectBtn.onclick = () => {
  const remoteId = remoteIdInput.value;
  const conn = peer.connect(remoteId);
  conn.on('open', () => {
    conn.send({ type: 'screen-invite' }); // отправляем приглашение

    conn.on('data', async data => {
      if (data.type === 'invite-accepted') {
        // Принимающая сторона согласилась → запускаем трансляцию
        currentStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 } });
        video.srcObject = currentStream;

        currentCall = peer.call(remoteId, currentStream);
      } else if (data.type === 'invite-declined') {
        alert("Пользователь отказался принять трансляцию.");
      }
    });
  });
};

// Кнопка "На весь экран"
fullscreenBtn.onclick = () => {
  if (video.requestFullscreen) video.requestFullscreen();
  else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
};

const video = document.getElementById('video');
const shareBtn = document.getElementById('shareBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const linkDiv = document.getElementById('link');

let localStream = null;
let currentCall = null;

function generateRandomId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for(let i=0; i<length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Получаем ID комнаты из URL или генерируем новый
const urlParams = new URLSearchParams(window.location.search);
let roomId = urlParams.get('room');
if (!roomId) {
  roomId = generateRandomId();
  // Меняем URL без перезагрузки страницы
  window.history.replaceState(null, null, "?room=" + roomId);
}

// Показываем ссылку для копирования
const currentUrl = window.location.origin + window.location.pathname + '?room=' + roomId;
linkDiv.innerHTML = `<input type="text" value="${currentUrl}" readonly style="width:80%;padding:8px;font-size:16px;" />`;

// Инициализируем Peer с ID комнаты (чтобы упростить — делаем peer.id = roomId + role)
const peerId = roomId + '-' + (Math.random() < 0.5 ? 'host' : 'guest'); // рандомно выбираем роль
const peer = new Peer(peerId, {
  debug: 2
});

peer.on('open', id => {
  console.log('Мой Peer ID:', id);
});

// Обработка входящего звонка (мы — зритель)
peer.on('call', call => {
  call.answer(); // Не передаем поток, только принимаем
  currentCall = call;
  call.on('stream', stream => {
    video.srcObject = stream;
  });
  call.on('close', () => {
    video.srcObject = null;
  });
});

// Кнопка "Поделиться экраном" — вызываем другого пользователя в комнате
shareBtn.onclick = async () => {
  if (localStream) {
    alert("Вы уже транслируете экран!");
    return;
  }
  try {
    localStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30, width: 1920, height: 1080 },
      audio: false
    });
    video.srcObject = localStream;

    // Находим ID партнёра в комнате (если мы host, то guest, и наоборот)
    const partnerId = roomId + (peerId.endsWith('host') ? '-guest' : '-host');
    const call = peer.call(partnerId, localStream);
    currentCall = call;
    call.on('close', () => {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
      video.srcObject = null;
    });
  } catch (e) {
    alert('Ошибка доступа к экрану: ' + e.message);
  }
};

// Полноэкранный режим для видео
fullscreenBtn.onclick = () => {
  if (video.requestFullscreen) video.requestFullscreen();
  else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
};

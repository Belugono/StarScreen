// Получаем параметры комнаты и роли из URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room') || generateRandomId();
const role = urlParams.get('role') || 'guest'; // по умолчанию смотрящий

// Если нет room в URL — обновим ссылку и покажем её
if (!urlParams.get('room')) {
  const newUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}&role=host`;
  window.history.replaceState(null, null, newUrl);
  alert('Вы хост — поделитесь этой ссылкой с другом: ' + newUrl);
}

linkDiv.innerHTML = `<input type="text" value="${window.location.origin + window.location.pathname + '?room=' + roomId + '&role=' + (role === 'host' ? 'guest' : 'host')}" readonly style="width:80%;padding:8px;font-size:16px;" />`;

// Формируем peerId по роли
const peerId = roomId + '-' + role;
const peer = new Peer(peerId, {
  debug: 2
});

peer.on('open', id => {
  console.log('Мой Peer ID:', id);
});

if (role === 'host') {
  shareBtn.style.display = 'inline-block';
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

      const partnerId = roomId + '-guest';
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
} else {
  // Для гостя кнопка скрыта
  shareBtn.style.display = 'none';

  // Гость отвечает на вызов и показывает поток
  peer.on('call', call => {
    call.answer();
    currentCall = call;
    call.on('stream', stream => {
      video.srcObject = stream;
    });
    call.on('close', () => {
      video.srcObject = null;
    });
  });
}

fullscreenBtn.onclick = () => {
  if (video.requestFullscreen) video.requestFullscreen();
  else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
};

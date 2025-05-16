const peer = new Peer(); // peerjs.com сервер
const myIdEl = document.getElementById('my-id');
const remoteIdInput = document.getElementById('remote-id');
const connectBtn = document.getElementById('connect');
const shareBtn = document.getElementById('share');
const fullscreenBtn = document.getElementById('fullscreen');
const video = document.getElementById('video');

let conn = null;
let call = null;

peer.on('open', id => {
  myIdEl.textContent = id;
});

peer.on('call', incomingCall => {
  incomingCall.answer(); // ответить без потока (если только принимаем)
  incomingCall.on('stream', stream => {
    video.srcObject = stream;
  });
});

connectBtn.onclick = () => {
  const remoteId = remoteIdInput.value;
  conn = peer.connect(remoteId);
  conn.on('open', () => {
    alert("Подключено к " + remoteId);
  });
};

shareBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 } });
  video.srcObject = stream;

  const remoteId = remoteIdInput.value;
  call = peer.call(remoteId, stream);
};

fullscreenBtn.onclick = () => {
  if (video.requestFullscreen) video.requestFullscreen();
  else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
};

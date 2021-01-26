// HTML에서 정의한 요소를 참조
let divSelectRoom = document.getElementById("selectRoom");
let divConsultingRoom = document.getElementById("consultingRoom");
const buttonGoRoom = document.getElementById("goRoom");
const inputRoomNumber = document.getElementById("roomNumber");
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");

let inputCallName = document.getElementById("inputCallName");
let buttonSetName = document.getElementById("buttonSetName");
let headingCallName = document.getElementById("callName");

// 다른 값을 호스팅하기 위해 다른 변수를 추가, 향후 비디오에서 사용할 변수를 추가(글로벌로 설정하는 데 필요한 방 번호)
let roomNumber,
  localStream,
  remoteStream,
  rtcPeerConnection,
  isCaller,
  dataChannel;

// rtcPeerConnection를 정의할 수 있도록 iceServers 설정
const iceServers = {
  iceServer: [
    // 모질라에서 제공하는 stun 서버
    { urls: "stun:stun.services.mozilla.com" },
    // 구글에서 제공하는 stun 서버
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

// 상수가 될 스트림 제약을 정의 함 (문자열 제약 조건이지만 비디오 및 오디오 스트림에 적용 됨)
const streamConstraints = {
  audio: true,
  video: true,
};

// 소켓 상수 설정
const socket = io();

// 화상채팅 접속 버튼 (실제 이름을 입력하고 이동을 클릭하면 애플리케이션에 액세스 가능)
buttonGoRoom.onclick = async function () {
  // 유효한 방이 있는지 유효성 검사
  if (!inputRoomNumber.value) {
    alert("화상채팅 코드를 확인해주세요");
  } else {
    // 입력값의 방 번호를 받음
    roomNumber = inputRoomNumber.value;
    // 신호 서버에서 방 번호와 참여 메시지 정보를 다른 피어로 보냄
    socket.emit("create or join", roomNumber);

    // 사용자 미디어 연결을 아래의 socket.on으로 이동
    // navigator.mediaDevices
    //   .getUserMedia(streamConstraints)
    //   .then((stream) => {
    //     localStream = stream;
    //     localVideo.srcObject = stream;
    //   })
    //   .catch((err) => {
    //     console.log(`에러 : ${err}`);
    //   });
    divSelectRoom.style = "display: none";
    divConsultingRoom.style = "display: block";
  }
};

buttonSetName.onclick = async function () {
  if (!inputCallName.value) {
    alert("please enter call name");
  } else {
    dataChannel.send(inputCallName.value);
    headingCallName.innerText = inputCallName.value;
  }
};

// 서버 응답 수신하는 메시지 핸들러를 추가 (app.js -> io.on(if numClients == 0))
socket.on("created", async function (room) {
  localStream = await navigator.mediaDevices
    .getUserMedia(streamConstraints)
    .catch((err) => {
      console.log(`에러 : ${err}`);
    });
  localVideo.srcObject = localStream;
  isCaller = true;
});

socket.on("joined", async function (room) {
  localStream = await navigator.mediaDevices.getUserMedia(streamConstraints);
  localVideo.srcObject = localStream;
  socket.emit("ready", roomNumber);
});

socket.on("ready", async function (room) {
  if (isCaller) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = onicecandidate;
    rtcPeerConnection.ontrack = onAddStream;
    rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
    rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
    dataChannel = rtcPeerConnection.createDataChannel(roomNumber);
    const sdp = await rtcPeerConnection.createOffer();
    rtcPeerConnection.setLocalDescription(sdp);
    socket.emit("offer", {
      type: "offer",
      sdp: sdp,
      room: roomNumber,
    });

    dataChannel.onmessage = (event) => {
      headingCallName.innerText = event.data;
    };
  }
});

socket.on("offer", async function (event) {
  if (!isCaller) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = onicecandidate;
    rtcPeerConnection.ontrack = onAddStream;
    rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
    rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
    rtcPeerConnection.ondatachannel = (event) => {
      dataChannel = event.channel;
      dataChannel.onmessage = (event) => {
        headingCallName.innerText = event.data;
      };
    };
    const sdp = await rtcPeerConnection.createAnswer();
    rtcPeerConnection.setLocalDescription(sdp);
    socket.emit("answer", {
      type: "answer",
      sdp: sdp,
      room: roomNumber,
    });
  }
});

socket.on("candidate", function (event) {
  console.log("received candidate event", event);
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.lable,
    candidate: event.candidate.candidate,
    sdpMid: event.id,
  });

  rtcPeerConnection.addIceCandidate(candidate);
});

socket.on("answer", async function (event) {
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
});

function onAddStream(event) {
  remoteVideo.srcObject = event.streams[0];
  remoteStream = event.streams[0];
}

function onicecandidate(event) {
  if (event.candidate) {
    console.log(`sending ice candidate`, event.candidate);
    const outgoing = {
      type: "candidate",
      lable: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate,
      room: roomNumber,
    };
    console.log(outgoing);
    socket.emit("candidate", outgoing);
  }
}

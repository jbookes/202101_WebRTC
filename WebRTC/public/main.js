// HTML에서 정의한 요소를 참조
let divSelectRoom = document.getElementById("selectRoom");
let divConsultingRoom = document.getElementById("consultingRoom");
let inputRoomNumber = document.getElementById("roomNumber");
let btnGoRoom = document.getElementById("goRoom");
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");

// 다른 값을 호스팅하기 위해 다른 변수를 추가, 향후 비디오에서 사용할 변수를 추가(글로벌로 설정하는 데 필요한 방 번호)
let roomNumber, localStream, remoteStream, rtcPeerConnection, isCaller;

// rtcPeerConnection를 정의할 수 있도록 iceServers 설정
const iceServers = {
  iceServer: [
    // 모질라에서 제공하는 스턴서버
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

// 화상채팅 접속 버튼 (실제 이름을 입력하고 이동을 클릭하면 애플리케이션에 액세스 가능)
btnGoRoom.onclick = () => {
  // 유효한 방이 있는지 유효성 검사
  if (inputRoomNumber.value === "") {
    alert("화상채팅 코드를 확인해주세요");
  } else {
    navigator.mediaDevices
      .getUserMedia(streamConstraints)
      .then((stream) => {
        localStream = stream;
        localVideo.srcObject = stream;
      })
      .catch((err) => {
        console.log(`에러 : ${err}`);
      });
    divSelectRoom.style = "display : none";
    divConsultingRoom.style = "display : black";
  }
};

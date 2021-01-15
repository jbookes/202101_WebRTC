# WebRTC

1. 별도 플러그인 없이 웹에서 RTC(Real-Time-Communications) 구현이 가능

2. 기능 종류 (MediaStream, PeerConnection, DataChannel)
   MediaStream : 사용자의 PC 또는 Mobile의 카메라, 마이크 등의 데이터 스트림에 액세스 함.
   PeerConnection : 암호화 및 대역폭 관리 기능을 사용하여 음성 또는 영상 통화할 수 있음.
   DataChannel : 일반 데이터의 P2P 통신을 가능하게 함.

3. 그 외 세부적인 기능
   getUserMedia :
   응용 프로그램에서 사용자가 미디어 장치에 액세스 할 수 있도록 함.

4. adapter.js 사용
   여러가지 브라우저 접속할 때 생기는 차이들을 통일화하기 위해 사용 됨.
   ex) 크롬, 파이어폭스, 오페라, 사파리, 엣지 등등

5. 통신관련 메모
   사용자 로컬에 미디어 스트림이 있으면 TCP 연결을 통해 RTC 빌드를 만듬
   SRTP 프로토콜을 사용하여 피어 투 피어 연결이 이루어짐
   즉, 미디어가 스토리지 없이 다른 브러우저로 바로 이동함
   중간 및 전송 중에 암호화되어 기본적으로 보안이 가능함

6. 라이브러리 설치
   npm install -S express
   npm install -S socket.io

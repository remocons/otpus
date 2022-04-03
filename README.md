# otpus

pseudo otp generator,  cryptograpy

- hash wrapper :  sha256,  chacha
시중 hash를 사용하지만,  서로 사용법이 조금씩 다르다. 이를 일반화.
암호화시 hash 선택가능하도록

- pseudo OTP generator. hash base.
해시생성도 규칙에 따라 달라진다. 

입력자료도 자료형따라 달라진다.


- encrypt   XOR with OTP
xor연산은 
1. otp 생성
2. xor연산.  연산은 별도 규칙불필요.
otp 생성 규칙적용.

현재 사용방식

key 가 문자면 UTF8 버퍼 변환 먼저

key 가 버퍼면  hash 생성

data는 buffer.

byte단위 연산,

연산속도를 위해  4바이트 연산이기본.  나머지연산.

            ]]

xcrypt()




encrypt()kjjjjmmmmm        

decrypt()



- 노드,브라우저 공용
- 일부 기본 함수는  c/cpp 포팅, 호환성제공

MBP. 사용.
- 바이너리 패키징
- Buffer 유틸리티.
- 노드,브라우저 공용


bayo.  파일암호화,   파일.블롭.  브라우저/노드 호환. 파일처리.  암호화 기본은 webCrypto AES기반.  일부 암호키 작업을 전용암호사용.




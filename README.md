# seochoAI
# MUSICGEN 프로젝트

MUSICGEN은 사용자 입력을 기반으로 AI를 활용하여 독특한 음악을 생성하는 프로젝트입니다.

## 프로젝트 개요

이 프로젝트는 사용자가 제공한 프롬프트를 바탕으로 AI 모델을 사용하여 독창적인 음악을 생성합니다. OpenAI의 GPT 모델을 활용하여 프롬프트를 최적화하고, Facebook의 MusicGen 모델을 사용하여 실제 음악을 생성합니다.

## 주요 기능

1. 프롬프트 기반 음악 생성: 사용자의 텍스트 입력을 바탕으로 AI가 음악을 생성합니다.
2. 다중 변주 생성: 하나의 프롬프트로 여러 개의 음악 변주를 생성할 수 있습니다.
3. 음악 길이 조절: 사용자가 원하는 음악 길이를 지정할 수 있습니다.
4. 실시간 진행 상황 표시: 음악 생성 과정의 진행 상황을 실시간으로 확인할 수 있습니다.
5. 음악 다운로드: 생성된 음악을 WAV 파일 형식으로 다운로드할 수 있습니다.

## 기술 스택

### 프론트엔드
- React.js: 사용자 인터페이스 구축
- Ant Design: UI 컴포넌트 라이브러리
- Axios: HTTP 클라이언트
- Vite: 빌드 도구

### 백엔드
- FastAPI: 백엔드 프레임워크
- OpenAI GPT-4o-mini: 프롬프트 최적화
- Facebook의 MusicGen (musicgen-small 모델): 음악 생성
- PyDub, SoundFile: 오디오 처리
- asyncio: 비동기 처리
- Pydantic: 데이터 검증 및 설정 관리

## 시작하기

1. 프로젝트 클론:
   ```
   git clone [프로젝트 레포지토리 URL]
   cd musicgen
   ```

2. 의존성 설치:
   ```
   pip install -r requirements.txt
   npm install
   ```

3. 환경 변수 설정:
   - `.env` 파일을 생성하고 필요한 API 키를 설정합니다.

4. 백엔드 실행:
   ```
   uvicorn main:app --reload
   ```

5. 프론트엔드 실행:
   ```
   npm run dev
   ```

## 프로젝트 구조

- `main.py`: FastAPI 애플리케이션의 메인 파일
- `model.py`: AI 모델 핸들러 및 음악 생성 로직
- `prompt.py`: 음악 생성 프롬프트 템플릿
- `type.py`: Pydantic 모델 정의
- `App.jsx`: React 애플리케이션의 메인 컴포넌트
- `vite.config.js`: Vite 설정 파일
- `package.json`: 프로젝트 의존성 및 스크립트 정의

## 주의사항

- 이 프로젝트는 OpenAI API와 Facebook의 MusicGen 모델을 사용합니다. 적절한 API 키와 모델 사용 권한이 필요합니다.

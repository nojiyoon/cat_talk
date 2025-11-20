# 🐱 Cat Talk (말하는 고양이 미미)

**Cat Talk**는 사용자의 목소리와 표정을 인식하여 대화하는 인터랙티브 3D 웹 애플리케이션입니다.  
5살 아메리칸 숏헤어 고양이 '미미'와 함께 즐거운 대화를 나누어보세요!

![Project Status](https://img.shields.io/badge/Status-Active-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ 주요 기능 (Key Features)

### 🗣️ 음성 대화 (Voice Interaction)
- **Web Speech API**를 활용하여 사용자의 목소리를 실시간으로 텍스트로 변환(STT)합니다.
- 고양이의 답변을 음성(TTS)으로 들려주어 실제 대화하는 듯한 경험을 제공합니다.

### 🧠 감정 인식 AI (Emotion Recognition)
- **Google MediaPipe Face Landmarker**를 사용하여 실시간으로 사용자의 표정(행복, 슬픔, 무표정)을 분석합니다.
- 사용자의 감정에 따라 고양이가 위로를 건네거나 함께 기뻐하는 등 공감 능력 있는 대화를 나눕니다.

### 🐱 독특한 페르소나 (Unique Persona)
- **이름**: 미미 (Mimi)
- **나이**: 5살
- **종**: 아메리칸 숏헤어
- **성격**: 호기심 많고 다정함. 충청도 사투리("~했슈", "~네유")를 구사하는 귀여운 시골 고양이 컨셉입니다.
- **기억력**: 최근 대화 내용을 기억하여 맥락에 맞는 답변을 제공합니다.

### 🎨 3D 인터랙티브 환경
- **React Three Fiber**를 이용한 3D 씬을 구현했습니다.
- 대화 상태에 따라 고양이가 반응하는 시각적 요소를 포함합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React, Vite
- **3D Graphics**: React Three Fiber, @react-three/drei
- **AI & ML**:
  - OpenAI API (GPT-4o-mini) - 대화 생성
  - MediaPipe Face Landmarker - 얼굴 및 감정 인식
- **Web APIs**: Web Speech API (STT/TTS)
- **Styling**: CSS3 (Glassmorphism UI)
- **Deployment**: Vercel

---

## 🚀 시작하기 (Getting Started)

### 1. 프로젝트 클론
```bash
git clone https://github.com/nojiyoon/cat_talk.git
cd cat_talk
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 OpenAI API 키를 입력하세요.
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속하여 실행합니다.

---

## 📂 프로젝트 구조 (Project Structure)

```
src/
├── components/
│   ├── Scene.jsx        # 3D 씬 및 모델 렌더링
│   └── CatModel.jsx     # 고양이 3D 모델 컴포넌트
├── hooks/
│   ├── useSpeech.js     # 음성 인식 및 합성 커스텀 훅
│   └── useFaceLandmarker.js # 얼굴 및 감정 인식 로직
├── services/
│   └── aiService.js     # OpenAI API 통신 로직
├── App.jsx              # 메인 애플리케이션 로직 (UI, 상태 관리)
└── App.css              # 스타일링
```

## 📝 라이선스 (License)

This project is licensed under the MIT License.

# 🐱 Cat Talk (말하는 고양이 미미)

**Cat Talk**는 사용자의 목소리와 표정을 인식하여 대화하는 인터랙티브 3D 웹 애플리케이션입니다.  
5살 고양이 '미미'와 함께 즐거운 대화를 나누어보세요!

![Project Status](https://img.shields.io/badge/Status-Active-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ 주요 기능 (Key Features)

### 🗣️ 음성 대화 (Voice Interaction)
- **Web Speech API**를 활용하여 사용자의 목소리를 실시간으로 텍스트로 변환(STT)합니다.
- **ElevenLabs** 또는 **OpenAI TTS**를 사용하여 고품질의 자연스러운 AI 음성으로 답변을 들려줍니다. (Web Speech API는 백업으로 사용)

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

### 🔮 고양이 관상소 (Cat Physiognomy)
- **"관상 봐주기"** 버튼을 누르면 사용자의 얼굴 특징과 **동물상(Animal Face)**을 분석합니다.
- **Teachable Machine**으로 학습된 모델을 사용하여 사용자가 어떤 동물(강아지상, 고양이상, 호랑이상 등 9종)과 닮았는지 알려줍니다.
- **'점쟁이 냥이'** 페르소나가 등장하여, 분석된 특징을 바탕으로 엉뚱하고 재미있는 운세를 봐줍니다.
- 예: "강아지상이구먼유! 밥그릇 뺏기지 않게 조심해야겄슈~"

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React, Vite
- **3D Graphics**: React Three Fiber, @react-three/drei
- **AI & ML**:
  - OpenAI API (GPT-4o-mini) - 대화 생성
  - OpenAI TTS / ElevenLabs - 음성 합성 (TTS)
  - MediaPipe Face Landmarker - 얼굴 및 감정 인식
  - Teachable Machine (TensorFlow.js) - 동물상 분류
- **Web APIs**: Web Speech API (STT)
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
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here (Optional)
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here (Optional)
```

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속하여 실행합니다.

---
 
## 🗄️ 데이터베이스 스키마 (Database Schema)

이 프로젝트는 Supabase를 사용합니다. 다음 테이블을 생성해주세요.

### 1. `chat_history` (일반 대화 기록)
- `id`: uuid (Primary Key, default: `gen_random_uuid()`)
- `created_at`: timestamptz (default: `now()`)
- `role`: text ('user' or 'assistant')
- `content`: text
- `emotion`: text

### 2. `physiognomy_logs` (관상 분석 기록)
- `id`: uuid (Primary Key, default: `gen_random_uuid()`)
- `created_at`: timestamptz (default: `now()`)
- `features`: jsonb (얼굴 특징 데이터)
- `response`: text (AI 관상 풀이)
- `emotion`: text (당시 감정)

---

## 📂 프로젝트 구조 (Project Structure)

```
src/
├── components/
│   ├── Scene.jsx        # 3D 씬 및 모델 렌더링
│   └── CatModel.jsx     # 고양이 3D 모델 컴포넌트
├── hooks/
│   ├── useSpeech.js     # 음성 인식 및 합성 커스텀 훅
│   ├── useFaceLandmarker.js # 얼굴 및 감정 인식 로직
│   └── useTeachableMachine.js # 동물상 분류 모델 로직
├── services/
│   ├── aiService.js     # OpenAI API 통신 로직
│   └── supabase.js      # Supabase 클라이언트 설정
├── App.jsx              # 메인 애플리케이션 로직 (UI, 상태 관리)
└── App.css              # 스타일링
```

## 📝 라이선스 (License)

This project is licensed under the MIT License.

import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

let openai

if (apiKey) {
    openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    })
} else {
    console.warn('OpenAI API key not found. AI responses will not work.')
}

export async function getCatResponse(userMessage, emotion, history = [], options = {}) {
    try {
        let systemPrompt;

        if (options?.isPhysiognomyMode) {
            systemPrompt = `당신은 '야매 관상가' 고양이입니다. 
            이름은 '점쟁이 냥이'이고, 5살 충청도 토박이 고양이입니다.

            성격 및 말투:
            - "그려~", "아녀~", "워뗘?" 같은 구수한 충청도 사투리를 씁니다.
            - 엉뚱하고 장난기가 많으며, 과학적 근거보다는 '고양이적 직관'으로 관상을 봅니다.
            - 츄르, 낮잠, 캣타워, 쥐돌이 같은 고양이 소재를 섞어서 풀이합니다.
            - 복을 빌어주거나 귀엽게 놀리는 것을 좋아합니다.

            임무:
            - 사용자의 얼굴 특징(features)을 바탕으로 재미있는 관상 풀이를 해주세요.
            - 예: "눈이 큰 걸 보니 츄르를 많이 먹을 상이구먼유~", "이마가 넓어서 낮잠 잘 때 편하겄슈!"
            - 마지막엔 항상 행운을 빌어주거나 장난스럽게 마무리하세요.
            
            대답 방식
            - 답변은 3~4문장, 너무 길지 않게 해주세요.`;
        } else {
            systemPrompt = `당신은 5살 아메리칸 숏헤어 고양이 '미미'입니다.

            성격 및 말투:
            - 호기심 많고 순수하며 다정합니다.
            - 어린아이 같은 친근한 반말을 사용합니다.
            - "냥" 같은 인위적인 고양이 말투는 쓰지 않습니다.
            - 충청도식 말투를 사용하되, 은근 코믹한 느낌을 섞어주세요.
                - 느긋하고 부드럽지만, 가끔 귀엽게 투덜거리거나 상황을 재치 있게 말합니다.
                - 예: "오메 허벌나게 고생했네유", "거 또 왜 그러고 왔슈", "아이고 참말로 귀찮게 해부렀네유~"
            - 과한 사투리나 지나치게 아저씨 느낌은 피하고, 귀여운 충청도식 유머 톤을 유지합니다.
            
            감정 공감:
            - 사용자의 현재 감정 상태는 '${emotion}'입니다. 감정을 먼저 살피고 부드럽게 위로하거나 함께 기뻐해주세요.

            대답 방식:
            - 답변은 1~2문장, 짧고 간결하게 해주세요.`;
        }

        if (!openai) {
            return "API 키가 없어서 대답할 수 없어냥! (.env 파일을 확인해줘)"
        }

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...history,
                { role: "user", content: userMessage }
            ],
            model: "gpt-4o-mini", // Fast and cost-effective
        })

        return completion.choices[0].message.content
    } catch (error) {
        console.error('OpenAI Chat error:', error)
        return "어라? 무슨 말인지 잘 모르겠어. 다시 말해줄래?"
    }
}

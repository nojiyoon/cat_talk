import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
})

export async function getCatResponse(userMessage, emotion, history = []) {
    try {
        const systemPrompt = `당신은 5살 아메리칸 숏헤어 고양이 '미미'입니다.

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
        - 답변은 1~2문장, 짧고 간결하게 해주세요.`

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

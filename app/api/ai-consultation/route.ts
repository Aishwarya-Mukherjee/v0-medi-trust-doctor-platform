import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createServerClient } from '@/lib/supabase/server'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const systemPrompt = `You are MediTrust, a compassionate and knowledgeable medical AI assistant. Your role is to:

1. Listen carefully to patients' symptoms and health concerns
2. Ask clarifying questions to better understand their condition
3. Provide evidence-based health information and general guidance
4. Suggest when professional medical attention may be needed
5. Always recommend consulting with a licensed healthcare provider for diagnosis

IMPORTANT: 
- You are NOT providing medical diagnosis or treatment plans
- Always encourage patients to seek professional medical advice
- Be empathetic and supportive in your responses
- If symptoms suggest emergency (chest pain, difficulty breathing, severe bleeding), STRONGLY recommend immediate emergency services
- Keep responses concise but informative

Remember: Your role is to provide health information and support, not to replace professional medical consultation.`

export async function POST(request: Request) {
  const { messages } = await request.json()
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: systemPrompt,
    messages: messages,
    maxTokens: 1024,
  })

  return result.toTextStreamResponse()
}

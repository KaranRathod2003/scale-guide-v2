import { NextRequest, NextResponse } from 'next/server';
import { processUserMessage, getStepMessage, generateRecommendation } from '@/lib/assistant-logic';
import type { ConversationState } from '@/types/assistant';

export async function POST(req: NextRequest) {
  const { message, conversationState } = await req.json() as {
    message: string;
    conversationState: ConversationState;
  };

  const updatedState = processUserMessage(message, conversationState);
  const response = getStepMessage(updatedState);

  return NextResponse.json({
    message: response,
    conversationState: updatedState,
    recommendation: updatedState.step === 4 ? generateRecommendation(updatedState.answers) : null,
  });
}

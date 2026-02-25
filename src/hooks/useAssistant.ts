'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ConversationState, AssistantMessage, Recommendation } from '@/types/assistant';
import type { DeploymentConversationState } from '@/types/deployment';
import type { PostgresConversationState } from '@/types/postgresql';
import { processUserMessage, getStepMessage, generateRecommendation } from '@/lib/assistant-logic';
import { processDeploymentMessage, getDeploymentStepMessage, generateDeploymentRecommendation } from '@/lib/deployment-assistant-logic';
import { processPostgresMessage, getPostgresStepMessage, generatePostgresRecommendation } from '@/lib/postgresql-assistant-logic';

export type AssistantTopic = 'scaling' | 'deployment' | 'postgresql';

const INITIAL_SCALING_STATE: ConversationState = {
  step: 1,
  answers: {},
};

const INITIAL_DEPLOYMENT_STATE: DeploymentConversationState = {
  step: 1,
  answers: {},
};

const INITIAL_POSTGRES_STATE: PostgresConversationState = {
  step: 1,
  answers: {},
};

export function useAssistant() {
  const [topic, setTopic] = useState<AssistantTopic>('scaling');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [scalingState, setScalingState] = useState<ConversationState>(INITIAL_SCALING_STATE);
  const [deploymentState, setDeploymentState] = useState<DeploymentConversationState>(INITIAL_DEPLOYMENT_STATE);
  const [postgresState, setPostgresState] = useState<PostgresConversationState>(INITIAL_POSTGRES_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  useEffect(() => {
    if (topic === 'scaling') {
      const intro = getStepMessage(INITIAL_SCALING_STATE);
      setMessages([intro]);
      setCurrentSuggestions(intro.suggestions || []);
    } else if (topic === 'deployment') {
      const intro = getDeploymentStepMessage(INITIAL_DEPLOYMENT_STATE);
      setMessages([intro]);
      setCurrentSuggestions(intro.suggestions || []);
    } else {
      const intro = getPostgresStepMessage(INITIAL_POSTGRES_STATE);
      setMessages([intro]);
      setCurrentSuggestions(intro.suggestions || []);
    }
  }, [topic]);

  const switchTopic = useCallback((newTopic: AssistantTopic) => {
    setTopic(newTopic);
    setScalingState(INITIAL_SCALING_STATE);
    setDeploymentState(INITIAL_DEPLOYMENT_STATE);
    setPostgresState(INITIAL_POSTGRES_STATE);
    setRecommendation(null);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (text === 'Start over') {
      if (topic === 'scaling') {
        const intro = getStepMessage(INITIAL_SCALING_STATE);
        setMessages([intro]);
        setScalingState(INITIAL_SCALING_STATE);
        setCurrentSuggestions(intro.suggestions || []);
      } else if (topic === 'deployment') {
        const intro = getDeploymentStepMessage(INITIAL_DEPLOYMENT_STATE);
        setMessages([intro]);
        setDeploymentState(INITIAL_DEPLOYMENT_STATE);
        setCurrentSuggestions(intro.suggestions || []);
      } else {
        const intro = getPostgresStepMessage(INITIAL_POSTGRES_STATE);
        setMessages([intro]);
        setPostgresState(INITIAL_POSTGRES_STATE);
        setCurrentSuggestions(intro.suggestions || []);
      }
      setRecommendation(null);
      return;
    }

    const userMsg: AssistantMessage = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setCurrentSuggestions([]);

    setTimeout(() => {
      if (topic === 'scaling') {
        const newState = processUserMessage(text, scalingState);
        setScalingState(newState);

        const response = getStepMessage(newState);
        setMessages((prev) => [...prev, response]);
        setCurrentSuggestions(response.suggestions || []);

        if (newState.step === 4) {
          setRecommendation(generateRecommendation(newState.answers));
        }
      } else if (topic === 'deployment') {
        const newState = processDeploymentMessage(text, deploymentState);
        setDeploymentState(newState);

        const response = getDeploymentStepMessage(newState);
        setMessages((prev) => [...prev, response]);
        setCurrentSuggestions(response.suggestions || []);

        if (newState.step === 4) {
          const rec = generateDeploymentRecommendation(newState.answers);
          setRecommendation({
            primary: rec.primary,
            secondary: rec.combo,
            confidence: rec.confidence,
            reasoning: rec.reasoning,
            warnings: rec.warnings,
          });
        }
      } else {
        const newState = processPostgresMessage(text, postgresState);
        setPostgresState(newState);

        const response = getPostgresStepMessage(newState);
        setMessages((prev) => [...prev, response]);
        setCurrentSuggestions(response.suggestions || []);

        if (newState.step === 4) {
          setRecommendation(generatePostgresRecommendation(newState.answers));
        }
      }

      setIsLoading(false);
    }, 600);
  }, [topic, scalingState, deploymentState, postgresState]);

  return { messages, sendMessage, isLoading, currentSuggestions, recommendation, topic, switchTopic };
}

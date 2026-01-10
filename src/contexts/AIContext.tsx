import { createContext, useContext, useState, ReactNode } from 'react';

interface AIContextType {
  isAIEnabled: boolean;
  userConsent: boolean;
  loading: boolean;
  error: string | null;
  setUserConsent: (consent: boolean) => void;
  features: {
    smartRoutes: boolean;
    dynamicPricing: boolean;
    riskAssessment: boolean;
    nlpSearch: boolean;
    recommendations: boolean;
    predictive: boolean;
    smartMatching: boolean;
    conversationAI: boolean;
  };
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({ children }: AIProviderProps) {
  const [userConsent, setUserConsentState] = useState<boolean>(true);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const setUserConsent = (consent: boolean) => {
    setUserConsentState(consent);
  };

  const value: AIContextType = {
    isAIEnabled: true,
    userConsent,
    loading,
    error,
    setUserConsent,
    features: {
      smartRoutes: true,
      dynamicPricing: true,
      riskAssessment: true,
      nlpSearch: true,
      recommendations: true,
      predictive: true,
      smartMatching: true,
      conversationAI: true,
    },
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

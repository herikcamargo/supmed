import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star,
  Send,
  X
} from 'lucide-react';

const FEEDBACK_STORAGE_KEY = 'supmed_feedback_history';

// Perguntas de feedback por módulo
const feedbackQuestions = {
  default: [
    { id: 'facilidade', pergunta: 'O módulo foi fácil de usar?', type: 'rating' },
    { id: 'precisao', pergunta: 'As informações foram precisas?', type: 'rating' },
    { id: 'velocidade', pergunta: 'O tempo de resposta foi adequado?', type: 'rating' }
  ],
  diagnostico: [
    { id: 'facilidade', pergunta: 'O diagnóstico foi fácil de obter?', type: 'rating' },
    { id: 'precisao', pergunta: 'O diagnóstico foi preciso?', type: 'rating' },
    { id: 'utilidade', pergunta: 'As sugestões foram úteis?', type: 'rating' }
  ],
  prescricao: [
    { id: 'facilidade', pergunta: 'A prescrição foi fácil de criar?', type: 'rating' },
    { id: 'completude', pergunta: 'Encontrou todas as medicações?', type: 'rating' },
    { id: 'formato', pergunta: 'O formato da prescrição foi adequado?', type: 'rating' }
  ],
  calculadora: [
    { id: 'facilidade', pergunta: 'O score foi fácil de calcular?', type: 'rating' },
    { id: 'clareza', pergunta: 'A interpretação foi clara?', type: 'rating' },
    { id: 'utilidade', pergunta: 'A conduta sugerida foi útil?', type: 'rating' }
  ]
};

export default function FeedbackCollector({ module, onClose, autoShow = false }) {
  const [isVisible, setIsVisible] = useState(autoShow);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const questions = feedbackQuestions[module] || feedbackQuestions.default;

  useEffect(() => {
    if (autoShow) {
      // Verificar se já coletou feedback recentemente para este módulo
      const lastFeedback = localStorage.getItem(`supmed_last_feedback_${module}`);
      if (lastFeedback) {
        const lastDate = new Date(lastFeedback);
        const hoursSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          setIsVisible(false);
          return;
        }
      }
      
      // Mostrar após delay
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [autoShow, module]);

  const handleRating = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
    
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleSubmit = () => {
    const feedback = {
      id: `feedback_${Date.now()}`,
      module,
      timestamp: new Date().toISOString(),
      responses,
      comment,
      sessionId: localStorage.getItem('supmed_session_id')
    };

    // Salvar feedback
    const history = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
    history.unshift(feedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
    
    // Marcar que coletou feedback
    localStorage.setItem(`supmed_last_feedback_${module}`, new Date().toISOString());
    
    setSubmitted(true);
    
    // Fechar após 2s
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 2000);
  };

  const handleSkip = () => {
    localStorage.setItem(`supmed_last_feedback_${module}`, new Date().toISOString());
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <Card className="w-80 bg-white shadow-lg border border-slate-200">
        <CardContent className="p-4">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <ThumbsUp className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-slate-800">Obrigado pelo feedback!</p>
              <p className="text-xs text-slate-500">Sua opinião nos ajuda a melhorar</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-slate-700">Feedback Rápido</p>
                  <p className="text-[10px] text-slate-400">{currentStep + 1} de {questions.length}</p>
                </div>
                <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-800 mb-3">{questions[currentStep].pergunta}</p>
                
                {/* Rating Stars */}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(questions[currentStep].id, star)}
                      className={`p-1 transition-transform hover:scale-110 ${
                        responses[questions[currentStep].id] >= star 
                          ? 'text-amber-400' 
                          : 'text-slate-200'
                      }`}
                    >
                      <Star 
                        className="w-8 h-8" 
                        fill={responses[questions[currentStep].id] >= star ? 'currentColor' : 'none'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1 mb-3">
                {questions.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx <= currentStep ? 'bg-blue-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Comentário opcional no último step */}
              {currentStep === questions.length - 1 && responses[questions[currentStep].id] && (
                <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                  <Textarea
                    placeholder="Comentário adicional (opcional)"
                    className="h-16 text-xs"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmit}
                  >
                    <Send className="w-3 h-3 mr-1" /> Enviar Feedback
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para solicitar feedback
export function useFeedback(module) {
  const [showFeedback, setShowFeedback] = useState(false);

  const requestFeedback = () => {
    setShowFeedback(true);
  };

  const FeedbackComponent = showFeedback ? (
    <FeedbackCollector 
      module={module} 
      autoShow={true}
      onClose={() => setShowFeedback(false)} 
    />
  ) : null;

  return { requestFeedback, FeedbackComponent };
}

// Obter estatísticas de feedback
export const getFeedbackStats = (module = null) => {
  const history = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
  const filtered = module ? history.filter(f => f.module === module) : history;
  
  if (filtered.length === 0) return null;

  const avgByQuestion = {};
  filtered.forEach(feedback => {
    Object.entries(feedback.responses).forEach(([key, value]) => {
      if (!avgByQuestion[key]) {
        avgByQuestion[key] = { total: 0, count: 0 };
      }
      avgByQuestion[key].total += value;
      avgByQuestion[key].count += 1;
    });
  });

  Object.keys(avgByQuestion).forEach(key => {
    avgByQuestion[key] = (avgByQuestion[key].total / avgByQuestion[key].count).toFixed(1);
  });

  return {
    total: filtered.length,
    averages: avgByQuestion,
    lastFeedback: filtered[0]?.timestamp
  };
};
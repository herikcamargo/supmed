import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Zap, RotateCcw, ThumbsUp, Clock, ThumbsDown } from 'lucide-react';

export default function FlashcardsMode({ userEmail }) {
  const [cardAtual, setCardAtual] = useState(null);
  const [mostrarVerso, setMostrarVerso] = useState(false);
  const [contador, setContador] = useState(0);

  const queryClient = useQueryClient();

  const { data: flashcards = [] } = useQuery({
    queryKey: ['edu_flashcards'],
    queryFn: () => base44.entities.EduFlashcard.list()
  });

  const atualizarPontuacaoMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.entities.EduPontuacao.filter({ usuario_email: userEmail });
      if (result.length > 0) {
        const atual = result[0];
        await base44.entities.EduPontuacao.update(atual.id, {
          flashcards_concluidos: atual.flashcards_concluidos + 1,
          pontos_totais: atual.pontos_totais + 5
        });
      }
      queryClient.invalidateQueries(['edu_pontuacao']);
    }
  });

  const proximoCard = (dificuldade) => {
    if (mostrarVerso) {
      atualizarPontuacaoMutation.mutate();
      if (dificuldade === 'facil') toast.success('+5 pontos');
    }
    
    if (flashcards.length > 0) {
      const random = flashcards[Math.floor(Math.random() * flashcards.length)];
      setCardAtual(random);
      setMostrarVerso(false);
      setContador(contador + 1);
    }
  };

  useEffect(() => {
    if (flashcards.length > 0 && !cardAtual) {
      proximoCard();
    }
  }, [flashcards]);

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Flashcards</p>
                <p className="text-xs text-slate-500">Revisados hoje: {contador}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!cardAtual ? (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhum flashcard disponível</p>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className="bg-white/80 backdrop-blur-sm border-slate-200 cursor-pointer hover:shadow-lg transition-all min-h-64"
          onClick={() => setMostrarVerso(!mostrarVerso)}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-64">
            <div className="text-center mb-4">
              <Badge variant="outline" className="text-[8px] mb-2">{cardAtual.especialidade}</Badge>
              <p className="text-xs text-slate-500 mb-4">
                {mostrarVerso ? 'Resposta' : 'Pergunta'} • Clique para virar
              </p>
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-slate-800 leading-relaxed">
                {mostrarVerso ? cardAtual.verso : cardAtual.frente}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {mostrarVerso && cardAtual && (
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            className="h-12 text-xs text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => proximoCard('dificil')}
          >
            <ThumbsDown className="w-4 h-4 mb-1" />
            <br />Difícil
          </Button>
          <Button 
            variant="outline" 
            className="h-12 text-xs text-yellow-600 border-yellow-200 hover:bg-yellow-50"
            onClick={() => proximoCard('medio')}
          >
            <Clock className="w-4 h-4 mb-1" />
            <br />Revisar
          </Button>
          <Button 
            className="h-12 text-xs bg-green-600 hover:bg-green-700"
            onClick={() => proximoCard('facil')}
          >
            <ThumbsUp className="w-4 h-4 mb-1" />
            <br />Fácil
          </Button>
        </div>
      )}
    </div>
  );
}
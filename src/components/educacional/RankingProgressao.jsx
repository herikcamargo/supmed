import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp, Award, Medal, Crown } from 'lucide-react';

export default function RankingProgressao({ userEmail }) {
  const { data: rankings = [] } = useQuery({
    queryKey: ['edu_ranking'],
    queryFn: async () => {
      const result = await base44.entities.EduPontuacao.list('-pontos_totais', 20);
      return result;
    }
  });

  const posicaoUsuario = rankings.findIndex(r => r.usuario_email === userEmail) + 1;
  const dadosUsuario = rankings.find(r => r.usuario_email === userEmail);

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-sm border-green-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Ranking Global</p>
              <p className="text-xs text-slate-500">Sua posição: #{posicaoUsuario || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {dadosUsuario && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">Sua Performance</p>
                <div className="flex gap-2">
                  <Badge className="bg-green-600 text-white text-xs">
                    {dadosUsuario.pontos_totais} pontos
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Nível {dadosUsuario.nivel}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {dadosUsuario.quizzes_respondidos} quizzes
                  </Badge>
                </div>
              </div>
              <Award className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Top 20 Estudantes</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Nenhum dado de ranking ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rankings.map((rank, i) => {
                const isPodio = i < 3;
                const isUser = rank.usuario_email === userEmail;
                
                return (
                  <div 
                    key={rank.id} 
                    className={`p-2 rounded border transition-colors ${
                      isUser ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPodio ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {i === 0 && <Crown className="w-3 h-3" />}
                          {i === 1 && <Medal className="w-3 h-3" />}
                          {i === 2 && <Award className="w-3 h-3" />}
                          {i > 2 && (i + 1)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-800">
                            {isUser ? 'Você' : rank.usuario_email.split('@')[0]}
                          </p>
                          <p className="text-[10px] text-slate-500">Nível {rank.nivel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800">{rank.pontos_totais}</p>
                        <p className="text-[10px] text-slate-500">{rank.quizzes_respondidos} quizzes</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
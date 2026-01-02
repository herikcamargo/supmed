import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  GraduationCap,
  Brain,
  BookOpen,
  Trophy,
  Zap,
  Clock,
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
  Flame,
  Star,
  BarChart3
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';

import QuizClinico from '../components/educacional/QuizClinico';
import FlashcardsMode from '../components/educacional/FlashcardsMode';
import TemasRapidos from '../components/educacional/TemasRapidos';
import RankingProgressao from '../components/educacional/RankingProgressao';

export default function ModoEducacional() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setUserEmail(user.email);
      } catch {
        const stored = localStorage.getItem('supmed_doctor');
        if (stored) {
          const doctor = JSON.parse(stored);
          setUserEmail(doctor.email);
        }
      }
    };
    loadUser();
  }, []);

  // Carregar pontuação do usuário
  const { data: pontuacao } = useQuery({
    queryKey: ['edu_pontuacao', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const result = await base44.entities.EduPontuacao.filter({ usuario_email: userEmail });
      return result[0] || null;
    },
    enabled: !!userEmail
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">


          {/* Header com Stats Rápidas */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Pontos</p>
                    <p className="text-lg font-bold text-purple-600">{pontuacao?.pontos_totais || 0}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Streak</p>
                    <p className="text-lg font-bold text-orange-600 flex items-center gap-1">
                      {pontuacao?.streak_dias || 0}
                      <Flame className="w-4 h-4" />
                    </p>
                  </div>
                  <Flame className="w-8 h-8 text-orange-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Nível</p>
                    <p className="text-lg font-bold text-blue-600">{pontuacao?.nivel || 1}</p>
                  </div>
                  <Star className="w-8 h-8 text-blue-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Taxa Acerto</p>
                    <p className="text-lg font-bold text-green-600">
                      {pontuacao?.acertos_total && pontuacao?.quizzes_respondidos 
                        ? Math.round((pontuacao.acertos_total / pontuacao.quizzes_respondidos) * 100)
                        : 0}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200/50 p-1 mb-4">
              <TabsTrigger value="inicio" className="text-xs gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Início
              </TabsTrigger>
              <TabsTrigger value="quiz" className="text-xs gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Quiz
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="text-xs gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Flashcards
              </TabsTrigger>
              <TabsTrigger value="temas" className="text-xs gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Revisão
              </TabsTrigger>
              <TabsTrigger value="ranking" className="text-xs gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Ranking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inicio" className="mt-0">
              <InicioView onNavigate={setActiveTab} pontuacao={pontuacao} />
            </TabsContent>

            <TabsContent value="quiz" className="mt-0">
              <QuizClinico userEmail={userEmail} />
            </TabsContent>

            <TabsContent value="flashcards" className="mt-0">
              <FlashcardsMode userEmail={userEmail} />
            </TabsContent>

            <TabsContent value="temas" className="mt-0">
              <TemasRapidos userEmail={userEmail} />
            </TabsContent>

            <TabsContent value="ranking" className="mt-0">
              <RankingProgressao userEmail={userEmail} />
            </TabsContent>
          </Tabs>

          <DisclaimerFooter />
        </div>
      </main>
    </div>
  );
}

// COMPONENTE: Tela Inicial
function InicioView({ onNavigate, pontuacao }) {
  const modulos = [
    {
      id: 'quiz',
      titulo: 'Quiz Clínico',
      descricao: 'Questões de múltipla escolha com feedback imediato',
      icon: Brain,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'flashcards',
      titulo: 'Flashcards',
      descricao: 'Revisão rápida com repetição espaçada',
      icon: Zap,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'temas',
      titulo: 'Temas Rápidos',
      descricao: 'Resumos de 2-3 minutos para revisão',
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'ranking',
      titulo: 'Ranking',
      descricao: 'Veja sua evolução e compare com outros',
      icon: Trophy,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Boas-vindas */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                Bem-vindo ao Modo Educacional!
              </h2>
              <p className="text-sm text-slate-600 mb-3">
                Aprimore seus conhecimentos através de quizzes, flashcards e revisões rápidas. 
                Acumule pontos, suba de nível e compare seu progresso com outros estudantes.
              </p>
              <div className="flex gap-2">
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  Nível {pontuacao?.nivel || 1}
                </Badge>
                <Badge className="bg-orange-100 text-orange-700 text-xs">
                  {pontuacao?.streak_dias || 0} dias consecutivos
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  {pontuacao?.quizzes_respondidos || 0} quizzes realizados
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Módulos */}
      <div className="grid md:grid-cols-2 gap-4">
        {modulos.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card key={mod.id} className={`${mod.bgColor} ${mod.borderColor} border-2 hover:shadow-lg transition-all cursor-pointer group`} onClick={() => onNavigate(mod.id)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${mod.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-800 mb-1">{mod.titulo}</h3>
                    <p className="text-xs text-slate-600">{mod.descricao}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dica do Dia */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-1">💡 Dica de Estudo</p>
              <p className="text-xs text-amber-700">
                Estude por intervalos de 25-30 minutos (técnica Pomodoro) e mantenha sua sequência diária ativa para maximizar o aprendizado!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
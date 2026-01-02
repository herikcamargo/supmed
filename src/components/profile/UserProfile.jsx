import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Award, 
  TrendingUp, 
  Clock, 
  Star,
  Target,
  BookOpen,
  Activity,
  CheckCircle2,
  Medal,
  Flame
} from 'lucide-react';

// Competências e níveis
const competencias = [
  { id: 'emergencia', nome: 'Emergência', icon: Activity, maxLevel: 10 },
  { id: 'cardiologia', nome: 'Cardiologia', icon: Activity, maxLevel: 10 },
  { id: 'pediatria', nome: 'Pediatria', icon: Activity, maxLevel: 10 },
  { id: 'neurologia', nome: 'Neurologia', icon: Activity, maxLevel: 10 },
  { id: 'toxicologia', nome: 'Toxicologia', icon: Activity, maxLevel: 10 },
  { id: 'trauma', nome: 'Trauma', icon: Activity, maxLevel: 10 }
];

// Conquistas possíveis
const achievements = [
  { id: 'first_diagnosis', nome: 'Primeiro Diagnóstico', desc: 'Completou 1 diagnóstico IA', icon: '🎯', points: 10 },
  { id: 'speed_demon', nome: 'Velocista', desc: 'Completou atendimento em < 5min', icon: '⚡', points: 20 },
  { id: 'night_owl', nome: 'Coruja Noturna', desc: '10 atendimentos noturnos', icon: '🦉', points: 30 },
  { id: 'protocol_master', nome: 'Mestre dos Protocolos', desc: 'Usou 50 protocolos', icon: '📋', points: 50 },
  { id: 'score_expert', nome: 'Expert em Scores', desc: 'Calculou 100 scores', icon: '🧮', points: 40 },
  { id: 'lifesaver', nome: 'Salva-Vidas', desc: '100 atendimentos de emergência', icon: '❤️', points: 100 },
  { id: 'educator', nome: 'Educador', desc: 'Compartilhou 20 casos', icon: '📚', points: 25 },
  { id: 'researcher', nome: 'Pesquisador', desc: 'Consultou 200 guidelines', icon: '🔬', points: 35 }
];

export default function UserProfile({ isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const doctor = JSON.parse(localStorage.getItem('supmed_doctor') || '{}');
    const stats = JSON.parse(localStorage.getItem('supmed_user_stats') || '{}');
    const userAchievements = JSON.parse(localStorage.getItem('supmed_achievements') || '[]');
    const competenciaLevels = JSON.parse(localStorage.getItem('supmed_competencias') || '{}');
    
    setProfile({
      ...doctor,
      stats: {
        totalAtendimentos: stats.totalAtendimentos || 0,
        diagnosticosIA: stats.diagnosticosIA || 0,
        prescricoes: stats.prescricoes || 0,
        horasUso: stats.horasUso || 0,
        sequenciaDias: stats.sequenciaDias || 0,
        pontosTotais: stats.pontosTotais || 0,
        ...stats
      },
      achievements: userAchievements,
      competencias: competenciaLevels
    });
  };

  const getLevel = (points) => {
    if (points < 100) return { level: 1, title: 'Iniciante', nextLevel: 100 };
    if (points < 300) return { level: 2, title: 'Aprendiz', nextLevel: 300 };
    if (points < 600) return { level: 3, title: 'Praticante', nextLevel: 600 };
    if (points < 1000) return { level: 4, title: 'Especialista', nextLevel: 1000 };
    if (points < 1500) return { level: 5, title: 'Expert', nextLevel: 1500 };
    if (points < 2500) return { level: 6, title: 'Mestre', nextLevel: 2500 };
    return { level: 7, title: 'Lenda', nextLevel: points };
  };

  if (!isOpen || !profile) return null;

  const levelInfo = getLevel(profile.stats.pontosTotais);
  const progressToNext = ((profile.stats.pontosTotais / levelInfo.nextLevel) * 100).toFixed(0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  {profile.pronoun} {profile.fullName}
                </h2>
                <p className="text-xs text-slate-500">CRM: {profile.crm}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="text-[9px] bg-indigo-500">
                    <Star className="w-2.5 h-2.5 mr-0.5" /> Nível {levelInfo.level}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{levelInfo.title}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          {/* Level Progress */}
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-indigo-700">{profile.stats.pontosTotais} XP</span>
              <span className="text-xs text-indigo-500">{levelInfo.nextLevel} XP para próximo nível</span>
            </div>
            <Progress value={parseFloat(progressToNext)} className="h-2" />
            <div className="flex items-center gap-2 mt-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-slate-600">
                Sequência: <strong>{profile.stats.sequenciaDias} dias</strong>
              </span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-100 p-0.5 h-8 mb-4">
              <TabsTrigger value="overview" className="text-[10px] h-7">Visão Geral</TabsTrigger>
              <TabsTrigger value="competencias" className="text-[10px] h-7">Competências</TabsTrigger>
              <TabsTrigger value="conquistas" className="text-[10px] h-7">Conquistas</TabsTrigger>
              <TabsTrigger value="historico" className="text-[10px] h-7">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <Activity className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-800">{profile.stats.totalAtendimentos}</p>
                  <p className="text-[10px] text-slate-500">Atendimentos</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <Target className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-800">{profile.stats.diagnosticosIA}</p>
                  <p className="text-[10px] text-slate-500">Diagnósticos IA</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <BookOpen className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-800">{profile.stats.prescricoes}</p>
                  <p className="text-[10px] text-slate-500">Prescrições</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-800">{profile.stats.horasUso}h</p>
                  <p className="text-[10px] text-slate-500">Tempo de Uso</p>
                </div>
              </div>

              {/* Destaques */}
              <h3 className="text-xs font-semibold text-slate-700 mb-2">Pontos de Destaque</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-100">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-700">Alta precisão em diagnósticos de emergência</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-700">Uso consistente de protocolos atualizados</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="competencias">
              <div className="space-y-3">
                {competencias.map((comp) => {
                  const level = profile.competencias[comp.id] || 0;
                  const progress = (level / comp.maxLevel) * 100;
                  
                  return (
                    <div key={comp.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-700">{comp.nome}</span>
                        <Badge variant="outline" className="text-[9px]">Nível {level}/{comp.maxLevel}</Badge>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="conquistas">
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((ach) => {
                  const unlocked = profile.achievements.includes(ach.id);
                  return (
                    <div 
                      key={ach.id} 
                      className={`p-3 rounded-lg border ${unlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-50'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{ach.icon}</span>
                        <div>
                          <p className="text-xs font-medium text-slate-800">{ach.nome}</p>
                          <p className="text-[9px] text-slate-500">{ach.desc}</p>
                        </div>
                      </div>
                      {unlocked && (
                        <Badge className="text-[8px] bg-amber-500 mt-1">+{ach.points} XP</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="historico">
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Histórico de atendimentos simulados</p>
                <p className="text-[10px] text-slate-300">Em desenvolvimento</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Função para atualizar stats do usuário
export const updateUserStats = (stat, increment = 1) => {
  const stats = JSON.parse(localStorage.getItem('supmed_user_stats') || '{}');
  stats[stat] = (stats[stat] || 0) + increment;
  localStorage.setItem('supmed_user_stats', JSON.stringify(stats));
};

// Função para desbloquear conquista
export const unlockAchievement = (achievementId) => {
  const achievements = JSON.parse(localStorage.getItem('supmed_achievements') || '[]');
  if (!achievements.includes(achievementId)) {
    achievements.push(achievementId);
    localStorage.setItem('supmed_achievements', JSON.stringify(achievements));
    
    // Adicionar pontos
    const ach = achievements.find(a => a.id === achievementId);
    if (ach) {
      updateUserStats('pontosTotais', ach.points);
    }
    
    return true; // Nova conquista
  }
  return false;
};

// Função para atualizar competência
export const updateCompetencia = (competenciaId, increment = 0.1) => {
  const competencias = JSON.parse(localStorage.getItem('supmed_competencias') || '{}');
  competencias[competenciaId] = Math.min(10, (competencias[competenciaId] || 0) + increment);
  localStorage.setItem('supmed_competencias', JSON.stringify(competencias));
};
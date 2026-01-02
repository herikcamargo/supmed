import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Activity, TrendingUp, Search, Calendar, AlertTriangle } from 'lucide-react';

// Atualizar estatísticas do sistema
export function updateSystemStats(event) {
  const stats = JSON.parse(localStorage.getItem('supmed_system_stats') || '{}');
  
  if (!stats.searches) stats.searches = [];
  if (!stats.diseases) stats.diseases = [];
  if (!stats.daily) stats.daily = {};
  if (!stats.errors) stats.errors = [];
  
  const today = new Date().toISOString().split('T')[0];
  
  switch (event.type) {
    case 'search':
      stats.searches.unshift({
        query: event.query,
        timestamp: new Date().toISOString()
      });
      if (stats.searches.length > 100) stats.searches.splice(100);
      break;
      
    case 'disease_query':
      const existingDisease = stats.diseases.find(d => d.name === event.disease);
      if (existingDisease) {
        existingDisease.count++;
      } else {
        stats.diseases.push({ name: event.disease, count: 1 });
      }
      stats.diseases.sort((a, b) => b.count - a.count);
      if (stats.diseases.length > 50) stats.diseases.splice(50);
      break;
      
    case 'error':
      stats.errors.unshift({
        message: event.message,
        page: event.page,
        timestamp: new Date().toISOString()
      });
      if (stats.errors.length > 50) stats.errors.splice(50);
      break;
  }
  
  // Atualizar estatísticas diárias
  if (!stats.daily[today]) {
    stats.daily[today] = { searches: 0, users: 0, errors: 0 };
  }
  if (event.type === 'search') stats.daily[today].searches++;
  if (event.type === 'error') stats.daily[today].errors++;
  
  localStorage.setItem('supmed_system_stats', JSON.stringify(stats));
}

export default function SystemStats() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Atualizar a cada 5s
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    const storedStats = JSON.parse(localStorage.getItem('supmed_system_stats') || '{}');
    const storedUsers = JSON.parse(localStorage.getItem('supmed_users') || '[]');
    setStats(storedStats);
    setUsers(storedUsers);
  };

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ativo').length;
  const newToday = users.filter(u => u.createdAt?.startsWith(today)).length;
  const newThisWeek = users.filter(u => u.createdAt >= lastWeek).length;
  
  const onlineUsers = users.filter(u => {
    const lastLogin = new Date(u.lastLogin || 0);
    const now = new Date();
    return (now - lastLogin) < 15 * 60 * 1000; // Últimos 15 min
  }).length;

  const todaySearches = stats.daily?.[today]?.searches || 0;
  const todayErrors = stats.daily?.[today]?.errors || 0;

  return (
    <div className="space-y-4">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs opacity-80">Total Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <UserPlus className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-2xl font-bold">{newThisWeek}</p>
                <p className="text-xs opacity-80">Novos (7 dias)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-2xl font-bold">{onlineUsers}</p>
                <p className="text-xs opacity-80">Online Agora</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Search className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-2xl font-bold">{todaySearches}</p>
                <p className="text-xs opacity-80">Pesquisas Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Top Pesquisas */}
        <Card className="bg-white/80 border border-slate-200/50">
          <CardContent className="p-3">
            <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Top Pesquisas
            </h3>
            <div className="space-y-1">
              {stats.searches?.slice(0, 8).map((search, i) => (
                <div key={i} className="flex items-center justify-between p-1 bg-slate-50 rounded text-xs">
                  <span className="truncate flex-1">{search.query}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(search.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {!stats.searches?.length && (
                <p className="text-xs text-slate-400 text-center py-4">Nenhuma pesquisa registrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Doenças Mais Consultadas */}
        <Card className="bg-white/80 border border-slate-200/50">
          <CardContent className="p-3">
            <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Doenças Mais Consultadas
            </h3>
            <div className="space-y-1">
              {stats.diseases?.slice(0, 8).map((disease, i) => (
                <div key={i} className="flex items-center justify-between p-1 bg-slate-50 rounded text-xs">
                  <span className="truncate flex-1">{disease.name}</span>
                  <Badge variant="outline" className="text-[9px]">{disease.count}</Badge>
                </div>
              ))}
              {!stats.diseases?.length && (
                <p className="text-xs text-slate-400 text-center py-4">Nenhuma consulta registrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Erros Recentes */}
        <Card className="bg-white/80 border border-slate-200/50">
          <CardContent className="p-3">
            <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Erros ({todayErrors} hoje)
            </h3>
            <div className="space-y-1">
              {stats.errors?.slice(0, 8).map((error, i) => (
                <div key={i} className="p-1 bg-red-50 rounded text-xs">
                  <p className="text-red-700 truncate">{error.message}</p>
                  <p className="text-[10px] text-red-500">{error.page} • {new Date(error.timestamp).toLocaleTimeString('pt-BR')}</p>
                </div>
              ))}
              {!stats.errors?.length && (
                <p className="text-xs text-slate-400 text-center py-4">Nenhum erro registrado 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
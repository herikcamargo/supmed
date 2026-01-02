import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Activity,
  Pill,
  MessageSquare,
  TrendingUp,
  Clock,
  User
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Estatisticas() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-stats'],
    queryFn: () => base44.entities.Patient.list()
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['prescriptions-stats'],
    queryFn: () => base44.entities.Prescription.list()
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts-stats'],
    queryFn: () => base44.entities.CommunityPost.list()
  });

  // Calculate stats
  const statusCounts = {
    aguardando: patients.filter(p => p.status === 'aguardando').length,
    em_atendimento: patients.filter(p => p.status === 'em_atendimento').length,
    finalizado: patients.filter(p => p.status === 'finalizado').length,
    encaminhado: patients.filter(p => p.status === 'encaminhado').length
  };

  const priorityCounts = {
    verde: patients.filter(p => p.priority === 'verde').length,
    amarelo: patients.filter(p => p.priority === 'amarelo').length,
    laranja: patients.filter(p => p.priority === 'laranja').length,
    vermelho: patients.filter(p => p.priority === 'vermelho').length
  };

  const statusData = [
    { name: 'Aguardando', value: statusCounts.aguardando, color: '#94a3b8' },
    { name: 'Em Atendimento', value: statusCounts.em_atendimento, color: '#3b82f6' },
    { name: 'Finalizado', value: statusCounts.finalizado, color: '#10b981' },
    { name: 'Encaminhado', value: statusCounts.encaminhado, color: '#8b5cf6' }
  ];

  const priorityData = [
    { name: 'Verde', value: priorityCounts.verde, color: '#22c55e' },
    { name: 'Amarelo', value: priorityCounts.amarelo, color: '#eab308' },
    { name: 'Laranja', value: priorityCounts.laranja, color: '#f97316' },
    { name: 'Vermelho', value: priorityCounts.vermelho, color: '#ef4444' }
  ];

  // Recent activity
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = patients.filter(p => p.created_date?.startsWith(dateStr)).length;
    return {
      day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      atendimentos: count
    };
  }).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
              Estatísticas
            </h1>
            <p className="text-slate-500 mt-1">Visão geral do seu desempenho</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs uppercase tracking-wider">Total Pacientes</p>
                    <p className="text-3xl font-bold mt-1">{patients.length}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs uppercase tracking-wider">Em Atendimento</p>
                    <p className="text-3xl font-bold mt-1">{statusCounts.em_atendimento}</p>
                  </div>
                  <Activity className="w-10 h-10 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs uppercase tracking-wider">Prescrições</p>
                    <p className="text-3xl font-bold mt-1">{prescriptions.length}</p>
                  </div>
                  <Pill className="w-10 h-10 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs uppercase tracking-wider">Posts</p>
                    <p className="text-3xl font-bold mt-1">{posts.length}</p>
                  </div>
                  <MessageSquare className="w-10 h-10 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Status Distribution */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {statusData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-600">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Classificação de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity */}
          <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Atendimentos nos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="atendimentos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Últimos Pacientes Registrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length > 0 ? (
                <div className="space-y-3">
                  {patients.slice(0, 5).map((patient) => (
                    <div 
                      key={patient.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{patient.name}</p>
                          <p className="text-xs text-slate-500">{patient.chief_complaint || 'Sem queixa'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          patient.priority === 'verde' ? 'bg-green-100 text-green-700' :
                          patient.priority === 'amarelo' ? 'bg-yellow-100 text-yellow-700' :
                          patient.priority === 'laranja' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {patient.priority?.toUpperCase() || 'VERDE'}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(patient.created_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400">Nenhum paciente registrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
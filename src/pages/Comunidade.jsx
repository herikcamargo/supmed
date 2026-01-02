import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users,
  Plus,
  Search,
  Shield,
  TrendingUp,
  Clock,
  Flame,
  AlertTriangle
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';
import PostCreator from '../components/community/PostCreator';
import PostCard from '../components/community/PostCard';
import PostViewer from '../components/community/PostViewer';

const especialidadesCategorias = [
  { value: 'todos', label: 'Todos', icon: '🔥', color: 'bg-slate-500' },
  { value: 'emergencia', label: 'Emergência', icon: '🚨', color: 'bg-red-500' },
  { value: 'cardiologia', label: 'Cardiologia', icon: '❤️', color: 'bg-rose-500' },
  { value: 'neurologia', label: 'Neurologia', icon: '🧠', color: 'bg-purple-500' },
  { value: 'pediatria', label: 'Pediatria', icon: '👶', color: 'bg-pink-500' },
  { value: 'ginecologia', label: 'Ginecologia', icon: '🤰', color: 'bg-fuchsia-500' },
  { value: 'exames_diagnostico', label: 'Diagnóstico', icon: '🔬', color: 'bg-blue-500' },
  { value: 'clinica_medica', label: 'Clínica Médica', icon: '🩺', color: 'bg-cyan-500' }
];

export default function Comunidade() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('todos');
  const [showTermosModal, setShowTermosModal] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(
    localStorage.getItem('supmed_community_terms') === 'true'
  );

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['community_posts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 100),
    initialData: []
  });

  const postsAtivos = posts.filter(p => p.status === 'ativo' || p.status === 'pendente');

  const postsFiltrados = postsAtivos.filter(p => {
    const matchSearch = !searchTerm || 
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.afeccao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchEspecialidade = filtroEspecialidade === 'todos' || p.especialidade === filtroEspecialidade;
    
    return matchSearch && matchEspecialidade;
  });

  const handleAbrirCreator = () => {
    if (!termosAceitos) {
      setShowTermosModal(true);
    } else {
      setShowCreator(true);
    }
  };

  const handleAceitarTermos = () => {
    localStorage.setItem('supmed_community_terms', 'true');
    setTermosAceitos(true);
    setShowTermosModal(false);
    setShowCreator(true);
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
          <div className="p-4 md:p-6">
            <PostViewer 
              postId={selectedPost} 
              onBack={() => {
                setSelectedPost(null);
                refetch();
              }} 
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Comunidade Médica</h1>
                <p className="text-xs text-slate-500">Fórum colaborativo de casos clínicos</p>
              </div>
            </div>
            
            <Button onClick={handleAbrirCreator} size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-3.5 h-3.5 mr-1" /> Novo Caso
            </Button>
          </div>

          {/* Alerta LGPD */}
          <Card className="bg-blue-50 border-blue-200 mb-4">
            <CardContent className="p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Ambiente Educacional Seguro • Discussões anônimas • Zero identificação de pacientes • LGPD compliant • Moderação ativa
              </p>
            </CardContent>
          </Card>

          {/* Busca e Filtros */}
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar casos por tema, afecção..."
                    className="pl-9 h-9 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-3">
                <div className="flex gap-1 overflow-x-auto">
                  {especialidadesCategorias.map(cat => (
                    <Button
                      key={cat.value}
                      size="sm"
                      variant={filtroEspecialidade === cat.value ? 'default' : 'outline'}
                      className={`h-7 text-xs whitespace-nowrap ${
                        filtroEspecialidade === cat.value ? 'bg-indigo-600' : ''
                      }`}
                      onClick={() => setFiltroEspecialidade(cat.value)}
                    >
                      <span className="mr-1">{cat.icon}</span> {cat.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Rápidas */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-3 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-slate-800">{postsAtivos.length}</p>
                <p className="text-xs text-slate-500">Casos Ativos</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-3 text-center">
                <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-slate-800">{posts.reduce((sum, p) => sum + (p.likes || 0), 0)}</p>
                <p className="text-xs text-slate-500">Interações</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-slate-800">
                  {posts.filter(p => {
                    const criado = new Date(p.created_date);
                    const agora = new Date();
                    return (agora - criado) < 86400000;
                  }).length}
                </p>
                <p className="text-xs text-slate-500">Hoje</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Posts */}
          <div className="grid gap-3">
            {isLoading ? (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-slate-500">Carregando casos...</p>
                </CardContent>
              </Card>
            ) : postsFiltrados.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Nenhum caso encontrado</p>
                  <p className="text-xs text-slate-400 mt-1">Seja o primeiro a compartilhar!</p>
                </CardContent>
              </Card>
            ) : (
              postsFiltrados.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onClick={() => setSelectedPost(post.id)}
                />
              ))
            )}
          </div>

          <DisclaimerFooter />
        </div>
      </main>

      {/* Modal de Criação */}
      <Dialog open={showCreator} onOpenChange={setShowCreator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Publicar Caso Clínico</DialogTitle>
          </DialogHeader>
          <PostCreator 
            onSuccess={() => {
              setShowCreator(false);
              refetch();
            }}
            onCancel={() => setShowCreator(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Termos */}
      <Dialog open={showTermosModal} onOpenChange={setShowTermosModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Termos da Comunidade
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto p-4">
            <div className="p-3 bg-blue-50 rounded border border-blue-100">
              <p className="text-xs font-semibold text-blue-900 mb-2">Princípios Fundamentais:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>✅ Discussão educacional colaborativa</li>
                <li>✅ Foco em aprendizado clínico</li>
                <li>✅ Respeito ao Código de Ética Médica</li>
                <li>✅ Conformidade total com LGPD</li>
              </ul>
            </div>

            <div className="p-3 bg-red-50 rounded border border-red-100">
              <p className="text-xs font-semibold text-red-900 mb-2">Estritamente Proibido:</p>
              <ul className="text-xs text-red-700 space-y-1">
                <li>❌ Identificação de pacientes (nome, CPF, RG, prontuário)</li>
                <li>❌ Dados pessoais (endereço, telefone, e-mail)</li>
                <li>❌ Fotos identificáveis</li>
                <li>❌ Decisões clínicas definitivas</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50 rounded border border-amber-100">
              <p className="text-xs font-semibold text-amber-900 mb-2">⚠️ Importante:</p>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Este é um ambiente educacional</li>
                <li>• Não substitui avaliação clínica presencial</li>
                <li>• Moderação automática e humana ativa</li>
                <li>• Violações graves resultam em banimento</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowTermosModal(false)} className="flex-1 h-9 text-sm">
              Cancelar
            </Button>
            <Button onClick={handleAceitarTermos} className="flex-1 h-9 text-sm bg-indigo-600 hover:bg-indigo-700">
              Aceito os Termos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
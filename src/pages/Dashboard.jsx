import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isDemoMode, getAutoUser } from '../components/auth/DevConfig';
import Sidebar from '../components/dashboard/Sidebar';
import { useProfile } from '../components/profile/ProfileContext';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createPageUrl } from '@/utils';
import SetupAdmin from '../components/admin/SetupAdmin';
import ForcarPermissoesAdmin from '../components/admin/ForcarPermissoesAdmin';
import {
  Users,
  Pill,
  AlertTriangle,
  Brain,
  Skull,
  BookOpen,
  Baby,
  Heart,
  User,
  FlaskConical,
  ImageIcon,
  Syringe,
  Scissors,
  Clock,
  ChevronRight,
  Activity,
  Calculator,
  Zap,
  Bug,
  ClipboardList,
  StickyNote,
  History
} from 'lucide-react';

const moduleCategories = {
  emergency: {
    title: '🚨 EMERGÊNCIA',
    color: 'text-red-600',
    pulse: true,
    items: [
      { title: 'Plantonista', icon: AlertTriangle, page: 'Plantonista', color: 'bg-red-500' },
      { title: 'CEATOX e Interações', icon: Skull, page: 'Ceatox', color: 'bg-orange-500' },
      { title: 'Protocolos', icon: ClipboardList, page: 'Protocolos', color: 'bg-rose-500' }
    ]
  },
  specialties: {
    title: '🏥 ESPECIALIDADES',
    color: 'text-blue-600',
    items: [
      { title: 'Pediatria', icon: Baby, page: 'Pediatria', color: 'bg-pink-500' },
      { title: 'Ginecologia', icon: Heart, page: 'Ginecologia', color: 'bg-fuchsia-500' },
      { title: 'Dermatologia', icon: User, page: 'Dermatologia', color: 'bg-amber-500' },
      { title: 'Infectologia', icon: Bug, page: 'Infectologia', color: 'bg-lime-600' }
    ]
  },
  complement: {
    title: '🔬 COMPLEMENTAR',
    color: 'text-slate-600',
    items: [
      { title: 'Calculadoras & Scores', icon: Calculator, page: 'Calculadoras', color: 'bg-sky-500' },
      { title: 'Procedimentos', icon: Scissors, page: 'Procedimentos', color: 'bg-violet-500' }
    ]
  },
  knowledge: {
    title: '📚 CONHECIMENTO',
    color: 'text-indigo-600',
    items: [
      { title: 'Guidelines', icon: BookOpen, page: 'Guidelines', color: 'bg-cyan-500' },
      { title: 'Comunidade', icon: Users, page: 'Comunidade', color: 'bg-indigo-600' }
    ]
  }
};

const priorityColors = {
  verde: 'bg-green-100 text-green-700',
  amarelo: 'bg-yellow-100 text-yellow-700',
  laranja: 'bg-orange-100 text-orange-700',
  vermelho: 'bg-red-100 text-red-700'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [attentionLevel, setAttentionLevel] = useState(null);
  const [quickNotes, setQuickNotes] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [precisaSetupAdmin, setPrecisaSetupAdmin] = useState(false);

  // Carregar ícones customizados
  const { data: iconesCustomizados = [] } = useQuery({
    queryKey: ['icones-customizados'],
    queryFn: () => base44.entities.IconeCustomizado.list(),
    initialData: []
  });

  const getIconeCustomizado = (moduloId) => {
    return iconesCustomizados.find(ic => ic.modulo_id === moduloId && ic.ativo);
  };

  useEffect(() => {
    const storedDoctor = localStorage.getItem('supmed_doctor');
    const storedAttention = localStorage.getItem('supmed_attention');
    
    if (!storedDoctor) {
      navigate(createPageUrl('AcessoMedico'));
      return;
    }
    
    if (!storedAttention) {
      navigate(createPageUrl('AttentionSelect'));
      return;
    }
    
    const doctorData = JSON.parse(storedDoctor);
    // Garantir valores padrão
    const safeDoctor = {
      ...doctorData,
      role: doctorData.role || 'user',
      profissao: doctorData.profissao || 'medico',
      full_name: doctorData.full_name || doctorData.fullName || 'Usuário',
      pronoun: doctorData.pronoun || 'Dr.'
    };
    
    setDoctor(safeDoctor);
    setAttentionLevel(storedAttention);

    // Verificar se precisa setup admin (primeiro usuário do sistema)
    if (!safeDoctor.role || safeDoctor.role === 'user') {
      base44.entities.User.list().then(users => {
        if (users && users.length > 0) {
          const ordenados = users.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
          if (ordenados[0].email === safeDoctor.email) {
            setPrecisaSetupAdmin(true);
          }
        }
      }).catch(err => {
        console.log('Não foi possível verificar usuários:', err);
      });
    }

    // Carregar anotações rápidas
    const storedNotes = localStorage.getItem('supmed_quick_notes');
    if (storedNotes) setQuickNotes(storedNotes);

    // Carregar últimas pesquisas
    const storedSearches = localStorage.getItem('supmed_recent_searches');
    if (storedSearches) setRecentSearches(JSON.parse(storedSearches));
  }, [navigate]);

  // Salvar anotações automaticamente
  useEffect(() => {
    if (quickNotes !== null) {
      const timer = setTimeout(() => {
        localStorage.setItem('supmed_quick_notes', quickNotes);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quickNotes]);



  const attentionLabels = {
    primaria: 'Atenção Primária',
    secundaria: 'Atenção Secundária',
    terciaria: 'Atenção Terciária',
    academico: 'Modo Acadêmico'
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {doctor ? `${doctor.pronoun} ${doctor.full_name || doctor.fullName || 'Usuário'}` : 'Dashboard'}
              </h1>
              <p className="text-sm text-slate-500 mt-1" translate="no">
                {attentionLevel ? attentionLabels[attentionLevel] : 'SUPMED'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })}
            </div>
          </div>

          {/* Setup Admin Inicial */}
          {precisaSetupAdmin && (
            <div className="mb-6">
              <SetupAdmin />
            </div>
          )}

          {/* Correção de Permissões Admin */}
          {doctor && doctor.role === 'admin' && !doctor.papel_editorial && (
            <div className="mb-6">
              <ForcarPermissoesAdmin />
            </div>
          )}

          {/* Module Categories */}
          <div className="space-y-6">
            {Object.entries(moduleCategories).map(([key, category]) => (
              <div key={key}>
                <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${category.color}`}>
                  {category.pulse && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  {category.title}
                </h2>
                <div className={`grid gap-3 ${
                  category.items.length <= 2 ? 'grid-cols-2' : 
                  category.items.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 
                  'grid-cols-2 md:grid-cols-5'
                }`}>
                  {category.items.map((module) => {
                    const Icon = module.icon;
                    const moduloId = module.page.toLowerCase();
                    const iconeCustom = getIconeCustomizado(moduloId);
                    
                    return (
                      <Link
                        key={module.title}
                        to={createPageUrl(module.page)}
                        className="group"
                      >
                        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-slate-300 transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-4 flex items-center gap-3">
                            {iconeCustom ? (
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-transparent">
                                <img 
                                  src={iconeCustom.icone_url} 
                                  alt={module.title}
                                  className="w-12 h-12 object-contain"
                                />
                              </div>
                            ) : (
                              <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
                              {module.title}
                            </span>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Anotações Rápidas */}
          <div className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-slate-700">
              <StickyNote className="w-4 h-4" />
              📝 ANOTAÇÕES RÁPIDAS
            </h2>
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-4">
                <Textarea
                  placeholder="Digite lembretes, condutas temporárias ou observações de plantão..."
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="min-h-[100px] text-sm resize-none border-slate-200 focus:border-blue-400"
                />
                <p className="text-xs text-slate-400 mt-2">
                  💾 Salvamento automático • Uso pessoal
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Últimas Pesquisas */}
          {recentSearches.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-slate-700">
                <History className="w-4 h-4" />
                🔎 ÚLTIMAS PESQUISAS
              </h2>
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="p-3">
                  <div className="space-y-1.5">
                    {recentSearches.slice(0, 5).map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigate(createPageUrl('Plantonista'), { state: { search: search.query } })}
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors duration-200 flex items-center gap-2"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        {search.query}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}


        </div>
      </main>
    </div>
  );
}
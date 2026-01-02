import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { hasAccess } from '../auth/PermissionGuard';
import { isDemoMode } from '../auth/DevConfig';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import {
  Stethoscope,
  LayoutDashboard,
  AlertTriangle,
  Brain,
  Pill,
  Skull,
  BookOpen,
  Baby,
  Heart,
  User,
  Users,
  FlaskConical,
  ImageIcon,
  Syringe,
  Scissors,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  Calculator,
  FileText,
  Zap,
  Bug,
  ClipboardList,
  Lock,
  Settings,
  GraduationCap,
  Shield,
  MessageSquare,
  Newspaper,
  Edit3
} from 'lucide-react';

// Estrutura organizada em 3 blocos hierárquicos
const menuStructure = {
  plantonista: {
    title: 'PLANTONISTA',
    icon: AlertTriangle,
    items: [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        page: 'Dashboard',
        color: 'bg-slate-500'
      },
      { 
        id: 'plantonista', 
        label: 'Ações Clínicas', 
        icon: 'custom-image',
        iconUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c4a3dce43b2d9bf6062b9/c7d362632_1.png',
        page: 'Plantonista',
        color: 'bg-red-500',
        highlight: true
      },
      { 
        id: 'scores', 
        label: 'Calculadoras & Scores', 
        icon: Calculator, 
        page: 'Calculadoras',
        color: 'bg-sky-500'
      },
      { 
        id: 'comunicacao', 
        label: 'Comunicação Difícil', 
        icon: MessageSquare, 
        page: 'ComunicacaoDificil',
        color: 'bg-purple-500'
      },
      { 
        id: 'ceatox', 
        label: 'CEATOX', 
        icon: Skull, 
        page: 'Ceatox',
        color: 'bg-orange-500'
      },
      { 
        id: 'procedimentos', 
        label: 'Procedimentos', 
        icon: Scissors, 
        page: 'Procedimentos',
        color: 'bg-violet-500'
      },
      { 
        id: 'semiologia', 
        label: 'Semiologia', 
        icon: Stethoscope, 
        page: 'Semiologia',
        color: 'bg-teal-500'
      },
      { 
        id: 'prescricao-digital', 
        label: 'Prescrição Digital', 
        icon: FileText, 
        page: 'PrescricaoDigital',
        color: 'bg-emerald-500'
      }
    ]
  },
  especialidades: {
    title: 'ESPECIALIDADES',
    icon: Stethoscope,
    items: [
      { 
        id: 'pediatria', 
        label: 'Pediatria', 
        icon: Baby, 
        page: 'Pediatria',
        color: 'bg-pink-500'
      },
      { 
        id: 'ginecologia', 
        label: 'GO',
        translateNo: true,
        icon: Heart, 
        page: 'Ginecologia',
        color: 'bg-fuchsia-500'
      },
      { 
        id: 'dermatologia', 
        label: 'Dermatologia', 
        icon: User, 
        page: 'Dermatologia',
        color: 'bg-amber-500'
      },
      { 
        id: 'infectologia', 
        label: 'Infectologia', 
        icon: Bug, 
        page: 'Infectologia',
        color: 'bg-lime-600'
      }
    ]
  },
  ferramentas: {
    title: 'FERRAMENTAS & OUTROS',
    icon: Zap,
    items: [
      { 
        id: 'guidelines', 
        label: 'Guidelines & Protocolos', 
        icon: BookOpen, 
        page: 'GuidelinesProtocolos',
        color: 'bg-cyan-500'
      },
      { 
        id: 'bulario', 
        label: 'Bulário', 
        icon: FileText, 
        page: 'Bulario',
        color: 'bg-gray-500'
      },
      { 
        id: 'vacinacao', 
        label: 'Vacinação | PNI 2025', 
        icon: Syringe, 
        page: 'Vacinacao',
        color: 'bg-blue-500'
      },
      { 
        id: 'comunidade', 
        label: 'Comunidade', 
        icon: Users, 
        page: 'Comunidade',
        color: 'bg-indigo-600'
      },
      { 
        id: 'educacional', 
        label: 'Modo Educacional', 
        icon: GraduationCap, 
        page: 'ModoEducacional',
        color: 'bg-purple-600'
      },
      { 
        id: 'jornal', 
        label: 'Jornal Médico', 
        icon: Newspaper, 
        page: 'Jornal',
        color: 'bg-amber-600'
      },
      { 
        id: 'configuracoes', 
        label: 'Configurações', 
        icon: Settings, 
        page: 'Configuracoes',
        color: 'bg-slate-600'
      },
      { 
        id: 'admin', 
        label: 'Admin Panel', 
        icon: Shield, 
        page: 'AdminPanel',
        color: 'bg-violet-600',
        adminOnly: true
      },
      { 
        id: 'editorial', 
        label: 'Painel Editorial', 
        icon: Edit3, 
        page: 'PainelEditorial',
        color: 'bg-indigo-600',
        adminOnly: true
      }
    ]
  }
};

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [modulosPublicados, setModulosPublicados] = useState(new Set());
  const queryClient = useQueryClient();

  // Carregar status dos módulos
  const { data: modulosStatus = [] } = useQuery({
    queryKey: ['modulos-status'],
    queryFn: () => base44.entities.ModuloStatus.list(),
    initialData: []
  });

  // Atualizar lista de módulos publicados
  useEffect(() => {
    const publicados = new Set(
      modulosStatus
        .filter(m => m.status === 'publicado')
        .map(m => m.modulo_id)
    );
    setModulosPublicados(publicados);
  }, [modulosStatus]);

  // Carregar ícones customizados
  const { data: iconesCustomizados = [] } = useQuery({
    queryKey: ['icones-customizados'],
    queryFn: () => base44.entities.IconeCustomizado.list(),
    initialData: []
  });

  const getIconeCustomizado = (moduloId) => {
    return iconesCustomizados.find(ic => ic.modulo_id === moduloId && ic.ativo);
  };

  const handleLogout = () => {
    if (isDemoMode()) {
      localStorage.removeItem('supmed_doctor');
      localStorage.removeItem('supmed_attention');
      window.location.href = createPageUrl('AcessoMedico');
      return;
    }
    
    localStorage.removeItem('supmed_doctor');
    localStorage.removeItem('supmed_attention');
    window.location.href = createPageUrl('AcessoMedico');
  };

  return (
    <aside className={`
      fixed left-0 top-0 h-screen bg-white/70 backdrop-blur-xl border-r border-slate-200/50
      transition-all duration-200 z-50 flex flex-col
      ${collapsed ? 'w-16' : 'w-56'}
    `}>
      {/* Header */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {(() => {
            const logoCustom = getIconeCustomizado('logo');
            return logoCustom ? (
              <img 
                src={logoCustom.icone_url} 
                alt="Logo"
                className={collapsed ? "w-8 h-8 object-contain" : "w-8 h-8 object-contain"}
              />
            ) : (
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
            );
          })()}
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-blue-900 text-sm" translate="no">SUPMED</h1>
              <p className="text-[10px] text-slate-400">Sistema Médico</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-2.5 top-16 w-5 h-5 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors duration-200"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-slate-500" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-slate-500" />
        )}
      </button>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin">
        {Object.entries(menuStructure).map(([sectionKey, section]) => {
          const SectionIcon = section.icon;
          
          return (
            <div key={sectionKey}>
              {/* Título da Seção */}
              {!collapsed && (
                <div className="px-2 mb-1.5 mt-2 first:mt-0">
                  <div className="flex items-center gap-1.5">
                    <SectionIcon className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {section.title}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 mt-1" />
                </div>
              )}
              
              {/* Items da Seção */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath.includes(item.page);
                  const canAccess = isDemoMode() ? true : hasAccess(item.page);

                  // Verificar se é item apenas para admin
                  const storedUser = localStorage.getItem('supmed_doctor');
                  const currentUser = storedUser ? JSON.parse(storedUser) : null;
                  const isAdmin = isDemoMode() ? true : (currentUser?.role === 'admin');

                  // Verificar se o módulo está publicado
                  const moduloStatus = modulosStatus.find(m => m.modulo_id === item.id);
                  const isPublished = !moduloStatus || moduloStatus.status === 'publicado';

                  // Ocultar módulos não publicados para não-admins
                  if (!isAdmin && !isPublished) {
                    return null;
                  }
                  
                  if (item.adminOnly && !isAdmin) {
                    return null;
                  }
                  
                  if (!canAccess) {
                    return (
                      <div
                        key={item.id}
                        className={`
                          flex items-center gap-2 px-2 py-1.5 rounded-lg opacity-40 cursor-not-allowed
                          ${collapsed ? 'justify-center' : ''}
                        `}
                        title="Sem permissão de acesso"
                      >
                        <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 bg-slate-300">
                          <Lock className="w-6 h-6 text-slate-500" />
                        </div>
                        {!collapsed && (
                          <span className="text-xs font-medium truncate flex-1 text-slate-400">
                            {item.label}
                          </span>
                        )}
                      </div>
                    );
                  }
                  
                  // Verificar se existe ícone customizado
                  const iconeCustom = getIconeCustomizado(item.id);

                  return (
                    <Link
                      key={item.id}
                      to={createPageUrl(item.page)}
                      className={`
                        flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-900 text-white' 
                          : 'text-slate-600 hover:bg-slate-100'
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                    >
                      {iconeCustom ? (
                        <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 bg-transparent">
                          <img 
                            src={iconeCustom.icone_url} 
                            alt={item.label}
                            className="w-10 h-10 object-contain"
                            key={iconeCustom.icone_url}
                          />
                        </div>
                      ) : (
                        <div className={`
                          w-10 h-10 rounded flex items-center justify-center flex-shrink-0
                          ${isActive ? 'bg-white/20' : item.color}
                        `}>
                          {item.icon === 'custom-image' && item.iconUrl ? (
                            <img src={item.iconUrl} alt="" className="w-9 h-9 object-contain" />
                          ) : (
                            <Icon className={`w-6 h-6 text-white`} />
                          )}
                        </div>
                      )}

                      {!collapsed && (
                        <span className="text-xs font-medium flex-1 leading-tight" translate={item.translateNo ? "no" : "yes"} style={{ wordBreak: 'break-word' }}>
                          {item.label}
                        </span>
                      )}

                      {!collapsed && item.highlight && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-medium rounded animate-pulse">
                          !
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-2 w-full px-2 py-1.5 rounded-lg
            text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-xs font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
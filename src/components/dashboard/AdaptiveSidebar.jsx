import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useProfile } from '../profile/ProfileContext';
import {
  Stethoscope,
  LayoutDashboard,
  AlertTriangle,
  Pill,
  Skull,
  BookOpen,
  Baby,
  Heart,
  User,
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
  Settings,
  GraduationCap,
  Shield,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const allModules = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard', color: 'bg-slate-500' },
  plantonista: { label: 'Plantonista', icon: AlertTriangle, page: 'Plantonista', color: 'bg-red-500', highlight: true },
  ceatox: { label: 'CEATOX', icon: Skull, page: 'Ceatox', color: 'bg-orange-500' },
  guidelines: { label: 'Guidelines', icon: BookOpen, page: 'Guidelines', color: 'bg-cyan-500' },
  pediatria: { label: 'Pediatria', icon: Baby, page: 'Pediatria', color: 'bg-pink-500' },
  ginecologia: { label: 'Ginecologia', icon: Heart, page: 'Ginecologia', color: 'bg-fuchsia-500' },
  dermatologia: { label: 'Dermatologia', icon: User, page: 'Dermatologia', color: 'bg-amber-500' },
  infectologia: { label: 'Infectologia', icon: Bug, page: 'Infectologia', color: 'bg-lime-600' },
  procedimentos: { label: 'Procedimentos', icon: Scissors, page: 'Procedimentos', color: 'bg-violet-500' },
  scores: { label: 'Scores', icon: Calculator, page: 'Calculadoras', color: 'bg-sky-500' },
  protocolos: { label: 'Protocolos', icon: ClipboardList, page: 'Protocolos', color: 'bg-rose-500' },
  bulario: { label: 'Bulário', icon: FileText, page: 'Bulario', color: 'bg-gray-500' },
  comunidade: { label: 'Comunidade', icon: User, page: 'Comunidade', color: 'bg-indigo-600' },
  educacional: { label: 'Educacional', icon: GraduationCap, page: 'ModoEducacional', color: 'bg-purple-600' }
};

export default function AdaptiveSidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { getModulosPrioritarios, getConfigPerfil } = useProfile();
  
  const storedUser = localStorage.getItem('supmed_doctor');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = currentUser?.role === 'admin';
  
  console.log('👤 Usuário atual:', currentUser?.email, '| Role:', currentUser?.role, '| É admin?', isAdmin);

  const modulosPrioritarios = getModulosPrioritarios();
  const perfilConfig = getConfigPerfil();

  // Separar módulos prioritários e outros
  const priorityModules = modulosPrioritarios
    .map(id => ({ id, ...allModules[id] }))
    .filter(m => m.page);

  const otherModules = Object.entries(allModules)
    .filter(([id]) => !modulosPrioritarios.includes(id))
    .map(([id, data]) => ({ id, ...data }));

  const handleLogout = () => {
    localStorage.removeItem('supmed_doctor');
    localStorage.removeItem('supmed_attention');
    window.location.href = createPageUrl('AcessoMedico');
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = currentPath.includes(item.page);
    
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
        <div className={`
          w-6 h-6 rounded flex items-center justify-center flex-shrink-0
          ${isActive ? 'bg-white/20' : item.color}
        `}>
          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-white'}`} />
        </div>
        
        {!collapsed && (
          <span className="text-xs font-medium truncate flex-1">
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
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-blue-900 text-sm">SUPMED</h1>
              <p className="text-[10px] text-slate-400">{perfilConfig.label}</p>
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
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
        {Object.entries(allModules).map(([id, data]) => renderMenuItem({ id, ...data }))}

        {/* Configurações e Admin */}
        <div className="h-px bg-slate-200 my-2" />
        
        <Link
          to={createPageUrl('Configuracoes')}
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200
            ${currentPath.includes('Configuracoes') 
              ? 'bg-blue-900 text-white' 
              : 'text-slate-600 hover:bg-slate-100'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className={`
            w-6 h-6 rounded flex items-center justify-center flex-shrink-0
            ${currentPath.includes('Configuracoes') ? 'bg-white/20' : 'bg-slate-600'}
          `}>
            <Settings className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && <span className="text-xs font-medium">Configurações</span>}
        </Link>

        {isAdmin && (
          <Link
            to={createPageUrl('AdminPanel')}
            className={`
              flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200
              ${currentPath.includes('AdminPanel') 
                ? 'bg-blue-900 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <div className={`
              w-6 h-6 rounded flex items-center justify-center flex-shrink-0
              ${currentPath.includes('AdminPanel') ? 'bg-white/20' : 'bg-violet-600'}
            `}>
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            {!collapsed && <span className="text-xs font-medium">Admin Panel</span>}
          </Link>
        )}
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
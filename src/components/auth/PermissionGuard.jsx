import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { isSecurityEnabled, isDemoMode, getAutoUser } from './DevConfig';

// Mapeamento de módulos para IDs de acesso
const moduleAccessMap = {
  'Dashboard': 'dashboard',
  'AdminPanel': 'admin',
  'Plantonista': 'plantonista',
  'DiagnosticoIA': 'diagnostico',
  'Prescricoes': 'prescricoes',
  'Ceatox': 'ceatox',
  'Guidelines': 'guidelines',
  'Pediatria': 'pediatria',
  'Ginecologia': 'ginecologia',
  'Dermatologia': 'dermatologia',
  'Infectologia': 'infectologia',
  'Exames': 'exames',
  'ExamesImagem': 'imagem',
  'ECG': 'ecg',
  'Diluicao': 'diluicao',
  'Procedimentos': 'procedimentos',
  'Calculadoras': 'scores',
  'Interacoes': 'interacoes',
  'Protocolos': 'protocolos',
  'Bulario': 'bulario',
  'Comunidade': 'comunidade',
  'CasosClinicosInterativos': 'casos',
  'Estatisticas': 'estatisticas',
  'PainelEditorial': 'editorial',
  'Vacinacao': 'vacinacao',
  'Semiologia': 'semiologia',
  'PrescricaoDigital': 'prescricao_digital'
};

export function hasAccess(moduleName) {
  if (!isSecurityEnabled() || isDemoMode()) {
    return true;
  }
  
  const storedDoctor = localStorage.getItem('supmed_doctor');
  if (!storedDoctor) return false;
  
  const userData = JSON.parse(storedDoctor);
  
  // CRÍTICO: Admins têm acesso total SEMPRE
  if (userData.role === 'admin') {
    return true;
  }
  
  const acessos = userData.acessos || [];
  
  // Acesso total via acessos
  if (acessos.includes('*')) return true;
  
  const moduleId = moduleAccessMap[moduleName] || moduleName.toLowerCase();
  return acessos.includes(moduleId);
}

// Verifica se o usuário tem uma restrição específica
export function hasRestriction(restriction) {
  const storedDoctor = localStorage.getItem('supmed_doctor');
  if (!storedDoctor) return true;
  
  const userData = JSON.parse(storedDoctor);
  const restricoes = userData.restricoes || [];
  
  return restricoes.includes(restriction);
}

export function getCurrentUser() {
  if (isDemoMode()) {
    return getAutoUser();
  }
  
  const storedDoctor = localStorage.getItem('supmed_doctor');
  if (!storedDoctor) return null;
  return JSON.parse(storedDoctor);
}

// Obtém o perfil do usuário
export function getUserProfile() {
  const user = getCurrentUser();
  return user?.perfil || null;
}

export default function PermissionGuard({ children, moduleName, restriction }) {
  if (isDemoMode()) {
    return children;
  }
  
  const user = getCurrentUser();
  
  // Se não está logado
  if (!user) {
    return (
      <AccessDenied 
        message="Você precisa estar logado para acessar este módulo."
        showLogin
      />
    );
  }
  
  // CRÍTICO: Admins têm acesso total, sem restrições
  if (user.role === 'admin') {
    return children;
  }
  
  // Verifica acesso ao módulo
  if (moduleName && !hasAccess(moduleName)) {
    return (
      <AccessDenied 
        message={`Seu perfil não tem acesso a este módulo.`}
        userProfile={user.profissao}
      />
    );
  }
  
  // Verifica restrição específica
  if (restriction && hasRestriction(restriction)) {
    return (
      <AccessDenied 
        message={`Este recurso está restrito para seu perfil.`}
        restriction={restriction}
        userProfile={user.profissao}
      />
    );
  }
  
  return children;
}

// Componente de acesso negado
function AccessDenied({ message, showLogin, userProfile, restriction }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-slate-600 mb-4">{message}</p>
          
          {userProfile && (
            <p className="text-xs text-slate-500 mb-4">
              Perfil atual: <span className="font-medium">{userProfile}</span>
            </p>
          )}
          
          <div className="flex gap-2 justify-center">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="w-3 h-3 mr-1" /> Voltar ao Dashboard
              </Button>
            </Link>
            {showLogin && (
              <Link to={createPageUrl('AcessoMedico')}>
                <Button size="sm" className="text-xs bg-blue-900 hover:bg-blue-800">
                  Fazer Login
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para verificar permissões
export function usePermissions() {
  const user = getCurrentUser();
  
  return {
    user,
    isLoggedIn: !!user,
    profile: user?.perfil,
    profileData: user?.perfilData,
    hasAccess: (moduleName) => hasAccess(moduleName),
    hasRestriction: (restriction) => hasRestriction(restriction),
    canUseAdvancedIA: !hasRestriction('ia_avancada'),
    canSignReports: !hasRestriction('laudos_definitivos'),
    canAccessComplexExams: !hasRestriction('exames_complexos')
  };
}
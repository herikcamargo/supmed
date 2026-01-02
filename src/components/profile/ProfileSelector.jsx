import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile } from './ProfileContext';
import { 
  Stethoscope, 
  HeartPulse, 
  ClipboardList, 
  GraduationCap, 
  User,
  Check,
  Info
} from 'lucide-react';

const iconMap = {
  Stethoscope,
  HeartPulse,
  ClipboardList,
  GraduationCap,
  User
};

export default function ProfileSelector() {
  const { perfil, atualizarPerfil, PERFIS_CONFIG } = useProfile();

  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-500'
  };

  return (
    <Card className="bg-white/80 border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Perfil Profissional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-700 flex items-start gap-2">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              Seu perfil adapta a interface, linguagem e prioriza módulos sem bloquear acessos. 
              Todos os recursos permanecem disponíveis.
            </span>
          </p>
        </div>

        <div className="grid gap-2">
          {Object.entries(PERFIS_CONFIG).map(([key, config]) => {
            const Icon = iconMap[config.icone];
            const isActive = perfil === key;
            
            return (
              <button
                key={key}
                onClick={() => atualizarPerfil(key)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${isActive 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${colorMap[config.cor]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800">{config.label}</p>
                      {isActive && (
                        <Badge className="text-[8px] bg-blue-600 text-white h-4 px-1.5">
                          <Check className="w-2.5 h-2.5 mr-0.5" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{config.descricao}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-[10px] text-slate-400">
            💡 Você pode personalizar atalhos individuais nas configurações avançadas
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
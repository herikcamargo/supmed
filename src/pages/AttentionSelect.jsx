import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDemoMode } from '../components/auth/DevConfig';
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Ambulance, 
  Hospital, 
  GraduationCap,
  Stethoscope,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const attentionLevels = [
  {
    id: 'primaria',
    title: 'Atenção Primária',
    subtitle: 'UBS',
    description: 'Consultas e prevenção',
    icon: Building2,
    bgLight: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-300'
  },
  {
    id: 'secundaria',
    title: 'Atenção Secundária',
    subtitle: 'UPA',
    description: 'Urgências 24h',
    icon: Ambulance,
    bgLight: 'bg-amber-100',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-300'
  },
  {
    id: 'terciaria',
    title: 'Atenção Terciária',
    subtitle: 'Hospital',
    description: 'Internações e UTI',
    icon: Hospital,
    bgLight: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-300'
  },
  {
    id: 'academico',
    title: 'Modo Acadêmico',
    subtitle: 'Estudos',
    description: 'Acesso completo',
    icon: GraduationCap,
    bgLight: 'bg-violet-100',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-300'
  }
];

export default function AttentionSelect() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [hoveredLevel, setHoveredLevel] = useState(null);

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
    if (!storedDoctor) {
      navigate(createPageUrl('AcessoMedico'));
      return;
    }
    setDoctor(JSON.parse(storedDoctor));
  }, [navigate]);

  const handleSelect = (level) => {
    setSelectedLevel(level.id);
    localStorage.setItem('supmed_attention', level.id);
    
    setTimeout(() => {
      navigate(createPageUrl('Dashboard'));
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          {(() => {
            const logoCustom = getIconeCustomizado('logo');
            return logoCustom ? (
              <img 
                src={logoCustom.icone_url} 
                alt="Logo"
                className="w-24 h-24 mx-auto object-contain mb-3"
              />
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-900 rounded-xl mb-3">
                <Stethoscope className="w-11 h-11 text-white" />
              </div>
            );
          })()}
          <h1 className="text-xl font-semibold text-slate-800 mb-1">
            {doctor ? `Olá, ${doctor.pronome} ${(doctor.full_name || doctor.fullName || '').split(' ')[0]}` : 'SUPMED'}
          </h1>
          <p className="text-sm text-slate-500">
            Selecione o nível de atenção
          </p>
        </div>

        {/* Cards de Seleção */}
        <div className="grid md:grid-cols-2 gap-3">
          {attentionLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.id;
            const iconeCustom = getIconeCustomizado(`atencao-${level.id}`);
            
            return (
              <Card
                key={level.id}
                onClick={() => handleSelect(level)}
                className={`
                  cursor-pointer transition-all duration-200
                  bg-white/80 backdrop-blur-sm border
                  ${isSelected ? `${level.borderColor} border-2` : 'border-slate-200/50 hover:border-slate-300'}
                `}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {iconeCustom ? (
                      <div className="w-20 h-20 flex items-center justify-center">
                        <img 
                          src={iconeCustom.icone_url} 
                          alt={level.title}
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-lg ${level.bgLight} flex items-center justify-center`}>
                        <Icon className={`w-10 h-10 ${level.textColor}`} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {level.title}
                        </h3>
                        {isSelected ? (
                          <CheckCircle2 className={`w-4 h-4 ${level.textColor}`} />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <p className={`text-xs ${level.textColor}`}>{level.subtitle}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{level.description}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Carregando...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-4">
          Protocolos adaptados ao nível selecionado
        </p>
      </div>
    </div>
  );
}
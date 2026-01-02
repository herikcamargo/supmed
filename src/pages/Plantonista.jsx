import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { initializeSearchIndices } from '../components/search/SearchIndex';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Search, 
  FileText,
  AlertTriangle,
  Pill,
  Syringe,
  FlaskConical,
  ImageIcon,
  Activity,
  Wind,
  Bed,
  ArrowLeft,
  ChevronRight,
  Clipboard,
  FilePenLine
} from 'lucide-react';

import PlantonistaSearch from '../components/plantonista/PlantonistaSearch';
import PlantonistaModelos from '../components/plantonista/PlantonistaModelos';
import PlantonistaPrescricao from '../components/plantonista/PlantonistaPrescricao';
import PlantonistaDiluicao from '../components/plantonista/PlantonistaDiluicao';
import PlantonistaInteracoes from '../components/plantonista/PlantonistaInteracoes';
import PlantonistaExamesLab from '../components/plantonista/PlantonistaExamesLab';
import PlantonistaExamesImagem from '../components/plantonista/PlantonistaExamesImagem';
import PlantonistaECG from '../components/plantonista/PlantonistaECG';
import PlantonistaIOT from '../components/plantonista/PlantonistaIOT';
import PlantonistaInternacao from '../components/plantonista/PlantonistaInternacao';
import PlantonistaDocumentos from '../components/plantonista/PlantonistaDocumentos';

const modulos = [
  { id: 'pesquisa', nome: 'Pesquisa Clínica', icon: Search, color: 'bg-blue-500', desc: 'Busca rápida por patologias' },
  { id: 'modelos', nome: 'Modelos de Anamnese', icon: FileText, color: 'bg-slate-500', desc: 'Anamnese e exame físico' },
  { id: 'documentos', nome: 'Documentos Oficiais', icon: Clipboard, color: 'bg-orange-500', desc: 'DO, CAT e SINAN' },
  { id: 'prescricao', nome: 'Prescrição Médica', icon: Pill, color: 'bg-purple-500', desc: 'Geração de prescrições' },
  { id: 'prescricao-digital', nome: 'Prescrição Digital', icon: FilePenLine, color: 'bg-emerald-500', desc: 'Módulo de prescrição digital (Demo)' },
  { id: 'interacoes', nome: 'Interações Medicamentosas', icon: AlertTriangle, color: 'bg-purple-600', desc: 'Análise de segurança' },
  { id: 'iot', nome: 'Intubação Orotraqueal', icon: Wind, color: 'bg-red-500', desc: 'Sequência, drogas e VM' },
  { id: 'diluicao', nome: 'Diluição de Drogas', icon: Syringe, color: 'bg-teal-500', desc: 'Calculadora de infusões' },
  { id: 'exames-lab', nome: 'Exames Laboratoriais', icon: FlaskConical, color: 'bg-green-500', desc: 'Interpretação de labs' },
  { id: 'internacao', nome: 'Internação / FAST-HUG', icon: Bed, color: 'bg-indigo-500', desc: 'Checklist de internação' },
  { id: 'exames-imagem', nome: 'Exames de Imagem', icon: ImageIcon, color: 'bg-amber-500', desc: 'Interpretação RX/TC/USG' },
  { id: 'ecg', nome: 'Eletrocardiograma', icon: Activity, color: 'bg-rose-500', desc: 'Interpretação de ECG' }
];

export default function Plantonista() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [moduloAtivo, setModuloAtivo] = useState(null);
  const navigate = useNavigate();
  
  // Carregar ícones customizados
  const { data: iconesCustomizados = [] } = useQuery({
    queryKey: ['icones-customizados'],
    queryFn: () => base44.entities.IconeCustomizado.list(),
    initialData: []
  });

  const getIconeCustomizado = (moduloId) => {
    return iconesCustomizados.find(ic => ic.modulo_id === moduloId && ic.ativo);
  };
  
  // Inicializar índices de busca
  useEffect(() => {
    initializeSearchIndices();
  }, []);

  // Detectar parâmetro "tab" na URL e abrir módulo correspondente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      const modulo = modulos.find(m => m.id === tabParam);
      if (modulo) setModuloAtivo(modulo);
    }
  }, []);

  const handleSelectModulo = (modulo) => {
    setModuloAtivo(modulo);
  };

  const handleVoltar = () => {
    setModuloAtivo(null);
  };

  const renderModuloContent = () => {
    if (!moduloAtivo) return null;
    
    switch(moduloAtivo.id) {
      case 'pesquisa': return <PlantonistaSearch />;
      case 'modelos': return <PlantonistaModelos />;
      case 'documentos': return <PlantonistaDocumentos />;
      case 'prescricao': return <PlantonistaPrescricao />;
      case 'prescricao-digital':
        navigate(createPageUrl('PrescricaoDigital'));
        return null;
      case 'interacoes': return <PlantonistaInteracoes />;
      case 'iot': return <PlantonistaIOT />;
      case 'diluicao': return <PlantonistaDiluicao />;
      case 'exames-lab': return <PlantonistaExamesLab />;
      case 'internacao': return <PlantonistaInternacao />;
      case 'exames-imagem': return <PlantonistaExamesImagem />;
      case 'ecg': return <PlantonistaECG />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Plantonista</h1>
              <p className="text-xs text-slate-500">Recursos completos para o plantão médico</p>
            </div>
          </div>

          {/* MENU PRINCIPAL */}
          {!moduloAtivo && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modulos.map((modulo) => {
                const Icon = modulo.icon;
                const iconeCustom = getIconeCustomizado(modulo.id);
                
                return (
                  <Card 
                    key={modulo.id}
                    className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:shadow-xl hover:border-red-300 transition-all cursor-pointer"
                    onClick={() => handleSelectModulo(modulo)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        {iconeCustom ? (
                          <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                            <img 
                              src={iconeCustom.icone_url} 
                              alt={modulo.nome}
                              className="w-16 h-16 object-contain"
                            />
                          </div>
                        ) : (
                          <div className={`w-14 h-14 rounded-xl ${modulo.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-800 mb-1">{modulo.nome}</h3>
                          <p className="text-xs text-slate-500">{modulo.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end text-xs text-red-600 font-medium">
                        Acessar <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* CONTEÚDO DO MÓDULO */}
          {moduloAtivo && (
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleVoltar}
                className="text-xs h-7 mb-4"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Voltar aos Módulos
              </Button>
              
              {renderModuloContent()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
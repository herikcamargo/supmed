import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Activity,
  Heart,
  Brain,
  Wind,
  Baby,
  Bug,
  Zap,
  Droplets,
  Stethoscope
} from 'lucide-react';
import ScoreCalculator from '../components/scores/ScoreCalculator';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';
import { createNavigationUrl, SUPMED_ROUTES } from '../components/navigation/NavigationLinks';
import { createPageUrl } from '@/utils';

// Função para encontrar score por ID em todas as categorias
const findScoreById = (scoreId, categories) => {
  for (const cat of categories) {
    const found = cat.scores.find(s => s.id === scoreId);
    if (found) return found;
  }
  return null;
};

const scoreCategories = [
  {
    id: 'cardio',
    nome: 'Cardiologia / Vascular',
    icon: Heart,
    color: 'bg-red-500',
    scores: [
      { id: 'heart', nome: 'HEART Score', desc: 'Risco de eventos cardiovasculares em dor torácica', fonte: 'Six et al., NEJM 2008', completo: true },
      { id: 'grace', nome: 'GRACE Score', desc: 'Risco em síndrome coronariana aguda', fonte: 'Fox et al., BMJ 2006', completo: true },
      { id: 'timi_nstemi', nome: 'TIMI (NSTEMI)', desc: 'Risco em NSTEMI', fonte: 'Antman et al., JAMA 2000', completo: true },
      { id: 'timi_stemi', nome: 'TIMI (STEMI)', desc: 'Mortalidade em STEMI', fonte: 'Morrow et al., Circulation 2000', completo: true },
      { id: 'chadsvasc', nome: 'CHA₂DS₂-VASc', desc: 'Risco tromboembólico em FA', fonte: 'Lip et al., Chest 2010', completo: true },
      { id: 'hasbled', nome: 'HAS-BLED', desc: 'Risco de sangramento em anticoagulação', fonte: 'Pisters et al., Chest 2010', completo: true },
      { id: 'wells_tep', nome: 'Wells Score (TEP)', desc: 'Probabilidade de tromboembolismo pulmonar', fonte: 'Wells et al., Ann Intern Med 2001', completo: true },
      { id: 'wells_tvp', nome: 'Wells Score (TVP)', desc: 'Probabilidade de trombose venosa profunda', fonte: 'Wells et al., Lancet 1997', completo: true },
      { id: 'perc', nome: 'PERC Rule', desc: 'Exclusão clínica de TEP', fonte: 'Kline et al., J Thromb Haemost 2004', completo: true },
      { id: 'shock_index', nome: 'Shock Index', desc: 'FC/PAS - Avaliação de choque', fonte: 'Allgöwer & Burri, 1967', completo: true },
      { id: 'killip', nome: 'Killip Classification', desc: 'Classificação de IC no IAM', fonte: 'Killip & Kimball, Am J Cardiol 1967', completo: true }
    ]
  },
  {
    id: 'neuro',
    nome: 'Neurologia',
    icon: Brain,
    color: 'bg-purple-600',
    scores: [
      { id: 'nihss', nome: 'NIH Stroke Scale (NIHSS)', desc: 'Gravidade do AVC', fonte: 'Brott et al., Stroke 1989', completo: true },
      { id: 'glasgow', nome: 'Glasgow Coma Scale (GCS)', desc: 'Nível de consciência', fonte: 'Teasdale & Jennett, Lancet 1974', completo: true },
      { id: 'abcd2', nome: 'ABCD² Score', desc: 'Risco de AVC após AIT', fonte: 'Johnston et al., Lancet 2007', completo: true },
      { id: 'hunt_hess', nome: 'Hunt-Hess', desc: 'Classificação de hemorragia subaracnoide', fonte: 'Hunt & Hess, J Neurosurg 1968', completo: true },
      { id: 'fisher', nome: 'Fisher Scale', desc: 'Risco de vasoespasmo em HSA', fonte: 'Fisher et al., Neurosurgery 1980', completo: true },
      { id: 'canadian_ct_head', nome: 'Canadian CT Head Rule', desc: 'Indicação de TC em TCE menor', fonte: 'Stiell et al., Lancet 2001', completo: true }
    ]
  },
  {
    id: 'respiratorio',
    nome: 'Respiratório / Pneumologia',
    icon: Wind,
    color: 'bg-blue-500',
    scores: [
      { id: 'curb65', nome: 'CURB-65', desc: 'Gravidade de pneumonia comunitária', fonte: 'BTS Guidelines, Thorax 2009', completo: true },
      { id: 'psi_port', nome: 'PSI/PORT Score', desc: 'Pneumonia Severity Index', fonte: 'Fine et al., NEJM 1997', completo: true },
      { id: 'pao2fio2', nome: 'PaO₂/FiO₂', desc: 'Relação PaO₂/FiO₂', fonte: 'Berlin Definition ARDS', completo: true },
      { id: 'berlin_ards', nome: 'Berlin ARDS', desc: 'Classificação de SDRA', fonte: 'ARDS Definition Task Force, JAMA 2012', completo: true },
      { id: 'smart_cop', nome: 'SMART-COP', desc: 'Necessidade de suporte ventilatório em PAC', fonte: 'Charles et al., Clin Infect Dis 2008', completo: true }
    ]
  },
  {
    id: 'infeccoes',
    nome: 'Infectologia / Sepse',
    icon: Bug,
    color: 'bg-green-600',
    scores: [
      { id: 'qsofa', nome: 'qSOFA', desc: 'Quick SOFA', fonte: 'Sepsis-3, JAMA 2016', completo: true },
      { id: 'sofa', nome: 'SOFA Score', desc: 'Sequential Organ Failure Assessment', fonte: 'Vincent et al., Intensive Care Med 1996', completo: true },
      { id: 'sirs', nome: 'SIRS', desc: 'Síndrome da Resposta Inflamatória Sistêmica', fonte: 'Bone et al., Chest 1992', completo: true },
      { id: 'clearance_lactato', nome: 'Clearance de Lactato', desc: 'Percentual de redução do lactato', fonte: 'Surviving Sepsis Campaign', completo: true },
      { id: 'volume_30ml', nome: 'Reposição 30mL/kg', desc: 'Volume para ressuscitação inicial', fonte: 'Surviving Sepsis 2021', completo: true }
    ]
  },
  {
    id: 'gastro',
    nome: 'Gastroenterologia / Hepatologia',
    icon: Stethoscope,
    color: 'bg-amber-500',
    scores: [
      { id: 'child_pugh', nome: 'Child-Pugh', desc: 'Gravidade de cirrose', fonte: 'Pugh et al., Br J Surg 1973', completo: true },
      { id: 'meld', nome: 'MELD', desc: 'Model for End-Stage Liver Disease', fonte: 'Kamath et al., Hepatology 2001', completo: true },
      { id: 'meld_na', nome: 'MELD-Na', desc: 'MELD com sódio', fonte: 'Kim et al., Hepatology 2008', completo: true },
      { id: 'glasgow_blatchford', nome: 'Glasgow-Blatchford', desc: 'Risco em hemorragia digestiva alta', fonte: 'Blatchford et al., Lancet 2000', completo: true },
      { id: 'rockall', nome: 'Rockall Score', desc: 'Risco de mortalidade em HDA', fonte: 'Rockall et al., Gut 1996', completo: true },
      { id: 'ranson', nome: 'Ranson Criteria', desc: 'Gravidade de pancreatite aguda', fonte: 'Ranson et al., Surg Gynecol Obstet 1974', completo: true },
      { id: 'apri', nome: 'APRI', desc: 'AST to Platelet Ratio Index', fonte: 'Wai et al., Hepatology 2003', completo: true },
      { id: 'fib4', nome: 'FIB-4', desc: 'Fibrose hepática', fonte: 'Sterling et al., Hepatology 2006', completo: true },
      { id: 'ast_alt', nome: 'Razão AST/ALT', desc: 'De Ritis Ratio', fonte: 'De Ritis', completo: true }
    ]
  },
  {
    id: 'renal',
    nome: 'Nefrologia / Metabólico',
    icon: Droplets,
    color: 'bg-teal-500',
    scores: [
      { id: 'ckd_epi', nome: 'CKD-EPI', desc: 'TFG estimada', fonte: 'Levey et al., Ann Intern Med 2009', completo: true },
      { id: 'cockcroft', nome: 'Cockcroft-Gault', desc: 'Clearance de creatinina', fonte: 'Cockcroft & Gault, Nephron 1976', completo: true },
      { id: 'mdrd', nome: 'MDRD', desc: 'TFG estimada', fonte: 'Levey et al., Ann Intern Med 1999', completo: true },
      { id: 'anion_gap', nome: 'Anion Gap', desc: 'Diferença de íons', fonte: 'Emmett & Narins, Medicine 1977', completo: true },
      { id: 'anion_gap_alb', nome: 'Anion Gap Corrigido', desc: 'Ajustado pela albumina', fonte: 'Figge et al., Crit Care Med 1998', completo: true },
      { id: 'fena', nome: 'FeNa', desc: 'Excreção fracionada de sódio', fonte: 'Espinel, JAMA 1976', completo: true },
      { id: 'feureia', nome: 'FeUreia', desc: 'Excreção fracionada de ureia', fonte: 'Carvounis et al., Am J Kidney Dis 2002', completo: true },
      { id: 'deficit_agua', nome: 'Déficit de Água Livre', desc: 'Cálculo para hipernatremia', fonte: 'Adrogue & Madias, NEJM 2000', completo: true }
    ]
  },
  {
    id: 'trauma',
    nome: 'Trauma / Emergência',
    icon: Zap,
    color: 'bg-orange-500',
    scores: [
      { id: 'glasgow', nome: 'Glasgow Coma Scale (GCS)', desc: 'Nível de consciência', fonte: 'Teasdale & Jennett, Lancet 1974', completo: true },
      { id: 'rts', nome: 'RTS (Revised Trauma Score)', desc: 'Gravidade do trauma', fonte: 'Champion et al., J Trauma 1989', completo: true },
      { id: 'iss', nome: 'ISS (Injury Severity Score)', desc: 'Gravidade anatômica do trauma', fonte: 'Baker et al., J Trauma 1974', completo: true },
      { id: 'abc_score', nome: 'ABC Score', desc: 'Previsão de transfusão maciça', fonte: 'Nunez et al., J Trauma 2009', completo: true },
      { id: 'nexus', nome: 'NEXUS C-Spine', desc: 'Indicação de RX cervical em trauma', fonte: 'Hoffman et al., NEJM 2000', completo: true }
    ]
  },
  {
    id: 'pediatria',
    nome: 'Pediatria / Neonatologia',
    icon: Baby,
    color: 'bg-pink-500',
    scores: [
      { id: 'apgar', nome: 'Apgar Score', desc: 'Vitalidade neonatal', fonte: 'Apgar, JAMA 1953', completo: true },
      { id: 'imc_ped', nome: 'IMC Pediátrico', desc: 'IMC com percentis', fonte: 'CDC/OMS', completo: true },
      { id: 'bsa_ped', nome: 'BSA Pediátrica', desc: 'Superfície corporal', fonte: 'Mosteller', completo: true },
      { id: 'holliday_segar', nome: 'Holliday-Segar', desc: 'Manutenção hídrica pediátrica', fonte: 'Holliday & Segar, Pediatrics 1957', completo: true }
    ]
  },
  {
    id: 'psiquiatria',
    nome: 'Psiquiatria',
    icon: Brain,
    color: 'bg-indigo-500',
    scores: [
      { id: 'ciwa', nome: 'CIWA-Ar', desc: 'Abstinência alcoólica', fonte: 'Sullivan et al., Br J Addict 1989', completo: true },
      { id: 'cows', nome: 'COWS', desc: 'Abstinência de opioides', fonte: 'Wesson & Ling, J Psychoactive Drugs 2003', completo: true },
      { id: 'phq9', nome: 'PHQ-9', desc: 'Rastreio e gravidade de depressão', fonte: 'Kroenke et al., J Gen Intern Med 2001', completo: true },
      { id: 'gad7', nome: 'GAD-7', desc: 'Rastreio de ansiedade generalizada', fonte: 'Spitzer et al., Arch Intern Med 2006', completo: true }
    ]
  },
  {
    id: 'hematologia',
    nome: 'Hematologia / Tromboembolismo',
    icon: Droplets,
    color: 'bg-rose-600',
    scores: [
      { id: 'padua', nome: 'Padua Prediction Score', desc: 'Risco de TEV em pacientes clínicos', fonte: 'Barbar et al., J Thromb Haemost 2010', completo: true },
      { id: 'caprini', nome: 'Caprini Score', desc: 'Risco de TEV em pacientes cirúrgicos', fonte: 'Caprini JA, Dis Mon 2005', completo: true }
    ]
  },
  {
    id: 'metabolico',
    nome: 'Cálculos Metabólicos',
    icon: Activity,
    color: 'bg-cyan-600',
    scores: [
      { id: 'imc', nome: 'IMC', desc: 'Índice de Massa Corporal', fonte: 'OMS', completo: true },
      { id: 'bsa', nome: 'BSA', desc: 'Superfície Corporal', fonte: 'Mosteller, NEJM 1987', completo: true },
      { id: 'ldl_friedewald', nome: 'LDL (Friedewald)', desc: 'Cálculo de LDL colesterol', fonte: 'Friedewald et al., Clin Chem 1972', completo: true },
      { id: 'osmolaridade', nome: 'Osmolaridade Plasmática', desc: 'Osmolaridade calculada', fonte: 'Fórmula clássica', completo: true },
      { id: 'na_corrigido', nome: 'Sódio Corrigido', desc: 'Correção pela glicose', fonte: 'Katz, NEJM 1973', completo: true },
      { id: 'calcio_corrigido', nome: 'Cálcio Corrigido', desc: 'Ajuste pela albumina', fonte: 'Payne et al., BMJ 1973', completo: true },
      { id: 'gotejamento', nome: 'Gotejamento', desc: 'mL/h para gotas/min', fonte: 'Cálculo padrão', completo: true }
    ]
  }
];

import { Skull } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Calculadoras() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedScore, setSelectedScore] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [contextoOrigem, setContextoOrigem] = useState(null);

  // BUSCAR CALCULADORAS APROVADAS DO BANCO
  const { data: calculadorasAprovadas = [], isLoading: loadingCalculadoras } = useQuery({
    queryKey: ['calculadoras-aprovadas'],
    queryFn: async () => {
      const calcs = await base44.entities.ConteudoEditorial.filter({
        tipo_modulo: 'calculadora',
        status_editorial: 'aprovado',
        publicado: true
      });
      return calcs;
    },
    initialData: []
  });

  // BUSCAR SCORES APROVADOS DO BANCO
  const { data: scoresAprovados = [], isLoading: loadingScores } = useQuery({
    queryKey: ['scores-aprovados'],
    queryFn: async () => {
      const scores = await base44.entities.ConteudoEditorial.filter({
        tipo_modulo: 'escala',
        status_editorial: 'aprovado',
        publicado: true
      });
      return scores;
    },
    initialData: []
  });
  


  // Verificar e abrir score da URL automaticamente com contexto de origem
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scoreId = urlParams.get('score');
    const origem = urlParams.get('origem');
    const afeccao = urlParams.get('afeccao');
    const procedimento = urlParams.get('procedimento');
    const especialidade = urlParams.get('especialidade');
    
    if (scoreId) {
      const foundScore = findScoreById(scoreId, scoreCategories);
      if (foundScore) {
        setSelectedScore(foundScore);
        
        // CRÍTICO: Preservar contexto de origem para retorno correto
        if (origem && afeccao) {
          setContextoOrigem({
            tipo: origem,
            afeccao: afeccao,
            procedimento: procedimento,
            especialidade: especialidade
          });
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const scoreId = urlParams.get('score');
      const origem = urlParams.get('origem');
      const afeccao = urlParams.get('afeccao');
      const procedimento = urlParams.get('procedimento');
      const especialidade = urlParams.get('especialidade');
      
      if (scoreId) {
        const foundScore = findScoreById(scoreId, scoreCategories);
        if (foundScore && foundScore.id !== selectedScore?.id) {
          setSelectedScore(foundScore);
          
          // CRÍTICO: Atualizar contexto de origem
          if (origem && afeccao) {
            setContextoOrigem({ 
              tipo: origem, 
              afeccao, 
              procedimento, 
              especialidade 
            });
          } else {
            setContextoOrigem(null);
          }
          
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        setSelectedScore(null);
        setContextoOrigem(null);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [selectedScore]);

  // CORREÇÃO CRÍTICA: Botão Voltar com retorno contextual rápido (<200ms)
  const handleVoltar = () => {
    // REGRA: Sempre retornar exatamente para a afecção de origem
    if (contextoOrigem?.tipo === 'afeccao' && contextoOrigem?.afeccao) {
      // Retorno direto para a afecção - RÁPIDO
      window.location.href = createPageUrl('Plantonista') + 
        `?retorno_afeccao=${encodeURIComponent(contextoOrigem.afeccao)}`;
    } else if (contextoOrigem?.tipo === 'plantonista' && contextoOrigem?.afeccao) {
      // Retorno direto para o Plantonista com afecção
      window.location.href = createPageUrl('Plantonista') + 
        `?retorno_afeccao=${encodeURIComponent(contextoOrigem.afeccao)}`;
    } else if (contextoOrigem?.tipo === 'procedimento' && contextoOrigem?.procedimento) {
      // Retorno para procedimento
      window.location.href = createPageUrl('Procedimentos') + 
        `?retorno_procedimento=${encodeURIComponent(contextoOrigem.procedimento)}`;
    } else {
      // Fallback: Voltar ao catálogo (SEM RELOAD)
      setSelectedScore(null);
      setContextoOrigem(null);
      const params = new URLSearchParams(window.location.search);
      params.delete('score');
      params.delete('origem');
      params.delete('especialidade');
      params.delete('afeccao');
      params.delete('procedimento');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.pushState({}, '', newUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Scores Clínicos</h1>
              <p className="text-xs text-slate-500">Escalas e escores médicos validados</p>
            </div>
          </div>

          {selectedScore ? (
            <ScoreCalculator 
              score={selectedScore} 
              contextoOrigem={contextoOrigem}
              onBack={handleVoltar} 
            />
          ) : selectedCategory ? (
            <div className="space-y-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)} className="text-xs h-7">
                ← Voltar às Categorias
              </Button>
              <div className="grid md:grid-cols-2 gap-3">
                {selectedCategory.scores.filter(s => s.completo === true).map((score) => (
                  <Card 
                    key={score.id} 
                    className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer" 
                    onClick={() => setSelectedScore(score)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-800">{score.nome}</span>
                        <Calculator className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{score.desc}</p>
                      <p className="text-[9px] text-slate-400">{score.fonte}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scoreCategories
                .filter(cat => cat.scores.filter(s => s.completo === true).length > 0)
                .map((cat) => {
                  const Icon = cat.icon;
                  const scoresCompletos = cat.scores.filter(s => s.completo === true);
                  
                  return (
                    <Card 
                      key={cat.id} 
                      className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-lg ${cat.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-slate-800">{cat.nome}</h3>
                            <p className="text-[10px] text-slate-500">{scoresCompletos.length} score(s)</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end text-xs text-blue-600 font-medium">
                          Ver scores →
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}

          <DisclaimerFooter variant="calculadora" />
        </div>
        </main>
        </div>
        );
        }
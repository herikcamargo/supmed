import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Droplet, 
  Zap, 
  Activity, 
  Droplets, 
  Filter,
  ChevronLeft,
  Info,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calculator
} from 'lucide-react';
import DisclaimerFooter from '../compliance/DisclaimerFooter';

// Definição dos exames críticos
const examesCriticos = [
  {
    id: 'gasometria',
    nome: 'Gasometria',
    icon: Droplet,
    color: 'bg-blue-500',
    interpretacoes: [
      {
        titulo: 'Acidose Metabólica (pH < 7.35, HCO₃ < 22)',
        significado: 'Excesso de ácidos ou perda de bases. O organismo está tentando compensar reduzindo PaCO₂.',
        relacoes: [
          'Anion gap aumentado: cetoacidose, acidose láctica, intoxicações',
          'Anion gap normal: diarreia, perdas renais, expansão rápida com SF'
        ],
        situacoes: ['Choque séptico', 'DM descompensada', 'Insuficiência renal', 'Intoxicações'],
        erros: [
          'Esquecer de calcular anion gap',
          'Não identificar compensação respiratória',
          'Confundir acidose metabólica com respiratória'
        ]
      },
      {
        titulo: 'Alcalose Metabólica (pH > 7.45, HCO₃ > 26)',
        significado: 'Excesso de bases ou perda de ácidos. Compensação: retenção de CO₂.',
        relacoes: [
          'Cl baixo + K baixo: vômitos, uso de diuréticos',
          'Cl normal: hiperaldosteronismo, hipercortisolismo'
        ],
        situacoes: ['Vômitos profusos', 'Uso crônico de diuréticos', 'Perda de K+'],
        erros: [
          'Não dosar eletrólitos junto',
          'Esquecer que reposição de K+ é essencial',
          'Tratar só o pH sem corrigir causa'
        ]
      },
      {
        titulo: 'Acidose Respiratória (pH < 7.35, PaCO₂ > 45)',
        significado: 'Hipoventilação. Acúmulo de CO₂ por falha na ventilação.',
        relacoes: [
          'Aguda: HCO₃ pouco elevado (compensação renal leva dias)',
          'Crônica: HCO₃ muito elevado (>30)'
        ],
        situacoes: ['DPOC descompensado', 'Fadiga respiratória', 'Depressão SNC', 'Obesidade hipoventilação'],
        erros: [
          'Confundir com acidose metabólica',
          'Não diferenciar aguda de crônica',
          'Intubar paciente DPOC crônico sem critério'
        ]
      },
      {
        titulo: 'Alcalose Respiratória (pH > 7.45, PaCO₂ < 35)',
        significado: 'Hiperventilação. Eliminação excessiva de CO₂.',
        relacoes: [
          'HCO₃ normal: aguda (ansiedade, dor)',
          'HCO₃ baixo: crônica (altitude, gestação, doenças pulmonares)'
        ],
        situacoes: ['Ansiedade', 'Dor aguda', 'Sepse inicial', 'Hiperventilação mecânica'],
        erros: [
          'Tratar só a gasometria sem identificar causa',
          'Ignorar que pode ser sinal de sepse',
          'Não reconhecer hiperventilação compensatória'
        ]
      },
      {
        titulo: 'Hipoxemia (PaO₂ < 60 ou SatO₂ < 90%)',
        significado: 'Baixa oxigenação arterial. Pode ter múltiplas causas.',
        relacoes: [
          'Gradiente A-a elevado: shunt, V/Q mismatch',
          'Gradiente A-a normal: hipoventilação, altitude'
        ],
        situacoes: ['Pneumonia', 'TEP', 'Edema pulmonar', 'DPOC', 'Asma grave'],
        erros: [
          'Não calcular gradiente A-a',
          'Confiar só na SatO₂ (curva de dissociação)',
          'Não considerar anemia grave'
        ]
      }
    ]
  },
  {
    id: 'eletrolitos',
    nome: 'Eletrólitos',
    icon: Zap,
    color: 'bg-amber-500',
    interpretacoes: [
      {
        titulo: 'Hiponatremia (Na < 135)',
        significado: 'Excesso de água em relação ao sódio, ou perda real de sódio.',
        relacoes: [
          'Osmolalidade baixa: hiponatremia verdadeira',
          'Osmolalidade normal/alta: pseudohiponatremia, glicose alta',
          'Volemia: hipovolêmica, euvolêmica, hipervolêmica'
        ],
        situacoes: ['SIADH', 'ICC descompensada', 'Cirrose', 'Uso de diuréticos', 'Polidipsia'],
        erros: [
          'Corrigir rápido demais (mielinólise pontina)',
          'Não avaliar volemia',
          'Não corrigir Na pela glicemia alta',
          'Dar SF em SIADH (piora)'
        ]
      },
      {
        titulo: 'Hipernatremia (Na > 145)',
        significado: 'Perda de água livre maior que perda de sódio.',
        relacoes: [
          'Sempre acompanhada de hipertonicidade',
          'Desidratação grave: Na > 160',
          'Diabetes insípido: poliúria + hipernatremia'
        ],
        situacoes: ['Desidratação', 'Diabetes insípido', 'Perdas insensíveis aumentadas', 'Hiperglicemia osmótica'],
        erros: [
          'Corrigir muito rápido (edema cerebral)',
          'Não calcular déficit de água livre',
          'Usar SF 0,9% (mantém hipernatremia)',
          'Ignorar causa (diabetes insípido)'
        ]
      },
      {
        titulo: 'Hipocalemia (K < 3.5)',
        significado: 'Perda de potássio por rim, TGI ou redistribuição intracelular.',
        relacoes: [
          'K < 3: risco de arritmia',
          'Alcalose metabólica frequente',
          'Mg baixo impede correção de K'
        ],
        situacoes: ['Vômitos', 'Diarreia', 'Diuréticos', 'Alcalose metabólica', 'Insulina'],
        erros: [
          'Repor K em paciente oligurico sem checar função renal',
          'Repor rápido demais em veia periférica',
          'Não dosar magnésio junto',
          'Não fazer ECG se K < 3'
        ]
      },
      {
        titulo: 'Hipercalemia (K > 5.5)',
        significado: 'Acúmulo de potássio. Risco de parada cardíaca.',
        relacoes: [
          'K > 6.5: risco iminente',
          'ECG: onda T apiculada, alargamento QRS',
          'Acidose piora (K sai da célula)',
          'IRA: causa mais comum'
        ],
        situacoes: ['IRA', 'Rabdomiólise', 'Acidose', 'Hemólise', 'Medicamentos (IECA, espironolactona)'],
        erros: [
          'Não fazer ECG imediato',
          'Dosar sem cuidado (hemólise da amostra)',
          'Não estabilizar membrana (gluconato Ca)',
          'Esquecer de remover K (resinas, diálise)'
        ]
      },
      {
        titulo: 'Hipocalcemia (Ca < 8.5 mg/dL)',
        significado: 'Déficit de cálcio. Considerar albumina baixa.',
        relacoes: [
          'Ca ionizado é o mais confiável',
          'Corrigir pela albumina: Ca corrigido = Ca + 0.8 × (4 - albumina)',
          'Mg baixo piora hipocalcemia'
        ],
        situacoes: ['Hipoalbuminemia', 'Hipoparatireoidismo', 'Déficit de vitamina D', 'Pancreatite aguda'],
        erros: [
          'Não corrigir pela albumina',
          'Tratar Ca de 7 em paciente com albumina de 2',
          'Esquecer de dosar Mg',
          'Não reconhecer tetania'
        ]
      },
      {
        titulo: 'Hipercalcemia (Ca > 10.5 mg/dL)',
        significado: 'Excesso de cálcio. Causas principais: câncer e hiperparatireoidismo.',
        relacoes: [
          'Ca > 14: crise hipercalcêmica',
          'PTH alto: hiperparatireoidismo',
          'PTH baixo: malignidade, intoxicação por vitamina D'
        ],
        situacoes: ['Neoplasias', 'Hiperparatireoidismo', 'Imobilização prolongada', 'Intoxicação vitamina D'],
        erros: [
          'Não hidratar adequadamente',
          'Usar furosemida antes de hidratar',
          'Não investigar malignidade',
          'Esquecer de dosar PTH'
        ]
      }
    ]
  },
  {
    id: 'lactato',
    nome: 'Lactato',
    icon: Activity,
    color: 'bg-red-500',
    interpretacoes: [
      {
        titulo: 'Lactato Elevado (> 2 mmol/L)',
        significado: 'Metabolismo anaeróbico. Pode indicar hipoperfusão tecidual.',
        relacoes: [
          'Lactato > 4: hiperlactatemia grave, mortalidade alta',
          'Acidose láctica tipo A: hipoperfusão (choque)',
          'Acidose láctica tipo B: disfunção mitocondrial, fármacos'
        ],
        situacoes: ['Choque séptico', 'Choque cardiogênico', 'Isquemia mesentérica', 'Convulsões', 'Intoxicação por metformina'],
        erros: [
          'Não coletar antes de iniciar ressuscitação',
          'Interpretar como marcador único de gravidade',
          'Esquecer causas tipo B (metformina, propofol)',
          'Não reconhecer clearance lento como mau prognóstico'
        ]
      },
      {
        titulo: 'Lactato Normal (< 2 mmol/L)',
        significado: 'Metabolismo aeróbico preservado. Boa perfusão tecidual.',
        relacoes: [
          'Lactato normal não exclui sepse',
          'Pacientes compensados podem ter lactato normal',
          'Clearance de lactato é importante no seguimento'
        ],
        situacoes: ['Paciente estável', 'Ressuscitação bem-sucedida', 'Avaliação inicial de baixo risco'],
        erros: [
          'Confiar só no lactato para excluir choque',
          'Não considerar clínica junto',
          'Esquecer que diabéticos podem ter lactato normal em cetoacidose'
        ]
      }
    ]
  },
  {
    id: 'hemograma',
    nome: 'Hemograma',
    icon: Droplets,
    color: 'bg-rose-500',
    interpretacoes: [
      {
        titulo: 'Anemia (Hb < 12 ♀, < 13 ♂)',
        significado: 'Redução da massa eritrocitária. Classificar por VCM e RDW.',
        relacoes: [
          'VCM < 80: microcítica (ferro, talassemia)',
          'VCM 80-100: normocítica (sangramento, doença crônica)',
          'VCM > 100: macrocítica (B12, folato, álcool)',
          'Reticulócitos: alta = regenerativa, baixa = hiporregenerativa'
        ],
        situacoes: ['Sangramento agudo', 'Anemia ferropriva', 'Anemia de doença crônica', 'Hemólise'],
        erros: [
          'Não pedir reticulócitos',
          'Esquecer de dosar ferro/ferritina',
          'Transfundir sem critério clínico',
          'Não investigar causa'
        ]
      },
      {
        titulo: 'Leucocitose (Leucócitos > 11.000)',
        significado: 'Elevação de glóbulos brancos. Analisar diferencial.',
        relacoes: [
          'Neutrofilia: infecção bacteriana, estresse',
          'Linfocitose: viral, leucemia linfocítica',
          'Eosinofilia: alergia, parasitas',
          'Desvio à esquerda: bastonetes > 5%'
        ],
        situacoes: ['Infecção bacteriana', 'Estresse cirúrgico', 'Corticoides', 'Leucemia'],
        erros: [
          'Não olhar diferencial',
          'Confundir leucocitose por corticoide com infecção',
          'Ignorar leucocitose > 50.000 (reação leucemoide)',
          'Esquecer que idosos podem não ter leucocitose'
        ]
      },
      {
        titulo: 'Leucopenia (Leucócitos < 4.000)',
        significado: 'Redução de glóbulos brancos. Risco de infecção.',
        relacoes: [
          'Neutrófilos < 1.500: neutropenia leve',
          'Neutrófilos < 500: neutropenia grave (risco alto)',
          'Causas: quimioterapia, viral, autoimune'
        ],
        situacoes: ['Quimioterapia', 'HIV avançado', 'Infecções virais', 'LES', 'Medicamentos'],
        erros: [
          'Não contar neutrófilos absolutos',
          'Liberar paciente oncológico com neutropenia grave',
          'Não considerar profilaxia antibiótica',
          'Esquecer de investigar medicamentos'
        ]
      },
      {
        titulo: 'Plaquetopenia (Plaquetas < 150.000)',
        significado: 'Redução de plaquetas. Risco de sangramento.',
        relacoes: [
          '< 50.000: risco moderado, evitar procedimentos',
          '< 20.000: risco alto, sangramento espontâneo',
          '< 10.000: emergência hematológica',
          'Pseudo-plaquetopenia: agregação in vitro (EDTA)'
        ],
        situacoes: ['PTI', 'Sepse', 'Dengue', 'Hiperesplenismo', 'Quimioterapia'],
        erros: [
          'Não refazer em citrato se suspeita pseudo-plaquetopenia',
          'Transfundir sem critério',
          'Não investigar causa',
          'Ignorar microangiopatia (esquizócitos)'
        ]
      }
    ]
  },
  {
    id: 'funcao-renal',
    nome: 'Função Renal',
    icon: Filter,
    color: 'bg-teal-500',
    interpretacoes: [
      {
        titulo: 'Creatinina Elevada (IRA)',
        significado: 'Aumento de Cr em 48-72h. Classificar em pré-renal, renal ou pós-renal.',
        relacoes: [
          'Ur/Cr > 20: pré-renal (desidratação, baixo débito)',
          'Ur/Cr < 10: renal (NTA, nefrite)',
          'EAS com cilindros, proteinúria: lesão renal',
          'Anúria súbita: pós-renal (obstrução)'
        ],
        situacoes: ['Desidratação', 'Choque', 'Nefrotóxicos', 'Obstrução urinária', 'Rabdomiólise'],
        erros: [
          'Não diferenciar pré/renal/pós',
          'Não suspender nefrotóxicos',
          'Não fazer USG em anúria',
          'Esquecer de calcular TFG'
        ]
      },
      {
        titulo: 'Ureia Elevada',
        significado: 'Catabolismo proteico ou redução da filtração glomerular.',
        relacoes: [
          'Ur > 100: uremia (náuseas, confusão)',
          'Ur/Cr > 20: desidratação, sangramento digestivo',
          'Ur isolada: catabolismo, dieta hiperproteica'
        ],
        situacoes: ['Desidratação', 'Sangramento digestivo alto', 'IRA', 'DRC descompensada'],
        erros: [
          'Usar ureia isolada para avaliar função renal',
          'Não considerar sangramento TGI alto',
          'Esquecer que corticoide eleva ureia'
        ]
      },
      {
        titulo: 'Hipercalemia na IRA',
        significado: 'K não é excretado. Risco de arritmia fatal.',
        relacoes: [
          'Acidose piora (K sai da célula)',
          'Oligoanúria: K sobe rápido',
          'K > 6.5 com ECG alterado: emergência dialítica'
        ],
        situacoes: ['IRA avançada', 'Rabdomiólise', 'Síndrome de lise tumoral'],
        erros: [
          'Não fazer ECG urgente',
          'Não estabilizar membrana',
          'Não indicar diálise a tempo',
          'Dar K em soro inadvertidamente'
        ]
      }
    ]
  }
];

export default function PlantonistaExamesLab() {
  const [view, setView] = useState('interpretacao'); // 'interpretacao' ou 'calculadoras'
  const [exameSelecionado, setExameSelecionado] = useState(null);
  const [interpretacaoAberta, setInterpretacaoAberta] = useState(null);
  
  // Estados das calculadoras
  const [gasometria, setGasometria] = useState({ ph: '', pco2: '', hco3: '', na: '' });
  const [gapAnionico, setGapAnionico] = useState({ na: '', cl: '', hco3: '' });
  const [osmolaridade, setOsmolaridade] = useState({ na: '', glicose: '', ureia: '' });
  const [clearance, setClearance] = useState({ idade: '', peso: '', creatinina: '', sexo: 'M' });
  const [correcaoNa, setCorrecaoNa] = useState({ na: '', glicose: '' });
  
  const [resultadoGaso, setResultadoGaso] = useState(null);
  const [resultadoGap, setResultadoGap] = useState(null);
  const [resultadoOsm, setResultadoOsm] = useState(null);
  const [resultadoClr, setResultadoClr] = useState(null);
  const [resultadoNa, setResultadoNa] = useState(null);
  
  // Funções de cálculo
  const calcularGasometria = () => {
    const ph = parseFloat(gasometria.ph);
    const pco2 = parseFloat(gasometria.pco2);
    const hco3 = parseFloat(gasometria.hco3);
    const na = parseFloat(gasometria.na) || 140;
    
    if (!ph || !pco2 || !hco3) return;
    
    let disturbio = '';
    let compensacao = '';
    const cl = 105; // Valor padrão se não fornecido
    const gap = na - (cl + hco3);
    
    // Padrão identificado (educacional)
    if (ph < 7.35) {
      if (pco2 > 45) disturbio = 'Padrão compatível com acidose respiratória';
      else if (hco3 < 22) disturbio = 'Padrão compatível com acidose metabólica';
    } else if (ph > 7.45) {
      if (pco2 < 35) disturbio = 'Padrão compatível com alcalose respiratória';
      else if (hco3 > 26) disturbio = 'Padrão compatível com alcalose metabólica';
    } else {
      disturbio = 'pH dentro da faixa de referência';
    }
    
    // Compensação esperada
    if (disturbio.includes('Acidose Metabólica')) {
      const pco2Esperado = 1.5 * hco3 + 8;
      compensacao = Math.abs(pco2 - pco2Esperado) < 2 ? 'Adequada' : 'Inadequada';
    } else if (disturbio.includes('Alcalose Metabólica')) {
      const pco2Esperado = 0.7 * (hco3 - 24) + 40;
      compensacao = Math.abs(pco2 - pco2Esperado) < 5 ? 'Adequada' : 'Inadequada';
    }
    
    setResultadoGaso({ disturbio, compensacao, gap: gasometria.na ? gap.toFixed(1) : null });
  };
  
  const calcularGap = () => {
    const na = parseFloat(gapAnionico.na);
    const cl = parseFloat(gapAnionico.cl);
    const hco3 = parseFloat(gapAnionico.hco3);
    
    if (!na || !cl || !hco3) return;
    
    const gap = na - (cl + hco3);
    let interpretacao = '';
    
    if (gap > 12) interpretacao = 'Valor aumentado — pode estar associado a cetoacidose, acidose láctica ou intoxicações';
    else if (gap < 6) interpretacao = 'Valor baixo — pode estar associado a hipoalbuminemia ou mieloma múltiplo';
    else interpretacao = 'Valor dentro da faixa esperada';
    
    setResultadoGap({ valor: gap.toFixed(1), interpretacao });
  };
  
  const calcularOsmolaridade = () => {
    const na = parseFloat(osmolaridade.na);
    const glicose = parseFloat(osmolaridade.glicose);
    const ureia = parseFloat(osmolaridade.ureia);
    
    if (!na || !glicose || !ureia) return;
    
    const osm = 2 * na + glicose / 18 + ureia / 6;
    let interpretacao = '';
    
    if (osm < 275) interpretacao = 'Valor abaixo do esperado — pode estar associado a hiponatremia ou polidipsia';
    else if (osm > 295) interpretacao = 'Valor acima do esperado — pode estar associado a hipernatremia, hiperglicemia ou uremia';
    else interpretacao = 'Valor dentro da faixa esperada';
    
    setResultadoOsm({ valor: osm.toFixed(1), interpretacao });
  };
  
  const calcularClearance = () => {
    const idade = parseFloat(clearance.idade);
    const peso = parseFloat(clearance.peso);
    const cr = parseFloat(clearance.creatinina);
    
    if (!idade || !peso || !cr) return;
    
    const fatorSexo = clearance.sexo === 'F' ? 0.85 : 1;
    const clr = ((140 - idade) * peso * fatorSexo) / (72 * cr);
    
    let classificacao = '';
    if (clr >= 90) classificacao = 'Função renal dentro do esperado';
    else if (clr >= 60) classificacao = 'Compatível com redução leve da função renal (estágio 2)';
    else if (clr >= 30) classificacao = 'Compatível com redução moderada da função renal (estágio 3)';
    else if (clr >= 15) classificacao = 'Compatível com redução grave da função renal (estágio 4)';
    else classificacao = 'Compatível com falência renal avançada (estágio 5)';
    
    setResultadoClr({ valor: clr.toFixed(1), classificacao });
  };
  
  const calcularCorrecaoNa = () => {
    const na = parseFloat(correcaoNa.na);
    const glicose = parseFloat(correcaoNa.glicose);
    
    if (!na || !glicose) return;
    
    const correcao = (glicose - 100) / 100 * 1.6;
    const naCorrigido = na + correcao;
    
    setResultadoNa({ 
      valor: naCorrigido.toFixed(1), 
      diferenca: correcao.toFixed(1),
      obs: glicose > 100 ? 'Hiperglicemia causa pseudohiponatremia' : 'Glicose normal'
    });
  };

  if (exameSelecionado) {
    const exame = examesCriticos.find(e => e.id === exameSelecionado);
    const Icon = exame.icon;

    return (
      <div className="space-y-3">
        {/* Header com Voltar */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExameSelecionado(null);
              setInterpretacaoAberta(null);
            }}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className={`w-8 h-8 rounded-lg ${exame.color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{exame.nome}</h3>
            <p className="text-[10px] text-slate-500">Selecione uma interpretação</p>
          </div>
        </div>

        {/* Lista de Interpretações */}
        <div className="space-y-2">
          {exame.interpretacoes.map((interp, idx) => (
            <Card 
              key={idx}
              className={`
                cursor-pointer transition-all duration-200 border
                ${interpretacaoAberta === idx 
                  ? 'bg-blue-50 border-blue-300 shadow-sm' 
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }
              `}
              onClick={() => setInterpretacaoAberta(interpretacaoAberta === idx ? null : idx)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-slate-800">{interp.titulo}</h4>
                  {interpretacaoAberta === idx ? (
                    <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </div>

                {interpretacaoAberta === idx && (
                  <div className="space-y-3 mt-3">
                    {/* Significado */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-600" />
                        <h5 className="text-xs font-semibold text-blue-900">O que significa</h5>
                      </div>
                      <p className="text-[10px] text-slate-700 leading-relaxed">
                        {interp.significado}
                      </p>
                    </div>

                    {/* Relações */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Activity className="w-3.5 h-3.5 text-purple-600" />
                        <h5 className="text-xs font-semibold text-purple-900">Relações importantes</h5>
                      </div>
                      <ul className="space-y-1">
                        {interp.relacoes.map((rel, i) => (
                          <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                            <span className="text-purple-500 font-bold mt-0.5">→</span>
                            <span>{rel}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Situações Clínicas */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Droplet className="w-3.5 h-3.5 text-teal-600" />
                        <h5 className="text-xs font-semibold text-teal-900">Situações clínicas comuns</h5>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {interp.situacoes.map((sit, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] bg-teal-50 text-teal-700 border-teal-200">
                            {sit}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Erros Frequentes */}
                    <div className="p-2.5 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <h5 className="text-xs font-semibold text-red-900">Erros frequentes de interpretação</h5>
                      </div>
                      <ul className="space-y-1">
                        {interp.erros.map((erro, i) => (
                          <li key={i} className="text-[10px] text-red-700 flex items-start gap-1.5">
                            <span className="text-red-500 font-bold">×</span>
                            <span>{erro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Tela de Calculadoras
  if (view === 'calculadoras') {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setView('interpretacao')} className="h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Calculadoras de Exames</h3>
            <p className="text-[10px] text-slate-500">Cálculos matemáticos para apoio clínico</p>
          </div>
        </div>

        {/* 1. Gasometria */}
        <Card className="bg-white/80 border-slate-200">
          <CardContent className="p-3 space-y-2">
            <h4 className="text-xs font-semibold text-slate-800">Interpretação de Gasometria (educacional)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">pH</Label>
                <Input type="number" step="0.01" placeholder="7.40" className="h-8 text-xs" 
                  value={gasometria.ph} onChange={(e) => setGasometria({...gasometria, ph: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">pCO₂ (mmHg)</Label>
                <Input type="number" placeholder="40" className="h-8 text-xs"
                  value={gasometria.pco2} onChange={(e) => setGasometria({...gasometria, pco2: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">HCO₃ (mEq/L)</Label>
                <Input type="number" placeholder="24" className="h-8 text-xs"
                  value={gasometria.hco3} onChange={(e) => setGasometria({...gasometria, hco3: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">Na⁺ (opcional)</Label>
                <Input type="number" placeholder="140" className="h-8 text-xs"
                  value={gasometria.na} onChange={(e) => setGasometria({...gasometria, na: e.target.value})} />
              </div>
            </div>
            <Button onClick={calcularGasometria} className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700">
              Calcular
            </Button>
            {resultadoGaso && (
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs font-semibold text-blue-800">{resultadoGaso.disturbio}</p>
                {resultadoGaso.compensacao && <p className="text-[10px] text-blue-700">Compensação: {resultadoGaso.compensacao}</p>}
                {resultadoGaso.gap && <p className="text-[10px] text-blue-700">Gap Aniônico: {resultadoGaso.gap}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Gap Aniônico */}
        <Card className="bg-white/80 border-slate-200">
          <CardContent className="p-3 space-y-2">
            <h4 className="text-xs font-semibold text-slate-800">Gap Aniônico</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px]">Na⁺</Label>
                <Input type="number" placeholder="140" className="h-8 text-xs"
                  value={gapAnionico.na} onChange={(e) => setGapAnionico({...gapAnionico, na: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">Cl⁻</Label>
                <Input type="number" placeholder="105" className="h-8 text-xs"
                  value={gapAnionico.cl} onChange={(e) => setGapAnionico({...gapAnionico, cl: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">HCO₃</Label>
                <Input type="number" placeholder="24" className="h-8 text-xs"
                  value={gapAnionico.hco3} onChange={(e) => setGapAnionico({...gapAnionico, hco3: e.target.value})} />
              </div>
            </div>
            <Button onClick={calcularGap} className="w-full h-8 text-xs bg-amber-600 hover:bg-amber-700">
              Calcular
            </Button>
            {resultadoGap && (
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs font-semibold text-amber-800">Gap: {resultadoGap.valor} mEq/L</p>
                <p className="text-[10px] text-amber-700">{resultadoGap.interpretacao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Osmolaridade */}
        <Card className="bg-white/80 border-slate-200">
          <CardContent className="p-3 space-y-2">
            <h4 className="text-xs font-semibold text-slate-800">Osmolaridade Plasmática</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px]">Na⁺</Label>
                <Input type="number" placeholder="140" className="h-8 text-xs"
                  value={osmolaridade.na} onChange={(e) => setOsmolaridade({...osmolaridade, na: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">Glicose</Label>
                <Input type="number" placeholder="100" className="h-8 text-xs"
                  value={osmolaridade.glicose} onChange={(e) => setOsmolaridade({...osmolaridade, glicose: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">Ureia</Label>
                <Input type="number" placeholder="30" className="h-8 text-xs"
                  value={osmolaridade.ureia} onChange={(e) => setOsmolaridade({...osmolaridade, ureia: e.target.value})} />
              </div>
            </div>
            <Button onClick={calcularOsmolaridade} className="w-full h-8 text-xs bg-teal-600 hover:bg-teal-700">
              Calcular
            </Button>
            {resultadoOsm && (
              <div className="p-2 bg-teal-50 rounded border border-teal-200">
                <p className="text-xs font-semibold text-teal-800">{resultadoOsm.valor} mOsm/L</p>
                <p className="text-[10px] text-teal-700">{resultadoOsm.interpretacao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Clearance Creatinina */}
        <Card className="bg-white/80 border-slate-200">
          <CardContent className="p-3 space-y-2">
            <h4 className="text-xs font-semibold text-slate-800">Clearance de Creatinina (Cockcroft-Gault)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Idade (anos)</Label>
                <Input type="number" placeholder="60" className="h-8 text-xs"
                  value={clearance.idade} onChange={(e) => setClearance({...clearance, idade: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">Peso (kg)</Label>
                <Input type="number" placeholder="70" className="h-8 text-xs"
                  value={clearance.peso} onChange={(e) => setClearance({...clearance, peso: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">Creatinina</Label>
                <Input type="number" step="0.1" placeholder="1.2" className="h-8 text-xs"
                  value={clearance.creatinina} onChange={(e) => setClearance({...clearance, creatinina: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">Sexo</Label>
                <Select value={clearance.sexo} onValueChange={(v) => setClearance({...clearance, sexo: v})}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={calcularClearance} className="w-full h-8 text-xs bg-green-600 hover:bg-green-700">
              Calcular
            </Button>
            {resultadoClr && (
              <div className="p-2 bg-green-50 rounded border border-green-200">
                <p className="text-xs font-semibold text-green-800">{resultadoClr.valor} mL/min</p>
                <p className="text-[10px] text-green-700">{resultadoClr.classificacao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Correção Na */}
        <Card className="bg-white/80 border-slate-200">
          <CardContent className="p-3 space-y-2">
            <h4 className="text-xs font-semibold text-slate-800">Correção de Na⁺ pela Glicose</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Na⁺ medido</Label>
                <Input type="number" placeholder="130" className="h-8 text-xs"
                  value={correcaoNa.na} onChange={(e) => setCorrecaoNa({...correcaoNa, na: e.target.value})} />
              </div>
              <div>
                <Label className="text-[10px]">Glicose (mg/dL)</Label>
                <Input type="number" placeholder="400" className="h-8 text-xs"
                  value={correcaoNa.glicose} onChange={(e) => setCorrecaoNa({...correcaoNa, glicose: e.target.value})} />
              </div>
            </div>
            <Button onClick={calcularCorrecaoNa} className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700">
              Calcular
            </Button>
            {resultadoNa && (
              <div className="p-2 bg-purple-50 rounded border border-purple-200">
                <p className="text-xs font-semibold text-purple-800">Na⁺ corrigido: {resultadoNa.valor} mEq/L</p>
                <p className="text-[10px] text-purple-700">Diferença: +{resultadoNa.diferenca} mEq/L</p>
                <p className="text-[10px] text-purple-600">{resultadoNa.obs}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela inicial - Seleção de Exame
  return (
    <div className="space-y-4">
      {/* Título */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Exames Laboratoriais — Conceitos Educacionais</h3>
        <p className="text-[10px] text-slate-500">Selecione o exame para revisar padrões fisiológicos e alterações comuns</p>
      </div>

      {/* Grid de Exames */}
      <div className="grid grid-cols-2 gap-3">
        {examesCriticos.map((exame) => {
          const Icon = exame.icon;
          return (
            <button
              key={exame.id}
              onClick={() => setExameSelecionado(exame.id)}
              className="group"
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
                  <div className={`w-12 h-12 rounded-xl ${exame.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900">
                    {exame.nome}
                  </span>
                </CardContent>
              </Card>
            </button>
          );
        })}
        
        {/* Botão Calculadoras */}
        <button onClick={() => setView('calculadoras')} className="group">
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-purple-700">
                Calculadoras
              </span>
            </CardContent>
          </Card>
        </button>
      </div>

      <DisclaimerFooter />
    </div>
  );
}
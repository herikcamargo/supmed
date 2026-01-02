import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Utensils, 
  Pill, 
  Moon, 
  Shield, 
  ArrowUp, 
  Droplet, 
  Activity,
  Calendar,
  Syringe,
  Wind,
  Droplets,
  Stethoscope,
  Users,
  Heart,
  Sun,
  UserCircle,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import DisclaimerFooter from '../compliance/DisclaimerFooter';

export default function PlantonistaInternacao() {
  const [expandedItems, setExpandedItems] = useState({
    F: false,
    A: false,
    S: false,
    T: false,
    H: false,
    U: false,
    G: false
  });

  const toggleItem = (item) => {
    setExpandedItems({...expandedItems, [item]: !expandedItems[item]});
  };

  const [devices, setDevices] = useState({
    vm: false,
    desmame: '',
    svd: false,
    cvc: false,
    sonda: false
  });

  const [humanization, setHumanization] = useState({
    mobilizacao: false,
    banhoSol: false,
    familia: false
  });



  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
        <CardContent className="p-4">
          <h2 className="text-white font-semibold text-base mb-1 flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            INTERNAÇÃO — Avaliação Sistemática
          </h2>
          <p className="text-blue-100 text-xs">
            Checklist educacional baseado em FAST-HUG para organização da avaliação diária
          </p>
        </CardContent>
      </Card>

      {/* SEÇÃO 1 - FAST-HUG */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            FAST-HUG — Checklist Educacional Detalhado
          </CardTitle>
          <p className="text-xs text-slate-500">Clique em cada item para conteúdo educacional completo</p>
        </CardHeader>
        <CardContent className="space-y-3">
          
          {/* F - FEEDING */}
          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto hover:bg-blue-50"
              onClick={() => toggleItem('F')}
            >
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-800">F — Feeding (Alimentação)</span>
              </div>
              {expandedItems.F ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {expandedItems.F && (
              <div className="p-4 bg-blue-50 border-t border-blue-200 space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-blue-900 mb-2">CONCEITO</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    A nutrição adequada é essencial para recuperação clínica, cicatrização, função imune e redução de morbimortalidade. 
                    O suporte nutricional deve ser iniciado precocemente em pacientes com risco ou desnutrição estabelecida.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-blue-900 mb-2">VIAS DE ADMINISTRAÇÃO</h5>
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded border border-blue-100">
                      <p className="text-xs font-medium text-slate-800">Via Oral</p>
                      <p className="text-[10px] text-slate-600">Indicação: pacientes conscientes, com TGI funcionante e deglutição preservada. Preferencial sempre que possível.</p>
                      <p className="text-[10px] text-blue-700 mt-1">Exemplo clínico: paciente pós-cirurgia eletiva, com boa aceitação alimentar.</p>
                    </div>
                    
                    <div className="p-2 bg-white rounded border border-blue-100">
                      <p className="text-xs font-medium text-slate-800">Nutrição Enteral (SNE/SNG/Gastrostomia)</p>
                      <p className="text-[10px] text-slate-600">Indicação: TGI funcionante, mas incapacidade de ingestão oral (rebaixamento nível consciência, disfagia, IOT).</p>
                      <p className="text-[10px] text-blue-700 mt-1">Exemplo clínico: paciente em VM, sedado, com peristaltismo presente. Início 24-48h após estabilização hemodinâmica.</p>
                      <Badge className="text-[9px] mt-1 bg-green-500">Preferir via enteral sobre parenteral quando TGI viável</Badge>
                    </div>
                    
                    <div className="p-2 bg-white rounded border border-blue-100">
                      <p className="text-xs font-medium text-slate-800">Nutrição Parenteral Total (NPT)</p>
                      <p className="text-[10px] text-slate-600">Indicação: TGI não funcionante (oclusão intestinal, íleo paralítico grave, isquemia intestinal, fístulas alto débito).</p>
                      <p className="text-[10px] text-blue-700 mt-1">Exemplo clínico: paciente com peritonite, abdome aberto, sem progressão de dieta enteral após 7 dias.</p>
                      <Badge className="text-[9px] mt-1 bg-amber-500">Requer cateter central. Maior risco de infecção e hiperglicemia.</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-blue-900 mb-2">CÁLCULO DE NECESSIDADES</h5>
                  <ul className="text-[10px] text-slate-700 space-y-1">
                    <li>• Calorias: 25-30 kcal/kg/dia (paciente crítico)</li>
                    <li>• Proteínas: 1.2-2.0 g/kg/dia (maior em sepse, queimados, trauma)</li>
                    <li>• Hidratação: 30-35 mL/kg/dia (ajustar por perdas, febre, drenos)</li>
                  </ul>
                </div>

                <div className="p-2 bg-amber-50 rounded border border-amber-200">
                  <p className="text-[10px] text-amber-800">
                    <strong>⚠️ Atenção:</strong> Síndrome de realimentação em pacientes com desnutrição grave. 
                    Monitorar fosfato, potássio e magnésio. Iniciar aporte calórico gradual.
                  </p>
                </div>

                <div className="text-[9px] text-slate-500">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  <strong>Referência:</strong> BRASPEN Guideline 2023 - Terapia Nutricional no Paciente Grave; 
                  ASPEN Guidelines 2022 - Critical Care Nutrition
                </div>
              </div>
            )}
          </div>

          {/* A - ANALGESIA */}
          <div className="border border-green-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto hover:bg-green-50"
              onClick={() => toggleItem('A')}
            >
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-slate-800">A — Analgesia (Controle da Dor)</span>
              </div>
              {expandedItems.A ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {expandedItems.A && (
              <div className="p-4 bg-green-50 border-t border-green-200 space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-green-900 mb-2">CONCEITO</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    A dor não controlada aumenta estresse metabólico, resposta inflamatória, tempo de VM, agitação e pode evoluir para dor crônica. 
                    Analgesia adequada é direito do paciente e melhora desfechos clínicos.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-green-900 mb-2">ESCADA ANALGÉSICA DA OMS</h5>
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded border border-green-100">
                      <p className="text-xs font-medium text-slate-800">Degrau 1 — Dor Leve (EVA 1-3)</p>
                      <p className="text-[10px] text-slate-600">Analgésicos não opioides: Dipirona, Paracetamol, AINEs (se sem contraindicação).</p>
                      <p className="text-[10px] text-green-700 mt-1">Exemplo: dor pós-operatória leve, cefaleia leve.</p>
                    </div>
                    
                    <div className="p-2 bg-white rounded border border-green-100">
                      <p className="text-xs font-medium text-slate-800">Degrau 2 — Dor Moderada (EVA 4-6)</p>
                      <p className="text-[10px] text-slate-600">Opioides fracos: Codeína, Tramadol + não opioides.</p>
                      <p className="text-[10px] text-green-700 mt-1">Exemplo: dor pós-operatória moderada, trauma moderado.</p>
                    </div>
                    
                    <div className="p-2 bg-white rounded border border-green-100">
                      <p className="text-xs font-medium text-slate-800">Degrau 3 — Dor Intensa (EVA 7-10)</p>
                      <p className="text-[10px] text-slate-600">Opioides fortes: Morfina, Fentanil, Metadona + não opioides + adjuvantes.</p>
                      <p className="text-[10px] text-green-700 mt-1">Exemplo: dor pós-operatória grande porte, politrauma, dor oncológica, queimaduras extensas.</p>
                      <Badge className="text-[9px] mt-1 bg-red-500">Monitorar depressão respiratória, náuseas, constipação</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-green-900 mb-2">ESCALAS DE AVALIAÇÃO</h5>
                  <ul className="text-[10px] text-slate-700 space-y-1">
                    <li>• EVA (Escala Visual Analógica): 0 (sem dor) a 10 (pior dor imaginável)</li>
                    <li>• BPS (Behavioral Pain Scale): para pacientes não comunicativos</li>
                    <li>• CPOT (Critical-Care Pain Observation Tool): pacientes em VM</li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-green-900 mb-2">ANALGESIA MULTIMODAL</h5>
                  <p className="text-[10px] text-slate-700">
                    Combinar diferentes classes de analgésicos para otimizar controle da dor e reduzir dose de opioides (poupador de opioide). 
                    Ex: Dipirona + Cetoprofeno + Morfina em paciente pós-laparotomia.
                  </p>
                </div>

                <div className="p-2 bg-amber-50 rounded border border-amber-200">
                  <p className="text-[10px] text-amber-800">
                    <strong>⚠️ Contraindicações AINEs:</strong> insuficiência renal, úlcera péptica ativa, sangramento ativo, cardiopatia grave.
                  </p>
                </div>

                <div className="text-[9px] text-slate-500">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  <strong>Referência:</strong> WHO Guidelines for Pharmacological Management of Pain (2023); 
                  AMIB - Diretrizes de Analgesia e Sedação em UTI (2022)
                </div>
              </div>
            )}
          </div>

          {/* S - SEDATION */}
          <div className="border border-purple-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto hover:bg-purple-50"
              onClick={() => toggleItem('S')}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-slate-800">S — Sedation (Sedação)</span>
              </div>
              {expandedItems.S ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {expandedItems.S && (
              <div className="p-4 bg-purple-50 border-t border-purple-200 space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-purple-900 mb-2">CONCEITO</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    A sedação visa conforto, ansiolíse, facilitação da VM e procedimentos. Sedação excessiva aumenta tempo de VM, delirium, polineuropatia do paciente crítico e mortalidade. 
                    Objetivo: sedação leve com despertar diário sempre que possível.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-purple-900 mb-2">ESCALA RASS (Richmond Agitation-Sedation Scale)</h5>
                  <div className="space-y-1">
                    <div className="p-2 bg-white rounded border border-purple-100">
                      <p className="text-[10px] font-medium text-slate-800">+4 Combativo • +3 Muito agitado • +2 Agitado • +1 Inquieto</p>
                      <p className="text-[10px] text-red-600">Agitação — avaliar causas (dor, delirium, hipóxia, abstinência)</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded border border-green-300">
                      <p className="text-[10px] font-medium text-slate-800">0 Alerta e Calmo</p>
                      <p className="text-[10px] text-green-700">Meta ideal para maioria dos pacientes</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-purple-100">
                      <p className="text-[10px] font-medium text-slate-800">-1 Sonolento • -2 Sedação leve • -3 Sedação moderada</p>
                      <p className="text-[10px] text-blue-600">Sedação leve — facilita interação, fisioterapia, avaliação neurológica</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-purple-100">
                      <p className="text-[10px] font-medium text-slate-800">-4 Sedação profunda • -5 Não despertável</p>
                      <p className="text-[10px] text-amber-600">Sedação profunda — indicações restritas (hipertensão intracraniana, SDRA grave, proteção neurológica)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-purple-900 mb-2">ESTRATÉGIA DE SEDAÇÃO</h5>
                  <ul className="text-[10px] text-slate-700 space-y-1">
                    <li>• <strong>Meta sedação:</strong> RASS -1 a 0 (sedação leve ou alerta calmo)</li>
                    <li>• <strong>Interrupção diária de sedação (IDS):</strong> protocolo de despertar diário para avaliar neurológico e possibilidade de extubação</li>
                    <li>• <strong>Analgesia primeiro:</strong> priorizar controle da dor antes de sedar (analgosedação)</li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-purple-900 mb-2">AGENTES SEDATIVOS COMUNS</h5>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-700">• <strong>Propofol:</strong> sedação de curta duração, rápido despertar. Risco: hipotensão, síndrome infusional (doses altas prolongadas).</p>
                    <p className="text-[10px] text-slate-700">• <strong>Midazolam:</strong> benzodiazepínico. Risco: acúmulo, delirium, tolerância. Evitar uso prolongado.</p>
                    <p className="text-[10px] text-slate-700">• <strong>Dexmedetomidina:</strong> agonista α2, preserva despertar. Vantagens: menor delirium, sem depressão respiratória. Desvantagens: bradicardia, hipotensão, custo.</p>
                  </div>
                </div>

                <div className="p-2 bg-amber-50 rounded border border-amber-200">
                  <p className="text-[10px] text-amber-800">
                    <strong>⚠️ Síndrome de Abstinência:</strong> pacientes em sedação prolongada podem desenvolver dependência. Redução gradual é necessária.
                  </p>
                </div>

                <div className="text-[9px] text-slate-500">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  <strong>Referência:</strong> PADIS Guidelines 2018 - Clinical Practice Guidelines for Pain, Agitation/Sedation, Delirium, Immobility, and Sleep Disruption; 
                  Barr J, et al. Crit Care Med 2013
                </div>
              </div>
            )}
          </div>

          {/* T - THROMBOPROPHYLAXIS */}
          <div className="border border-red-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto hover:bg-red-50"
              onClick={() => toggleItem('T')}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-slate-800">T — Thromboembolic Prevention (Profilaxia TEV)</span>
              </div>
              {expandedItems.T ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {expandedItems.T && (
              <div className="p-4 bg-red-50 border-t border-red-200 space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-red-900 mb-2">CONCEITO</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    O tromboembolismo venoso (TVP/TEP) é complicação frequente em pacientes internados, especialmente em UTI. 
                    Profilaxia adequada reduz morbimortalidade. Avaliar risco trombótico vs. risco hemorrágico.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-red-900 mb-2">SCORE DE CAPRINI (Risco Cirúrgico)</h5>
                  <div className="space-y-1">
                    <div className="p-2 bg-white rounded border border-red-100">
                      <p className="text-[10px] font-medium text-slate-800">0-1 ponto: Muito baixo risco</p>
                      <p className="text-[10px] text-slate-600">Profilaxia: mobilização precoce</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-red-100">
                      <p className="text-[10px] font-medium text-slate-800">2 pontos: Baixo risco</p>
                      <p className="text-[10px] text-slate-600">Profilaxia: meias elásticas, mobilização</p>
                    </div>
                    <div className="p-2 bg-amber-100 rounded border border-amber-300">
                      <p className="text-[10px] font-medium text-slate-800">3-4 pontos: Risco moderado</p>
                      <p className="text-[10px] text-slate-600">Profilaxia: heparina de baixo peso molecular (enoxaparina 40mg SC 1x/dia)</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded border border-red-300">
                      <p className="text-[10px] font-medium text-slate-800">≥5 pontos: Alto risco</p>
                      <p className="text-[10px] text-slate-600">Profilaxia: enoxaparina 40mg SC 12/12h OU heparina não fracionada 5000 UI SC 8/8h</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Fatores: idade &gt;60, IMC &gt;25, cirurgia &gt;45min, câncer, TVP prévia, imobilização, gravidez, etc.</p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-red-900 mb-2">SCORE DE PADUA (Risco Clínico - Paciente Internado)</h5>
                  <div className="space-y-1">
                    <div className="p-2 bg-white rounded border border-red-100">
                      <p className="text-[10px] font-medium text-slate-800">&lt;4 pontos: Baixo risco</p>
                      <p className="text-[10px] text-slate-600">Profilaxia: mobilização precoce. Farmacológica se fatores adicionais.</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded border border-red-300">
                      <p className="text-[10px] font-medium text-slate-800">≥4 pontos: Alto risco</p>
                      <p className="text-[10px] text-slate-600">Profilaxia: enoxaparina 40mg SC 1x/dia OU heparina 5000 UI SC 8/8h</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Fatores: câncer ativo, TVP/TEP prévio, mobilidade reduzida, trombofilia, trauma, ICC/IR, idade &gt;70, etc.</p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-red-900 mb-2">MÉTODOS DE PROFILAXIA</h5>
                  <ul className="text-[10px] text-slate-700 space-y-1">
                    <li>• <strong>Mecânica:</strong> compressão pneumática intermitente (CPI), meias de compressão graduada</li>
                    <li>• <strong>Farmacológica:</strong> heparina de baixo peso molecular (enoxaparina, dalteparina) ou heparina não fracionada</li>
                    <li>• <strong>Combinada:</strong> mecânica + farmacológica em pacientes de muito alto risco</li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-red-900 mb-2">CONTRAINDICAÇÕES À PROFILAXIA FARMACOLÓGICA</h5>
                  <ul className="text-[10px] text-slate-700 space-y-1">
                    <li>• Sangramento ativo ou risco alto de sangramento</li>
                    <li>• Plaquetas &lt;50.000/mm³ (relativo)</li>
                    <li>• Cirurgia neurológica/oftalmológica recente</li>
                    <li>• Punção lombar/anestesia neuroaxial recente (&lt;12h)</li>
                    <li>• Insuficiência renal grave (ClCr &lt;30 mL/min) — ajustar dose ou usar HNF</li>
                  </ul>
                </div>

                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-[10px] text-blue-800">
                    <strong>💡 Dica clínica:</strong> Em pacientes com alto risco trombótico E alto risco hemorrágico, considerar profilaxia mecânica isolada até estabilização.
                  </p>
                </div>

                <div className="text-[9px] text-slate-500">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  <strong>Referência:</strong> CHEST Guidelines 2012 - Antithrombotic Therapy and Prevention of Thrombosis; 
                  Caprini JA. Dis Mon 2005; Barbar S, et al. J Thromb Haemost 2010 (Padua Score)
                </div>
              </div>
            )}
          </div>

          {/* H - HEAD ELEVATED */}
          <div className="border border-amber-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto hover:bg-amber-50"
              onClick={() => toggleItem('H')}
            >
              <div className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-slate-800">H — Head of Bed Elevated (Cabeceira Elevada)</span>
              </div>
              {expandedItems.H ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {expandedItems.H && (
              <div className="p-4 bg-amber-50 border-t border-amber-200 space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-amber-900 mb-2">CONCEITO</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    A elevação da cabeceira do leito reduz risco de broncoaspiração de conteúdo gástrico, pneumonia associada à ventilação mecânica (PAV), 
                    refluxo gastroesofágico e melhora mecânica ventilatória.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-amber-900 mb-2">RECOMENDAÇÃO</h5>
                  <div className="p-2 bg-white rounded border border-amber-200">
                    <p className="text-xs font-medium text-slate-800">Elevação 30-45 graus</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      • <strong>Indicação:</strong> todos os pacientes em VM, com sonda enteral, rebaixamento do nível de consciência, gastroparesia, refluxo
                    </p>
                    <p className="text-[10px] text-slate-600">
                      • <strong>Exceções:</strong> instabilidade hemodinâmica grave, choque, trauma raquimedular em fase aguda (conforme protocolo), hipertensão intracraniana grave
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-amber-900 mb-2">MEDIDAS ASSOCIADAS</h5>
                  <ul className="text-[10px] text-slate-700 space-y-1">
                    <li>• Manter pressão do cuff do tubo orotraqueal entre 20-30 cmH₂O</li>
                    <li>• Higiene oral com clorexidina 0,12% (4x/dia)</li>
                    <li>• Aspiração de secreção subglótica (se tubo com sistema apropriado)</li>
                    <li>• Pausa na dieta antes de procedimentos que exijam decúbito horizontal</li>
                  </ul>
                </div>

                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-[10px] text-blue-800">
                    <strong>💡 Bundle de prevenção de PAV:</strong> cabeceira 30-45°, higiene oral, despertar diário, teste de respiração espontânea, profilaxia TVP e úlcera.
                  </p>
                </div>

                <div className="text-[9px] text-slate-500">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  <strong>Referência:</strong> Institute for Healthcare Improvement (IHI) - Ventilator Bundle; 
                  CDC Guidelines - Prevention of VAP 2022
                </div>
              </div>
            )}
          </div>

          {/* U - ULCER PROPHYLAXIS */}
          <div className="border border-orange-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto hover:bg-orange-50"
              onClick={() => toggleItem('U')}
            >
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-slate-800">U — Stress Ulcer Prophylaxis (Profilaxia de Úlcera)</span>
              </div>
              {expandedItems.U ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {expandedItems.U && (
              <div className="p-4 bg-orange-50 border-t border-orange-200 space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-orange-900 mb-2">CONCEITO</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Úlcera de estresse é erosão da mucosa gastroduodenal relacionada à hipoperfusão esplâncnica, resposta inflamatória, 
                    insuficiência de mecanismos protetores mucosos. Pode levar a sangramento digestivo alto significativo.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-orange-900 mb-2">INDICAÇÕES DE PROFILAXIA</h5>
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-slate-800">Fatores de Alto Risco:</p>
                    <ul className="text-[10px] text-slate-700 space-y-1 ml-3">
                      <li>• Ventilação mecânica por &gt;48 horas</li>
                      <li>• Coagulopatia (INR &gt;1.5, plaquetas &lt;50.000, TTPa &gt;2x controle)</li>
                    </ul>
                    <p className="text-[10px] font-medium text-slate-800 mt-2">Fatores de Risco Moderado (2 ou mais):</p>
                    <ul className="text-[10px] text-slate-700 space-y-1 ml-3">
                      <li>• Choque/sepse</li>
                      <li>• Insuficiência renal aguda</li>
                      <li>• Insuficiência hepática</li>
                      <li>• Queimaduras &gt;35% SCQ</li>
                      <li>• Politrauma</li>
                      <li>• TCE grave</li>
                      <li>• Uso de corticosteroides em altas doses</li>
                      <li>• História de úlcera péptica ou HGDA no último ano</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-orange-900 mb-2">AGENTES PROFILÁTICOS</h5>
                  <div className="space-y-1">
                    <div className="p-2 bg-white rounded border border-orange-100">
                      <p className="text-[10px] font-medium text-slate-800">Inibidor de Bomba de Prótons (IBP)</p>
                      <p className="text-[10px] text-slate-600">Omeprazol 20-40mg/dia, Pantoprazol 40mg/dia (EV ou VO). Mais eficaz que antagonistas H2.</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-orange-100">
                      <p className="text-[10px] font-medium text-slate-800">Antagonista H2</p>
                      <p className="text-[10px] text-slate-600">Ranitidina (retirada do mercado), Famotidina 20mg 12/12h. Alternativa se IBP indisponível.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-orange-900 mb-2">QUANDO NÃO FAZER PROFILAXIA</h5>
                  <ul className="text-[10px] text-slate-700 space-y-1">
                    <li>• Paciente com dieta oral plena e bem tolerada</li>
                    <li>• Ausência de fatores de risco</li>
                    <li>• Paciente estável, sem VM, sem coagulopatia</li>
                  </ul>
                </div>

                <div className="p-2 bg-amber-50 rounded border border-amber-200">
                  <p className="text-[10px] text-amber-800">
                    <strong>⚠️ Atenção:</strong> Uso prolongado de IBP pode aumentar risco de pneumonia, Clostridioides difficile, má absorção de B12/magnésio. 
                    Reavaliar necessidade diariamente.
                  </p>
                </div>

                <div className="text-[9px] text-slate-500">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  <strong>Referência:</strong> ASHP Therapeutic Guidelines - Stress Ulcer Prophylaxis 2022; 
                  Cook DJ, et al. NEJM 1998; Krag M, et al. NEJM 2018 (SUP-ICU trial)
                </div>
              </div>
            )}
          </div>

          {/* G - GLUCOSE CONTROL */}
          <div className="border border-cyan-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto hover:bg-cyan-50"
              onClick={() => toggleItem('G')}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-semibold text-slate-800">G — Glucose Control (Controle Glicêmico)</span>
              </div>
              {expandedItems.G ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {expandedItems.G && (
              <div className="p-4 bg-cyan-50 border-t border-cyan-200 space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-cyan-900 mb-2">CONCEITO</h5>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    A hiperglicemia é comum no paciente crítico (estresse, inflamação, corticosteroides, nutrição). 
                    Controle glicêmico inadequado aumenta infecções, tempo de VM, mortalidade. 
                    Hipoglicemia é igualmente perigosa (dano neurológico, arritmias, morte).
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-cyan-900 mb-2">META GLICÊMICA NO PACIENTE CRÍTICO</h5>
                  <div className="p-2 bg-green-100 rounded border border-green-300">
                    <p className="text-xs font-medium text-slate-800">140-180 mg/dL</p>
                    <p className="text-[10px] text-slate-600">Meta recomendada pela maioria dos consensos (NICE-SUGAR trial, 2009)</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    • Controle intensivo (80-110 mg/dL) aumenta risco de hipoglicemia sem benefício claro em mortalidade.<br/>
                    • Em pós-operatório cardíaco e neurológico, algumas diretrizes sugerem meta mais restrita (110-140 mg/dL).
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-cyan-900 mb-2">HIPOGLICEMIA — TRÍADE DE WHIPPLE</h5>
                  <div className="p-2 bg-amber-100 rounded border border-amber-300">
                    <p className="text-[10px] font-medium text-slate-800">Diagnóstico de Hipoglicemia</p>
                    <ul className="text-[10px] text-slate-700 space-y-1 mt-1">
                      <li>1. Sintomas compatíveis com hipoglicemia (sudorese, tremores, taquicardia, confusão, convulsão)</li>
                      <li>2. Glicemia plasmática baixa documentada (&lt;70 mg/dL; grave se &lt;54 mg/dL)</li>
                      <li>3. Reversão dos sintomas após correção da glicemia</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-cyan-900 mb-2">CORREÇÃO DA HIPOGLICEMIA</h5>
                  <div className="space-y-1">
                    <div className="p-2 bg-white rounded border border-cyan-100">
                      <p className="text-[10px] font-medium text-slate-800">Paciente Consciente (VO)</p>
                      <p className="text-[10px] text-slate-600">15-20g de carboidrato simples (150-200 mL suco, 3-4 sachês açúcar). Reavaliar em 15 minutos.</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-cyan-100">
                      <p className="text-[10px] font-medium text-slate-800">Paciente com Acesso Venoso</p>
                      <p className="text-[10px] text-slate-600">
                        • Glicose 50% (20-40 mL EV em bolus) OU<br/>
                        • Glicose 10% (100-200 mL EV em 10-15 min)
                      </p>
                      <p className="text-[10px] text-blue-700 mt-1">Reavaliar glicemia capilar em 10-15 minutos. Manter infusão de glicose se necessário.</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-cyan-100">
                      <p className="text-[10px] font-medium text-slate-800">Paciente sem Acesso Venoso</p>
                      <p className="text-[10px] text-slate-600">Glucagon 1mg IM/SC. Menos eficaz em desnutridos ou insuficiência hepática.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-cyan-900 mb-2">HIPERGLICEMIA — ABORDAGEM</h5>
                  <div className="space-y-1">
                    <div className="p-2 bg-white rounded border border-cyan-100">
                      <p className="text-[10px] font-medium text-slate-800">Insulinoterapia Subcutânea (paciente estável)</p>
                      <p className="text-[10px] text-slate-600">
                        • Insulina NPH (basal) + insulina regular ou ultrarrápida (correção prandial)<br/>
                        • Escala de correção conforme HGT
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded border border-cyan-100">
                      <p className="text-[10px] font-medium text-slate-800">Insulinoterapia Venosa Contínua (paciente crítico)</p>
                      <p className="text-[10px] text-slate-600">
                        • Insulina regular EV em bomba de infusão<br/>
                        • Protocolo institucional para titulação (ex: Yale Protocol)<br/>
                        • Monitorização glicêmica horária ou a cada 2h
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-cyan-900 mb-2">COMPLICAÇÕES HIPERGLICÊMICAS AGUDAS</h5>
                  <div className="space-y-1">
                    <div className="p-2 bg-red-100 rounded border border-red-300">
                      <p className="text-[10px] font-medium text-slate-800">Cetoacidose Diabética (CAD)</p>
                      <p className="text-[10px] text-slate-700">
                        Hiperglicemia + cetose + acidose metabólica (pH &lt;7.3, HCO3 &lt;15). Comum em DM1.<br/>
                        <strong>Tratamento:</strong> hidratação EV vigorosa, insulina regular EV contínua, correção eletrolítica (K+).
                      </p>
                    </div>
                    <div className="p-2 bg-red-100 rounded border border-red-300">
                      <p className="text-[10px] font-medium text-slate-800">Estado Hiperosmolar Hiperglicêmico (EHH)</p>
                      <p className="text-[10px] text-slate-700">
                        Hiperglicemia grave (geralmente &gt;600 mg/dL), hiperosmolaridade, sem cetose significativa. Comum em DM2 idosos.<br/>
                        <strong>Tratamento:</strong> hidratação agressiva, insulina EV (doses menores que CAD), correção eletrolítica.
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-700 mt-2">
                    ⚠️ <strong>Atenção:</strong> correção rápida da glicemia/osmolaridade pode causar edema cerebral (especialmente em crianças). Reduzir glicemia em 50-75 mg/dL/h.
                  </p>
                </div>

                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-[10px] text-blue-800">
                    <strong>💡 Dica clínica:</strong> Monitorização mais frequente se: mudança na dieta/nutrição, corticoterapia, uso de vasopressores, sepse.
                  </p>
                </div>

                <div className="text-[9px] text-slate-500">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  <strong>Referência:</strong> NICE-SUGAR Study Investigators. NEJM 2009; 
                  ADA Standards of Medical Care in Diabetes 2024; 
                  Jacobi J, et al. Crit Care Med 2012 - Guidelines for the Use of Insulin Therapy in Critically Ill
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* SEÇÃO 2 - SUPORTE E DISPOSITIVOS */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Syringe className="w-4 h-4 text-violet-600" />
            Suporte e Dispositivos
          </CardTitle>
          <p className="text-xs text-slate-500">Revisão de dispositivos invasivos e suporte ventilatório</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer">
              <Checkbox
                checked={devices.vm}
                onCheckedChange={(checked) => setDevices({...devices, vm: checked})}
              />
              <Wind className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-slate-700">Ventilação Mecânica</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer">
              <Checkbox
                checked={devices.svd}
                onCheckedChange={(checked) => setDevices({...devices, svd: checked})}
              />
              <Droplets className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-slate-700">Sonda Vesical de Demora (SVD)</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer">
              <Checkbox
                checked={devices.cvc}
                onCheckedChange={(checked) => setDevices({...devices, cvc: checked})}
              />
              <Activity className="w-4 h-4 text-red-500" />
              <span className="text-xs text-slate-700">Cateter Venoso Central (CVC)</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer">
              <Checkbox
                checked={devices.sonda}
                onCheckedChange={(checked) => setDevices({...devices, sonda: checked})}
              />
              <Utensils className="w-4 h-4 text-green-500" />
              <span className="text-xs text-slate-700">Sonda Nasoentérica / Nasogástrica</span>
            </label>
          </div>

          {devices.vm && (
            <div className="p-3 bg-blue-50 rounded border border-blue-100">
              <Label className="text-xs text-slate-600 mb-1">Possibilidade de Desmame (conceito educacional)</Label>
              <Input
                placeholder="Ex: Em avaliação / Teste de respiração espontânea / Critérios não preenchidos"
                value={devices.desmame}
                onChange={(e) => setDevices({...devices, desmame: e.target.value})}
                className="text-xs h-8"
              />
              <p className="text-[10px] text-slate-400 mt-1">⚠️ Avaliação conceitual — não define conduta</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEÇÃO 3 - HUMANIZAÇÃO E MULTIDISCIPLINAR */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600" />
            Humanização e Multidisciplinar
          </CardTitle>
          <p className="text-xs text-slate-500">Aspectos de cuidado humanizado e equipe multiprofissional</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer">
            <Checkbox
              checked={humanization.mobilizacao}
              onCheckedChange={(checked) => setHumanization({...humanization, mobilizacao: checked})}
            />
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-700">Mobilização Fora do Leito (conceito educacional)</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer">
            <Checkbox
              checked={humanization.banhoSol}
              onCheckedChange={(checked) => setHumanization({...humanization, banhoSol: checked})}
            />
            <Sun className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-slate-700">Banho de Sol / Estímulos Sensoriais</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer">
            <Checkbox
              checked={humanization.familia}
              onCheckedChange={(checked) => setHumanization({...humanization, familia: checked})}
            />
            <UserCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-slate-700">Interação Familiar (quando aplicável)</span>
          </label>

          <div className="p-2 bg-blue-50 rounded border border-blue-100 mt-2">
            <p className="text-[10px] text-blue-700">
              💡 Itens de reflexão clínica e apoio à equipe multiprofissional
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aviso Regulatório */}
      <Card className="bg-amber-50 border border-amber-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-800 font-medium mb-1">Ferramenta Educacional</p>
              <p className="text-[10px] text-amber-700 leading-relaxed">
                Checklist organizacional baseado na metodologia FAST-HUG. 
                Não substitui julgamento clínico, não define condutas nem prescrições. 
                Todos os campos são opcionais e de preenchimento livre.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <DisclaimerFooter variant="protocolo" />
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Calculator, Table, User, ClipboardCheck, Info, Activity, Wind } from 'lucide-react';
import DisclaimerFooter from '../compliance/DisclaimerFooter';

// Base de drogas com doses de referência
const drogasIOT = {
  etomidato: {
    nome: 'Etomidato',
    categoria: 'Sedação/Indução',
    dose_min: 0.2,
    dose_max: 0.4,
    dose_habitual: 0.3,
    unidade: 'mg/kg',
    apresentacao: '2mg/ml (amp 10ml)',
    obs: 'Estabilidade hemodinâmica. Evitar uso prolongado (supressão adrenal).'
  },
  quetamina: {
    nome: 'Quetamina',
    categoria: 'Sedação/Indução',
    dose_min: 1,
    dose_max: 2,
    dose_habitual: 1.5,
    unidade: 'mg/kg',
    apresentacao: '50mg/ml (amp 10ml)',
    obs: 'Mantém drive respiratório. Broncodilatador. Cuidado em HIC e psicose.'
  },
  midazolam: {
    nome: 'Midazolam',
    categoria: 'Sedação',
    dose_min: 0.05,
    dose_max: 0.3,
    dose_habitual: 0.1,
    unidade: 'mg/kg',
    apresentacao: '5mg/ml (amp 3ml ou 10ml)',
    obs: 'Amnésia. Instabilidade hemodinâmica em doses altas.'
  },
  propofol: {
    nome: 'Propofol',
    categoria: 'Sedação/Indução',
    dose_min: 1.5,
    dose_max: 2.5,
    dose_habitual: 2,
    unidade: 'mg/kg',
    apresentacao: '10mg/ml (amp 20ml)',
    obs: 'Rápido início. Hipotensão frequente. Evitar em instabilidade.'
  },
  fentanil: {
    nome: 'Fentanil',
    categoria: 'Analgésico opioide',
    dose_min: 1,
    dose_max: 3,
    dose_habitual: 2,
    unidade: 'mcg/kg',
    apresentacao: '50mcg/ml (amp 2ml, 5ml ou 10ml)',
    obs: 'Analgesia potente. Depressão respiratória. Rigidez torácica em bolus rápido.'
  },
  succinilcolina: {
    nome: 'Succinilcolina',
    categoria: 'Bloqueador neuromuscular',
    dose_min: 1,
    dose_max: 1.5,
    dose_habitual: 1.2,
    unidade: 'mg/kg',
    apresentacao: '100mg (frasco)',
    obs: 'Início rápido (45-60s). CI: hipercalemia, queimadura, trauma raquimedular, miopatia.'
  },
  rocuronio: {
    nome: 'Rocurônio',
    categoria: 'Bloqueador neuromuscular',
    dose_min: 0.6,
    dose_max: 1.2,
    dose_habitual: 1,
    unidade: 'mg/kg',
    apresentacao: '10mg/ml (amp 5ml)',
    obs: 'Alternativa à succinilcolina. Início 60-90s. Duração 30-45min.'
  }
};

// Sequências de IOT mais usadas
const sequenciasComuns = [
  {
    nome: 'IOT Sequência Rápida (RSI) - Padrão',
    indicacao: 'Paciente estável, sem contraindicações',
    drogas: [
      { nome: 'Fentanil', dose: '2-3 mcg/kg', timing: '3-5 min antes' },
      { nome: 'Etomidato', dose: '0.3 mg/kg', timing: 'Indução' },
      { nome: 'Succinilcolina', dose: '1.2 mg/kg', timing: 'Imediatamente após' }
    ]
  },
  {
    nome: 'IOT - Paciente Instável',
    indicacao: 'Hipotensão, choque, trauma grave',
    drogas: [
      { nome: 'Quetamina', dose: '1-1.5 mg/kg', timing: 'Indução' },
      { nome: 'Rocurônio', dose: '1 mg/kg', timing: 'Imediatamente após' }
    ]
  },
  {
    nome: 'IOT - Contraindicação à Succinilcolina',
    indicacao: 'Hipercalemia, queimadura, trauma raquimedular',
    drogas: [
      { nome: 'Fentanil', dose: '2 mcg/kg', timing: '3-5 min antes' },
      { nome: 'Etomidato', dose: '0.3 mg/kg', timing: 'Indução' },
      { nome: 'Rocurônio', dose: '1.2 mg/kg', timing: 'Imediatamente após' }
    ]
  },
  {
    nome: 'IOT - Broncoespasmo / Asma',
    indicacao: 'Paciente com broncoespasmo ativo',
    drogas: [
      { nome: 'Quetamina', dose: '1.5 mg/kg', timing: 'Indução' },
      { nome: 'Rocurônio', dose: '1 mg/kg', timing: 'Imediatamente após' }
    ]
  }
];

// Planejamento IOT - Planos A B C D
const planosIOT = [
  {
    plano: 'A',
    nome: 'Laringoscopia Direta',
    descricao: 'Primeira tentativa de IOT com laringoscopia direta',
    passos: ['Posicionamento adequado', 'Pré-oxigenação', 'Laringoscopia', 'Intubação orotraqueal'],
    limitacao: 'Máximo 3 tentativas'
  },
  {
    plano: 'B',
    nome: 'Máscara Laríngea ou Videolaringoscopia',
    descricao: 'Alternativa após falha do Plano A',
    passos: ['Ventilação com máscara laríngea', 'Ou videolaringoscopia', 'Considerar intubação através da ML'],
    limitacao: 'Se falhar, seguir para Plano C'
  },
  {
    plano: 'C',
    nome: 'Impossível Intubar, Impossível Ventilar',
    descricao: 'Emergência de via aérea - acesso cirúrgico',
    passos: ['Chamar ajuda imediata', 'Cricotireoidostomia ou traqueostomia', 'Material preparado com antecedência'],
    limitacao: 'Executar rapidamente'
  },
  {
    plano: 'D',
    nome: 'Despertar o Paciente',
    descricao: 'Opção se situação não urgente e falha do Plano A/B',
    passos: ['Reverter sedação se possível', 'Ventilação não-invasiva', 'Reavaliar estratégia'],
    limitacao: 'Não aplicável em parada ou via aérea definitiva urgente'
  }
];

// Avaliação de Via Aérea
const avaliacaoViaAerea = {
  mallampati: [
    { classe: 'I', descricao: 'Visível: pilares amigdalianos, palato mole e úvula completos', risco: 'Baixo' },
    { classe: 'II', descricao: 'Visível: palato mole e úvula parcial', risco: 'Baixo-Moderado' },
    { classe: 'III', descricao: 'Visível: apenas palato mole', risco: 'Moderado-Alto' },
    { classe: 'IV', descricao: 'Visível: apenas palato duro', risco: 'Alto' }
  ],
  lemon: [
    { sigla: 'L', nome: 'Look externally', descricao: 'Aparência externa (obesidade, barba, trauma facial, sangue)', avaliacao: 'Inspeção visual' },
    { sigla: 'E', nome: 'Evaluate 3-3-2', descricao: '3 dedos abertura bucal, 3 dedos hiomento, 2 dedos tireomentual', avaliacao: 'Medidas anatômicas' },
    { sigla: 'M', nome: 'Mallampati', descricao: 'Classificação de Mallampati', avaliacao: 'Classes I-IV' },
    { sigla: 'O', nome: 'Obstruction', descricao: 'Obstrução (tumor, edema, epiglotite, sangue)', avaliacao: 'Presença de obstrução' },
    { sigla: 'N', nome: 'Neck mobility', descricao: 'Mobilidade cervical (flexão/extensão)', avaliacao: 'Amplitude de movimento' }
  ],
  obese: [
    { sigla: 'O', nome: 'Obese', descricao: 'IMC > 30 kg/m²', risco: 'Dificulta posicionamento e visualização' },
    { sigla: 'B', nome: 'Beard', descricao: 'Presença de barba', risco: 'Dificulta selamento da máscara' },
    { sigla: 'E', nome: 'Edentulous', descricao: 'Edêntulo (sem dentes)', risco: 'Dificulta vedação e suporte de tecidos' },
    { sigla: 'S', nome: 'Sleep apnea', descricao: 'Apneia do sono ou ronco', risco: 'Via aérea potencialmente difícil' },
    { sigla: 'E', nome: 'Elderly', descricao: 'Idade > 55 anos', risco: 'Menor reserva funcional e comorbidades' }
  ]
};

// Checklist pré-IOT
const checklistItems = [
  { id: 'via_aerea', label: 'Avaliação de via aérea (Mallampati, abertura bucal, mobilidade cervical)' },
  { id: 'oxigenacao', label: 'Pré-oxigenação (O₂ 100% por 3-5 min ou 8 CV vitais)' },
  { id: 'monitorizacao', label: 'Monitorização (ECG, PA, SpO₂, Capnografia)' },
  { id: 'acesso', label: 'Acesso venoso calibroso e funcionante' },
  { id: 'materiais', label: 'Materiais: laringoscópio, tubos, guia, aspiração' },
  { id: 'plano_b', label: 'Plano alternativo (máscara laríngea, cricotireoidostomia)' },
  { id: 'drogas', label: 'Drogas preparadas e doses checadas' },
  { id: 'equipe', label: 'Equipe briefada e papéis definidos' }
];

// Parâmetros ventilatórios
const parametrosVM = [
  {
    nome: 'Volume Corrente (VC)',
    sigla: 'Vt',
    definicao: 'Volume de ar fornecido em cada ciclo respiratório',
    unidade: 'ml ou ml/kg',
    referencia: '6-8 ml/kg peso predito',
    aumentar: 'Maior ventilação alveolar, risco de barotrauma',
    diminuir: 'Menor ventilação, hipercapnia, proteção pulmonar'
  },
  {
    nome: 'Frequência Respiratória (FR)',
    sigla: 'f ou RR',
    definicao: 'Número de ciclos respiratórios por minuto',
    unidade: 'irpm (incursões por minuto)',
    referencia: '12-20 irpm (adultos)',
    aumentar: 'Maior ventilação minuto, alcalose respiratória, auto-PEEP',
    diminuir: 'Menor ventilação, acidose respiratória'
  },
  {
    nome: 'PEEP',
    sigla: 'PEEP',
    definicao: 'Pressão positiva ao final da expiração',
    unidade: 'cmH₂O',
    referencia: '5-10 cmH₂O (inicial)',
    aumentar: 'Recrutamento alveolar, melhora oxigenação, risco de barotrauma',
    diminuir: 'Menor pressão intratorácica, risco de colapso alveolar'
  },
  {
    nome: 'FiO₂',
    sigla: 'FiO₂',
    definicao: 'Fração inspirada de oxigênio',
    unidade: '% (0.21 a 1.0)',
    referencia: 'Iniciar 100%, titular para SpO₂ ≥ 92%',
    aumentar: 'Melhora oxigenação, risco de toxicidade em exposição prolongada',
    diminuir: 'Reduz risco de toxicidade, pode piorar oxigenação'
  },
  {
    nome: 'Pressão de Pico (Ppico)',
    sigla: 'Ppico',
    definicao: 'Pressão máxima durante inspiração (via aérea + resistência)',
    unidade: 'cmH₂O',
    referencia: '< 35 cmH₂O',
    aumentar: 'Indica resistência ou baixa complacência',
    diminuir: 'Reduz risco de barotrauma'
  },
  {
    nome: 'Pressão de Platô (Pplatô)',
    sigla: 'Pplatô',
    definicao: 'Pressão alveolar em pausa inspiratória (complacência)',
    unidade: 'cmH₂O',
    referencia: '< 30 cmH₂O (ventilação protetora)',
    aumentar: 'Risco de barotrauma e volutrauma',
    diminuir: 'Proteção pulmonar'
  }
];

// Modos ventilatórios
const modosVM = [
  {
    nome: 'Volume Controlado (VCV)',
    sigla: 'A/C-VC, CMV',
    como_funciona: 'O ventilador entrega um volume fixo pré-determinado. A pressão varia conforme a complacência pulmonar.',
    vantagens: 'Garante volume minuto constante, fácil de titular PaCO₂',
    desvantagens: 'Risco de pressões elevadas se complacência baixa',
    uso_comum: 'Pacientes sedados, bloqueados, pós-IOT imediato'
  },
  {
    nome: 'Pressão Controlada (PCV)',
    sigla: 'A/C-PC',
    como_funciona: 'O ventilador entrega uma pressão fixa. O volume varia conforme a complacência pulmonar.',
    vantagens: 'Limita pressão, proteção contra barotrauma',
    desvantagens: 'Volume não garantido, pode hipoventilação se complacência cai',
    uso_comum: 'SDRA, baixa complacência, risco de barotrauma'
  },
  {
    nome: 'Pressão de Suporte (PSV)',
    sigla: 'PSV',
    como_funciona: 'Modo espontâneo. Paciente dispara o ciclo, ventilador auxilia com pressão pré-definida.',
    vantagens: 'Permite espontaneidade, conforto, desmame progressivo',
    desvantagens: 'Requer drive respiratório do paciente',
    uso_comum: 'Desmame ventilatório, pacientes conscientes'
  }
];

// Alarmes e segurança
const alarmesVM = [
  {
    alarme: 'Pressão Alta',
    possiveis_causas: 'Tosse, broncoespasmo, rolha de secreção, pneumotórax, mordida do tubo, desadaptação',
    acao_educacional: 'Avaliar paciente, aspirar, checar posição do tubo, sedar se necessário'
  },
  {
    alarme: 'Volume Baixo',
    possiveis_causas: 'Desconexão, vazamento no circuito, fístula broncopleural, extubação acidental',
    acao_educacional: 'Checar circuito, conexões, cuff, posição do tubo'
  },
  {
    alarme: 'Apneia',
    possiveis_causas: 'Sedação excessiva, bloqueio neuromuscular, lesão neurológica central',
    acao_educacional: 'Avaliar nível de sedação, gasometria, exame neurológico'
  },
  {
    alarme: 'SpO₂ Baixa',
    possiveis_causas: 'Hipoxemia, desconexão, deslocamento do tubo, pneumotórax, atelectasia, broncoespasmo',
    acao_educacional: 'Aumentar FiO₂, checar tubo, auscultar, considerar RX tórax'
  },
  {
    alarme: 'Auto-PEEP',
    possiveis_causas: 'Tempo expiratório curto, broncoespasmo, FR muito alta',
    acao_educacional: 'Reduzir FR, aumentar tempo expiratório, tratar broncoespasmo'
  }
];

// Conceitos importantes
const conceitosVM = [
  {
    titulo: 'Ventilação Protetora',
    descricao: 'Estratégia com VC baixo (6ml/kg peso predito) e Pplatô < 30 cmH₂O para reduzir lesão pulmonar.',
    indicacao: 'SDRA, lesão pulmonar aguda'
  },
  {
    titulo: 'Driving Pressure',
    descricao: 'Diferença entre Pplatô e PEEP. Preditor de mortalidade em SDRA.',
    referencia: 'Manter < 15 cmH₂O'
  },
  {
    titulo: 'Complacência Pulmonar',
    descricao: 'Capacidade do pulmão de se expandir. Calculada por VC / (Pplatô - PEEP).',
    obs: 'Baixa complacência = pulmão rígido'
  },
  {
    titulo: 'Titulação de PEEP',
    descricao: 'Ajuste progressivo para otimizar oxigenação sem causar hiperinsuflação.',
    metodo: 'Método ARDSNet, tabela PEEP/FiO₂'
  },
  {
    titulo: 'Hipercapnia Permissiva',
    descricao: 'Aceitar PaCO₂ mais alta para permitir ventilação protetora.',
    limite: 'pH > 7.20 geralmente tolerável'
  }
];

export default function PlantonistaIOT() {
  const [activeTab, setActiveTab] = useState('calculadora');
  
  // Calculadora
  const [peso, setPeso] = useState('');
  const [tipoPeso, setTipoPeso] = useState('real');
  const [drogaSelecionada, setDrogaSelecionada] = useState('etomidato');
  const [doseEditada, setDoseEditada] = useState('');
  
  // Checklist
  const [checklist, setChecklist] = useState({});

  // Calcular dose
  const resultadoCalculo = useMemo(() => {
    if (!peso || !drogaSelecionada) return null;
    
    const p = parseFloat(peso);
    if (isNaN(p) || p <= 0 || p > 300) return null;
    
    const droga = drogasIOT[drogaSelecionada];
    const doseMin = (p * droga.dose_min).toFixed(1);
    const doseMax = (p * droga.dose_max).toFixed(1);
    const doseHabitual = (p * droga.dose_habitual).toFixed(1);
    
    return { droga, doseMin, doseMax, doseHabitual, peso: p };
  }, [peso, drogaSelecionada]);



  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 border border-slate-200/50 p-1 grid grid-cols-6 w-full">
        <TabsTrigger value="calculadora" className="text-xs gap-1 data-[state=active]:bg-slate-100">
          <Calculator className="w-3.5 h-3.5" />
          Calculadora
        </TabsTrigger>
        <TabsTrigger value="sequencias" className="text-xs gap-1 data-[state=active]:bg-slate-100">
          <Table className="w-3.5 h-3.5" />
          Sequências
        </TabsTrigger>
        <TabsTrigger value="planos" className="text-xs gap-1 data-[state=active]:bg-amber-100">
          <AlertTriangle className="w-3.5 h-3.5" />
          Planos
        </TabsTrigger>
        <TabsTrigger value="avaliacao" className="text-xs gap-1 data-[state=active]:bg-purple-100">
          <Info className="w-3.5 h-3.5" />
          Via Aérea
        </TabsTrigger>
        <TabsTrigger value="vm" className="text-xs gap-1 data-[state=active]:bg-blue-100">
          <Activity className="w-3.5 h-3.5" />
          VM
        </TabsTrigger>
        <TabsTrigger value="checklist" className="text-xs gap-1 data-[state=active]:bg-slate-100">
          <ClipboardCheck className="w-3.5 h-3.5" />
          Checklist
        </TabsTrigger>
        </TabsList>

        {/* CALCULADORA DE DOSE */}
        <TabsContent value="calculadora" className="mt-3 space-y-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              {/* Peso */}
              <div>
                <Label className="text-xs text-slate-600 mb-1.5 block">Peso do paciente (kg)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Ex: 70"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <RadioGroup value={tipoPeso} onValueChange={setTipoPeso} className="flex gap-3">
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="real" id="real" />
                      <Label htmlFor="real" className="text-xs cursor-pointer">Real</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="ideal" id="ideal" />
                      <Label htmlFor="ideal" className="text-xs cursor-pointer">Ideal</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="estimado" id="estimado" />
                      <Label htmlFor="estimado" className="text-xs cursor-pointer">Estimado</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Droga */}
              <div>
                <Label className="text-xs text-slate-600 mb-1.5 block">Droga</Label>
                <Select value={drogaSelecionada} onValueChange={setDrogaSelecionada}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(drogasIOT).map(([key, droga]) => (
                      <SelectItem key={key} value={key}>
                        {droga.nome} ({droga.categoria})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resultado */}
              {resultadoCalculo && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      {resultadoCalculo.droga.nome}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {resultadoCalculo.peso} kg ({tipoPeso})
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <p className="text-[9px] text-slate-500 mb-0.5">Mínima</p>
                      <p className="text-sm font-bold text-slate-700">
                        {resultadoCalculo.doseMin}
                      </p>
                      <p className="text-[8px] text-slate-400">
                        {resultadoCalculo.droga.unidade}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded border border-blue-300">
                      <p className="text-[9px] text-blue-700 mb-0.5">Habitual</p>
                      <p className="text-sm font-bold text-blue-800">
                        {resultadoCalculo.doseHabitual}
                      </p>
                      <p className="text-[8px] text-blue-600">
                        {resultadoCalculo.droga.unidade}
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <p className="text-[9px] text-slate-500 mb-0.5">Máxima</p>
                      <p className="text-sm font-bold text-slate-700">
                        {resultadoCalculo.doseMax}
                      </p>
                      <p className="text-[8px] text-slate-400">
                        {resultadoCalculo.droga.unidade}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 space-y-1">
                    <p><strong>Apresentação:</strong> {resultadoCalculo.droga.apresentacao}</p>
                    <p><strong>Observação:</strong> {resultadoCalculo.droga.obs}</p>
                  </div>

                  {/* Dose editável */}
                  <div className="pt-2 border-t border-blue-200">
                    <Label className="text-[10px] text-slate-600 mb-1 block">Ajustar dose manualmente (opcional)</Label>
                    <Input
                      type="text"
                      placeholder={`Ex: ${resultadoCalculo.doseHabitual} ${resultadoCalculo.droga.unidade.split('/')[0]}`}
                      value={doseEditada}
                      onChange={(e) => setDoseEditada(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLANEJAMENTO - PLANOS A B C D */}
        <TabsContent value="planos" className="mt-3 space-y-3">
          <Card className="bg-amber-50/80 backdrop-blur-sm border border-amber-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-amber-800">
                  <p className="font-medium">Planejamento obrigatório antes de qualquer IOT</p>
                  <p className="mt-0.5">Sempre tenha os planos A, B, C, D definidos. Via aérea difícil = múltiplas estratégias.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {planosIOT.map((plano, idx) => (
            <Card key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{plano.plano}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-slate-800">{plano.nome}</h3>
                    <p className="text-[10px] text-slate-500">{plano.descricao}</p>
                  </div>
                </div>

                <div className="pl-10 space-y-1">
                  <p className="text-[10px] font-medium text-slate-600">Passos:</p>
                  {plano.passos.map((passo, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[10px] text-slate-400">{i + 1}.</span>
                      <p className="text-[10px] text-slate-600">{passo}</p>
                    </div>
                  ))}
                </div>

                <div className="pl-10 pt-2 border-t border-slate-200">
                  <Badge variant="outline" className="text-[9px]">
                    {plano.limitacao}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AVALIAÇÃO DE VIA AÉREA */}
        <TabsContent value="avaliacao" className="mt-3 space-y-3">
          {/* Mallampati */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-600" />
                Classificação de Mallampati
              </h3>
              <p className="text-[10px] text-slate-600">Avaliação com paciente sentado, boca aberta, língua para fora, sem fonação</p>
              
              <div className="space-y-2">
                {avaliacaoViaAerea.mallampati.map((item, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-purple-800">Classe {item.classe}</h4>
                      <Badge className={`text-[9px] ${
                        item.risco === 'Baixo' ? 'bg-green-500' : 
                        item.risco === 'Baixo-Moderado' ? 'bg-yellow-500' :
                        item.risco === 'Moderado-Alto' ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {item.risco}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-600">{item.descricao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LEMON */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                LEMON Score
              </h3>
              <p className="text-[10px] text-slate-600">Mnemônico para avaliação sistemática de via aérea difícil</p>
              
              <div className="space-y-2">
                {avaliacaoViaAerea.lemon.map((item, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">{item.sigla}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800">{item.nome}</h4>
                    </div>
                    <p className="text-[10px] text-slate-600 mb-1">{item.descricao}</p>
                    <p className="text-[9px] text-blue-700 font-medium">Avaliação: {item.avaliacao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* OBESE */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-600" />
                OBESE Score
              </h3>
              <p className="text-[10px] text-slate-600">Avaliação específica para ventilação com máscara difícil</p>
              
              <div className="space-y-2">
                {avaliacaoViaAerea.obese.map((item, idx) => (
                  <div key={idx} className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-rose-500 flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">{item.sigla}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800">{item.nome}</h4>
                    </div>
                    <p className="text-[10px] text-slate-600 mb-1">{item.descricao}</p>
                    <p className="text-[9px] text-rose-700 font-medium">{item.risco}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEQUÊNCIAS COMUNS */}
        <TabsContent value="sequencias" className="mt-3 space-y-3">
          {sequenciasComuns.map((seq, idx) => (
            <Card key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-3 space-y-2">
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">{seq.nome}</h3>
                  <p className="text-[10px] text-slate-500">{seq.indicacao}</p>
                </div>
                <div className="space-y-1.5">
                  {seq.drogas.map((droga, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                      <div>
                        <p className="text-xs font-medium text-slate-700">{droga.nome}</p>
                        <p className="text-[9px] text-slate-500">{droga.timing}</p>
                      </div>
                      <Badge className="text-[9px]">{droga.dose}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>



        {/* VENTILAÇÃO MECÂNICA */}
        <TabsContent value="vm" className="mt-3 space-y-3">
          {/* Parâmetros Básicos */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Parâmetros Básicos
              </h3>
              
              <div className="space-y-2">
                {parametrosVM.map((param, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-slate-800">{param.nome}</h4>
                      <Badge variant="outline" className="text-[9px]">{param.sigla}</Badge>
                    </div>
                    <p className="text-[10px] text-slate-600 mb-2">{param.definicao}</p>
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      <div>
                        <p className="text-slate-500">Referência:</p>
                        <p className="font-medium text-slate-700">{param.referencia}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Unidade:</p>
                        <p className="font-medium text-slate-700">{param.unidade}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                      <p className="text-[9px]">
                        <span className="text-green-700">↑ Aumentar:</span> <span className="text-slate-600">{param.aumentar}</span>
                      </p>
                      <p className="text-[9px]">
                        <span className="text-red-700">↓ Diminuir:</span> <span className="text-slate-600">{param.diminuir}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Modos Ventilatórios */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-600" />
                Modos Ventilatórios
              </h3>
              
              <div className="space-y-2">
                {modosVM.map((modo, idx) => (
                  <div key={idx} className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-slate-800">{modo.nome}</h4>
                      <Badge className="text-[9px] bg-cyan-600">{modo.sigla}</Badge>
                    </div>
                    <p className="text-[10px] text-slate-600 mb-2">{modo.como_funciona}</p>
                    <div className="space-y-1 text-[9px]">
                      <p><span className="text-green-700 font-medium">✓ Vantagens:</span> {modo.vantagens}</p>
                      <p><span className="text-amber-700 font-medium">⚠ Desvantagens:</span> {modo.desvantagens}</p>
                      <p><span className="text-slate-600 font-medium">Uso comum:</span> {modo.uso_comum}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alarmes e Segurança */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Alarmes e Segurança
              </h3>
              
              <div className="space-y-2">
                {alarmesVM.map((alarme, idx) => (
                  <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="text-xs font-semibold text-red-800 mb-1">{alarme.alarme}</h4>
                    <div className="space-y-1 text-[10px]">
                      <p className="text-slate-600">
                        <span className="font-medium">Possíveis causas:</span> {alarme.possiveis_causas}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">Abordagem:</span> {alarme.acao_educacional}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conceitos Importantes */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-600" />
                Conceitos Importantes
              </h3>
              
              <div className="space-y-2">
                {conceitosVM.map((conceito, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-xs font-semibold text-purple-800 mb-1">{conceito.titulo}</h4>
                    <p className="text-[10px] text-slate-600 mb-1">{conceito.descricao}</p>
                    {conceito.indicacao && (
                      <p className="text-[9px] text-slate-500">
                        <span className="font-medium">Indicação:</span> {conceito.indicacao}
                      </p>
                    )}
                    {conceito.referencia && (
                      <p className="text-[9px] text-purple-700 font-medium">
                        Referência: {conceito.referencia}
                      </p>
                    )}
                    {conceito.obs && (
                      <p className="text-[9px] text-slate-500">
                        <span className="font-medium">Obs:</span> {conceito.obs}
                      </p>
                    )}
                    {conceito.metodo && (
                      <p className="text-[9px] text-slate-500">
                        <span className="font-medium">Método:</span> {conceito.metodo}
                      </p>
                    )}
                    {conceito.limite && (
                      <p className="text-[9px] text-slate-500">
                        <span className="font-medium">Limite:</span> {conceito.limite}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHECKLIST PRÉ-IOT */}
        <TabsContent value="checklist" className="mt-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-800">Checklist Pré-Intubação</h3>
                <Badge variant="outline" className="text-[9px]">
                  {Object.values(checklist).filter(Boolean).length}/{checklistItems.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 p-2 rounded bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Checkbox
                      id={item.id}
                      checked={checklist[item.id] || false}
                      onCheckedChange={(checked) => setChecklist({ ...checklist, [item.id]: checked })}
                    />
                    <Label htmlFor={item.id} className="text-xs text-slate-700 cursor-pointer leading-tight">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>

              {Object.values(checklist).filter(Boolean).length === checklistItems.length && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
                  <p className="text-xs font-semibold text-green-700">✓ Checklist completo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DisclaimerFooter variant="calculadora" />
    </div>
  );
}
import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import {
  Baby,
  Calculator,
  Ruler,
  Weight,
  Droplets,
  Pill,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Search,
  Heart,
  Brain,
  Loader2,
  TrendingUp,
  Clock,
  Syringe,
  FileText,
  Calendar
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';
import CalendarioVacinal from '../components/pediatria/CalendarioVacinal';

// Medicações pediátricas comuns com dosagens
const pediatricMedications = [
  { name: 'Dipirona', concentration: '500mg/ml', dose: '10-15', unit: 'mg/kg', maxDose: '1g', frequency: '6/6h', route: 'VO/IV', category: 'analgésico', contraindications: ['< 3 meses', 'alergia a pirazolônicos'] },
  { name: 'Paracetamol', concentration: '200mg/ml', dose: '10-15', unit: 'mg/kg', maxDose: '750mg', frequency: '6/6h', route: 'VO', category: 'analgésico', contraindications: ['hepatopatia grave'] },
  { name: 'Ibuprofeno', concentration: '50mg/ml', dose: '5-10', unit: 'mg/kg', maxDose: '400mg', frequency: '8/8h', route: 'VO', category: 'AINE', contraindications: ['< 6 meses', 'nefropatia', 'dengue'] },
  { name: 'Amoxicilina', concentration: '250mg/5ml', dose: '40-90', unit: 'mg/kg/dia', maxDose: '3g/dia', frequency: '8/8h', route: 'VO', category: 'antibiótico', contraindications: ['alergia a penicilinas'] },
  { name: 'Amoxicilina + Clavulanato', concentration: '400mg/5ml', dose: '45-90', unit: 'mg/kg/dia', maxDose: '3g/dia', frequency: '12/12h', route: 'VO', category: 'antibiótico', contraindications: ['alergia a penicilinas', 'icterícia prévia'] },
  { name: 'Azitromicina', concentration: '200mg/5ml', dose: '10', unit: 'mg/kg', maxDose: '500mg', frequency: '1x/dia', route: 'VO', category: 'antibiótico', contraindications: ['alergia a macrolídeos'] },
  { name: 'Cefalexina', concentration: '250mg/5ml', dose: '25-50', unit: 'mg/kg/dia', maxDose: '4g/dia', frequency: '6/6h', route: 'VO', category: 'antibiótico', contraindications: ['alergia a cefalosporinas'] },
  { name: 'Ceftriaxona', concentration: '1g', dose: '50-100', unit: 'mg/kg/dia', maxDose: '4g/dia', frequency: '12/12h', route: 'IV/IM', category: 'antibiótico', contraindications: ['< 28 dias', 'hiperbilirrubinemia'] },
  { name: 'Prednisolona', concentration: '3mg/ml', dose: '1-2', unit: 'mg/kg', maxDose: '60mg', frequency: '1x/dia', route: 'VO', category: 'corticoide', contraindications: ['varicela ativa', 'TB'] },
  { name: 'Dexametasona', concentration: '4mg/ml', dose: '0.15-0.6', unit: 'mg/kg', maxDose: '10mg', frequency: '1x/dia', route: 'IV/IM/VO', category: 'corticoide', contraindications: ['infecção fúngica sistêmica'] },
  { name: 'Salbutamol', concentration: '5mg/ml', dose: '0.1-0.15', unit: 'mg/kg', maxDose: '5mg', frequency: 'SOS', route: 'NBZ', category: 'broncodilatador', contraindications: ['arritmia'] },
  { name: 'Ondansetrona', concentration: '4mg/2ml', dose: '0.1-0.15', unit: 'mg/kg', maxDose: '8mg', frequency: '8/8h', route: 'IV/VO', category: 'antiemético', contraindications: ['QT longo'] },
  { name: 'Metoclopramida', concentration: '5mg/ml', dose: '0.1-0.15', unit: 'mg/kg', maxDose: '10mg', frequency: '8/8h', route: 'IV/VO', category: 'antiemético', contraindications: ['< 1 ano', 'obstrução intestinal'] },
  { name: 'Omeprazol', concentration: '20mg', dose: '0.7-1', unit: 'mg/kg', maxDose: '40mg', frequency: '1x/dia', route: 'VO', category: 'IBP', contraindications: [] },
  { name: 'Ranitidina', concentration: '15mg/ml', dose: '2-4', unit: 'mg/kg/dia', maxDose: '300mg/dia', frequency: '12/12h', route: 'VO/IV', category: 'bloqueador H2', contraindications: [] },
  { name: 'Hidrocortisona', concentration: '100mg', dose: '1-5', unit: 'mg/kg', maxDose: '100mg', frequency: '6/6h', route: 'IV', category: 'corticoide', contraindications: ['infecção fúngica'] },
  { name: 'Adrenalina', concentration: '1mg/ml', dose: '0.01', unit: 'mg/kg', maxDose: '0.5mg', frequency: 'SOS', route: 'IM/IV', category: 'emergência', contraindications: [] },
  { name: 'Atropina', concentration: '0.25mg/ml', dose: '0.02', unit: 'mg/kg', maxDose: '0.5mg', frequency: 'SOS', route: 'IV', category: 'emergência', contraindications: ['glaucoma'] },
  { name: 'Diazepam', concentration: '5mg/ml', dose: '0.2-0.5', unit: 'mg/kg', maxDose: '10mg', frequency: 'SOS', route: 'IV/Retal', category: 'anticonvulsivante', contraindications: ['depressão respiratória'] },
  { name: 'Fenobarbital', concentration: '100mg/ml', dose: '15-20', unit: 'mg/kg', maxDose: '1g', frequency: 'ataque', route: 'IV', category: 'anticonvulsivante', contraindications: ['porfiria'] }
];

// Protocolos PALS
const palsProtocols = {
  pcr: {
    title: 'PCR Pediátrica',
    steps: [
      { step: 1, action: 'Verificar responsividade e respiração', time: '10s' },
      { step: 2, action: 'Chamar ajuda e pedir DEA', time: '' },
      { step: 3, action: 'Iniciar RCP: 30:2 (1 socorrista) ou 15:2 (2 socorristas)', time: '' },
      { step: 4, action: 'Compressões: 100-120/min, 1/3 do diâmetro AP', time: '' },
      { step: 5, action: 'Aplicar DEA quando disponível', time: '' }
    ],
    medications: [
      { drug: 'Adrenalina', dose: '0.01 mg/kg (0.1 ml/kg da 1:10.000)', timing: 'A cada 3-5 min' },
      { drug: 'Amiodarona', dose: '5 mg/kg', timing: 'FV/TV refratária (máx 3 doses)' },
      { drug: 'Lidocaína', dose: '1 mg/kg', timing: 'Alternativa à amiodarona' }
    ]
  },
  bradicardia: {
    title: 'Bradicardia Sintomática',
    steps: [
      { step: 1, action: 'Manter vias aéreas, O2, monitorização', time: '' },
      { step: 2, action: 'Se FC < 60 com má perfusão: iniciar RCP', time: '' },
      { step: 3, action: 'Identificar e tratar causa (hipóxia é a mais comum)', time: '' }
    ],
    medications: [
      { drug: 'Adrenalina', dose: '0.01 mg/kg IV/IO', timing: 'Se não responder a ventilação' },
      { drug: 'Atropina', dose: '0.02 mg/kg (mín 0.1mg, máx 0.5mg)', timing: 'Se causa vagal' }
    ]
  },
  taquicardia: {
    title: 'Taquicardia com Pulso',
    steps: [
      { step: 1, action: 'Avaliar QRS: estreito (<0.09s) ou largo (>0.09s)', time: '' },
      { step: 2, action: 'TSV: manobras vagais (gelo na face em lactentes)', time: '' },
      { step: 3, action: 'Se instável: cardioversão sincronizada 0.5-1 J/kg', time: '' }
    ],
    medications: [
      { drug: 'Adenosina', dose: '0.1 mg/kg (máx 6mg), depois 0.2 mg/kg (máx 12mg)', timing: 'TSV estável' },
      { drug: 'Amiodarona', dose: '5 mg/kg em 20-60 min', timing: 'TV estável com pulso' }
    ]
  },
  choque: {
    title: 'Choque Pediátrico',
    steps: [
      { step: 1, action: 'O2, monitorização, acesso venoso/IO', time: '' },
      { step: 2, action: 'Bolus SF 0.9% 20 ml/kg em 5-10 min', time: '' },
      { step: 3, action: 'Reavaliar após cada bolus (até 60 ml/kg)', time: '' },
      { step: 4, action: 'Se refratário: iniciar vasopressor', time: '' }
    ],
    medications: [
      { drug: 'Cristaloide', dose: '20 ml/kg bolus', timing: 'Repetir até 3x' },
      { drug: 'Adrenalina', dose: '0.1-1 mcg/kg/min', timing: 'Choque frio' },
      { drug: 'Noradrenalina', dose: '0.1-2 mcg/kg/min', timing: 'Choque quente' },
      { drug: 'Dopamina', dose: '5-20 mcg/kg/min', timing: 'Alternativa' }
    ]
  }
};

// Marcos do desenvolvimento
const developmentMilestones = {
  '1-2 meses': { motor: 'Levanta a cabeça brevemente', social: 'Sorriso social', linguagem: 'Vocaliza sons', alerta: 'Não fixa olhar' },
  '3-4 meses': { motor: 'Sustenta cabeça, rola', social: 'Ri alto', linguagem: 'Balbucia', alerta: 'Não segue objetos' },
  '5-6 meses': { motor: 'Senta com apoio, transfere objetos', social: 'Reconhece estranhos', linguagem: 'Sílabas', alerta: 'Não vira para sons' },
  '7-9 meses': { motor: 'Senta sem apoio, engatinha', social: 'Ansiedade com estranhos', linguagem: 'Mama, papa', alerta: 'Não senta' },
  '10-12 meses': { motor: 'Fica em pé, anda com apoio', social: 'Dá tchau', linguagem: '1-3 palavras', alerta: 'Não balbucia' },
  '12-15 meses': { motor: 'Anda sozinho', social: 'Aponta', linguagem: '4-6 palavras', alerta: 'Não anda' },
  '18 meses': { motor: 'Corre, sobe escadas', social: 'Brinca paralelo', linguagem: '10-25 palavras', alerta: 'Não fala palavras' },
  '2 anos': { motor: 'Chuta bola, sobe/desce escadas', social: 'Brinca de faz-de-conta', linguagem: 'Frases de 2 palavras, 50+ palavras', alerta: 'Não combina palavras' },
  '3 anos': { motor: 'Pedala triciclo, pula', social: 'Brinca com outros', linguagem: 'Frases completas', alerta: 'Fala ininteligível' },
  '4 anos': { motor: 'Pula num pé só', social: 'Amigos imaginários', linguagem: 'Conta histórias', alerta: 'Não forma frases' },
  '5 anos': { motor: 'Pega bola, equilibra', social: 'Joga com regras', linguagem: 'Gramática correta', alerta: 'Dificuldade motora' }
};

// Parâmetros vitais por idade
const vitalSignsByAge = {
  'RN (0-28d)': { fc: '120-160', fr: '40-60', pas: '60-90', pad: '30-60' },
  'Lactente (1-12m)': { fc: '100-150', fr: '30-40', pas: '80-100', pad: '50-70' },
  '1-3 anos': { fc: '90-130', fr: '24-30', pas: '90-105', pad: '55-70' },
  '4-5 anos': { fc: '80-120', fr: '20-24', pas: '95-110', pad: '60-75' },
  '6-12 anos': { fc: '70-110', fr: '16-22', pas: '100-120', pad: '60-75' },
  '> 12 anos': { fc: '60-100', fr: '12-20', pas: '110-135', pad: '65-85' }
};

export default function Pediatria() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('calculadora');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState('anos');
  const [height, setHeight] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [calculatedDose, setCalculatedDose] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [renalFunction, setRenalFunction] = useState('normal');
  const [comorbidities, setComorbidities] = useState([]);
  
  // Estados para calculadora educacional
  const [selectedMedication, setSelectedMedication] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childAgeUnit, setChildAgeUnit] = useState('anos');
  const [calcWeight, setCalcWeight] = useState('');
  const [doseParam, setDoseParam] = useState('');
  const [concentration, setConcentration] = useState('');
  const [calcResult, setCalcResult] = useState(null);

  const medicationsList = [
    { 
      name: 'Paracetamol',
      routes: ['Oral', 'Intravenosa', 'Retal'],
      ageRestrictions: {
        'Oral': { minMonths: 3, text: 'O uso por via oral é descrito na literatura para crianças acima de 3 meses de idade.' },
        'Intravenosa': { minMonths: 3, text: 'O uso por via intravenosa é descrito na literatura para crianças acima de 3 meses de idade.' },
        'Retal': { minMonths: 6, text: 'O uso por via retal é descrito na literatura para crianças acima de 6 meses de idade.' }
      }
    },
    { 
      name: 'Dipirona',
      routes: ['Oral', 'Intravenosa', 'Intramuscular'],
      ageRestrictions: {
        'Oral': { minMonths: 3, text: 'O uso por via oral é descrito na literatura para crianças acima de 3 meses de idade.' },
        'Intravenosa': { minMonths: 3, text: 'O uso por via intravenosa é descrito na literatura para crianças acima de 3 meses de idade.' },
        'Intramuscular': { minMonths: 3, text: 'O uso por via intramuscular é descrito na literatura para crianças acima de 3 meses de idade.' }
      }
    },
    { 
      name: 'Ibuprofeno',
      routes: ['Oral'],
      ageRestrictions: {
        'Oral': { minMonths: 6, text: 'O uso por via oral é descrito na literatura para crianças acima de 6 meses de idade.' }
      }
    },
    { 
      name: 'Amoxicilina',
      routes: ['Oral'],
      ageRestrictions: {
        'Oral': { minMonths: 0, text: 'O uso por via oral é descrito na literatura para todas as faixas etárias pediátricas.' }
      }
    },
    { 
      name: 'Cefalexina',
      routes: ['Oral'],
      ageRestrictions: {
        'Oral': { minMonths: 0, text: 'O uso por via oral é descrito na literatura para todas as faixas etárias pediátricas.' }
      }
    },
    { 
      name: 'Azitromicina',
      routes: ['Oral', 'Intravenosa'],
      ageRestrictions: {
        'Oral': { minMonths: 6, text: 'O uso por via oral é descrito na literatura para crianças acima de 6 meses de idade.' },
        'Intravenosa': { minMonths: 6, text: 'O uso por via intravenosa é descrito na literatura para crianças acima de 6 meses de idade.' }
      }
    },
    { 
      name: 'Ceftriaxona',
      routes: ['Intravenosa', 'Intramuscular'],
      ageRestrictions: {
        'Intravenosa': { minMonths: 1, text: 'O uso por via intravenosa é descrito na literatura para crianças acima de 1 mês de idade.' },
        'Intramuscular': { minMonths: 1, text: 'O uso por via intramuscular é descrito na literatura para crianças acima de 1 mês de idade.' }
      }
    },
    { 
      name: 'Prednisolona',
      routes: ['Oral'],
      ageRestrictions: {
        'Oral': { minMonths: 0, text: 'O uso por via oral é descrito na literatura para todas as faixas etárias pediátricas.' }
      }
    }
  ];

  const getAgeInMonths = () => {
    if (!childAge) return null;
    const age = parseFloat(childAge);
    if (childAgeUnit === 'anos') return age * 12;
    return age;
  };

  const getAgeRestrictionInfo = () => {
    if (!selectedMedication || !selectedRoute || !childAge) return null;
    
    const med = medicationsList.find(m => m.name === selectedMedication);
    if (!med) return null;
    
    const ageMonths = getAgeInMonths();
    const restriction = med.ageRestrictions[selectedRoute];
    
    if (!restriction) return null;
    
    return {
      text: restriction.text,
      meetsAge: ageMonths >= restriction.minMonths
    };
  };

  const calculatePediatricDose = () => {
    const peso = parseFloat(calcWeight);
    const param = parseFloat(doseParam);
    const conc = concentration ? parseFloat(concentration) : null;
    
    if (!peso || !param || isNaN(peso) || isNaN(param)) {
      setCalcResult(null);
      return;
    }
    
    const doseMg = peso * param;
    const volumeMl = conc && conc > 0 ? doseMg / conc : null;
    
    setCalcResult({
      medication: selectedMedication,
      route: selectedRoute,
      age: childAge ? `${childAge} ${childAgeUnit}` : null,
      peso,
      param,
      doseMg: doseMg.toFixed(2),
      conc,
      volumeMl: volumeMl ? volumeMl.toFixed(2) : null
    });
  };

  const calculateDose = (med) => {
    if (!weight || isNaN(parseFloat(weight))) return;
    
    const w = parseFloat(weight);
    const doseRange = med.dose.split('-');
    const minDosePerKg = parseFloat(doseRange[0]);
    const maxDosePerKg = doseRange.length > 1 ? parseFloat(doseRange[1]) : minDosePerKg;
    
    let minDose = minDosePerKg * w;
    let maxDose = maxDosePerKg * w;
    
    // Ajuste para DRC
    if (renalFunction === 'leve') {
      minDose *= 0.75;
      maxDose *= 0.75;
    } else if (renalFunction === 'moderada') {
      minDose *= 0.5;
      maxDose *= 0.5;
    } else if (renalFunction === 'grave') {
      minDose *= 0.25;
      maxDose *= 0.25;
    }
    
    const maxAllowed = parseFloat(med.maxDose);
    
    setSelectedMed(med);
    setCalculatedDose({
      min: Math.min(minDose, maxAllowed).toFixed(1),
      max: Math.min(maxDose, maxAllowed).toFixed(1),
      maxAllowed: med.maxDose,
      renalAdjusted: renalFunction !== 'normal'
    });
  };

  const calculateBSA = () => {
    if (!weight || !height) return null;
    const w = parseFloat(weight);
    const h = parseFloat(height);
    return Math.sqrt((w * h) / 3600).toFixed(2);
  };

  const calculateIdealWeight = () => {
    if (!age) return null;
    const a = parseFloat(age);
    if (ageUnit === 'meses') {
      if (a <= 12) return ((a + 9) / 2).toFixed(1);
      return null;
    }
    if (a <= 1) return '10';
    if (a <= 6) return (a * 2 + 8).toFixed(1);
    if (a <= 12) return ((a * 7 - 5) / 2).toFixed(1);
    return null;
  };

  const calculateFluidMaintenance = () => {
    if (!weight) return null;
    const w = parseFloat(weight);
    if (w <= 10) return { total: (w * 100).toFixed(0), rate: ((w * 100) / 24).toFixed(1) };
    if (w <= 20) return { total: (1000 + (w - 10) * 50).toFixed(0), rate: ((1000 + (w - 10) * 50) / 24).toFixed(1) };
    return { total: (1500 + (w - 20) * 20).toFixed(0), rate: ((1500 + (w - 20) * 20) / 24).toFixed(1) };
  };

  const getVitalSigns = () => {
    if (!age) return null;
    const a = parseFloat(age);
    if (ageUnit === 'meses') {
      if (a <= 1) return vitalSignsByAge['RN (0-28d)'];
      return vitalSignsByAge['Lactente (1-12m)'];
    }
    if (a <= 1) return vitalSignsByAge['Lactente (1-12m)'];
    if (a <= 3) return vitalSignsByAge['1-3 anos'];
    if (a <= 5) return vitalSignsByAge['4-5 anos'];
    if (a <= 12) return vitalSignsByAge['6-12 anos'];
    return vitalSignsByAge['> 12 anos'];
  };

  const filteredMedications = pediatricMedications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fluid = calculateFluidMaintenance();
  const vitalSigns = getVitalSigns();
  const bsa = calculateBSA();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <Baby className="w-6 h-6 text-pink-500" />
              Modo Pediatra
            </h1>
            <p className="text-slate-500 mt-1">Calculadora de doses, PALS e desenvolvimento infantil</p>
          </div>

          {/* Patient Data */}
          <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Dados do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-xs">Peso (kg)</Label>
                  <div className="relative mt-1">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      placeholder="Ex: 15"
                      className="pl-10"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Idade</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="Ex: 5"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                    <Select value={ageUnit} onValueChange={setAgeUnit}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anos">Anos</SelectItem>
                        <SelectItem value="meses">Meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Altura (cm)</Label>
                  <div className="relative mt-1">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      placeholder="Ex: 110"
                      className="pl-10"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Função Renal</Label>
                  <Select value={renalFunction} onValueChange={setRenalFunction}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="leve">DRC Leve (TFG 60-89)</SelectItem>
                      <SelectItem value="moderada">DRC Moderada (TFG 30-59)</SelectItem>
                      <SelectItem value="grave">DRC Grave (TFG &lt;30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">SC (m²)</Label>
                  <div className="mt-1 p-2.5 bg-slate-100 rounded-md text-center font-medium">
                    {bsa || '—'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="backdrop-blur-xl bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Weight className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-pink-600 font-medium">Peso Ideal</p>
                    <p className="text-lg font-bold text-pink-700">
                      {calculateIdealWeight() ? `${calculateIdealWeight()} kg` : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Hidratação</p>
                    <p className="text-lg font-bold text-blue-700">
                      {fluid ? `${fluid.total} ml/dia` : '—'}
                    </p>
                    {fluid && <p className="text-xs text-blue-500">{fluid.rate} ml/h</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-red-50 to-rose-50 border-red-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-red-600 font-medium">FC Normal</p>
                    <p className="text-lg font-bold text-red-700">
                      {vitalSigns ? `${vitalSigns.fc} bpm` : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">PA Normal</p>
                    <p className="text-lg font-bold text-emerald-700">
                      {vitalSigns ? `${vitalSigns.pas}/${vitalSigns.pad}` : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="calculadora">Calculadora de Doses</TabsTrigger>
              <TabsTrigger value="pals">Protocolos PALS</TabsTrigger>
              <TabsTrigger value="desenvolvimento">Desenvolvimento</TabsTrigger>
              <TabsTrigger value="vitais">Parâmetros Vitais</TabsTrigger>
              <TabsTrigger value="vacinal" className="gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Calendário Vacinal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculadora">
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-pink-500" />
                    Calculadora Pediátrica
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Ferramenta de apoio ao cálculo
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Inputs */}
                    <div className="space-y-4">
                      {/* Medicação */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700">
                          Medicação
                        </Label>
                        <Select value={selectedMedication} onValueChange={(value) => {
                          setSelectedMedication(value);
                          setSelectedRoute('');
                          setCalcResult(null);
                        }}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {medicationsList.map(med => (
                              <SelectItem key={med.name} value={med.name}>{med.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">
                          Informações baseadas em descrições da literatura
                        </p>
                      </div>

                      {/* Via de administração */}
                      {selectedMedication && (
                        <div>
                          <Label className="text-sm font-medium text-slate-700">
                            Via de administração
                          </Label>
                          <Select value={selectedRoute} onValueChange={(value) => {
                            setSelectedRoute(value);
                            setCalcResult(null);
                          }}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {medicationsList.find(m => m.name === selectedMedication)?.routes.map(route => (
                                <SelectItem key={route} value={route}>{route}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Idade da criança */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700">
                          Idade da criança
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Ex: 2"
                            value={childAge}
                            onChange={(e) => {
                              setChildAge(e.target.value);
                              setCalcResult(null);
                            }}
                          />
                          <Select value={childAgeUnit} onValueChange={setChildAgeUnit}>
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="meses">meses</SelectItem>
                              <SelectItem value="anos">anos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Informação de restrição por idade */}
                      {getAgeRestrictionInfo() && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800">
                            {getAgeRestrictionInfo().text}
                          </p>
                        </div>
                      )}

                      {/* Parâmetro de cálculo */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700">
                          Parâmetro (mg/kg/dose)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 10"
                          value={doseParam}
                          onChange={(e) => {
                            setDoseParam(e.target.value);
                            setCalcResult(null);
                          }}
                          className="mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Valor informado pelo usuário
                        </p>
                      </div>

                      {/* Peso */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700">
                          Peso (kg)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Ex: 12"
                          value={calcWeight}
                          onChange={(e) => {
                            setCalcWeight(e.target.value);
                            setCalcResult(null);
                          }}
                          className="mt-1"
                        />
                      </div>

                      {/* Concentração */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700">
                          Concentração (mg/mL) - opcional
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 20"
                          value={concentration}
                          onChange={(e) => {
                            setConcentration(e.target.value);
                            setCalcResult(null);
                          }}
                          className="mt-1"
                        />
                      </div>

                      <Button 
                        onClick={calculatePediatricDose}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                        disabled={!calcWeight || !doseParam}
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        Calcular
                      </Button>
                    </div>

                    {/* Resultado */}
                    <div>
                      {calcResult ? (
                        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-800">
                              Cálculo
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                              {calcResult.medication && (
                                <p className="text-slate-700">
                                  <strong>Medicação:</strong> {calcResult.medication}
                                </p>
                              )}
                              {calcResult.route && (
                                <p className="text-slate-700">
                                  <strong>Via:</strong> {calcResult.route}
                                </p>
                              )}
                              {calcResult.age && (
                                <p className="text-slate-700">
                                  <strong>Idade:</strong> {calcResult.age}
                                </p>
                              )}
                              <p className="text-slate-700">
                                <strong>Peso:</strong> {calcResult.peso} kg
                              </p>
                              <p className="text-slate-700">
                                <strong>Parâmetro informado:</strong> {calcResult.param} mg/kg
                              </p>
                            </div>

                            <div className="p-4 bg-white rounded-lg border border-slate-200">
                              <p className="text-xs text-slate-600 mb-2">Resultado matemático:</p>
                              <p className="text-lg font-bold text-slate-800">
                                {calcResult.peso} × {calcResult.param} = {calcResult.doseMg} mg
                              </p>
                            </div>

                            {calcResult.volumeMl && (
                              <div className="p-4 bg-white rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-600 mb-2">Conversão:</p>
                                <p className="text-base font-semibold text-slate-800">
                                  {calcResult.doseMg} mg ÷ {calcResult.conc} mg/mL = {calcResult.volumeMl} mL
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="h-full flex items-center justify-center p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                          <div className="text-center">
                            <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">
                              Preencha os campos para calcular
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aviso legal curto */}
                  <div className="mt-6 p-3 bg-slate-100 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-700 text-center">
                      As informações apresentadas não substituem a avaliação profissional.<br/>
                      A decisão clínica e a prescrição são de responsabilidade do profissional de saúde.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
            </TabsContent>

            <TabsContent value="pals">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Protocol Selection */}
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-red-500" />
                      Protocolos PALS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(palsProtocols).map(([key, protocol]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedProtocol(protocol)}
                          className={`w-full p-4 rounded-lg border text-left transition-all ${
                            selectedProtocol?.title === protocol.title
                              ? 'bg-red-50 border-red-200'
                              : 'bg-slate-50 border-transparent hover:border-slate-200'
                          }`}
                        >
                          <p className="font-medium text-slate-800">{protocol.title}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {protocol.steps.length} etapas • {protocol.medications.length} medicações
                          </p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Protocol Details */}
                {selectedProtocol ? (
                  <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-red-700">{selectedProtocol.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                          Sequência de Ações
                        </p>
                        <div className="space-y-2">
                          {selectedProtocol.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                              <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center flex-shrink-0 font-bold">
                                {step.step}
                              </span>
                              <div>
                                <p className="text-sm text-slate-700">{step.action}</p>
                                {step.time && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {step.time}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                          Medicações
                        </p>
                        <div className="space-y-2">
                          {selectedProtocol.medications.map((med, i) => (
                            <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-red-800">{med.drug}</span>
                              </div>
                              <p className="text-sm text-red-700">{med.dose}</p>
                              <p className="text-xs text-red-600 mt-1">{med.timing}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400">Selecione um protocolo PALS</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="desenvolvimento">
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    Marcos do Desenvolvimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(developmentMilestones).map(([faixa, marcos], i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-800 mb-3">{faixa}</h4>
                        <div className="grid md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Motor</p>
                            <p className="text-slate-700">{marcos.motor}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Social</p>
                            <p className="text-slate-700">{marcos.social}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Linguagem</p>
                            <p className="text-slate-700">{marcos.linguagem}</p>
                          </div>
                          <div>
                            <p className="text-xs text-red-500 mb-1">🚨 Alerta</p>
                            <p className="text-red-700">{marcos.alerta}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitais">
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Parâmetros Vitais por Idade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-medium text-slate-600">Faixa Etária</th>
                          <th className="text-center py-3 px-4 font-medium text-slate-600">FC (bpm)</th>
                          <th className="text-center py-3 px-4 font-medium text-slate-600">FR (irpm)</th>
                          <th className="text-center py-3 px-4 font-medium text-slate-600">PAS (mmHg)</th>
                          <th className="text-center py-3 px-4 font-medium text-slate-600">PAD (mmHg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(vitalSignsByAge).map(([faixa, valores], i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium text-slate-800">{faixa}</td>
                            <td className="text-center py-3 px-4 text-red-600">{valores.fc}</td>
                            <td className="text-center py-3 px-4 text-blue-600">{valores.fr}</td>
                            <td className="text-center py-3 px-4 text-emerald-600">{valores.pas}</td>
                            <td className="text-center py-3 px-4 text-purple-600">{valores.pad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vacinal">
              <CalendarioVacinal />
            </TabsContent>
          </Tabs>

          <DisclaimerFooter variant="calculadora" />
        </div>
      </main>
    </div>
  );
}
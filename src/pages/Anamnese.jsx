import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Sparkles,
  ClipboardList,
  Stethoscope,
  Heart,
  Activity,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  Zap,
  BookOpen,
  User,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Download,
  RefreshCw
} from 'lucide-react';

const specialties = [
  'Clínica Geral', 'Cardiologia', 'Pneumologia', 'Gastroenterologia', 
  'Neurologia', 'Ortopedia', 'Ginecologia', 'Pediatria', 'Psiquiatria',
  'Dermatologia', 'Urologia', 'Endocrinologia', 'Reumatologia'
];

const symptomQuestions = {
  'dor': ['Localização?', 'Intensidade (0-10)?', 'Tipo (pontada, queimação, pressão)?', 'Irradiação?', 'Fatores de melhora/piora?', 'Duração?'],
  'febre': ['Temperatura máxima?', 'Há quantos dias?', 'Padrão (contínua, intermitente)?', 'Calafrios?', 'Sudorese noturna?'],
  'dispneia': ['Em repouso ou aos esforços?', 'Ortopneia?', 'Dispneia paroxística noturna?', 'Quantos travesseiros usa?', 'Piora com exercício?'],
  'tosse': ['Seca ou produtiva?', 'Cor do escarro?', 'Sangue?', 'Piora noturna?', 'Há quanto tempo?'],
  'náusea': ['Vômitos associados?', 'Quantos episódios?', 'Relação com alimentação?', 'Conteúdo?'],
  'cefaleia': ['Localização?', 'Tipo (pulsátil, em aperto)?', 'Fotofobia/fonofobia?', 'Aura?', 'Náuseas?', 'Frequência?']
};

export default function Anamnese() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mode, setMode] = useState('rapido'); // rapido ou detalhado
  const [currentStep, setCurrentStep] = useState(0);
  const [specialty, setSpecialty] = useState('Clínica Geral');
  
  // Patient data
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    sex: '',
    weight: '',
    height: ''
  });

  // Dynamic questions based on symptoms
  const [mainSymptom, setMainSymptom] = useState('');
  const [dynamicQuestions, setDynamicQuestions] = useState([]);
  const [dynamicAnswers, setDynamicAnswers] = useState({});

  // Anamnesis sections
  const [anamnesis, setAnamnesis] = useState({
    chief_complaint: '',
    history_present_illness: '',
    past_medical_history: '',
    medications: '',
    allergies: '',
    family_history: '',
    social_history: '',
    review_of_systems: ''
  });

  // Physical exam
  const [physicalExam, setPhysicalExam] = useState({
    vital_signs: '',
    general_appearance: '',
    cardiovascular: '',
    respiratory: '',
    abdominal: '',
    neurological: '',
    specific: ''
  });

  // SOAP output
  const [soapNote, setSoapNote] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.MedicalRecord.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    }
  });

  // Generate dynamic questions based on main symptom
  useEffect(() => {
    if (mainSymptom) {
      const symptomKey = Object.keys(symptomQuestions).find(key => 
        mainSymptom.toLowerCase().includes(key)
      );
      if (symptomKey) {
        setDynamicQuestions(symptomQuestions[symptomKey]);
      }
    }
  }, [mainSymptom]);

  // Generate specialty-specific questions
  const getSpecialtyQuestions = () => {
    const questions = {
      'Cardiologia': ['Dor torácica?', 'Palpitações?', 'Síncope?', 'Edema de MMII?', 'Dispneia aos esforços?'],
      'Pneumologia': ['Tosse?', 'Expectoração?', 'Hemoptise?', 'Dispneia?', 'Dor torácica ventilatório-dependente?'],
      'Gastroenterologia': ['Dor abdominal?', 'Náuseas/vômitos?', 'Alteração do hábito intestinal?', 'Sangramento digestivo?', 'Icterícia?'],
      'Neurologia': ['Cefaleia?', 'Tontura/vertigem?', 'Alteração visual?', 'Fraqueza?', 'Parestesias?', 'Convulsões?'],
      'Ginecologia': ['DUM?', 'Ciclo menstrual regular?', 'Dispareunia?', 'Corrimento?', 'Sangramento anormal?', 'G_P_A_?'],
      'Pediatria': ['Vacinação em dia?', 'Marcos do desenvolvimento?', 'Alimentação?', 'Sono?', 'Eliminações?']
    };
    return questions[specialty] || [];
  };

  // Generate AI suggestions based on current data
  const generateAISuggestions = async () => {
    setIsGenerating(true);
    
    const prompt = `
      Você é um sistema de apoio à decisão clínica. Analise os seguintes dados e forneça sugestões:
      
      DADOS DO PACIENTE:
      - Nome: ${patientData.name || 'Não informado'}
      - Idade: ${patientData.age || 'Não informada'} anos
      - Sexo: ${patientData.sex || 'Não informado'}
      - Peso: ${patientData.weight || 'Não informado'} kg
      
      ESPECIALIDADE: ${specialty}
      
      QUEIXA PRINCIPAL: ${anamnesis.chief_complaint || mainSymptom || 'Não informada'}
      
      HDA: ${anamnesis.history_present_illness || 'Não informada'}
      
      ANTECEDENTES: ${anamnesis.past_medical_history || 'Não informados'}
      
      MEDICAMENTOS: ${anamnesis.medications || 'Não informados'}
      
      ALERGIAS: ${anamnesis.allergies || 'Não informadas'}
      
      Com base nesses dados:
      1. Sugira perguntas adicionais importantes
      2. Liste diagnósticos diferenciais possíveis com justificativa
      3. Sugira exames complementares
      4. Identifique red flags (sinais de alarme)
      5. Forneça recomendações de conduta inicial
    `;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          additional_questions: { 
            type: 'array', 
            items: { type: 'string' } 
          },
          differential_diagnosis: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                diagnosis: { type: 'string' },
                probability: { type: 'string' },
                justification: { type: 'string' }
              }
            } 
          },
          suggested_exams: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                exam: { type: 'string' },
                reason: { type: 'string' }
              }
            } 
          },
          red_flags: { 
            type: 'array', 
            items: { type: 'string' } 
          },
          initial_management: { 
            type: 'array', 
            items: { type: 'string' } 
          },
          guidelines_reference: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                guideline: { type: 'string' },
                recommendation: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setAiSuggestions(response);
    setIsGenerating(false);
  };

  // Generate SOAP note
  const generateSOAPNote = async () => {
    setIsGeneratingSOAP(true);
    
    const prompt = `
      Gere uma nota médica completa no formato SOAP (Subjetivo, Objetivo, Avaliação, Plano) com base nos seguintes dados:
      
      PACIENTE: ${patientData.name}, ${patientData.age} anos, ${patientData.sex}
      
      QUEIXA PRINCIPAL: ${anamnesis.chief_complaint}
      
      HDA: ${anamnesis.history_present_illness}
      
      HPP: ${anamnesis.past_medical_history}
      
      MEDICAMENTOS: ${anamnesis.medications}
      
      ALERGIAS: ${anamnesis.allergies}
      
      HISTÓRIA FAMILIAR: ${anamnesis.family_history}
      
      HISTÓRIA SOCIAL: ${anamnesis.social_history}
      
      EXAME FÍSICO:
      - Sinais Vitais: ${physicalExam.vital_signs}
      - Estado Geral: ${physicalExam.general_appearance}
      - Cardiovascular: ${physicalExam.cardiovascular}
      - Respiratório: ${physicalExam.respiratory}
      - Abdome: ${physicalExam.abdominal}
      - Neurológico: ${physicalExam.neurological}
      
      Gere o SOAP completo, profissional e adequado para documentação em prontuário médico.
    `;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          subjective: { type: 'string' },
          objective: { type: 'string' },
          assessment: { type: 'string' },
          plan: { type: 'string' },
          icd_codes: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                code: { type: 'string' },
                description: { type: 'string' }
              }
            } 
          }
        }
      }
    });

    setSoapNote(response);
    setIsGeneratingSOAP(false);
  };

  const steps = mode === 'rapido' 
    ? ['Identificação', 'Queixa', 'HDA Rápida', 'Exame Físico', 'Conclusão']
    : ['Identificação', 'Queixa Principal', 'HDA Detalhada', 'Antecedentes', 'Revisão de Sistemas', 'Exame Físico', 'SOAP'];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSave = () => {
    saveMutation.mutate({
      patient_name: patientData.name,
      anamnesis,
      physical_exam: physicalExam,
      diagnosis: soapNote?.assessment || '',
      plan: soapNote?.plan || ''
    });
  };

  const exportSOAP = () => {
    if (!soapNote) return;
    
    const content = `
NOTA SOAP - ${patientData.name}
Data: ${new Date().toLocaleDateString('pt-BR')}
=====================================

SUBJETIVO (S):
${soapNote.subjective}

OBJETIVO (O):
${soapNote.objective}

AVALIAÇÃO (A):
${soapNote.assessment}

PLANO (P):
${soapNote.plan}

CID-10:
${soapNote.icd_codes?.map(c => `${c.code} - ${c.description}`).join('\n') || 'Não especificado'}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOAP_${patientData.name || 'paciente'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-500" />
                Anamnese Inteligente
              </h1>
              <p className="text-slate-500 mt-1">Sistema adaptativo com suporte de IA</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Mode Toggle */}
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-lg p-2 border border-slate-200">
                <Zap className={`w-4 h-4 ${mode === 'rapido' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="text-sm text-slate-600">Rápido</span>
                <Switch
                  checked={mode === 'detalhado'}
                  onCheckedChange={(checked) => setMode(checked ? 'detalhado' : 'rapido')}
                />
                <span className="text-sm text-slate-600">Detalhado</span>
                <BookOpen className={`w-4 h-4 ${mode === 'detalhado' ? 'text-purple-500' : 'text-slate-400'}`} />
              </div>
            </div>
          </div>

          {/* Progress */}
          <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Etapa {currentStep + 1} de {steps.length}: {steps[currentStep]}
                </span>
                <Badge className={mode === 'rapido' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}>
                  {mode === 'rapido' ? '⚡ Modo Rápido' : '📚 Modo Detalhado'}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2">
                {steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`text-xs ${i === currentStep ? 'text-purple-600 font-medium' : 'text-slate-400'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 0: Identification */}
              {currentStep === 0 && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-500" />
                      Identificação do Paciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Nome Completo</Label>
                        <Input
                          value={patientData.name}
                          onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                          placeholder="Nome do paciente"
                        />
                      </div>
                      <div>
                        <Label>Idade</Label>
                        <Input
                          type="number"
                          value={patientData.age}
                          onChange={(e) => setPatientData({...patientData, age: e.target.value})}
                          placeholder="Anos"
                        />
                      </div>
                      <div>
                        <Label>Sexo</Label>
                        <Select
                          value={patientData.sex}
                          onValueChange={(value) => setPatientData({...patientData, sex: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="feminino">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Peso (kg)</Label>
                        <Input
                          type="number"
                          value={patientData.weight}
                          onChange={(e) => setPatientData({...patientData, weight: e.target.value})}
                          placeholder="kg"
                        />
                      </div>
                      <div>
                        <Label>Altura (cm)</Label>
                        <Input
                          type="number"
                          value={patientData.height}
                          onChange={(e) => setPatientData({...patientData, height: e.target.value})}
                          placeholder="cm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Especialidade</Label>
                        <Select value={specialty} onValueChange={setSpecialty}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((spec) => (
                              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 1: Chief Complaint */}
              {currentStep === 1 && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-purple-500" />
                      Queixa Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Queixa Principal (nas palavras do paciente)</Label>
                      <Textarea
                        value={anamnesis.chief_complaint}
                        onChange={(e) => {
                          setAnamnesis({...anamnesis, chief_complaint: e.target.value});
                          setMainSymptom(e.target.value);
                        }}
                        placeholder="Ex: Dor no peito há 2 horas"
                        rows={3}
                      />
                    </div>

                    {/* Dynamic questions based on symptom */}
                    {dynamicQuestions.length > 0 && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Perguntas Sugeridas pela IA
                        </p>
                        <div className="space-y-2">
                          {dynamicQuestions.map((q, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-purple-400" />
                              <span className="text-sm text-purple-800">{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specialty-specific questions */}
                    {getSpecialtyQuestions().length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-700 mb-3">
                          Perguntas específicas - {specialty}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {getSpecialtyQuestions().map((q, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm text-blue-800">{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 2: HDA */}
              {currentStep === 2 && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      História da Doença Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={anamnesis.history_present_illness}
                      onChange={(e) => setAnamnesis({...anamnesis, history_present_illness: e.target.value})}
                      placeholder="Descreva a evolução cronológica dos sintomas..."
                      rows={mode === 'rapido' ? 4 : 8}
                    />
                    
                    {mode === 'detalhado' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Início</Label>
                          <Input placeholder="Quando começou?" />
                        </div>
                        <div>
                          <Label>Duração</Label>
                          <Input placeholder="Quanto tempo?" />
                        </div>
                        <div>
                          <Label>Intensidade (0-10)</Label>
                          <Input type="number" min="0" max="10" />
                        </div>
                        <div>
                          <Label>Frequência</Label>
                          <Input placeholder="Constante? Intermitente?" />
                        </div>
                        <div className="col-span-2">
                          <Label>Fatores de melhora</Label>
                          <Input placeholder="O que alivia?" />
                        </div>
                        <div className="col-span-2">
                          <Label>Fatores de piora</Label>
                          <Input placeholder="O que piora?" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Antecedentes (detalhado) or Physical Exam (rápido) */}
              {currentStep === 3 && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      {mode === 'rapido' ? (
                        <><Stethoscope className="w-5 h-5 text-purple-500" /> Exame Físico</>
                      ) : (
                        <><Heart className="w-5 h-5 text-purple-500" /> Antecedentes</>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mode === 'rapido' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>PA (mmHg)</Label>
                            <Input placeholder="120/80" />
                          </div>
                          <div>
                            <Label>FC (bpm)</Label>
                            <Input placeholder="80" />
                          </div>
                          <div>
                            <Label>FR (irpm)</Label>
                            <Input placeholder="16" />
                          </div>
                          <div>
                            <Label>Tax (°C)</Label>
                            <Input placeholder="36.5" />
                          </div>
                          <div>
                            <Label>SpO2 (%)</Label>
                            <Input placeholder="98" />
                          </div>
                          <div>
                            <Label>Glasgow</Label>
                            <Input placeholder="15" />
                          </div>
                        </div>
                        <div>
                          <Label>Achados relevantes</Label>
                          <Textarea
                            value={physicalExam.general_appearance}
                            onChange={(e) => setPhysicalExam({...physicalExam, general_appearance: e.target.value})}
                            placeholder="Descreva os achados principais..."
                            rows={4}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>História Patológica Pregressa</Label>
                          <Textarea
                            value={anamnesis.past_medical_history}
                            onChange={(e) => setAnamnesis({...anamnesis, past_medical_history: e.target.value})}
                            placeholder="Doenças prévias, cirurgias, internações..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Medicamentos em uso</Label>
                          <Textarea
                            value={anamnesis.medications}
                            onChange={(e) => setAnamnesis({...anamnesis, medications: e.target.value})}
                            placeholder="Liste os medicamentos e doses..."
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Alergias</Label>
                          <Input
                            value={anamnesis.allergies}
                            onChange={(e) => setAnamnesis({...anamnesis, allergies: e.target.value})}
                            placeholder="Medicamentos, alimentos, outros..."
                          />
                        </div>
                        <div>
                          <Label>História Familiar</Label>
                          <Textarea
                            value={anamnesis.family_history}
                            onChange={(e) => setAnamnesis({...anamnesis, family_history: e.target.value})}
                            placeholder="Doenças na família..."
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>História Social</Label>
                          <Textarea
                            value={anamnesis.social_history}
                            onChange={(e) => setAnamnesis({...anamnesis, social_history: e.target.value})}
                            placeholder="Tabagismo, etilismo, drogas, profissão..."
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional steps for detailed mode */}
              {mode === 'detalhado' && currentStep === 4 && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Revisão de Sistemas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={anamnesis.review_of_systems}
                      onChange={(e) => setAnamnesis({...anamnesis, review_of_systems: e.target.value})}
                      placeholder="Revisão sistemática por aparelhos..."
                      rows={6}
                    />
                  </CardContent>
                </Card>
              )}

              {mode === 'detalhado' && currentStep === 5 && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-purple-500" />
                      Exame Físico Completo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>PA (mmHg)</Label>
                        <Input placeholder="120/80" />
                      </div>
                      <div>
                        <Label>FC (bpm)</Label>
                        <Input placeholder="80" />
                      </div>
                      <div>
                        <Label>FR (irpm)</Label>
                        <Input placeholder="16" />
                      </div>
                      <div>
                        <Label>Tax (°C)</Label>
                        <Input placeholder="36.5" />
                      </div>
                      <div>
                        <Label>SpO2 (%)</Label>
                        <Input placeholder="98" />
                      </div>
                      <div>
                        <Label>Dor (0-10)</Label>
                        <Input placeholder="0" />
                      </div>
                    </div>
                    
                    {['general_appearance', 'cardiovascular', 'respiratory', 'abdominal', 'neurological'].map((field) => (
                      <div key={field}>
                        <Label className="capitalize">{field.replace('_', ' ')}</Label>
                        <Textarea
                          value={physicalExam[field]}
                          onChange={(e) => setPhysicalExam({...physicalExam, [field]: e.target.value})}
                          placeholder={`Achados do exame ${field.replace('_', ' ')}...`}
                          rows={2}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Final Step: Conclusion/SOAP */}
              {((mode === 'rapido' && currentStep === 4) || (mode === 'detalhado' && currentStep === 6)) && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      Nota SOAP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!soapNote ? (
                      <div className="text-center py-8">
                        <Button
                          onClick={generateSOAPNote}
                          disabled={isGeneratingSOAP}
                          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                        >
                          {isGeneratingSOAP ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Gerando SOAP...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Gerar Nota SOAP
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {['subjective', 'objective', 'assessment', 'plan'].map((section) => (
                          <div key={section} className="p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-semibold text-slate-800 mb-2 uppercase">
                              {section === 'subjective' ? 'S - Subjetivo' :
                               section === 'objective' ? 'O - Objetivo' :
                               section === 'assessment' ? 'A - Avaliação' : 'P - Plano'}
                            </h4>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{soapNote[section]}</p>
                          </div>
                        ))}
                        
                        {soapNote.icd_codes?.length > 0 && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">CID-10</h4>
                            <div className="flex flex-wrap gap-2">
                              {soapNote.icd_codes.map((code, i) => (
                                <Badge key={i} variant="outline" className="text-blue-700 border-blue-300">
                                  {code.code} - {code.description}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={exportSOAP}>
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                          </Button>
                          <Button variant="outline" onClick={() => setSoapNote(null)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Anterior
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={generateAISuggestions}
                    disabled={isGenerating}
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Sugestões IA
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button onClick={() => setCurrentStep(currentStep + 1)}>
                      Próximo
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSave}
                      disabled={saveMutation.isPending}
                      className="bg-gradient-to-r from-blue-900 to-blue-700"
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Salvar Prontuário
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* AI Suggestions Panel */}
            <div className="space-y-6">
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Assistente IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
                      <p className="text-sm text-slate-500">Analisando dados...</p>
                    </div>
                  ) : aiSuggestions ? (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {/* Red Flags */}
                      {aiSuggestions.red_flags?.length > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Red Flags
                          </p>
                          <ul className="space-y-1">
                            {aiSuggestions.red_flags.map((flag, i) => (
                              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Diagnósticos Diferenciais */}
                      {aiSuggestions.differential_diagnosis?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Diagnósticos Diferenciais
                          </p>
                          <div className="space-y-2">
                            {aiSuggestions.differential_diagnosis.map((dx, i) => (
                              <div key={i} className="p-2 bg-slate-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-800 text-sm">{dx.diagnosis}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {dx.probability}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{dx.justification}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exames Sugeridos */}
                      {aiSuggestions.suggested_exams?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Exames Sugeridos
                          </p>
                          <ul className="space-y-1">
                            {aiSuggestions.suggested_exams.map((exam, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                <div>
                                  <span className="font-medium">{exam.exam}</span>
                                  <span className="text-slate-400 text-xs ml-1">- {exam.reason}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Conduta Inicial */}
                      {aiSuggestions.initial_management?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Conduta Sugerida
                          </p>
                          <ul className="space-y-1">
                            {aiSuggestions.initial_management.map((item, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center flex-shrink-0">
                                  {i + 1}
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Guidelines */}
                      {aiSuggestions.guidelines_reference?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            📚 Referências de Guidelines
                          </p>
                          {aiSuggestions.guidelines_reference.map((ref, i) => (
                            <div key={i} className="p-2 bg-cyan-50 rounded-lg border border-cyan-200 mb-2">
                              <p className="text-xs font-medium text-cyan-700">{ref.guideline}</p>
                              <p className="text-xs text-cyan-600 mt-1">{ref.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Perguntas Adicionais */}
                      {aiSuggestions.additional_questions?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Perguntas Adicionais
                          </p>
                          <ul className="space-y-1">
                            {aiSuggestions.additional_questions.map((q, i) => (
                              <li key={i} className="text-sm text-purple-700 flex items-center gap-2">
                                <ChevronRight className="w-3 h-3" />
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">
                        Preencha os dados e clique em "Sugestões IA" para receber recomendações
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
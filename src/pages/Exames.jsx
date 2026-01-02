import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FlaskConical,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Shield,
  BookOpen,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react';

// Base de conhecimento de exames (educacional)
const examDatabase = {
  'Hemoglobina': {
    unit: 'g/dL',
    refAdult: { male: '13.5-17.5', female: '12.0-16.0' },
    refPediatric: '11.0-14.0',
    description: 'A hemoglobina é a proteína presente nos glóbulos vermelhos responsável pelo transporte de oxigênio dos pulmões para os tecidos do corpo.',
    usedFor: 'Este exame é utilizado para avaliar a capacidade de transporte de oxigênio do sangue e detectar anemias.',
    commonContexts: ['Investigação de anemia', 'Avaliação pré-operatória', 'Acompanhamento de doenças crônicas', 'Check-up de rotina'],
    factors: ['Desidratação pode elevar valores', 'Altitude influencia resultados', 'Tabagismo pode alterar valores', 'Jejum não é necessário'],
    possibleAssociations: {
      elevated: ['Desidratação', 'Policitemia', 'Doenças pulmonares crônicas', 'Alta altitude', 'Tabagismo'],
      decreased: ['Anemia por deficiência de ferro', 'Anemia por deficiência de vitamina B12', 'Anemia por deficiência de ácido fólico', 'Perda sanguínea', 'Doenças crônicas', 'Hemólise']
    }
  },
  'Leucócitos': {
    unit: '/mm³',
    refAdult: { general: '4.000-11.000' },
    refPediatric: '5.000-15.000',
    description: 'Os leucócitos (glóbulos brancos) são células do sistema imunológico que defendem o organismo contra infecções e substâncias estranhas.',
    usedFor: 'Este exame é utilizado para avaliar o sistema imunológico e detectar infecções, inflamações ou doenças hematológicas.',
    commonContexts: ['Suspeita de infecção', 'Febre de origem indeterminada', 'Acompanhamento de quimioterapia', 'Avaliação de processos inflamatórios'],
    factors: ['Exercício físico intenso pode elevar temporariamente', 'Estresse emocional pode alterar', 'Algumas medicações influenciam', 'Jejum não é necessário'],
    possibleAssociations: {
      elevated: ['Infecção bacteriana', 'Inflamação', 'Estresse físico ou emocional', 'Leucemia', 'Uso de corticoides'],
      decreased: ['Infecção viral', 'Deficiência medular', 'Doenças autoimunes', 'Medicamentos (quimioterapia)', 'Infecções graves']
    }
  },
  'Plaquetas': {
    unit: '/mm³',
    refAdult: { general: '150.000-400.000' },
    refPediatric: '150.000-400.000',
    description: 'As plaquetas são fragmentos celulares essenciais para a coagulação sanguínea, atuando na formação de tampões hemostáticos.',
    usedFor: 'Este exame é utilizado para avaliar o risco de sangramento ou trombose e monitorar distúrbios da coagulação.',
    commonContexts: ['Investigação de sangramentos anormais', 'Avaliação pré-cirúrgica', 'Acompanhamento de quimioterapia', 'Suspeita de trombocitopenia'],
    factors: ['Exercício físico intenso pode elevar temporariamente', 'Altitude pode influenciar', 'Gravidez pode diminuir levemente', 'Jejum não é necessário'],
    possibleAssociations: {
      elevated: ['Inflamação crônica', 'Deficiência de ferro', 'Após esplenectomia', 'Doenças mieloproliferativas'],
      decreased: ['Dengue e outras viroses', 'Deficiência medular', 'Doenças autoimunes', 'Medicamentos', 'Consumo aumentado (coagulação)']
    }
  },
  'Glicemia': {
    unit: 'mg/dL',
    refAdult: { fasting: '70-99', postprandial: '<140' },
    refPediatric: '70-100',
    description: 'A glicemia mede a concentração de glicose (açúcar) no sangue, fundamental para o metabolismo energético do corpo.',
    usedFor: 'Este exame é utilizado para rastreamento, diagnóstico e acompanhamento do diabetes mellitus.',
    commonContexts: ['Rastreamento de diabetes', 'Acompanhamento diabético', 'Investigação de hipoglicemia', 'Check-up de rotina'],
    factors: ['OBRIGATÓRIO jejum de 8-12h para glicemia de jejum', 'Estresse pode elevar', 'Exercício pode diminuir', 'Muitos medicamentos interferem'],
    possibleAssociations: {
      elevated: ['Diabetes mellitus', 'Pré-diabetes', 'Estresse agudo', 'Uso de corticoides', 'Pancreatite'],
      decreased: ['Jejum prolongado', 'Excesso de insulina', 'Tumores pancreáticos', 'Insuficiência adrenal', 'Doença hepática grave']
    }
  },
  'Creatinina': {
    unit: 'mg/dL',
    refAdult: { male: '0.7-1.3', female: '0.6-1.1' },
    refPediatric: '0.3-0.7',
    description: 'A creatinina é um produto do metabolismo muscular excretado pelos rins. Seus níveis refletem a função renal.',
    usedFor: 'Este exame é utilizado para avaliar a função dos rins e diagnosticar doenças renais.',
    commonContexts: ['Avaliação de função renal', 'Acompanhamento de doença renal crônica', 'Monitoramento de medicações nefrotóxicas', 'Check-up de rotina'],
    factors: ['Massa muscular influencia valores', 'Dieta rica em proteínas pode elevar', 'Desidratação eleva temporariamente', 'Jejum não é necessário'],
    possibleAssociations: {
      elevated: ['Insuficiência renal aguda', 'Doença renal crônica', 'Desidratação', 'Obstrução urinária', 'Rabdomiólise'],
      decreased: ['Baixa massa muscular', 'Desnutrição', 'Gravidez', 'Doença hepática avançada']
    }
  },
  'Ureia': {
    unit: 'mg/dL',
    refAdult: { general: '10-50' },
    refPediatric: '15-40',
    description: 'A ureia é o principal produto final do metabolismo de proteínas, excretada pelos rins.',
    usedFor: 'Este exame é utilizado para avaliar a função renal e o metabolismo proteico.',
    commonContexts: ['Avaliação de função renal', 'Investigação de sangramento gastrointestinal', 'Monitoramento de diálise', 'Desidratação'],
    factors: ['Dieta rica em proteínas eleva', 'Desidratação eleva', 'Sangramento digestivo eleva', 'Jejum não é obrigatório mas recomendado'],
    possibleAssociations: {
      elevated: ['Insuficiência renal', 'Desidratação', 'Sangramento gastrointestinal', 'Dieta hiperproteica', 'Catabolismo aumentado'],
      decreased: ['Desnutrição', 'Doença hepática grave', 'Hiper-hidratação', 'Gravidez']
    }
  },
  'Sódio': {
    unit: 'mEq/L',
    refAdult: { general: '136-145' },
    refPediatric: '136-145',
    description: 'O sódio é o principal eletrólito extracelular, essencial para o equilíbrio hídrico e função nervosa.',
    usedFor: 'Este exame é utilizado para avaliar o equilíbrio hidroeletrolítico e distúrbios metabólicos.',
    commonContexts: ['Distúrbios neurológicos', 'Vômitos e diarreia', 'Uso de diuréticos', 'Insuficiência cardíaca'],
    factors: ['Ingestão de água influencia', 'Sudorese excessiva pode alterar', 'Medicações diuréticas interferem', 'Jejum não é necessário'],
    possibleAssociations: {
      elevated: ['Desidratação', 'Diabetes insipidus', 'Ingestão excessiva de sal', 'Hiperaldosteronismo'],
      decreased: ['Hiper-hidratação', 'Insuficiência cardíaca', 'Cirrose', 'SIADH', 'Uso de diuréticos', 'Vômitos/diarreia']
    }
  },
  'Potássio': {
    unit: 'mEq/L',
    refAdult: { general: '3.5-5.0' },
    refPediatric: '3.5-5.0',
    description: 'O potássio é o principal eletrólito intracelular, fundamental para a função muscular e cardíaca.',
    usedFor: 'Este exame é utilizado para avaliar o equilíbrio eletrolítico e prevenir arritmias cardíacas.',
    commonContexts: ['Arritmias cardíacas', 'Uso de diuréticos', 'Insuficiência renal', 'Fraqueza muscular'],
    factors: ['Hemólise da amostra pode elevar falsamente', 'Jejum não é necessário', 'Medicações influenciam', 'Não garrotear por tempo prolongado'],
    possibleAssociations: {
      elevated: ['Insuficiência renal', 'Acidose metabólica', 'Medicamentos (IECA, espironolactona)', 'Hemólise', 'Rabdomiólise'],
      decreased: ['Vômitos', 'Diarreia', 'Uso de diuréticos', 'Alcalose metabólica', 'Desnutrição']
    }
  },
  'TGO (AST)': {
    unit: 'U/L',
    refAdult: { general: '10-40' },
    refPediatric: '15-55',
    description: 'A TGO (AST) é uma enzima presente no fígado, coração, músculos e outros tecidos. Sua elevação indica lesão celular.',
    usedFor: 'Este exame é utilizado para avaliar lesão hepática, cardíaca ou muscular.',
    commonContexts: ['Suspeita de hepatite', 'Investigação de infarto', 'Uso de medicações hepatotóxicas', 'Doenças musculares'],
    factors: ['Exercício intenso pode elevar', 'Hemólise da amostra pode elevar', 'Jejum de 4h recomendado', 'Álcool eleva'],
    possibleAssociations: {
      elevated: ['Hepatite viral ou medicamentosa', 'Cirrose', 'Infarto do miocárdio', 'Miopatias', 'Alcoolismo'],
      decreased: ['Deficiência de vitamina B6', 'Sem significado clínico na maioria dos casos']
    }
  },
  'TGP (ALT)': {
    unit: 'U/L',
    refAdult: { general: '7-56' },
    refPediatric: '10-40',
    description: 'A TGP (ALT) é uma enzima mais específica do fígado. Sua elevação indica lesão hepatocelular.',
    usedFor: 'Este exame é utilizado para avaliar lesão ou doença do fígado.',
    commonContexts: ['Suspeita de hepatite', 'Esteatose hepática', 'Uso de medicações hepatotóxicas', 'Acompanhamento de hepatopatias'],
    factors: ['Exercício intenso pode elevar levemente', 'Obesidade pode elevar', 'Jejum de 4h recomendado', 'Álcool eleva'],
    possibleAssociations: {
      elevated: ['Hepatite viral ou medicamentosa', 'Esteatose hepática', 'Cirrose', 'Obstrução biliar', 'Síndrome metabólica'],
      decreased: ['Sem significado clínico na maioria dos casos']
    }
  },
  'Bilirrubina Total': {
    unit: 'mg/dL',
    refAdult: { general: '0.1-1.2' },
    refPediatric: 'Variável conforme idade (neonatal pode ser elevada)',
    description: 'A bilirrubina é um produto da degradação da hemoglobina. Sua elevação causa icterícia (amarelamento da pele).',
    usedFor: 'Este exame é utilizado para investigar icterícia e avaliar doenças hepáticas e hemolíticas.',
    commonContexts: ['Icterícia', 'Hepatites', 'Doenças hemolíticas', 'Síndrome de Gilbert'],
    factors: ['Jejum prolongado pode elevar', 'Hemólise da amostra pode elevar', 'Jejum de 4h recomendado'],
    possibleAssociations: {
      elevated: ['Hepatite', 'Cirrose', 'Obstrução biliar', 'Hemólise', 'Síndrome de Gilbert'],
      decreased: ['Sem significado clínico']
    }
  },
  'Hematócrito': {
    unit: '%',
    refAdult: { male: '41-53', female: '36-46' },
    refPediatric: '32-44',
    description: 'O hematócrito representa a porcentagem do volume sanguíneo ocupada pelos glóbulos vermelhos.',
    usedFor: 'Este exame é utilizado para avaliar anemias, desidratação e policitemia.',
    commonContexts: ['Investigação de anemia', 'Avaliação de desidratação', 'Check-up de rotina'],
    factors: ['Desidratação eleva', 'Altitude influencia', 'Posição do corpo na coleta pode alterar', 'Jejum não é necessário'],
    possibleAssociations: {
      elevated: ['Desidratação', 'Policitemia', 'Doenças pulmonares crônicas', 'Alta altitude'],
      decreased: ['Anemia', 'Hemorragia', 'Hiper-hidratação', 'Gravidez']
    }
  }
};

const availableExams = Object.keys(examDatabase).sort();

export default function Exames({ embedded = false }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExams, setSelectedExams] = useState([]);
  const [examResults, setExamResults] = useState({});
  const [biologicalSex, setBiologicalSex] = useState('male');
  const [selectedExamInfo, setSelectedExamInfo] = useState(null);

  const handleAddExam = (examName) => {
    if (!selectedExams.includes(examName)) {
      setSelectedExams([...selectedExams, examName]);
    }
  };

  const handleRemoveExam = (examName) => {
    setSelectedExams(selectedExams.filter(e => e !== examName));
    const newResults = { ...examResults };
    delete newResults[examName];
    setExamResults(newResults);
  };

  const handleResultChange = (examName, value) => {
    setExamResults({
      ...examResults,
      [examName]: value
    });
  };

  const getStatus = (examName, value) => {
    if (!value) return null;
    const exam = examDatabase[examName];
    const numValue = parseFloat(value);
    
    let refRange = null;
    if (exam.refAdult.male && exam.refAdult.female) {
      refRange = biologicalSex === 'male' ? exam.refAdult.male : exam.refAdult.female;
    } else {
      refRange = exam.refAdult.general || exam.refAdult.fasting;
    }
    
    if (!refRange) return null;
    
    const [min, max] = refRange.split('-').map(v => parseFloat(v.replace(/[^\d.]/g, '')));
    
    if (numValue < min) return 'below';
    if (numValue > max) return 'above';
    return 'normal';
  };

  const filteredExams = availableExams.filter(exam => 
    exam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={embedded ? '' : 'min-h-screen bg-slate-100'}>
      {!embedded && <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />}
      
      <main className={embedded ? '' : `transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className={embedded ? '' : 'p-4 md:p-6'}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Exames Laboratoriais</h1>
                <p className="text-xs text-slate-500">Organização e valores de referência</p>
              </div>
            </div>
            <Select value={biologicalSex} onValueChange={setBiologicalSex}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Banner Ético - SEMPRE VISÍVEL */}
          <Card className="mb-4 bg-amber-50 border-amber-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <strong>Ferramenta de apoio educacional.</strong> A interpretação final depende da avaliação clínica do profissional de saúde. Este sistema organiza dados e fornece valores de referência, não realiza diagnóstico ou recomendação de conduta.
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Busca de Exames */}
            <Card className="bg-white/80 border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Adicionar Exame</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-3">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input
                    placeholder="Buscar exame..."
                    className="pl-8 h-8 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {filteredExams.map(exam => (
                    <div key={exam} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-700">{exam}</p>
                        <p className="text-[10px] text-slate-400">{examDatabase[exam].unit}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => setSelectedExamInfo(exam)}
                        >
                          <Info className="w-3 h-3 text-slate-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px]"
                          onClick={() => handleAddExam(exam)}
                          disabled={selectedExams.includes(exam)}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exames Selecionados */}
            <Card className="bg-white/80 border-slate-200 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Resultados ({selectedExams.length})</span>
                  {selectedExams.length > 0 && (
                    <Badge variant="outline" className="text-[9px]">
                      Sexo: {biologicalSex === 'male' ? 'Masculino' : 'Feminino'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedExams.length === 0 ? (
                  <div className="text-center py-12">
                    <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Nenhum exame selecionado</p>
                    <p className="text-xs text-slate-400 mt-1">Adicione exames para visualizar valores</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedExams.map(examName => {
                      const exam = examDatabase[examName];
                      const status = getStatus(examName, examResults[examName]);
                      
                      let refRange = '';
                      if (exam.refAdult.male && exam.refAdult.female) {
                        refRange = biologicalSex === 'male' ? exam.refAdult.male : exam.refAdult.female;
                      } else {
                        refRange = exam.refAdult.general || exam.refAdult.fasting;
                      }
                      
                      return (
                        <Card key={examName} className="bg-slate-50 border-slate-200">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-semibold text-slate-800">{examName}</h3>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5"
                                    onClick={() => setSelectedExamInfo(examName)}
                                  >
                                    <Info className="w-3 h-3 text-slate-400" />
                                  </Button>
                                </div>
                                <p className="text-[10px] text-slate-500">
                                  Referência: {refRange} {exam.unit}
                                </p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveExam(examName)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Resultado"
                                className="flex-1 h-8 text-sm"
                                value={examResults[examName] || ''}
                                onChange={(e) => handleResultChange(examName, e.target.value)}
                              />
                              <span className="text-xs text-slate-500 w-16">{exam.unit}</span>
                              {status && (
                                <div className="flex items-center gap-1 min-w-[120px]">
                                  {status === 'normal' && (
                                    <>
                                      <Minus className="w-4 h-4 text-green-600" />
                                      <span className="text-[10px] text-green-700 font-medium">Dentro da referência</span>
                                    </>
                                  )}
                                  {status === 'above' && (
                                    <>
                                      <ArrowUp className="w-4 h-4 text-blue-600" />
                                      <span className="text-[10px] text-blue-700 font-medium">Acima da referência</span>
                                    </>
                                  )}
                                  {status === 'below' && (
                                    <>
                                      <ArrowDown className="w-4 h-4 text-orange-600" />
                                      <span className="text-[10px] text-orange-700 font-medium">Abaixo da referência</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialog de Informações do Exame */}
      <Dialog open={!!selectedExamInfo} onOpenChange={() => setSelectedExamInfo(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedExamInfo && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  {selectedExamInfo}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 text-sm">
                {/* Descrição */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">O que é?</h4>
                  <p className="text-xs text-slate-700">{examDatabase[selectedExamInfo].description}</p>
                </div>

                <Separator />

                {/* Para que serve */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Para que serve?</h4>
                  <p className="text-xs text-slate-700">{examDatabase[selectedExamInfo].usedFor}</p>
                </div>

                <Separator />

                {/* Valores de Referência */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Valores de Referência</h4>
                  <div className="space-y-1 text-xs text-slate-700">
                    {examDatabase[selectedExamInfo].refAdult.male && examDatabase[selectedExamInfo].refAdult.female ? (
                      <>
                        <p>• Adulto masculino: {examDatabase[selectedExamInfo].refAdult.male} {examDatabase[selectedExamInfo].unit}</p>
                        <p>• Adulto feminino: {examDatabase[selectedExamInfo].refAdult.female} {examDatabase[selectedExamInfo].unit}</p>
                      </>
                    ) : (
                      <p>• Adulto: {examDatabase[selectedExamInfo].refAdult.general || examDatabase[selectedExamInfo].refAdult.fasting} {examDatabase[selectedExamInfo].unit}</p>
                    )}
                    <p>• Pediátrico: {examDatabase[selectedExamInfo].refPediatric} {examDatabase[selectedExamInfo].unit}</p>
                  </div>
                </div>

                <Separator />

                {/* Contextos Comuns */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Contextos de Solicitação</h4>
                  <ul className="space-y-0.5">
                    {examDatabase[selectedExamInfo].commonContexts.map((ctx, i) => (
                      <li key={i} className="text-xs text-slate-700">• {ctx}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Fatores que Interferem */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Fatores que Podem Alterar</h4>
                  <ul className="space-y-0.5">
                    {examDatabase[selectedExamInfo].factors.map((factor, i) => (
                      <li key={i} className="text-xs text-slate-700">• {factor}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Possíveis Associações (NÃO ordenadas) */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Possíveis Associações
                  </h4>
                  
                  {examDatabase[selectedExamInfo].possibleAssociations.elevated.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-slate-700 mb-1">Valores elevados podem estar associados a:</p>
                      <ul className="space-y-0.5 ml-2">
                        {examDatabase[selectedExamInfo].possibleAssociations.elevated.map((cause, i) => (
                          <li key={i} className="text-xs text-slate-600">• {cause}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {examDatabase[selectedExamInfo].possibleAssociations.decreased.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-700 mb-1">Valores diminuídos podem estar associados a:</p>
                      <ul className="space-y-0.5 ml-2">
                        {examDatabase[selectedExamInfo].possibleAssociations.decreased.map((cause, i) => (
                          <li key={i} className="text-xs text-slate-600">• {cause}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <p className="text-[10px] text-slate-500 mt-2 italic">
                    * Lista não ordenada. A interpretação depende do contexto clínico completo.
                  </p>
                </div>

                {/* Aviso Ético */}
                <div className="p-2 bg-amber-50 rounded border border-amber-100">
                  <p className="text-[10px] text-amber-800">
                    <strong>Informação educacional.</strong> Deve ser interpretado no contexto clínico pelo profissional de saúde.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
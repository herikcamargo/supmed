import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Download,
  Calendar,
  User,
  Pill,
  Clock,
  FileSignature,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function PrescricaoDigital() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('nova');
  
  // Estado da prescrição atual
  const [prescricao, setPrescricao] = useState({
    paciente: {
      nome: '',
      idade: '',
      sexo: ''
    },
    medicamentos: [],
    orientacoes: ''
  });

  // Estado de medicamento sendo adicionado
  const [novoMedicamento, setNovoMedicamento] = useState({
    nome: '',
    dose: '',
    via: '',
    frequencia: '',
    duracao: ''
  });

  // Estado para busca no bulário (simulado)
  const [searchBulario, setSearchBulario] = useState('');
  const [showBularioResults, setShowBularioResults] = useState(false);

  // Medicamentos simulados do bulário
  const medicamentosBulario = [
    { nome: 'Amoxicilina 500mg', dose: '500mg' },
    { nome: 'Dipirona 500mg', dose: '500mg' },
    { nome: 'Paracetamol 750mg', dose: '750mg' },
    { nome: 'Omeprazol 20mg', dose: '20mg' },
    { nome: 'Losartana 50mg', dose: '50mg' },
    { nome: 'Metformina 850mg', dose: '850mg' },
    { nome: 'Sinvastatina 20mg', dose: '20mg' },
    { nome: 'Captopril 25mg', dose: '25mg' }
  ].filter(med => 
    searchBulario.length > 2 && 
    med.nome.toLowerCase().includes(searchBulario.toLowerCase())
  );

  // Histórico simulado
  const [historico, setHistorico] = useState([
    {
      id: 1,
      data: '2025-01-15',
      paciente: 'João Silva',
      medicamentos: 2,
      status: 'Exemplo'
    },
    {
      id: 2,
      data: '2025-01-10',
      paciente: 'Maria Santos',
      medicamentos: 3,
      status: 'Exemplo'
    }
  ]);

  // Adicionar medicamento à prescrição
  const adicionarMedicamento = () => {
    if (!novoMedicamento.nome || !novoMedicamento.dose) {
      toast.error('Preencha pelo menos o medicamento e a dose');
      return;
    }

    setPrescricao({
      ...prescricao,
      medicamentos: [...prescricao.medicamentos, { ...novoMedicamento, id: Date.now() }]
    });

    setNovoMedicamento({
      nome: '',
      dose: '',
      via: '',
      frequencia: '',
      duracao: ''
    });

    toast.success('Medicamento adicionado');
  };

  // Remover medicamento
  const removerMedicamento = (id) => {
    setPrescricao({
      ...prescricao,
      medicamentos: prescricao.medicamentos.filter(m => m.id !== id)
    });
    toast.success('Medicamento removido');
  };

  // Visualizar prescrição
  const visualizarPrescricao = () => {
    if (!prescricao.paciente.nome) {
      toast.error('Preencha os dados do paciente');
      return;
    }
    if (prescricao.medicamentos.length === 0) {
      toast.error('Adicione pelo menos um medicamento');
      return;
    }
    setActiveTab('visualizar');
  };

  // Limpar prescrição
  const limparPrescricao = () => {
    setPrescricao({
      paciente: {
        nome: '',
        idade: '',
        sexo: ''
      },
      medicamentos: [],
      orientacoes: ''
    });
    setNovoMedicamento({
      nome: '',
      dose: '',
      via: '',
      frequencia: '',
      duracao: ''
    });
    toast.success('Prescrição limpa');
  };

  const storedDoctor = localStorage.getItem('supmed_doctor');
  const doctor = storedDoctor ? JSON.parse(storedDoctor) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <main className={`flex-1 transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          
          {/* Header com alerta */}
          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 border-0 mb-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-white font-semibold text-base mb-1">
                    Módulo em Desenvolvimento - Versão Conceitual
                  </h2>
                  <p className="text-amber-100 text-xs leading-relaxed">
                    Este módulo é uma <strong>demonstração funcional</strong> do fluxo de prescrição digital. 
                    As prescrições geradas aqui <strong>NÃO possuem validade jurídica</strong> e não substituem 
                    prescrições médicas reais. Uso exclusivo para fins de desenvolvimento e planejamento arquitetural.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Header principal */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Prescrição Digital</h1>
            <p className="text-sm text-slate-600">Modelo de referência para prescrição eletrônica</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
              <TabsTrigger value="nova" className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Nova Prescrição
              </TabsTrigger>
              <TabsTrigger value="visualizar" className="text-xs">
                <Eye className="w-3.5 h-3.5 mr-1" /> Visualizar
              </TabsTrigger>
              <TabsTrigger value="historico" className="text-xs">
                <Clock className="w-3.5 h-3.5 mr-1" /> Histórico
              </TabsTrigger>
            </TabsList>

            {/* NOVA PRESCRIÇÃO */}
            <TabsContent value="nova" className="space-y-4">
              
              {/* Dados do Paciente */}
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Dados do Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-600">Nome Completo *</Label>
                      <Input
                        placeholder="Nome do paciente"
                        value={prescricao.paciente.nome}
                        onChange={(e) => setPrescricao({
                          ...prescricao,
                          paciente: { ...prescricao.paciente, nome: e.target.value }
                        })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-600">Idade</Label>
                      <Input
                        placeholder="Ex: 35 anos"
                        value={prescricao.paciente.idade}
                        onChange={(e) => setPrescricao({
                          ...prescricao,
                          paciente: { ...prescricao.paciente, idade: e.target.value }
                        })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-600">Sexo</Label>
                      <Select 
                        value={prescricao.paciente.sexo}
                        onValueChange={(value) => setPrescricao({
                          ...prescricao,
                          paciente: { ...prescricao.paciente, sexo: value }
                        })}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adicionar Medicamento */}
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pill className="w-4 h-4 text-green-600" />
                    Adicionar Medicamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1.5 relative">
                      <Label className="text-xs text-slate-600 flex items-center gap-1">
                        Medicamento *
                        <Badge variant="outline" className="text-[8px] bg-blue-50 text-blue-600">
                          Integração Bulário
                        </Badge>
                      </Label>
                      <Input
                        placeholder="Digite para buscar no bulário..."
                        value={novoMedicamento.nome || searchBulario}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchBulario(value);
                          setNovoMedicamento({ ...novoMedicamento, nome: value });
                          setShowBularioResults(value.length > 2);
                        }}
                        className="h-9 text-sm"
                      />
                      {showBularioResults && medicamentosBulario.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                          {medicamentosBulario.map((med, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setNovoMedicamento({ 
                                  ...novoMedicamento, 
                                  nome: med.nome,
                                  dose: med.dose 
                                });
                                setSearchBulario('');
                                setShowBularioResults(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
                            >
                              <p className="font-medium text-slate-800">{med.nome}</p>
                              <p className="text-xs text-slate-500">Dose padrão: {med.dose}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-600">Dose *</Label>
                      <Input
                        placeholder="Ex: 500mg"
                        value={novoMedicamento.dose}
                        onChange={(e) => setNovoMedicamento({ ...novoMedicamento, dose: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-600">Via</Label>
                      <Select 
                        value={novoMedicamento.via}
                        onValueChange={(value) => setNovoMedicamento({ ...novoMedicamento, via: value })}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VO">Via Oral (VO)</SelectItem>
                          <SelectItem value="IM">Intramuscular (IM)</SelectItem>
                          <SelectItem value="IV">Intravenosa (IV)</SelectItem>
                          <SelectItem value="SC">Subcutânea (SC)</SelectItem>
                          <SelectItem value="Topica">Tópica</SelectItem>
                          <SelectItem value="Inalatoria">Inalatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-600">Frequência</Label>
                      <Input
                        placeholder="Ex: 8/8h"
                        value={novoMedicamento.frequencia}
                        onChange={(e) => setNovoMedicamento({ ...novoMedicamento, frequencia: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-600">Duração</Label>
                      <Input
                        placeholder="Ex: 7 dias"
                        value={novoMedicamento.duracao}
                        onChange={(e) => setNovoMedicamento({ ...novoMedicamento, duracao: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={adicionarMedicamento}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-9 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar à Prescrição
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de Medicamentos */}
              {prescricao.medicamentos.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Medicamentos Prescritos ({prescricao.medicamentos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {prescricao.medicamentos.map((med, idx) => (
                      <div key={med.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{idx + 1}. {med.nome}</p>
                            <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                              <p><strong>Dose:</strong> {med.dose}</p>
                              {med.via && <p><strong>Via:</strong> {med.via}</p>}
                              {med.frequencia && <p><strong>Frequência:</strong> {med.frequencia}</p>}
                              {med.duracao && <p><strong>Duração:</strong> {med.duracao}</p>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerMedicamento(med.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Orientações */}
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Orientações Adicionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Orientações gerais para o paciente..."
                    value={prescricao.orientacoes}
                    onChange={(e) => setPrescricao({ ...prescricao, orientacoes: e.target.value })}
                    className="min-h-[100px] text-sm"
                  />
                </CardContent>
              </Card>

              {/* Ações */}
              <div className="flex gap-3">
                <Button
                  onClick={visualizarPrescricao}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar Prescrição
                </Button>
                <Button
                  onClick={limparPrescricao}
                  variant="outline"
                  className="h-10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </TabsContent>

            {/* VISUALIZAR PRESCRIÇÃO */}
            <TabsContent value="visualizar">
              <Card className="bg-white border border-slate-300">
                <CardContent className="p-8">
                  
                  {/* Alerta de exemplo */}
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <p className="text-xs font-semibold text-red-800">
                        EXEMPLO DE PRESCRIÇÃO DIGITAL - SEM VALIDADE JURÍDICA
                      </p>
                    </div>
                    <p className="text-[10px] text-red-600 mt-1">
                      Este documento é apenas uma demonstração funcional e não substitui prescrição médica real.
                    </p>
                  </div>

                  {/* Cabeçalho */}
                  <div className="text-center mb-6 pb-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">PRESCRIÇÃO MÉDICA</h2>
                    <p className="text-xs text-slate-600 mt-1">Sistema SUPMED - Módulo Demonstrativo</p>
                  </div>

                  {/* Dados do Médico */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Dados do Médico</h3>
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-sm text-slate-800">
                        <strong>Nome:</strong> {doctor?.full_name || 'Dr(a). [Nome do Médico]'}
                      </p>
                      <p className="text-sm text-slate-800">
                        <strong>CRM:</strong> [Registro Profissional]
                      </p>
                      <p className="text-sm text-slate-800">
                        <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Dados do Paciente */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Dados do Paciente</h3>
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-sm text-slate-800">
                        <strong>Nome:</strong> {prescricao.paciente.nome || '[Nome do Paciente]'}
                      </p>
                      {prescricao.paciente.idade && (
                        <p className="text-sm text-slate-800">
                          <strong>Idade:</strong> {prescricao.paciente.idade}
                        </p>
                      )}
                      {prescricao.paciente.sexo && (
                        <p className="text-sm text-slate-800">
                          <strong>Sexo:</strong> {prescricao.paciente.sexo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Medicamentos */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Prescrição</h3>
                    <div className="space-y-3">
                      {prescricao.medicamentos.map((med, idx) => (
                        <div key={med.id} className="p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm font-semibold text-slate-800 mb-1">
                            {idx + 1}. {med.nome} - {med.dose}
                          </p>
                          <div className="text-xs text-slate-700 space-y-0.5">
                            {med.via && <p>Via: {med.via}</p>}
                            {med.frequencia && <p>Frequência: {med.frequencia}</p>}
                            {med.duracao && <p>Duração: {med.duracao}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Orientações */}
                  {prescricao.orientacoes && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">Orientações</h3>
                      <div className="p-3 bg-slate-50 rounded">
                        <p className="text-sm text-slate-700 whitespace-pre-line">
                          {prescricao.orientacoes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Assinatura (simulada) */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="text-center">
                      <div className="h-16 border-t-2 border-slate-400 w-64 mx-auto mb-2"></div>
                      <p className="text-sm font-semibold text-slate-800">
                        {doctor?.full_name || 'Dr(a). [Nome do Médico]'}
                      </p>
                      <p className="text-xs text-slate-600">CRM: [Registro]</p>
                      <p className="text-[10px] text-slate-500 mt-2">
                        Assinatura Digital (Simulada)
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-sm"
                      onClick={() => toast.info('Função de download será implementada na versão completa')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF (Mock)
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-sm"
                      onClick={() => setActiveTab('nova')}
                    >
                      Nova Prescrição
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* HISTÓRICO */}
            <TabsContent value="historico">
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Prescrições (Exemplo)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {historico.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.paciente}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-slate-600 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.data).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="text-xs text-slate-600 flex items-center gap-1">
                                <Pill className="w-3 h-3" />
                                {item.medicamentos} medicamentos
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Integrações Disponíveis */}
          <Card className="mt-6 bg-green-50 border border-green-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-2">
                ✓ Integrações Conceituais Demonstradas
              </h3>
              <div className="text-xs text-green-700 space-y-1">
                <p>• <strong>Bulário:</strong> Busca de medicamentos com autocomplete (simulado acima)</p>
                <p>• <strong>Plantonista:</strong> Botão "Prescrever" disponível no módulo Ações Clínicas</p>
                <p>• <strong>Histórico:</strong> Navegação entre prescrições anteriores (aba Histórico)</p>
                <p>• <strong>Dados do Médico:</strong> Carregamento automático do perfil do usuário logado</p>
              </div>
            </CardContent>
          </Card>

          {/* Info Arquitetural */}
          <Card className="mt-4 bg-blue-50 border border-blue-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <FileSignature className="w-4 h-4" />
                Roadmap para Versão Completa
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• <strong>Próximas etapas:</strong> Integração com certificado digital A1/A3 (ICP-Brasil)</p>
                <p>• <strong>Validação:</strong> Implementar verificação de doses, interações medicamentosas e contraindicações</p>
                <p>• <strong>Integração Real:</strong> API Bulário ANVISA, banco de interações, sistema de alertas clínicos</p>
                <p>• <strong>Conformidade:</strong> Atender CFM nº 2.218/2018 (Telemedicina) e RDC nº 357/2020 (Prescrição Digital)</p>
                <p>• <strong>Segurança:</strong> Implementar auditoria completa, logs e criptografia end-to-end</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
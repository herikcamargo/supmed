import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Boxes,
  Search,
  Settings,
  Eye,
  EyeOff,
  Archive,
  CheckCircle2,
  Construction,
  Calendar,
  User,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Módulos padrão do sistema
const modulosPadrao = [
  { id: 'dashboard', nome: 'Dashboard', categoria: 'plantonista', descricao: 'Visão geral do sistema' },
  { id: 'plantonista', nome: 'Ações Clínicas', categoria: 'plantonista', descricao: 'Módulo principal de ações rápidas' },
  { id: 'scores', nome: 'Calculadoras', categoria: 'plantonista', descricao: 'Calculadoras e escores clínicos' },
  { id: 'comunicacao', nome: 'Comunicação Difícil', categoria: 'plantonista', descricao: 'Guia de comunicação com pacientes' },
  { id: 'ceatox', nome: 'CEATOX', categoria: 'plantonista', descricao: 'Toxicologia e intoxicações' },
  { id: 'procedimentos', nome: 'Procedimentos', categoria: 'plantonista', descricao: 'Guia de procedimentos médicos' },
  { id: 'semiologia', nome: 'Semiologia', categoria: 'plantonista', descricao: 'Semiologia clínica' },
  
  // Submódulos do Plantonista
  { id: 'plantonista_diluicao', nome: 'Diluição de Medicamentos', categoria: 'submodulo_plantonista', descricao: 'Cálculo de diluições medicamentosas' },
  { id: 'plantonista_ecg', nome: 'ECG', categoria: 'submodulo_plantonista', descricao: 'Atlas de eletrocardiografia' },
  { id: 'plantonista_exames_imagem', nome: 'Exames de Imagem', categoria: 'submodulo_plantonista', descricao: 'Laudos e patologias radiológicas' },
  { id: 'plantonista_exames_lab', nome: 'Exames Laboratoriais', categoria: 'submodulo_plantonista', descricao: 'Interpretação de exames laboratoriais' },
  { id: 'plantonista_interacoes', nome: 'Interações Medicamentosas', categoria: 'submodulo_plantonista', descricao: 'Verificação de interações medicamentosas' },
  { id: 'plantonista_iot', nome: 'IOT (Intubação)', categoria: 'submodulo_plantonista', descricao: 'Planejamento de intubação e ventilação mecânica' },
  { id: 'plantonista_documentos', nome: 'Documentos (DO/CAT/SINAN)', categoria: 'submodulo_plantonista', descricao: 'Modelos de documentos médicos legais' },
  { id: 'plantonista_prescricao', nome: 'Prescrição', categoria: 'submodulo_plantonista', descricao: 'Modelos de prescrição' },
  { id: 'plantonista_triagem', nome: 'Triagem', categoria: 'submodulo_plantonista', descricao: 'Protocolos de triagem e classificação de risco' },
  { id: 'plantonista_modelos', nome: 'Modelos de Anamnese', categoria: 'submodulo_plantonista', descricao: 'Templates de anamnese e exame físico' },
  { id: 'plantonista_internacao', nome: 'Internação', categoria: 'submodulo_plantonista', descricao: 'Critérios de internação e alta' },
  
  { id: 'pediatria', nome: 'Pediatria', categoria: 'especialidades', descricao: 'Módulo pediátrico' },
  { id: 'ginecologia', nome: 'GO', categoria: 'especialidades', descricao: 'Ginecologia e obstetrícia' },
  { id: 'dermatologia', nome: 'Dermatologia', categoria: 'especialidades', descricao: 'Dermatologia clínica' },
  { id: 'infectologia', nome: 'Infectologia', categoria: 'especialidades', descricao: 'Doenças infecciosas' },
  { id: 'guidelines', nome: 'Guidelines & Protocolos', categoria: 'ferramentas', descricao: 'Diretrizes clínicas' },
  { id: 'bulario', nome: 'Bulário', categoria: 'ferramentas', descricao: 'Consulta de medicamentos' },
  { id: 'vacinacao', nome: 'Vacinação | PNI 2025', categoria: 'ferramentas', descricao: 'Calendário vacinal' },
  { id: 'comunidade', nome: 'Comunidade', categoria: 'ferramentas', descricao: 'Casos clínicos compartilhados' },
  { id: 'educacional', nome: 'Modo Educacional', categoria: 'ferramentas', descricao: 'Questões e flashcards' },
  { id: 'jornal', nome: 'Jornal Médico', categoria: 'ferramentas', descricao: 'Atualizações médicas semanais' },
  { id: 'configuracoes', nome: 'Configurações', categoria: 'ferramentas', descricao: 'Configurações do usuário' }
];

export default function GestaoModulos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [logDialog, setLogDialog] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  
  const queryClient = useQueryClient();

  // Buscar status dos módulos
  const { data: modulosStatus = [], isLoading } = useQuery({
    queryKey: ['modulos-status'],
    queryFn: () => base44.entities.ModuloStatus.list(),
    initialData: []
  });

  // Buscar logs
  const { data: logs = [] } = useQuery({
    queryKey: ['logs-modulos'],
    queryFn: () => base44.entities.LogModuloStatus.list('-created_date', 100),
    initialData: []
  });

  // Mutation para criar/atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ moduloId, data }) => {
      const existing = modulosStatus.find(m => m.modulo_id === moduloId);
      
      if (existing) {
        return await base44.entities.ModuloStatus.update(existing.id, data);
      } else {
        return await base44.entities.ModuloStatus.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['modulos-status']);
      toast.success('Status do módulo atualizado');
    }
  });

  // Mutation para registrar log
  const logMutation = useMutation({
    mutationFn: (logData) => base44.entities.LogModuloStatus.create(logData),
    onSuccess: () => {
      queryClient.invalidateQueries(['logs-modulos']);
    }
  });

  // Handler para mudança de status
  const handleStatusChange = async (moduloId, nomeModulo, novoStatus, statusAnterior) => {
    const user = await base44.auth.me();
    
    // Atualizar status
    await updateStatusMutation.mutateAsync({
      moduloId,
      data: {
        modulo_id: moduloId,
        nome_modulo: nomeModulo,
        status: novoStatus
      }
    });

    // Registrar log
    await logMutation.mutateAsync({
      modulo_id: moduloId,
      nome_modulo: nomeModulo,
      acao: 'status_alterado',
      status_anterior: statusAnterior || 'indefinido',
      status_novo: novoStatus,
      usuario_email: user.email,
      usuario_nome: user.full_name,
      detalhes: `Status alterado de ${statusAnterior || 'indefinido'} para ${novoStatus}`
    });
  };

  // Handler para editar módulo
  const handleEdit = (modulo) => {
    setSelectedModulo(modulo);
    setEditDialog(true);
  };

  // Handler para salvar edição
  const handleSaveEdit = async () => {
    const user = await base44.auth.me();
    
    await updateStatusMutation.mutateAsync({
      moduloId: selectedModulo.modulo_id,
      data: selectedModulo
    });

    await logMutation.mutateAsync({
      modulo_id: selectedModulo.modulo_id,
      nome_modulo: selectedModulo.nome_modulo,
      acao: 'atualizado',
      usuario_email: user.email,
      usuario_nome: user.full_name,
      detalhes: 'Informações do módulo atualizadas'
    });

    setEditDialog(false);
    setSelectedModulo(null);
  };

  // Handler para ver logs
  const handleViewLogs = (moduloId) => {
    const moduloLogs = logs.filter(log => log.modulo_id === moduloId);
    setSelectedLogs(moduloLogs);
    setLogDialog(true);
  };

  // Obter status do módulo
  const getModuloStatus = (moduloId) => {
    return modulosStatus.find(m => m.modulo_id === moduloId) || null;
  };

  // Combinar módulos padrão com status
  const modulosCombinados = modulosPadrao.map(modulo => {
    const statusData = getModuloStatus(modulo.id);
    return {
      ...modulo,
      status: statusData?.status || 'publicado', // Default: publicado
      responsavel: statusData?.responsavel || '',
      updated_date: statusData?.updated_date || null,
      statusId: statusData?.id || null
    };
  });

  // Filtrar módulos
  const modulosFiltrados = modulosCombinados.filter(modulo => {
    const matchSearch = modulo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       modulo.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || modulo.status === filterStatus;
    const matchCategoria = filterCategoria === 'all' || modulo.categoria === filterCategoria;
    return matchSearch && matchStatus && matchCategoria;
  });

  const statusConfig = {
    em_construcao: { 
      label: 'Em Construção', 
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: Construction 
    },
    publicado: { 
      label: 'Publicado', 
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: Eye 
    },
    arquivado: { 
      label: 'Arquivado', 
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: Archive 
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Boxes className="w-5 h-5 text-blue-600" />
          Gestão de Módulos
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Controle o ciclo de vida e visibilidade de todos os módulos do aplicativo
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="publicado">Publicados</SelectItem>
                <SelectItem value="em_construcao">Em Construção</SelectItem>
                <SelectItem value="arquivado">Arquivados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="plantonista">Plantonista</SelectItem>
                <SelectItem value="submodulo_plantonista">Submódulos Plantonista</SelectItem>
                <SelectItem value="especialidades">Especialidades</SelectItem>
                <SelectItem value="ferramentas">Ferramentas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Publicados</p>
                <p className="text-2xl font-bold text-green-600">
                  {modulosCombinados.filter(m => m.status === 'publicado').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Em Construção</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {modulosCombinados.filter(m => m.status === 'em_construcao').length}
                </p>
              </div>
              <Construction className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Arquivados</p>
                <p className="text-2xl font-bold text-gray-600">
                  {modulosCombinados.filter(m => m.status === 'arquivado').length}
                </p>
              </div>
              <Archive className="w-8 h-8 text-gray-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Módulos */}
      <div className="grid gap-4">
        {modulosFiltrados.map((modulo) => {
          const statusInfo = statusConfig[modulo.status];
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={modulo.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-800">{modulo.nome}</h3>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {modulo.categoria}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{modulo.descricao}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {modulo.responsavel && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {modulo.responsavel}
                        </span>
                      )}
                      {modulo.updated_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(modulo.updated_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit({
                        modulo_id: modulo.id,
                        nome_modulo: modulo.nome,
                        descricao: modulo.descricao,
                        status: modulo.status,
                        responsavel: modulo.responsavel || '',
                        categoria: modulo.categoria
                      })}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewLogs(modulo.id)}
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    <Select
                      value={modulo.status}
                      onValueChange={(value) => handleStatusChange(modulo.id, modulo.nome, value, modulo.status)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publicado">Publicar</SelectItem>
                        <SelectItem value="em_construcao">Em Construção</SelectItem>
                        <SelectItem value="arquivado">Arquivar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modulosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">Nenhum módulo encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edição */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
          </DialogHeader>
          {selectedModulo && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Módulo</label>
                <Input
                  value={selectedModulo.nome_modulo}
                  onChange={(e) => setSelectedModulo({...selectedModulo, nome_modulo: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={selectedModulo.descricao}
                  onChange={(e) => setSelectedModulo({...selectedModulo, descricao: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Responsável (email)</label>
                <Input
                  value={selectedModulo.responsavel}
                  onChange={(e) => setSelectedModulo({...selectedModulo, responsavel: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={selectedModulo.status}
                  onValueChange={(value) => setSelectedModulo({...selectedModulo, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publicado">Publicado</SelectItem>
                    <SelectItem value="em_construcao">Em Construção</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Logs */}
      <Dialog open={logDialog} onOpenChange={setLogDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de Alterações</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum log encontrado</p>
            ) : (
              selectedLogs.map((log, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-1">
                    <Badge variant="outline">{log.acao}</Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(log.created_date).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-1">{log.detalhes}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3 h-3" />
                    {log.usuario_nome || log.usuario_email}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
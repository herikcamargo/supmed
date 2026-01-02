import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../components/dashboard/Sidebar';
import SystemStats from '../components/admin/SystemStats';
import AdminLogs from '../components/admin/AdminLogs';
import ContentManagement from '../components/admin/ContentManagement';
import GlobalSettings from '../components/admin/GlobalSettings';
import GestaoPermissoes from '../components/admin/GestaoPermissoes';
import GerenciamentoIcones from '../components/admin/GerenciamentoIcones';
import GestaoModulos from '../components/admin/GestaoModulos';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { addAdminLog } from '../components/admin/AdminLogs';
import {
  Users,
  Search,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  BarChart3,
  AlertTriangle,
  Eye,
  Mail,
  Phone,
  Building,
  FileText,
  Database,
  Settings,
  Image,
  Boxes
} from 'lucide-react';

const perfisLabel = {
  medico: 'Médico',
  residente: 'Residente',
  estudante: 'Estudante',
  enfermeiro: 'Enfermeiro',
  tecnico: 'Técnico',
  fisioterapeuta: 'Fisioterapeuta',
  nutricionista: 'Nutricionista',
  gestor: 'Gestor'
};

const statusColors = {
  ativo: 'bg-green-100 text-green-700',
  bloqueado: 'bg-red-100 text-red-700'
};

export default function AdminPanel() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfissao, setFilterProfissao] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem('supmed_doctor');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  // Carregar usuários do banco Base44
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const dbUsers = await base44.entities.User.list();
      const localUsers = JSON.parse(localStorage.getItem('supmed_users_db') || '[]');
      
      // Combinar (priorizar banco)
      const allUsers = [...dbUsers];
      localUsers.forEach(lu => {
        if (!allUsers.find(u => u.email === lu.email)) {
          allUsers.push(lu);
        }
      });
      
      return allUsers.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }) => {
      await base44.entities.User.update(userId, updates);
      
      const localUsers = JSON.parse(localStorage.getItem('supmed_users_db') || '[]');
      const userIndex = localUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        localUsers[userIndex] = { ...localUsers[userIndex], ...updates };
        localStorage.setItem('supmed_users_db', JSON.stringify(localUsers));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Usuário atualizado');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      await base44.entities.User.delete(userId);
      
      const localUsers = JSON.parse(localStorage.getItem('supmed_users_db') || '[]');
      const filtered = localUsers.filter(u => u.id !== userId);
      localStorage.setItem('supmed_users_db', JSON.stringify(filtered));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('Usuário excluído');
    }
  });

  const toggleUserStatus = (user) => {
    const newStatus = user.status === 'ativo' ? 'bloqueado' : 'ativo';
    updateUserMutation.mutate({ userId: user.id, updates: { status: newStatus } });
    
    addAdminLog(
      currentUser.id,
      currentUser.full_name,
      newStatus === 'bloqueado' ? 'user_blocked' : 'user_unblocked',
      `Usuário ${user.full_name} (${user.email}) ${newStatus === 'bloqueado' ? 'bloqueado' : 'desbloqueado'}`,
      { status: user.status },
      { status: newStatus }
    );
  };

  const toggleAdminRole = (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    updateUserMutation.mutate({ userId: user.id, updates: { role: newRole } });
    
    addAdminLog(
      currentUser.id,
      currentUser.full_name,
      'user_updated',
      `Role do usuário ${user.full_name} alterado para ${newRole}`,
      { role: user.role },
      { role: newRole }
    );
  };

  const deleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (!confirm(`Deseja realmente excluir ${user.full_name}? Esta ação é irreversível.`)) return;
    
    deleteUserMutation.mutate(userId);
    
    addAdminLog(
      currentUser.id,
      currentUser.full_name,
      'user_deleted',
      `Usuário ${user.full_name} (${user.email}) excluído permanentemente`,
      user,
      null
    );
  };

  const filteredUsers = users.filter(u => {
    const nome = u.full_name || u.fullName || '';
    const matchSearch = nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProfissao = filterProfissao === 'all' || u.profissao === filterProfissao;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchProfissao && matchStatus;
  });

  const stats = {
    total: users.length,
    ativos: users.filter(u => u.status === 'ativo').length,
    bloqueados: users.filter(u => u.status === 'bloqueado').length,
    admins: users.filter(u => u.role === 'admin').length,
    porProfissao: Object.entries(
      users.reduce((acc, u) => {
        acc[u.profissao] = (acc[u.profissao] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]),
    ultimosCadastros: users.slice(-5).reverse(),
    comoConheceu: Object.entries(
      users.reduce((acc, u) => {
        if (u.comoConheceu) acc[u.comoConheceu] = (acc[u.comoConheceu] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])
  };

  // Verificar se é admin
  if (currentUser?.role !== 'admin' && currentUser?.profissao !== 'gestor') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Acesso Restrito</h2>
            <p className="text-sm text-slate-600">Apenas administradores podem acessar este painel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Painel Administrativo</h1>
              <p className="text-xs text-slate-500">Gestão completa do sistema SUPMED</p>
            </div>
          </div>

          <Tabs defaultValue="dashboard">
            <TabsList className="bg-white border border-slate-200 p-0.5 mb-4 flex-wrap h-auto">
              <TabsTrigger value="dashboard" className="text-xs h-8 gap-1">
                <BarChart3 className="w-3.5 h-3.5" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="permissoes" className="text-xs h-8 gap-1">
                <Shield className="w-3.5 h-3.5" /> Permissões
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="text-xs h-8 gap-1">
                <Users className="w-3.5 h-3.5" /> Usuários
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs h-8 gap-1">
                <FileText className="w-3.5 h-3.5" /> Auditoria
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs h-8 gap-1">
                <Database className="w-3.5 h-3.5" /> Conteúdo
              </TabsTrigger>
              <TabsTrigger value="config" className="text-xs h-8 gap-1">
                <Settings className="w-3.5 h-3.5" /> Configurações
              </TabsTrigger>
              <TabsTrigger value="icones" className="text-xs h-8 gap-1">
                <Image className="w-3.5 h-3.5" /> Ícones
              </TabsTrigger>
              <TabsTrigger value="modulos" className="text-xs h-8 gap-1">
                <Boxes className="w-3.5 h-3.5" /> Módulos
              </TabsTrigger>
            </TabsList>

            {/* DASHBOARD */}
            <TabsContent value="dashboard">
              <SystemStats />
            </TabsContent>

            {/* PERMISSÕES */}
            <TabsContent value="permissoes">
              <GestaoPermissoes currentUser={currentUser} />
            </TabsContent>

            {/* USUÁRIOS */}
            <TabsContent value="usuarios">
              {/* Filtros */}
              <Card className="bg-white border-slate-200 mb-4">
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Buscar por nome ou e-mail..."
                        className="pl-9 h-9 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterProfissao} onValueChange={setFilterProfissao}>
                      <SelectTrigger className="w-36 h-9 text-xs">
                        <SelectValue placeholder="Profissão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {Object.entries(perfisLabel).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32 h-9 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="ativo">Ativos</SelectItem>
                        <SelectItem value="bloqueado">Bloqueados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Usuários */}
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="bg-white border-slate-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                           <span className="text-sm font-medium text-slate-600">
                             {(user.full_name || user.fullName)?.charAt(0)?.toUpperCase()}
                           </span>
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                             <p className="text-sm font-medium text-slate-800">{user.full_name || user.fullName}</p>
                             {user.role === 'admin' && (
                               <Badge className="bg-violet-100 text-violet-700 text-[8px]">ADMIN</Badge>
                             )}
                           </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {user.email}
                              </span>
                              {user.celular && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {user.celular}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[9px]">
                                {perfisLabel[user.profissao]}
                              </Badge>
                              <Badge className={`text-[9px] ${statusColors[user.status]}`}>
                                {user.status}
                              </Badge>
                              {user.instituicao && (
                                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                                  <Building className="w-3 h-3" /> {user.instituicao}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => { setSelectedUser(user); setShowEditDialog(true); }}
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 ${user.status === 'ativo' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                            onClick={() => toggleUserStatus(user)}
                          >
                            {user.status === 'ativo' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-violet-500 hover:bg-violet-50"
                            onClick={() => toggleAdminRole(user)}
                            title={user.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:bg-red-50"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredUsers.length === 0 && (
                  <Card className="bg-white border-slate-200">
                    <CardContent className="p-8 text-center">
                      <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Nenhum usuário encontrado</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* LOGS */}
            <TabsContent value="logs">
              <AdminLogs />
            </TabsContent>

            {/* CONTEÚDO */}
            <TabsContent value="content">
              <ContentManagement currentUser={currentUser} />
            </TabsContent>

            {/* CONFIGURAÇÕES */}
            <TabsContent value="config">
              <GlobalSettings currentUser={currentUser} />
            </TabsContent>

            {/* ÍCONES */}
            <TabsContent value="icones">
              <GerenciamentoIcones />
            </TabsContent>

            {/* GESTÃO DE MÓDULOS */}
            <TabsContent value="modulos">
              <GestaoModulos />
            </TabsContent>
          </Tabs>

          {/* Dialog Detalhes do Usuário */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm">Detalhes do Usuário</DialogTitle>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-lg font-medium text-slate-600">
                        {(selectedUser.full_name || selectedUser.fullName)?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{selectedUser.full_name || selectedUser.fullName}</p>
                      <p className="text-xs text-slate-500">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <Label className="text-[10px] text-slate-500">Profissão</Label>
                      <p className="font-medium">{perfisLabel[selectedUser.profissao]}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Registro</Label>
                      <p className="font-medium">{selectedUser.registro || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Instituição</Label>
                      <p className="font-medium">{selectedUser.instituicao || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Celular</Label>
                      <p className="font-medium">{selectedUser.celular || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Cadastro</Label>
                      <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Último Login</Label>
                      <p className="font-medium">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Como Conheceu</Label>
                      <p className="font-medium">{selectedUser.comoConheceu || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">Status</Label>
                      <Badge className={`text-[9px] ${statusColors[selectedUser.status]}`}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
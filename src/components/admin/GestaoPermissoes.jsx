import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Search, 
  Shield, 
  Edit3, 
  PenTool, 
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  History
} from 'lucide-react';
import { toast } from 'sonner';

const PAPEIS = {
  usuario: {
    label: 'Usuário Comum',
    icon: User,
    color: 'bg-slate-100 text-slate-700',
    desc: 'Acesso apenas a conteúdo publicado'
  },
  autor: {
    label: 'Autor',
    icon: PenTool,
    color: 'bg-blue-100 text-blue-700',
    desc: 'Pode criar e editar conteúdo clínico'
  },
  corpo_clinico: {
    label: 'Conselho Clínico',
    icon: Shield,
    color: 'bg-indigo-100 text-indigo-700',
    desc: 'Pode validar, aprovar e publicar conteúdo'
  }
};

export default function GestaoPermissoes({ currentUser }) {
  const [busca, setBusca] = useState('');
  const [filtroPapel, setFiltroPapel] = useState('todos');
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [motivoAlteracao, setMotivoAlteracao] = useState('');
  const [novoPapel, setNovoPapel] = useState('');
  const queryClient = useQueryClient();

  // Buscar usuários
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios-sistema'],
    queryFn: async () => {
      const users = await base44.entities.User.list('-created_date');
      return users;
    }
  });

  // Buscar logs de alteração
  const { data: logs = [] } = useQuery({
    queryKey: ['logs-permissoes'],
    queryFn: async () => {
      return await base44.entities.LogAlteracaoPermissao.list('-created_date', 50);
    }
  });

  // Mutation para alterar papel
  const alterarPapelMutation = useMutation({
    mutationFn: async ({ usuario, papel, motivo }) => {
      // CRÍTICO: Atualizar o usuário específico, não o atual
      await base44.entities.User.update(usuario.id, {
        papel_editorial: papel
      });

      // Registrar log
      await base44.entities.LogAlteracaoPermissao.create({
        usuario_alterado_email: usuario.email,
        usuario_alterado_nome: usuario.full_name,
        admin_responsavel_email: currentUser.email,
        admin_responsavel_nome: currentUser.full_name || currentUser.fullName,
        papel_anterior: usuario.papel_editorial || 'usuario',
        papel_novo: papel,
        motivo: motivo || 'Alteração de permissão',
        data_alteracao: new Date().toISOString()
      });

      return { usuario, papel };
    },
    onSuccess: ({ usuario, papel }) => {
      queryClient.invalidateQueries(['usuarios-sistema']);
      queryClient.invalidateQueries(['logs-permissoes']);
      toast.success(`${usuario.full_name} agora é: ${PAPEIS[papel].label}`);
      setDialogAberto(false);
      setUsuarioEditando(null);
      setNovoPapel('');
      setMotivoAlteracao('');
    },
    onError: () => {
      toast.error('Erro ao alterar permissão');
    }
  });

  const abrirDialogAlteracao = (usuario) => {
    setUsuarioEditando(usuario);
    setNovoPapel(usuario.papel_editorial || 'usuario');
    setDialogAberto(true);
  };

  const confirmarAlteracao = () => {
    if (!usuarioEditando || !novoPapel) return;

    if (novoPapel === usuarioEditando.papel_editorial) {
      toast.info('Nenhuma alteração necessária');
      setDialogAberto(false);
      return;
    }

    if (!motivoAlteracao.trim()) {
      toast.error('Motivo da alteração é obrigatório');
      return;
    }

    alterarPapelMutation.mutate({
      usuario: usuarioEditando,
      papel: novoPapel,
      motivo: motivoAlteracao
    });
  };

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusca = busca === '' || 
      u.full_name?.toLowerCase().includes(busca.toLowerCase()) ||
      u.email?.toLowerCase().includes(busca.toLowerCase());
    
    const matchPapel = filtroPapel === 'todos' || u.papel_editorial === filtroPapel;
    
    return matchBusca && matchPapel;
  });

  // Estatísticas
  const stats = {
    total: usuarios.length,
    usuarios: usuarios.filter(u => !u.papel_editorial || u.papel_editorial === 'usuario').length,
    autores: usuarios.filter(u => u.papel_editorial === 'autor').length,
    corpo_clinico: usuarios.filter(u => u.papel_editorial === 'corpo_clinico').length,
    admins: usuarios.filter(u => u.role === 'admin').length
  };

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-slate-500">Usuários</p>
            <p className="text-2xl font-bold text-slate-600">{stats.usuarios}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-3">
            <p className="text-xs text-blue-600">Autores</p>
            <p className="text-2xl font-bold text-blue-700">{stats.autores}</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-200">
          <CardContent className="p-3">
            <p className="text-xs text-indigo-600">C. Clínico</p>
            <p className="text-2xl font-bold text-indigo-700">{stats.corpo_clinico}</p>
          </CardContent>
        </Card>
        <Card className="border-violet-200">
          <CardContent className="p-3">
            <p className="text-xs text-violet-600">Admins</p>
            <p className="text-2xl font-bold text-violet-700">{stats.admins}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9 h-9 text-sm"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Select value={filtroPapel} onValueChange={setFiltroPapel}>
              <SelectTrigger className="w-48 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Papéis</SelectItem>
                <SelectItem value="usuario">Usuários Comuns</SelectItem>
                <SelectItem value="autor">Autores</SelectItem>
                <SelectItem value="corpo_clinico">Conselho Clínico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            Carregando usuários...
          </CardContent>
        </Card>
      ) : usuariosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhum usuário encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {usuariosFiltrados.map((usuario) => {
            const papel = usuario.papel_editorial || 'usuario';
            const PapelConfig = PAPEIS[papel];
            const IconePapel = PapelConfig.icon;
            const isCurrentUser = usuario.email === currentUser?.email;

            return (
              <Card key={usuario.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {usuario.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-800">{usuario.full_name}</p>
                          {usuario.role === 'admin' && (
                            <Badge className="bg-violet-100 text-violet-700 text-[8px]">
                              <Shield className="w-2.5 h-2.5 mr-0.5" />
                              ADMIN
                            </Badge>
                          )}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-[8px]">
                              Você
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-500 mb-2">{usuario.email}</p>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] ${PapelConfig.color}`}>
                            <IconePapel className="w-3 h-3 mr-1" />
                            {PapelConfig.label}
                          </Badge>
                          
                          <span className="text-[9px] text-slate-400">
                            Desde {new Date(usuario.created_date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirDialogAlteracao(usuario)}
                      disabled={isCurrentUser}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      Alterar Papel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Histórico Recente */}
      {logs.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico de Alterações (Últimas 10)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-700">
                      {log.usuario_alterado_nome}
                    </span>
                    <span className="text-slate-400">
                      {new Date(log.data_alteracao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Badge variant="outline" className="text-[8px]">
                      {PAPEIS[log.papel_anterior]?.label || log.papel_anterior}
                    </Badge>
                    <span>→</span>
                    <Badge variant="outline" className="text-[8px]">
                      {PAPEIS[log.papel_novo]?.label || log.papel_novo}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Por: {log.admin_responsavel_nome}
                    {log.motivo && ` • ${log.motivo}`}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Alteração de Papel */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Alterar Papel Editorial</DialogTitle>
          </DialogHeader>
          
          {usuarioEditando && (
            <div className="space-y-4">
              {/* Usuário */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-800 mb-1">
                  {usuarioEditando.full_name}
                </p>
                <p className="text-xs text-slate-500">{usuarioEditando.email}</p>
                <div className="mt-2">
                  <Badge className={`text-[10px] ${PAPEIS[usuarioEditando.papel_editorial || 'usuario'].color}`}>
                    Papel Atual: {PAPEIS[usuarioEditando.papel_editorial || 'usuario'].label}
                  </Badge>
                </div>
              </div>

              {/* Seleção de Novo Papel */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">
                  Novo Papel *
                </label>
                <Select value={novoPapel} onValueChange={setNovoPapel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAPEIS).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <div>
                              <p className="font-medium">{config.label}</p>
                              <p className="text-[10px] text-slate-500">{config.desc}</p>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição do Papel Selecionado */}
              {novoPapel && PAPEIS[novoPapel] && (
                <div className={`p-3 rounded-lg border-2 ${
                  novoPapel === 'corpo_clinico' ? 'bg-indigo-50 border-indigo-200' :
                  novoPapel === 'autor' ? 'bg-blue-50 border-blue-200' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-xs font-semibold mb-2">
                    Permissões de {PAPEIS[novoPapel].label}:
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {novoPapel === 'usuario' && (
                      <>
                        <li>✓ Visualizar conteúdo publicado</li>
                        <li>✗ Criar conteúdo</li>
                        <li>✗ Editar conteúdo</li>
                        <li>✗ Validar conteúdo</li>
                      </>
                    )}
                    {novoPapel === 'autor' && (
                      <>
                        <li>✓ Visualizar conteúdo publicado</li>
                        <li>✓ Criar afecções, semiologias, etc.</li>
                        <li>✓ Editar conteúdo próprio (enquanto pendente)</li>
                        <li>✗ Aprovar ou publicar conteúdo</li>
                      </>
                    )}
                    {novoPapel === 'corpo_clinico' && (
                      <>
                        <li>✓ Todas as permissões de Autor</li>
                        <li>✓ Acessar painel de validação</li>
                        <li>✓ Aprovar conteúdo de outros autores</li>
                        <li>✓ Publicar conteúdo validado</li>
                        <li>✓ Solicitar ajustes ou reprovar</li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              {/* Motivo */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">
                  Motivo da Alteração *
                </label>
                <Textarea
                  placeholder="Ex: Promovido a revisor técnico, Novo integrante do conselho editorial, etc."
                  value={motivoAlteracao}
                  onChange={(e) => setMotivoAlteracao(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>

              {/* Avisos */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold mb-1">⚠️ Atenção</p>
                    <p>Esta alteração entra em vigor imediatamente e afeta o que o usuário pode ver e fazer no sistema.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarAlteracao}
              disabled={alterarPapelMutation.isPending || !motivoAlteracao.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {alterarPapelMutation.isPending ? 'Salvando...' : 'Confirmar Alteração'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
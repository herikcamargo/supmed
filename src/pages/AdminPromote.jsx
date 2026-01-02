import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Shield, CheckCircle, UserPlus, AlertTriangle, Loader2 } from 'lucide-react';

const TARGET_ADMIN_EMAIL = "tfailevestibular@gmail.com";

export default function AdminPromote() {
  const [email, setEmail] = useState(TARGET_ADMIN_EMAIL);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [existingAdmins, setExistingAdmins] = useState([]);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const users = await base44.entities.User.filter({ role: 'admin' });
      setExistingAdmins(users);
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
    }
  };

  const promoteUser = async () => {
    if (!email || !email.includes('@')) {
      toast.error('E-mail inválido');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Buscar usuário por email
      const users = await base44.entities.User.filter({ 
        email: email.toLowerCase().trim() 
      });

      if (users.length === 0) {
        // Usuário não existe - criar
        const newAdmin = await base44.entities.User.create({
          full_name: 'Administrador',
          email: email.toLowerCase().trim(),
          role: 'admin',
          profissao: 'gestor',
          status: 'ativo',
          perfilData: {
            label: 'Administrador',
            acessos: ['*'],
            descricao: 'Acesso total ao sistema'
          },
          acessos: ['*'],
          restricoes: [],
          pronoun: 'Sr.',
          settings: {
            idioma: 'pt-BR',
            tema: 'light',
            notificacoes: true
          }
        });

        // Criar senha temporária
        const tempPassword = 'Admin@' + Math.random().toString(36).slice(-6);
        const passwordHashes = JSON.parse(localStorage.getItem('supmed_password_hashes') || '{}');
        passwordHashes[newAdmin.email] = btoa(tempPassword + 'supmed_salt_2024');
        localStorage.setItem('supmed_password_hashes', JSON.stringify(passwordHashes));

        setResult({
          success: true,
          message: 'Admin criado com sucesso!',
          user: newAdmin,
          tempPassword
        });
        toast.success('Admin criado! Senha temporária gerada.');
      } else {
        // Usuário existe - promover
        const user = users[0];
        
        if (user.role === 'admin') {
          setResult({
            success: true,
            message: 'Usuário já é administrador',
            user,
            alreadyAdmin: true
          });
          toast.info('Usuário já é admin');
        } else {
          await base44.entities.User.update(user.id, {
            role: 'admin',
            perfilData: {
              label: 'Administrador',
              acessos: ['*'],
              descricao: 'Acesso total ao sistema'
            },
            acessos: ['*'],
            restricoes: []
          });

          setResult({
            success: true,
            message: 'Usuário promovido a ADMIN!',
            user: { ...user, role: 'admin' }
          });
          toast.success('Usuário promovido a ADMIN!');
        }
      }

      loadAdmins();
    } catch (error) {
      console.error('Erro:', error);
      setResult({
        success: false,
        message: error.message || 'Erro ao processar'
      });
      toast.error(error.message || 'Erro ao processar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-xl mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">Promoção a Administrador</h1>
          <p className="text-sm text-slate-500">Sistema de Promoção Segura - SUPMED</p>
        </div>

        {/* Formulário */}
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-violet-600" />
              Promover Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-slate-600">E-mail do Usuário</Label>
              <Input
                type="email"
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-sm mt-1"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Se o usuário não existir, será criado automaticamente com senha temporária
              </p>
            </div>

            <Button
              onClick={promoteUser}
              disabled={isLoading || !email}
              className="w-full h-10 bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Promover a Admin
                </>
              )}
            </Button>

            {/* Resultado */}
            {result && (
              <Card className={result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.message}
                      </p>
                      {result.user && (
                        <div className="mt-2 space-y-1 text-xs">
                          <p className="text-slate-700">
                            <strong>Nome:</strong> {result.user.full_name}
                          </p>
                          <p className="text-slate-700">
                            <strong>E-mail:</strong> {result.user.email}
                          </p>
                          <p className="text-slate-700">
                            <strong>Role:</strong> {result.user.role}
                          </p>
                          {result.tempPassword && (
                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                              <p className="text-[10px] text-amber-900 mb-1 font-semibold">
                                ⚠️ SENHA TEMPORÁRIA (copie agora):
                              </p>
                              <code className="text-xs bg-white px-2 py-1 rounded border border-amber-200 font-mono">
                                {result.tempPassword}
                              </code>
                              <p className="text-[9px] text-amber-800 mt-1">
                                Usuário deve alterar esta senha no primeiro login
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Lista de Admins Atuais */}
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Administradores Atuais</span>
              <Badge className="bg-violet-100 text-violet-700 text-[8px]">
                {existingAdmins.length} admin(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {existingAdmins.length > 0 ? (
              <div className="space-y-2">
                {existingAdmins.map((admin) => (
                  <div 
                    key={admin.id} 
                    className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100"
                  >
                    <div>
                      <p className="text-xs font-medium text-slate-800">{admin.full_name}</p>
                      <p className="text-[10px] text-slate-500">{admin.email}</p>
                    </div>
                    <Badge className="bg-violet-100 text-violet-700 text-[8px]">
                      ADMIN
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Shield className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum administrador cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avisos de Segurança */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <p><strong>Segurança:</strong></p>
                <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                  <li>Administradores têm acesso total ao sistema</li>
                  <li>Todas as ações são registradas em logs de auditoria</li>
                  <li>Senhas temporárias devem ser alteradas no primeiro acesso</li>
                  <li>Conceda permissões de admin apenas para usuários confiáveis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
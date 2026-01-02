import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Componente de Setup do Admin Inicial
 * Promove o primeiro usuário a admin com permissões editoriais
 */
export default function SetupAdmin() {
  const [setupCompleto, setSetupCompleto] = useState(false);
  const queryClient = useQueryClient();

  const promoverAdminMutation = useMutation({
    mutationFn: async () => {
      // Buscar todos os usuários ordenados por data de criação
      const todosUsuarios = await base44.entities.User.list();
      
      if (!todosUsuarios || todosUsuarios.length === 0) {
        throw new Error('Nenhum usuário encontrado no sistema');
      }

      // Ordenar por created_date (primeiro usuário = fundador)
      const usuariosOrdenados = todosUsuarios.sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      );

      const primeiroUsuario = usuariosOrdenados[0];
      
      console.log('👑 Primeiro usuário (fundador):', primeiroUsuario.email);
      console.log('📅 Criado em:', primeiroUsuario.created_date);

      // Verificar se já é admin
      if (primeiroUsuario.role === 'admin' && primeiroUsuario.papel_editorial === 'corpo_clinico') {
        return { 
          success: true, 
          message: 'Usuário fundador já possui permissões de administrador',
          usuario: primeiroUsuario,
          jaConfigurado: true
        };
      }

      // Promover a admin + corpo clínico
      await base44.entities.User.update(primeiroUsuario.id, {
        papel_editorial: 'corpo_clinico',
        acessos: ['*'],
        restricoes: []
      });

      const usuarioAtualizado = await base44.auth.updateMe({
        papel_editorial: 'corpo_clinico',
        acessos: ['*'],
        restricoes: []
      });

      console.log('✅ Usuário promovido a admin:', usuarioAtualizado);

      // Atualizar localStorage
      const currentDoctor = localStorage.getItem('supmed_doctor');
      if (currentDoctor) {
        const doctorData = JSON.parse(currentDoctor);
        doctorData.role = 'admin';
        doctorData.papel_editorial = 'corpo_clinico';
        doctorData.acessos = ['*'];
        doctorData.restricoes = [];
        localStorage.setItem('supmed_doctor', JSON.stringify(doctorData));
      }

      return { 
        success: true, 
        message: 'Usuário fundador promovido a administrador',
        usuario: usuarioAtualizado,
        jaConfigurado: false
      };
    },
    onSuccess: (data) => {
      setSetupCompleto(true);
      queryClient.invalidateQueries();
      
      if (data.jaConfigurado) {
        toast.success('✅ Sistema já configurado!');
      } else {
        toast.success('✅ Admin inicial configurado com sucesso!', {
          description: `${data.usuario.email} agora tem acesso total ao painel editorial`,
          duration: 5000
        });
      }

      // Recarregar página após 2s para aplicar permissões
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    onError: (error) => {
      console.error('❌ Erro ao promover admin:', error);
      toast.error('Erro ao configurar admin: ' + error.message);
    }
  });

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Configuração Inicial do Sistema Editorial
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed mb-3">
              O sistema detectou que você é o <strong>primeiro usuário</strong> (fundador). 
              Para ativar o sistema editorial e liberar os módulos clínicos, você precisa ser promovido a administrador.
            </p>
            <div className="bg-white/50 p-3 rounded border border-blue-200 mb-3">
              <p className="text-xs text-blue-800 mb-2">
                <strong>Permissões que você receberá:</strong>
              </p>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>✓ Acesso total ao Painel Editorial</li>
                <li>✓ Aprovar e publicar conteúdos clínicos</li>
                <li>✓ Gerenciar status de módulos</li>
                <li>✓ Acesso a todos os módulos do sistema</li>
                <li>✓ Convidar e gerenciar outros usuários</li>
              </ul>
            </div>
            <div className="bg-amber-50 p-2 rounded border border-amber-200">
              <p className="text-[10px] text-amber-800">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Todos os outros usuários permanecerão como "user" e precisarão de aprovação para acessar módulos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          {setupCompleto ? (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Setup concluído! Recarregando...</span>
            </div>
          ) : (
            <Button
              onClick={() => promoverAdminMutation.mutate()}
              disabled={promoverAdminMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {promoverAdminMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Ativar Admin e Sistema Editorial
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
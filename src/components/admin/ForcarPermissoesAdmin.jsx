import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AlertTriangle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

/**
 * Componente para forçar permissões administrativas no banco
 * Garante que role e papel_editorial sejam persistidos corretamente
 */
export default function ForcarPermissoesAdmin() {
  const [processando, setProcessando] = useState(false);

  const corrigirPermissoes = async () => {
    setProcessando(true);
    
    try {
      // 1. Buscar usuário atual do banco
      const usuarioAtual = await base44.auth.me();
      console.log('👤 Usuário atual:', usuarioAtual);

      if (!usuarioAtual || !usuarioAtual.id) {
        throw new Error('Usuário não identificado');
      }

      // 2. Forçar permissões administrativas NO BANCO
      console.log('🔧 Aplicando permissões administrativas no banco...');
      
      await base44.entities.User.update(usuarioAtual.id, {
        papel_editorial: 'corpo_clinico',
        acessos: ['*'],
        restricoes: []
      });

      console.log('✅ Permissões atualizadas no banco User');

      // 3. Atualizar sessão via auth.updateMe
      const sessaoAtualizada = await base44.auth.updateMe({
        papel_editorial: 'corpo_clinico',
        acessos: ['*'],
        restricoes: []
      });

      console.log('✅ Sessão atualizada:', sessaoAtualizada);

      // 4. Forçar atualização do localStorage
      const storedDoctor = localStorage.getItem('supmed_doctor');
      if (storedDoctor) {
        const doctorData = JSON.parse(storedDoctor);
        const novoDoctor = {
          ...doctorData,
          role: usuarioAtual.role, // Pegar role original do banco
          papel_editorial: 'corpo_clinico',
          acessos: ['*'],
          restricoes: []
        };
        localStorage.setItem('supmed_doctor', JSON.stringify(novoDoctor));
        console.log('✅ localStorage atualizado:', novoDoctor);
      }

      toast.success('✅ Permissões administrativas aplicadas com sucesso!', {
        description: 'Recarregando página...',
        duration: 3000
      });

      // 5. Recarregar para aplicar
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao corrigir permissões:', error);
      toast.error('Erro ao aplicar permissões: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <Card className="bg-red-50 border-red-300 border-2">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-900 mb-2">
              🔧 Correção de Permissões Administrativas
            </h3>
            <p className="text-xs text-red-800 leading-relaxed mb-3">
              Se você está vendo bloqueios de acesso administrativo, clique no botão abaixo para 
              <strong> forçar a correção de permissões diretamente no banco de dados</strong>.
            </p>
            <div className="bg-white/70 p-3 rounded border border-red-200 mb-3">
              <p className="text-xs text-red-900 mb-2 font-semibold">O que será feito:</p>
              <ul className="space-y-1 text-xs text-red-800">
                <li>✓ Identificar seu usuário no banco</li>
                <li>✓ Definir papel_editorial = "corpo_clinico"</li>
                <li>✓ Definir acessos = ["*"] (acesso total)</li>
                <li>✓ Atualizar sessão e localStorage</li>
                <li>✓ Recarregar aplicação</li>
              </ul>
            </div>
            <p className="text-[10px] text-red-700 mb-3">
              ⚠️ Após a correção, suas permissões virão SEMPRE do banco de dados, 
              sem fallbacks ou bloqueios automáticos.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={corrigirPermissoes}
            disabled={processando}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {processando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Aplicando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Forçar Correção Administrativa
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
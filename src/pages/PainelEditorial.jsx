import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isDemoMode, getAutoUser } from '../components/auth/DevConfig';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Save, 
  X, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Search,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import FormularioSemiologia from '../components/editorial/FormularioSemiologia';
import FormularioGenerico from '../components/editorial/FormularioGenerico';
import ImageUploader from '../components/editorial/ImageUploader';
import StatusEditorial from '../components/editorial/StatusEditorial';
import PainelValidacao from '../components/editorial/PainelValidacao';

export default function PainelEditorial() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editandoAfeccao, setEditandoAfeccao] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [tipoConteudo, setTipoConteudo] = useState('afeccao');
  const [busca, setBusca] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('todas');
  const queryClient = useQueryClient();

  const [abaAtiva, setAbaAtiva] = useState('migracao'); // 'migracao', 'minhas', 'validar' ou 'criar'

  const TIPOS_MODULO = [
    { id: 'afeccao', label: 'Afecções', entity: 'AfeccaoEditorial' },
    { id: 'semiologia', label: 'Semiologia', entity: 'Semiologia' },
    { id: 'procedimento', label: 'Procedimentos', entity: 'Procedimento' },
    { id: 'calculadora', label: 'Calculadoras', entity: 'ConteudoEditorial' },
    { id: 'escala', label: 'Escalas/Escores', entity: 'ConteudoEditorial' },
    { id: 'protocolo', label: 'Protocolos', entity: 'ConteudoEditorial' },
    { id: 'guideline', label: 'Guidelines', entity: 'ConteudoEditorial' },
    { id: 'educacional', label: 'Educacional', entity: 'ConteudoEditorial' }
  ];

  const storedUser = localStorage.getItem('supmed_doctor');
  const currentUser = isDemoMode() ? getAutoUser() : (storedUser ? JSON.parse(storedUser) : null);
  const isCorpoClinico = isDemoMode() ? true : (currentUser?.papel_editorial === 'corpo_clinico' || currentUser?.role === 'admin');
  const isAutor = isDemoMode() ? true : (currentUser?.papel_editorial === 'autor' || isCorpoClinico);

  // Função de sincronização manual
  const handleSincronizacao = async () => {
    try {
      const { 
        sincronizarCalculadoras, 
        sincronizarEscalas, 
        sincronizarProcedimentos,
        sincronizarAfeccoesPlantonista 
      } = await import('../components/editorial/SincronizacaoConteudo');
      
      toast.info('Sincronizando conteúdos...');
      
      const [calc, esc, proc, afec] = await Promise.all([
        sincronizarCalculadoras(), 
        sincronizarEscalas(), 
        sincronizarProcedimentos(),
        sincronizarAfeccoesPlantonista()
      ]);
      
      toast.success(`Sincronização concluída: ${calc.count} calculadoras, ${esc.count} escalas, ${proc.count} procedimentos, ${afec.count} afecções`);
      queryClient.invalidateQueries(['conteudo-editorial']);
    } catch (error) {
      console.error(error);
      toast.error('Erro na sincronização: ' + error.message);
    }
  };

  // Sincronização automática em background (invisível)
  React.useEffect(() => {
    const sincronizar = async () => {
      try {
        const { 
          sincronizarCalculadoras, 
          sincronizarEscalas, 
          sincronizarProcedimentos,
          sincronizarAfeccoesPlantonista 
        } = await import('../components/editorial/SincronizacaoConteudo');
        
        await Promise.all([
          sincronizarCalculadoras(), 
          sincronizarEscalas(), 
          sincronizarProcedimentos(),
          sincronizarAfeccoesPlantonista()
        ]);
      } catch (error) {
        console.log('Sincronização automática concluída');
      }
    };
    sincronizar();
  }, []);

  const { data: afeccoes = [], isLoading } = useQuery({
    queryKey: ['conteudo-editorial', tipoConteudo, abaAtiva],
    queryFn: async () => {
      console.log('🔍 Carregando conteúdos - Aba:', abaAtiva, 'Tipo:', tipoConteudo);
      
      if (abaAtiva === 'validar') {
        return [];
      }

      let todosConteudos = [];
      
      if (tipoConteudo === 'semiologia') {
        todosConteudos = await base44.entities.Semiologia.list();
      } else if (tipoConteudo === 'afeccao') {
        todosConteudos = await base44.entities.AfeccaoEditorial.list();
      } else if (tipoConteudo === 'procedimento') {
        todosConteudos = await base44.entities.Procedimento.list();
      } else {
        todosConteudos = await base44.entities.ConteudoEditorial.filter({ tipo_modulo: tipoConteudo });
      }
      
      // FILTRO POR ABA
      if (abaAtiva === 'minhas') {
        // Mostrar apenas conteúdos do usuário atual
        todosConteudos = todosConteudos.filter(c => 
          c.created_by === currentUser?.email || c.autor_id === currentUser?.email
        );
      }
      // Se abaAtiva === 'criar', mostrar tudo (sem filtro)
      
      console.log(`✅ ${todosConteudos.length} conteúdos carregados do banco`);
      return todosConteudos.sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date));
    }
  });

  const salvarMutation = useMutation({
    mutationFn: async (data) => {
      console.log('🔵🔵🔵 SALVAMENTO INICIADO - MUTATION EXECUTANDO');
      console.log('📦 Data recebida:', data);
      console.log('👤 Usuário atual:', currentUser);
      
      // VALIDAÇÃO CRÍTICA: Apenas corpo clínico pode publicar
      if (data.publicado && !isCorpoClinico) {
        throw new Error('Apenas corpo clínico pode publicar');
      }

      // Remover campos temporários - MANTER TODOS OS OUTROS CAMPOS
      const dadosLimpos = { ...data };
      delete dadosLimpos._tipo_editor;
      delete dadosLimpos._alteracoes;
      delete dadosLimpos._origem;
      delete dadosLimpos._tipo;
      
      console.log('📦 Dados limpos para persistir:', dadosLimpos);

      // SEMIOLOGIA
      if (tipoConteudo === 'semiologia' || data._tipo_editor === 'semiologia') {
        const slug = data.slug || data.nome_topico.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
        const versaoAtual = parseFloat(data.versao || '1.0');
        const novaVersao = data.id ? (versaoAtual + 0.1).toFixed(1) : '1.0';
        
        const payload = {
          ...dadosLimpos,
          slug,
          versao: novaVersao,
          editor_responsavel: currentUser.email,
          data_ultima_atualizacao: new Date().toISOString()
        };

        if (data.id) {
          console.log('🔄 ATUALIZANDO Semiologia ID:', data.id);
          const resultado = await base44.entities.Semiologia.update(data.id, payload);
          console.log('✅ Semiologia atualizada:', resultado);
          return resultado;
        }
        
        payload.status_editorial = 'pendente_revisao';
        payload.publicado = false;
        payload.autor_id = currentUser.email;
        payload.data_criacao = new Date().toISOString();
        
        console.log('➕ CRIANDO nova Semiologia');
        const resultado = await base44.entities.Semiologia.create(payload);
        console.log('✅ Semiologia criada com ID:', resultado.id);
        return resultado;
      }

      // PROCEDIMENTO
      if (tipoConteudo === 'procedimento' || data._tipo_editor === 'procedimento' || data.passos) {
        const versaoAtual = parseFloat(data.versao || '1.0');
        const novaVersao = data.id ? (versaoAtual + 0.1).toFixed(1) : '1.0';
        
        const payload = {
          ...dadosLimpos,
          versao: novaVersao,
          editor_responsavel: currentUser.email,
          data_ultima_atualizacao: new Date().toISOString()
        };

        if (data.id) {
          console.log('🔄 ATUALIZANDO Procedimento ID:', data.id);
          const resultado = await base44.entities.Procedimento.update(data.id, payload);
          console.log('✅ Procedimento atualizado:', resultado);
          return resultado;
        }
        
        payload.status_editorial = 'pendente_revisao';
        payload.publicado = false;
        payload.autor_id = currentUser.email;
        payload.data_criacao = new Date().toISOString();
        
        console.log('➕ CRIANDO novo Procedimento');
        const resultado = await base44.entities.Procedimento.create(payload);
        console.log('✅ Procedimento criado com ID:', resultado.id);
        return resultado;
      }

      // CONTEÚDO EDITORIAL GENÉRICO (calculadora, escala, protocolo)
      if (data._tipo_editor === 'generico' || data.tipo_modulo) {
        const slug = data.slug || data.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
        const versaoAtual = parseFloat(data.versao || '1.0');
        const novaVersao = data.id ? (versaoAtual + 0.1).toFixed(1) : '1.0';
        
        const payload = {
          ...dadosLimpos,
          slug,
          versao: novaVersao,
          editor_responsavel: currentUser.email,
          data_ultima_atualizacao: new Date().toISOString()
        };

        if (data.id) {
          console.log('🔄 ATUALIZANDO ConteudoEditorial ID:', data.id);
          const resultado = await base44.entities.ConteudoEditorial.update(data.id, payload);
          console.log('✅ ConteudoEditorial atualizado:', resultado);
          return resultado;
        }
        
        payload.status_editorial = 'pendente_revisao';
        payload.publicado = false;
        payload.data_criacao = new Date().toISOString();
        
        console.log('➕ CRIANDO novo ConteudoEditorial');
        const resultado = await base44.entities.ConteudoEditorial.create(payload);
        console.log('✅ ConteudoEditorial criado com ID:', resultado.id);
        return resultado;
      }

      // AFECÇÃO EDITORIAL
      console.log('📝 Processando AFECÇÃO EDITORIAL');
      const slug = data.slug || data.nome_afeccao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
      const versaoAtual = parseFloat(data.versao || '1.0');
      const novaVersao = data.id ? (versaoAtual + 0.1).toFixed(1) : '1.0';
      
      const payload = {
        ...dadosLimpos,
        slug,
        versao: novaVersao,
        editor_responsavel: currentUser?.email || 'sistema',
        data_ultima_atualizacao: new Date().toISOString()
      };

      console.log('📦 Payload preparado para AfeccaoEditorial:', payload);

      if (data.id) {
        console.log('🔄 ATUALIZANDO AfeccaoEditorial ID:', data.id);
        console.log('📤 Enviando update para banco...');
        const resultado = await base44.entities.AfeccaoEditorial.update(data.id, payload);
        console.log('✅✅✅ AfeccaoEditorial atualizada com sucesso:', resultado);
        return resultado;
      }
      
      payload.status_editorial = 'pendente_revisao';
      payload.publicado = false;
      payload.autor_id = currentUser?.email || 'sistema';
      payload.origem_conteudo = 'editorial';
      payload.data_criacao = new Date().toISOString();
      
      console.log('➕➕➕ CRIANDO nova AfeccaoEditorial no banco');
      console.log('📤 Payload final para criação:', payload);
      
      const novaAfeccao = await base44.entities.AfeccaoEditorial.create(payload);
      console.log('✅✅✅ AfeccaoEditorial criada com sucesso! ID:', novaAfeccao.id);
      console.log('📋 Objeto completo retornado:', novaAfeccao);
      return novaAfeccao;
    },
    onSuccess: (result) => {
      console.log('✅✅✅ SALVAMENTO CONCLUÍDO COM SUCESSO:', result);
      console.log('🔄 Invalidando cache e recarregando listagem...');
      queryClient.invalidateQueries(['conteudo-editorial']);
      queryClient.invalidateQueries(['validacao-corpo-clinico']);
      toast.success('✓ Conteúdo salvo e persistido no banco!', {
        duration: 5000,
        position: 'top-center'
      });
      
      setTimeout(() => {
        console.log('🔄 Fechando formulário...');
        setModoEdicao(false);
        setEditandoAfeccao(null);
      }, 500);
    },
    onError: (error) => {
      console.error('❌❌❌ ERRO CRÍTICO AO SALVAR:', error);
      console.error('Stack trace:', error.stack);
      toast.error(`❌ Erro ao salvar: ${error.message}`, {
        duration: 8000,
        position: 'top-center'
      });
    },
    onMutate: (data) => {
      console.log('⏳ MUTATION INICIANDO (onMutate):', data);
      toast.info('⏳ Salvando...', { duration: 2000 });
    }
  });

  const deletarMutation = useMutation({
    mutationFn: async (item) => {
      if (item._origem === 'legado') {
        throw new Error('Conteúdos legados não podem ser excluídos');
      }
      
      console.log('🗑️ Deletando conteúdo ID:', item.id);
      
      // Determinar entidade correta
      let resultado;
      if (item.nome_topico) {
        resultado = await base44.entities.Semiologia.delete(item.id);
      } else if (item.nome_afeccao) {
        resultado = await base44.entities.AfeccaoEditorial.delete(item.id);
      } else if (item.categoria && item.passos) {
        resultado = await base44.entities.Procedimento.delete(item.id);
      } else {
        resultado = await base44.entities.ConteudoEditorial.delete(item.id);
      }
      
      console.log('✅ Conteúdo deletado do banco');
      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['conteudo-editorial']);
      queryClient.invalidateQueries(['validacao-corpo-clinico']);
      toast.success('Conteúdo excluído do banco');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao excluir');
    }
  });

  // Verificar se o usuário está logado primeiro
  if (!currentUser && !isDemoMode()) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
          <div className="p-8">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Login Necessário</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Você precisa estar logado para acessar o painel editorial.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Bloquear acesso apenas se NÃO for autor/corpo clínico/admin E não estiver em modo demo
  if (!isDemoMode() && !isAutor && currentUser) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
          <div className="p-8">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Apenas autores e corpo clínico podem acessar o painel editorial.
                </p>
                <Button onClick={() => window.location.href = createPageUrl('Dashboard')}>
                  Voltar ao Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const iniciarNova = () => {
    console.log('➕ Iniciando novo conteúdo do tipo:', tipoConteudo);
    
    if (tipoConteudo === 'semiologia') {
      setEditandoAfeccao({
        _tipo_editor: 'semiologia',
        nome_topico: '',
        sistema_dominio: '',
        objetivo_clinico: '',
        fundamentos_fisiopatologicos: '',
        anamnese_dirigida: [],
        sinais_sintomas_relevantes: [],
        exame_fisico_passos: [],
        achados_normais: [],
        achados_patologicos: [],
        correlacao_hipoteses: [],
        erros_comuns: [],
        red_flags_semiologicas: [],
        quando_avancar_investigacao: [],
        aplicacao_pratica: '',
        afeccoes_relacionadas: [],
        referencias_utilizadas: [],
        status: 'rascunho',
        versao: '1.0'
      });
    } else if (tipoConteudo === 'afeccao') {
      setEditandoAfeccao({
        _tipo_editor: 'afeccao',
        nome_afeccao: '',
        especialidade: '',
        ambiente_uso: [],
        imagens: [],
        definicao: '',
        avaliacao_inicial: [],
        diagnostico_clinico: '',
        diagnosticos_diferenciais: [],
        exames_indicados: [],
        conduta_imediata_pa: [],
        tratamento_manejo: [],
        red_flags: [],
        criterios_internacao: [],
        contraindicacoes: [],
        medicamentos_texto_livre: '',
        escalas_associadas: [],
        calculadoras_relacionadas: [],
        scores_relacionados: [],
        procedimentos_relacionados: [],
        referencias_utilizadas: [],
        notificacao_compulsoria: false,
        status_editorial: 'pendente_revisao',
        publicado: false,
        versao: '1.0'
      });
    } else {
      setEditandoAfeccao({
        _tipo_editor: 'generico',
        titulo: '',
        tipo_modulo: tipoConteudo,
        categoria: '',
        conteudo_estruturado: {},
        referencias: [],
        tags: [],
        modulos_relacionados: [],
        status: 'rascunho',
        versao: '1.0'
      });
    }
    
    setModoEdicao(true);
    console.log('✅ Modo de edição ativado');
  };

  const handleSalvar = () => {
    console.log('💾💾💾 BOTÃO SALVAR CLICADO - INÍCIO');
    console.log('📋 Dados atuais editandoAfeccao:', editandoAfeccao);
    console.log('🔍 Tipo de editor:', editandoAfeccao?._tipo_editor);
    
    if (!editandoAfeccao) {
      console.error('❌ editandoAfeccao está null/undefined!');
      toast.error('❌ Erro: Nenhum conteúdo para salvar');
      return;
    }
    
    // Validações básicas
    if (editandoAfeccao._tipo_editor === 'afeccao') {
      console.log('✓ Validando afecção...');
      console.log('  - nome_afeccao:', editandoAfeccao.nome_afeccao);
      console.log('  - especialidade:', editandoAfeccao.especialidade);
      console.log('  - definicao:', editandoAfeccao.definicao);
      console.log('  - referencias:', editandoAfeccao.referencias_utilizadas);
      
      if (!editandoAfeccao.nome_afeccao?.trim()) {
        console.error('❌ VALIDAÇÃO FALHOU: Nome da afecção vazio');
        toast.error('❌ Preencha o nome da afecção');
        return;
      }
      if (!editandoAfeccao.especialidade) {
        console.error('❌ VALIDAÇÃO FALHOU: Especialidade não selecionada');
        toast.error('❌ Selecione a especialidade');
        return;
      }
      if (!editandoAfeccao.definicao?.trim()) {
        console.error('❌ VALIDAÇÃO FALHOU: Definição vazia');
        toast.error('❌ Preencha a definição');
        return;
      }
      if (!editandoAfeccao.referencias_utilizadas || editandoAfeccao.referencias_utilizadas.length === 0) {
        console.error('❌ VALIDAÇÃO FALHOU: Sem referências');
        toast.error('❌ Adicione pelo menos uma referência bibliográfica');
        return;
      }
      console.log('✅ Validações de afecção OK!');
    } else if (editandoAfeccao._tipo_editor === 'semiologia') {
      if (!editandoAfeccao.nome_topico?.trim()) {
        toast.error('❌ Preencha o nome do tópico');
        return;
      }
      if (!editandoAfeccao.sistema_dominio) {
        toast.error('❌ Selecione o sistema/domínio');
        return;
      }
      if (!editandoAfeccao.objetivo_clinico?.trim()) {
        toast.error('❌ Preencha o objetivo clínico');
        return;
      }
      if (!editandoAfeccao.referencias_utilizadas || editandoAfeccao.referencias_utilizadas.length === 0) {
        toast.error('❌ Adicione pelo menos uma referência bibliográfica');
        return;
      }
    } else if (editandoAfeccao._tipo_editor === 'procedimento') {
      if (!editandoAfeccao.nome?.trim()) {
        toast.error('❌ Preencha o nome do procedimento');
        return;
      }
      if (!editandoAfeccao.categoria) {
        toast.error('❌ Selecione a categoria');
        return;
      }
      if (!editandoAfeccao.fontes || editandoAfeccao.fontes.length === 0) {
        toast.error('❌ Adicione pelo menos uma fonte/referência');
        return;
      }
    } else {
      if (!editandoAfeccao.titulo?.trim()) {
        toast.error('❌ Preencha o título');
        return;
      }
      if (!editandoAfeccao.tipo_modulo) {
        toast.error('❌ Selecione o tipo de módulo');
        return;
      }
      if (!editandoAfeccao.referencias || editandoAfeccao.referencias.length === 0) {
        toast.error('❌ Adicione pelo menos uma referência bibliográfica');
        return;
      }
    }

    // VALIDAÇÃO: Apenas corpo clínico pode publicar
    if (editandoAfeccao.publicado && !isCorpoClinico) {
      console.error('❌ VALIDAÇÃO FALHOU: Usuário não pode publicar');
      toast.error('❌ Apenas o corpo clínico pode publicar conteúdo');
      return;
    }

    console.log('✅✅✅ TODAS VALIDAÇÕES OK! Disparando mutation...');
    console.log('📤 Enviando para salvarMutation:', JSON.stringify(editandoAfeccao, null, 2));
    console.log('🔍 isPending:', salvarMutation.isPending);
    console.log('🔍 isError:', salvarMutation.isError);
    
    if (salvarMutation.isPending) {
      console.warn('⚠️ Mutation já está executando, ignorando clique duplicado');
      return;
    }
    
    try {
      console.log('🚀 Chamando salvarMutation.mutate...');
      salvarMutation.mutate(editandoAfeccao);
      console.log('✅ salvarMutation.mutate() executado sem exceção');
    } catch (error) {
      console.error('❌❌❌ EXCEÇÃO ao disparar mutation:', error);
      console.error('Stack:', error.stack);
      toast.error('❌ Erro ao salvar: ' + error.message);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`flex-1 overflow-y-auto transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Painel Editorial</h1>
              <p className="text-sm text-slate-500">
                {abaAtiva === 'criar' ? 'Cadastro de conteúdo clínico' : 'Validação do corpo clínico'}
              </p>
            </div>
            <Button 
              onClick={handleSincronizacao}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              🔄 Sincronizar
            </Button>
            {(abaAtiva === 'criar' || abaAtiva === 'minhas') && (
              <div className="flex gap-2 items-center">
                <Select value={tipoConteudo} onValueChange={setTipoConteudo}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_MODULO.map(tipo => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={iniciarNova} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Conteúdo
                </Button>
              </div>
            )}
          </div>

          {/* Tabs - Migração / Minhas Publicações / Todos / Validar */}
          {!modoEdicao && (
            <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="mb-6">
              <TabsList className={`grid w-full ${isCorpoClinico ? 'max-w-3xl grid-cols-4' : 'max-w-md grid-cols-2'}`}>
                {isCorpoClinico && (
                  <TabsTrigger value="migracao">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Migração
                  </TabsTrigger>
                )}
                <TabsTrigger value="minhas">
                  <FileText className="w-4 h-4 mr-2" />
                  Minhas Publicações
                </TabsTrigger>
                {isCorpoClinico && (
                  <TabsTrigger value="criar">
                    <Edit className="w-4 h-4 mr-2" />
                    Todos os Conteúdos
                  </TabsTrigger>
                )}
                {isCorpoClinico && (
                  <TabsTrigger value="validar">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validar Conteúdo
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          )}

          {/* Busca e Filtros */}
          {!modoEdicao && (abaAtiva === 'criar' || abaAtiva === 'minhas') && (
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={`Buscar ${tipoConteudo === 'semiologia' ? 'tópico de semiologia' : 'afecção'}...`}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroEspecialidade} onValueChange={setFiltroEspecialidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Especialidades</SelectItem>
                  <SelectItem value="cardiologia">Cardiologia</SelectItem>
                  <SelectItem value="neurologia">Neurologia</SelectItem>
                  <SelectItem value="respiratorio">Respiratório</SelectItem>
                  <SelectItem value="pneumologia">Pneumologia</SelectItem>
                  <SelectItem value="infeccoes">Infecções</SelectItem>
                  <SelectItem value="gastro">Gastroenterologia</SelectItem>
                  <SelectItem value="gastroenterologia">Gastroenterologia</SelectItem>
                  <SelectItem value="trauma">Trauma</SelectItem>
                  <SelectItem value="renal_metabolico">Renal/Metabólico</SelectItem>
                  <SelectItem value="pediatria">Pediatria</SelectItem>
                  <SelectItem value="psiquiatria">Psiquiatria</SelectItem>
                  <SelectItem value="ginecologia">Ginecologia</SelectItem>
                  <SelectItem value="dermatologia">Dermatologia</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="musculoesqueletico">Musculoesquelético</SelectItem>
                  <SelectItem value="oftalmologia">Oftalmologia</SelectItem>
                  <SelectItem value="otorrinolaringologia">Otorrinolaringologia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ABA DE MIGRAÇÃO - Apenas Corpo Clínico */}
          {!modoEdicao && abaAtiva === 'migracao' && isCorpoClinico && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-slate-600">Ferramenta de migração em desenvolvimento</p>
              </CardContent>
            </Card>
          )}

          {/* ABA DE VALIDAÇÃO - Apenas Corpo Clínico */}
          {!modoEdicao && abaAtiva === 'validar' && isCorpoClinico && (
            <PainelValidacao 
              currentUser={currentUser} 
              onRetornoEdicao={() => setAbaAtiva('minhas')}
            />
          )}

          {/* Listagem */}
          {!modoEdicao && (abaAtiva === 'criar' || abaAtiva === 'minhas') && (
            <div className="space-y-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center text-slate-500">
                    Carregando...
                  </CardContent>
                </Card>
              ) : (() => {
                // FILTRO CRÍTICO: Separar por aba
                const afeccoesFiltradas = afeccoes.filter(afeccao => {
                  const nomeMatch = busca === '' || 
                    (afeccao.nome_afeccao?.toLowerCase().includes(busca.toLowerCase())) ||
                    (afeccao.nome_topico?.toLowerCase().includes(busca.toLowerCase())) ||
                    (afeccao.titulo?.toLowerCase().includes(busca.toLowerCase()));
                  
                  const especialidadeMatch = filtroEspecialidade === 'todas' || 
                    afeccao.especialidade === filtroEspecialidade ||
                    afeccao.sistema_dominio === filtroEspecialidade ||
                    afeccao.categoria === filtroEspecialidade;
                  
                  return nomeMatch && especialidadeMatch;
                });

                if (afeccoesFiltradas.length === 0) {
                  return (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Nenhum conteúdo encontrado com esses filtros.</p>
                      </CardContent>
                    </Card>
                  );
                }

                // Agrupar por especialidade/sistema
                const agrupados = afeccoesFiltradas.reduce((acc, afeccao) => {
                  const chave = afeccao.especialidade || afeccao.sistema_dominio || 'geral';
                  if (!acc[chave]) acc[chave] = [];
                  acc[chave].push(afeccao);
                  return acc;
                }, {});

                return Object.entries(agrupados).map(([especialidade, itens]) => (
                  <div key={especialidade} className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-600 uppercase mb-3 px-2">
                      {especialidade.replace(/_/g, ' ')} ({itens.length})
                    </h3>
                    <div className="space-y-2">
                      {itens.map((afeccao) => (
                  <Card key={afeccao.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-slate-800">
                              {afeccao.nome_afeccao || afeccao.nome_topico || afeccao.titulo}
                            </h3>
                            <StatusEditorial 
                              status={afeccao.status_editorial || 'pendente_revisao'} 
                              publicado={afeccao.publicado}
                              size="sm"
                            />
                            {afeccao._origem === 'legado' && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                Legado
                              </Badge>
                            )}
                            {afeccao.notificacao_compulsoria && (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Not. Compulsória
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              v{afeccao.versao || '1.0'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <span className="capitalize">
                              {(afeccao.especialidade || afeccao.sistema_dominio || afeccao.categoria || 'geral').replace(/_/g, ' ')}
                            </span>
                            <span>•</span>
                            <span>{new Date(afeccao.updated_date || afeccao.created_date).toLocaleDateString('pt-BR')}</span>
                            {afeccao.autor_id && (
                              <>
                                <span>•</span>
                                <span>Por: {afeccao.autor_id}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {afeccao.definicao || afeccao.objetivo_clinico || 'Sem descrição'}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => {
                             // Determinar tipo de editor
                             let tipoEditor = 'generico';
                             if (afeccao.nome_topico || afeccao.sistema_dominio) {
                               tipoEditor = 'semiologia';
                             } else if (afeccao.nome_afeccao || afeccao.especialidade) {
                               tipoEditor = 'afeccao';
                             } else if (afeccao.tipo_modulo) {
                               tipoEditor = 'generico';
                             }

                             // Verificar permissão para editar
                             const podeEditar = 
                               isCorpoClinico || 
                               afeccao.created_by === currentUser?.email || 
                               afeccao.autor_id === currentUser?.email;

                             const statusPermiteEdicao = 
                               afeccao.status_editorial === 'pendente_revisao' || 
                               afeccao.status_editorial === 'ajustes_solicitados' ||
                               isCorpoClinico;

                             if (!podeEditar) {
                               toast.error('Você não pode editar este conteúdo');
                               return;
                             }

                             if (!statusPermiteEdicao) {
                               toast.error('Este conteúdo não pode ser editado no estado atual');
                               return;
                             }

                             setEditandoAfeccao({ ...afeccao, _tipo_editor: tipoEditor });
                             setModoEdicao(true);
                           }}
                          >
                           <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {!afeccao._origem && isCorpoClinico && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (confirm('Deseja realmente excluir?')) {
                                  deletarMutation.mutate(afeccao);
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Formulário de Edição */}
          {modoEdicao && editandoAfeccao && (
            <div>
              {editandoAfeccao._tipo_editor === 'semiologia' ? (
                <FormularioSemiologia 
                  topico={editandoAfeccao}
                  onChange={setEditandoAfeccao}
                  onSalvar={handleSalvar}
                  onCancelar={() => {
                    console.log('❌ Cancelando edição');
                    setModoEdicao(false);
                    setEditandoAfeccao(null);
                  }}
                  salvando={salvarMutation.isPending}
                />
              ) : editandoAfeccao._tipo_editor === 'afeccao' ? (
                <FormularioAfeccao 
                  afeccao={editandoAfeccao}
                  onChange={setEditandoAfeccao}
                  onSalvar={handleSalvar}
                  onCancelar={() => {
                    console.log('❌ Cancelando edição');
                    setModoEdicao(false);
                    setEditandoAfeccao(null);
                  }}
                  salvando={salvarMutation.isPending}
                />
              ) : (
                <FormularioGenerico
                  conteudo={editandoAfeccao}
                  onChange={setEditandoAfeccao}
                  onSalvar={handleSalvar}
                  onCancelar={() => {
                    console.log('❌ Cancelando edição');
                    setModoEdicao(false);
                    setEditandoAfeccao(null);
                  }}
                  salvando={salvarMutation.isPending}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FormularioAfeccao({ afeccao, onChange, onSalvar, onCancelar, salvando }) {
  const storedUser = localStorage.getItem('supmed_doctor');
  const currentUser = isDemoMode() ? getAutoUser() : (storedUser ? JSON.parse(storedUser) : null);
  const isCorpoClinico = isDemoMode() ? true : (currentUser?.papel_editorial === 'corpo_clinico' || currentUser?.role === 'admin');
  const isAutor = isDemoMode() ? true : (currentUser?.papel_editorial === 'autor');

  const updateField = (field, value) => {
    onChange({ ...afeccao, [field]: value });
  };

  const addArrayItem = (field, item) => {
    if (!item.trim()) return;
    onChange({ ...afeccao, [field]: [...(afeccao[field] || []), item] });
  };

  const removeArrayItem = (field, index) => {
    onChange({ ...afeccao, [field]: afeccao[field].filter((_, i) => i !== index) });
  };



  const addReferencia = () => {
    onChange({ 
      ...afeccao, 
      referencias_utilizadas: [...(afeccao.referencias_utilizadas || []), { tipo: 'diretriz', referencia_completa: '' }] 
    });
  };

  const updateReferencia = (index, field, value) => {
    const novasRefs = [...afeccao.referencias_utilizadas];
    novasRefs[index][field] = value;
    onChange({ ...afeccao, referencias_utilizadas: novasRefs });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {afeccao.id ? 'Editar Afecção' : 'Nova Afecção'}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancelar} disabled={salvando}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                console.log('🖱️ CLIQUE NO BOTÃO SALVAR DETECTADO');
                onSalvar();
              }} 
              disabled={salvando} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações Básicas */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Nome da Afecção *</label>
            <Input 
              value={afeccao.nome_afeccao}
              onChange={(e) => updateField('nome_afeccao', e.target.value)}
              placeholder="Ex: Infarto Agudo do Miocárdio"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Especialidade *</label>
            <Select value={afeccao.especialidade} onValueChange={(v) => updateField('especialidade', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardiologia">Cardiologia</SelectItem>
                <SelectItem value="neurologia">Neurologia</SelectItem>
                <SelectItem value="respiratorio">Respiratório</SelectItem>
                <SelectItem value="infeccoes">Infecções</SelectItem>
                <SelectItem value="gastro">Gastroenterologia</SelectItem>
                <SelectItem value="trauma">Trauma</SelectItem>
                <SelectItem value="renal_metabolico">Renal/Metabólico</SelectItem>
                <SelectItem value="pediatria">Pediatria</SelectItem>
                <SelectItem value="psiquiatria">Psiquiatria</SelectItem>
                <SelectItem value="ginecologia">Ginecologia</SelectItem>
                <SelectItem value="dermatologia">Dermatologia</SelectItem>
                <SelectItem value="geral">Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Informações do Fluxo Editorial */}
        <div className={`border-2 rounded-lg p-4 ${
          isCorpoClinico 
            ? 'border-indigo-200 bg-indigo-50/30'
            : 'border-blue-200 bg-blue-50/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className={`w-4 h-4 ${isCorpoClinico ? 'text-indigo-700' : 'text-blue-700'}`} />
            <h3 className={`text-sm font-semibold ${isCorpoClinico ? 'text-indigo-900' : 'text-blue-900'}`}>
              {isCorpoClinico ? 'Informações do Conteúdo' : 'Fluxo Editorial'}
            </h3>
          </div>
          <div className={`space-y-2 text-xs ${isCorpoClinico ? 'text-indigo-800' : 'text-blue-800'}`}>
            {!isCorpoClinico ? (
              <>
                <p>✓ Seu conteúdo será criado com status: <strong>Pendente de Revisão</strong></p>
                <p>✓ O corpo clínico analisará e poderá: aprovar, solicitar ajustes ou reprovar</p>
                <p>✓ Somente após aprovação o conteúdo ficará visível para usuários finais</p>
              </>
            ) : (
              <>
                <p>Autor: <strong>{afeccao.autor_id || afeccao.created_by || 'Sistema'}</strong></p>
                <p>Criado: <strong>{afeccao.created_date ? new Date(afeccao.created_date).toLocaleDateString('pt-BR') : 'N/A'}</strong></p>
                {afeccao.revisor_id && (
                  <p>Revisor: <strong>{afeccao.revisor_id}</strong></p>
                )}
              </>
            )}
          </div>
          <div className="mt-2">
            <StatusEditorial 
              status={afeccao.status_editorial || 'pendente_revisao'} 
              publicado={afeccao.publicado}
              size="default"
            />
          </div>
        </div>

        {/* Versão */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Versão</label>
            <Input value={afeccao.versao || '1.0'} disabled className="bg-slate-50" />
          </div>
        </div>

        {afeccao.historico_versoes?.length > 0 && (
          <div className="bg-slate-50 p-3 rounded-lg">
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Histórico de Versões</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {afeccao.historico_versoes.map((h, i) => (
                <div key={i} className="text-xs text-slate-600 flex gap-2">
                  <span className="font-medium">v{h.versao}</span>
                  <span className="text-slate-400">•</span>
                  <span>{new Date(h.data).toLocaleDateString('pt-BR')}</span>
                  <span className="text-slate-400">•</span>
                  <span className="flex-1">{h.alteracoes}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload de Imagens */}
        <ImageUploader 
          imagens={afeccao.imagens || []} 
          onChange={(imgs) => updateField('imagens', imgs)} 
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Definição *</label>
          <Textarea 
            value={afeccao.definicao}
            onChange={(e) => updateField('definicao', e.target.value)}
            rows={3}
            placeholder="Definição clínica objetiva da afecção"
          />
        </div>

        <ArrayField 
          label="Avaliação Inicial"
          items={afeccao.avaliacao_inicial}
          onAdd={(item) => addArrayItem('avaliacao_inicial', item)}
          onRemove={(i) => removeArrayItem('avaliacao_inicial', i)}
          placeholder="Ex: Verificar sinais vitais, história de DM/HAS"
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Diagnóstico Clínico</label>
          <Textarea 
            value={afeccao.diagnostico_clinico}
            onChange={(e) => updateField('diagnostico_clinico', e.target.value)}
            rows={2}
            placeholder="Abordagem diagnóstica"
          />
        </div>

        <ArrayField 
          label="Diagnósticos Diferenciais"
          items={afeccao.diagnosticos_diferenciais}
          onAdd={(item) => addArrayItem('diagnosticos_diferenciais', item)}
          onRemove={(i) => removeArrayItem('diagnosticos_diferenciais', i)}
          placeholder="Ex: Pericardite, TEP, Pneumonia"
        />

        <ArrayField 
          label="Exames Indicados"
          items={afeccao.exames_indicados}
          onAdd={(item) => addArrayItem('exames_indicados', item)}
          onRemove={(i) => removeArrayItem('exames_indicados', i)}
          placeholder="Ex: ECG 12 derivações, Troponina"
        />

        <ArrayField 
          label="Conduta Imediata no PA *"
          items={afeccao.conduta_imediata_pa}
          onAdd={(item) => addArrayItem('conduta_imediata_pa', item)}
          onRemove={(i) => removeArrayItem('conduta_imediata_pa', i)}
          placeholder="Ex: AAS 200mg VO, Monitorização contínua"
        />

        <ArrayField 
          label="Tratamento / Manejo"
          items={afeccao.tratamento_manejo}
          onAdd={(item) => addArrayItem('tratamento_manejo', item)}
          onRemove={(i) => removeArrayItem('tratamento_manejo', i)}
          placeholder="Ex: Beta-bloqueador após estabilização"
        />

        <ArrayField 
          label="Red Flags *"
          items={afeccao.red_flags}
          onAdd={(item) => addArrayItem('red_flags', item)}
          onRemove={(i) => removeArrayItem('red_flags', i)}
          placeholder="Ex: Dor torácica com dispneia súbita"
          highlight
        />

        <ArrayField 
          label="Critérios de Internação"
          items={afeccao.criterios_internacao}
          onAdd={(item) => addArrayItem('criterios_internacao', item)}
          onRemove={(i) => removeArrayItem('criterios_internacao', i)}
          placeholder="Ex: TIMI > 2, troponina elevada"
        />

        <ArrayField 
          label="Contraindicações"
          items={afeccao.contraindicacoes}
          onAdd={(item) => addArrayItem('contraindicacoes', item)}
          onRemove={(i) => removeArrayItem('contraindicacoes', i)}
          placeholder="Ex: Não usar AINEs em SCA"
        />

        {/* Medicações - TEXTO LIVRE */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">
            Medicações de Referência (Educacional)
          </label>
          <Textarea
            placeholder="Descreva as medicações de referência, doses educacionais, observações clínicas, etc.&#10;&#10;Exemplo:&#10;• AAS 200mg VO dose única&#10;• Clopidogrel 300mg VO ataque, depois 75mg/dia&#10;• Atenolol 50-100mg/dia (ajustar pela FC)&#10;&#10;⚠️ Conteúdo educacional, não substitui prescrição individualizada"
            value={afeccao.medicamentos_texto_livre || ''}
            onChange={(e) => updateField('medicamentos_texto_livre', e.target.value)}
            rows={8}
            className="text-sm font-mono"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Campo livre para descrever medicamentos, classes, doses de referência e observações clínicas.
          </p>
        </div>

        <ArrayField 
          label="Escalas Clínicas Associadas"
          items={afeccao.escalas_associadas}
          onAdd={(item) => addArrayItem('escalas_associadas', item)}
          onRemove={(i) => removeArrayItem('escalas_associadas', i)}
          placeholder="Ex: GRACE, TIMI"
        />

        {/* Integrações Clínicas */}
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Integrações Clínicas
          </h3>
          
          <ArrayField 
            label="Calculadoras Relacionadas"
            items={afeccao.calculadoras_relacionadas || []}
            onAdd={(item) => addArrayItem('calculadoras_relacionadas', item)}
            onRemove={(i) => removeArrayItem('calculadoras_relacionadas', i)}
            placeholder="ID da calculadora (ex: clearance-creatinina)"
          />

          <div className="mt-3">
            <ArrayField 
              label="Scores Clínicos Relacionados"
              items={afeccao.scores_relacionados || []}
              onAdd={(item) => addArrayItem('scores_relacionados', item)}
              onRemove={(i) => removeArrayItem('scores_relacionados', i)}
              placeholder="ID do score (ex: grace, timi, sofa)"
            />
          </div>

          <div className="mt-3">
            <ArrayField 
              label="Procedimentos Relacionados"
              items={afeccao.procedimentos_relacionados || []}
              onAdd={(item) => addArrayItem('procedimentos_relacionados', item)}
              onRemove={(i) => removeArrayItem('procedimentos_relacionados', i)}
              placeholder="ID do procedimento (ex: intubacao-orotraqueal)"
            />
          </div>

          <p className="text-[10px] text-blue-700 mt-2 bg-blue-100 p-2 rounded">
            ℹ️ Essas integrações criarão botões "Calcular Score" e "Ver Procedimento" na visualização da afecção
          </p>
        </div>

        {/* Notificação Compulsória */}
        <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50/30">
          <label className="text-xs font-semibold text-slate-700 mb-2 block">
            Doença de Notificação Compulsória (SINAN)?
          </label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={afeccao.notificacao_compulsoria === true}
                onChange={() => updateField('notificacao_compulsoria', true)}
                className="w-4 h-4"
              />
              <span className="text-sm">Sim</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!afeccao.notificacao_compulsoria}
                onChange={() => updateField('notificacao_compulsoria', false)}
                className="w-4 h-4"
              />
              <span className="text-sm">Não</span>
            </label>
          </div>

          {afeccao.notificacao_compulsoria && (
            <Textarea
              placeholder="Orientações sobre a notificação (opcional)"
              value={afeccao.orientacoes_notificacao || ''}
              onChange={(e) => updateField('orientacoes_notificacao', e.target.value)}
              rows={2}
              className="text-sm"
            />
          )}
        </div>

        {/* Referências Bibliográficas - OBRIGATÓRIO */}
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <label className="text-sm font-semibold text-blue-900">
                Referências Bibliográficas * (OBRIGATÓRIO)
              </label>
            </div>
            <Button variant="outline" size="sm" onClick={addReferencia} className="border-blue-300">
              <Plus className="w-3 h-3 mr-1" /> Adicionar Referência
            </Button>
          </div>

          {(!afeccao.referencias_utilizadas || afeccao.referencias_utilizadas.length === 0) && (
            <div className="bg-red-50 border border-red-200 p-3 rounded mb-2">
              <p className="text-xs text-red-800">
                ⚠️ <strong>Atenção:</strong> É obrigatório adicionar pelo menos uma referência científica. 
                Não é possível salvar conteúdo clínico sem fonte bibliográfica.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {afeccao.referencias_utilizadas?.map((ref, i) => (
              <div key={i} className="flex gap-2 p-3 bg-white border border-blue-200 rounded-lg">
                <Select value={ref.tipo} onValueChange={(v) => updateReferencia(i, 'tipo', v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diretriz">Diretriz</SelectItem>
                    <SelectItem value="livro">Livro</SelectItem>
                    <SelectItem value="artigo">Artigo</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Ex: AUTOR. Título. Edição. Local: Editora, Ano."
                  value={ref.referencia_completa}
                  onChange={(e) => updateReferencia(i, 'referencia_completa', e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeArrayItem('referencias_utilizadas', i)}
                  className="hover:bg-red-50"
                >
                  <X className="w-3 h-3 text-red-600" />
                </Button>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-blue-700 mt-2">
            ℹ️ Formato ABNT. Ex: KASPER, D. L. Harrison's Principles of Internal Medicine. 20th ed. New York: McGraw-Hill, 2018.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> {afeccao.disclaimer || "Conteúdo educacional. Não substitui julgamento clínico individual nem prescrição médica."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ArrayField({ label, items = [], onAdd, onRemove, placeholder, highlight }) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    onAdd(inputValue);
    setInputValue('');
  };

  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 mb-1 block">{label}</label>
      <div className="flex gap-2 mb-2">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="text-sm"
        />
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div 
            key={i} 
            className={`flex items-start gap-2 p-2 rounded text-sm ${
              highlight ? 'bg-red-50 border border-red-100' : 'bg-slate-50'
            }`}
          >
            <span className="flex-1 text-slate-700">• {item}</span>
            <Button variant="ghost" size="sm" onClick={() => onRemove(i)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon, Check, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const MODULOS_DISPONIVEIS = [
  // Logo e Branding
  { id: 'logo', nome: '🎨 Logo do Aplicativo', tipo: 'sistema' },
  
  // Módulos principais
  { id: 'dashboard', nome: 'Dashboard', tipo: 'modulo' },
  { id: 'plantonista', nome: 'Ações Clínicas', tipo: 'modulo' },
  { id: 'calculadoras', nome: 'Calculadoras', tipo: 'modulo' },
  { id: 'scores', nome: 'Scores/Escalas', tipo: 'modulo' },
  { id: 'comunicacao', nome: 'Comunicação Difícil', tipo: 'modulo' },
  { id: 'ceatox', nome: 'CEATOX', tipo: 'modulo' },
  { id: 'procedimentos', nome: 'Procedimentos', tipo: 'modulo' },
  { id: 'semiologia', nome: 'Semiologia', tipo: 'modulo' },
  { id: 'prescricao-digital', nome: 'Prescrição Digital', tipo: 'modulo' },
  { id: 'pediatria', nome: 'Pediatria', tipo: 'modulo' },
  { id: 'ginecologia', nome: 'Ginecologia', tipo: 'modulo' },
  { id: 'dermatologia', nome: 'Dermatologia', tipo: 'modulo' },
  { id: 'infectologia', nome: 'Infectologia', tipo: 'modulo' },
  { id: 'guidelines', nome: 'Guidelines', tipo: 'modulo' },
  { id: 'protocolos', nome: 'Protocolos', tipo: 'modulo' },
  { id: 'bulario', nome: 'Bulário', tipo: 'modulo' },
  { id: 'vacinacao', nome: 'Vacinação | PNI 2025', tipo: 'modulo' },
  { id: 'comunidade', nome: 'Comunidade', tipo: 'modulo' },
  { id: 'educacional', nome: 'Modo Educacional', tipo: 'modulo' },
  { id: 'jornal', nome: 'Jornal Médico', tipo: 'modulo' },
  { id: 'configuracoes', nome: 'Configurações', tipo: 'modulo' },
  { id: 'admin', nome: 'Admin Panel', tipo: 'modulo' },
  { id: 'editorial', nome: 'Painel Editorial', tipo: 'modulo' },
  
  // Níveis de Atenção
  { id: 'atencao-primaria', nome: '🏥 Atenção Primária', tipo: 'atencao' },
  { id: 'atencao-secundaria', nome: '🏥 Atenção Secundária', tipo: 'atencao' },
  { id: 'atencao-terciaria', nome: '🏥 Atenção Terciária', tipo: 'atencao' },
  { id: 'atencao-academico', nome: '🏥 Acadêmico', tipo: 'atencao' },
  
  // Sub-abas do módulo Ações Clínicas (Plantonista)
  { id: 'pesquisa', nome: '↳ Pesquisa Clínica', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'modelos', nome: '↳ Modelos de Anamnese', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'documentos', nome: '↳ Documentos Oficiais', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'prescricao', nome: '↳ Prescrição Médica', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'interacoes', nome: '↳ Interações Medicamentosas', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'iot', nome: '↳ Intubação Orotraqueal', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'diluicao', nome: '↳ Diluição de Drogas', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'exames-lab', nome: '↳ Exames Laboratoriais', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'internacao', nome: '↳ Internação / FAST-HUG', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'exames-imagem', nome: '↳ Exames de Imagem', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'ecg', nome: '↳ Eletrocardiograma', tipo: 'aba', modulo_pai: 'plantonista' },
  { id: 'triagem', nome: '↳ Triagem e Classificação', tipo: 'aba', modulo_pai: 'plantonista' },
  
  // Sub-abas de Procedimentos (por categoria)
  { id: 'proc-via-aerea', nome: '↳ Proc - Via Aérea', tipo: 'aba', modulo_pai: 'procedimentos' },
  { id: 'proc-acesso-vascular', nome: '↳ Proc - Acesso Vascular', tipo: 'aba', modulo_pai: 'procedimentos' },
  { id: 'proc-cardiovascular', nome: '↳ Proc - Cardiovascular', tipo: 'aba', modulo_pai: 'procedimentos' },
  { id: 'proc-toracico', nome: '↳ Proc - Torácico', tipo: 'aba', modulo_pai: 'procedimentos' },
  { id: 'proc-neurologico', nome: '↳ Proc - Neurológico', tipo: 'aba', modulo_pai: 'procedimentos' },
  { id: 'proc-abdominal', nome: '↳ Proc - Abdominal', tipo: 'aba', modulo_pai: 'procedimentos' },
  { id: 'proc-urologico', nome: '↳ Proc - Urológico', tipo: 'aba', modulo_pai: 'procedimentos' },
  { id: 'proc-trauma', nome: '↳ Proc - Trauma', tipo: 'aba', modulo_pai: 'procedimentos' },
  { id: 'proc-infecto-choque', nome: '↳ Proc - Infecto/Choque', tipo: 'aba', modulo_pai: 'procedimentos' },
  { id: 'proc-outros', nome: '↳ Proc - Outros', tipo: 'aba', modulo_pai: 'procedimentos' },
  
  // Sub-abas de Semiologia (por sistema)
  { id: 'semio-cardiologia', nome: '↳ Semio - Cardiologia', tipo: 'aba', modulo_pai: 'semiologia' },
  { id: 'semio-pneumologia', nome: '↳ Semio - Pneumologia', tipo: 'aba', modulo_pai: 'semiologia' },
  { id: 'semio-neurologia', nome: '↳ Semio - Neurologia', tipo: 'aba', modulo_pai: 'semiologia' },
  { id: 'semio-gastro', nome: '↳ Semio - Gastroenterologia', tipo: 'aba', modulo_pai: 'semiologia' },
  { id: 'semio-ortopedia', nome: '↳ Semio - Ortopedia', tipo: 'aba', modulo_pai: 'semiologia' },
  { id: 'semio-oftalmologia', nome: '↳ Semio - Oftalmologia', tipo: 'aba', modulo_pai: 'semiologia' },
  { id: 'semio-otorrino', nome: '↳ Semio - Otorrinolaringologia', tipo: 'aba', modulo_pai: 'semiologia' },
  { id: 'semio-geral', nome: '↳ Semio - Exame Físico Geral', tipo: 'aba', modulo_pai: 'semiologia' },
  
  // Sub-abas de Calculadoras
  { id: 'calc-cardiovascular', nome: '↳ Calc - Cardiovascular', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-renal', nome: '↳ Calc - Renal', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-neurologico', nome: '↳ Calc - Neurológico', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-respiratorio', nome: '↳ Calc - Respiratório', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-gastro', nome: '↳ Calc - Gastro/Hepato', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-trauma', nome: '↳ Calc - Trauma', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-infectologia', nome: '↳ Calc - Infectologia', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-hematologia', nome: '↳ Calc - Hematologia', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-obstetrica', nome: '↳ Calc - Obstétrica', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-pediatria', nome: '↳ Calc - Pediatria', tipo: 'aba', modulo_pai: 'calculadoras' },
  { id: 'calc-outros', nome: '↳ Calc - Outros', tipo: 'aba', modulo_pai: 'calculadoras' },
  
  // Sub-abas de CEATOX
  { id: 'ceatox-medicamentos', nome: '↳ CEATOX - Medicamentos', tipo: 'aba', modulo_pai: 'ceatox' },
  { id: 'ceatox-animais', nome: '↳ CEATOX - Animais Peçonhentos', tipo: 'aba', modulo_pai: 'ceatox' },
  { id: 'ceatox-plantas', nome: '↳ CEATOX - Plantas Tóxicas', tipo: 'aba', modulo_pai: 'ceatox' },
  { id: 'ceatox-quimicos', nome: '↳ CEATOX - Produtos Químicos', tipo: 'aba', modulo_pai: 'ceatox' },
  { id: 'ceatox-drogas', nome: '↳ CEATOX - Drogas Alucinógenas', tipo: 'aba', modulo_pai: 'ceatox' },
  { id: 'ceatox-sindromes', nome: '↳ CEATOX - Síndromes Toxicológicas', tipo: 'aba', modulo_pai: 'ceatox' },
  
  // Sub-abas de Exames de Imagem
  { id: 'imagem-rx', nome: '↳ Imagem - RX Tórax', tipo: 'aba', modulo_pai: 'exames-imagem' },
  { id: 'imagem-tc', nome: '↳ Imagem - TC', tipo: 'aba', modulo_pai: 'exames-imagem' },
  { id: 'imagem-usg', nome: '↳ Imagem - USG', tipo: 'aba', modulo_pai: 'exames-imagem' },
  { id: 'imagem-rm', nome: '↳ Imagem - RM', tipo: 'aba', modulo_pai: 'exames-imagem' },
  
  // Sub-abas de Exames Laboratoriais
  { id: 'lab-hematologia', nome: '↳ Lab - Hematologia', tipo: 'aba', modulo_pai: 'exames-lab' },
  { id: 'lab-bioquimica', nome: '↳ Lab - Bioquímica', tipo: 'aba', modulo_pai: 'exames-lab' },
  { id: 'lab-urina', nome: '↳ Lab - Urina', tipo: 'aba', modulo_pai: 'exames-lab' },
  { id: 'lab-gasometria', nome: '↳ Lab - Gasometria', tipo: 'aba', modulo_pai: 'exames-lab' },
  { id: 'lab-liquor', nome: '↳ Lab - Líquor', tipo: 'aba', modulo_pai: 'exames-lab' },
  { id: 'lab-microbiologia', nome: '↳ Lab - Microbiologia', tipo: 'aba', modulo_pai: 'exames-lab' },
  { id: 'lab-coagulacao', nome: '↳ Lab - Coagulação', tipo: 'aba', modulo_pai: 'exames-lab' },
  
  // Sub-abas de IOT/VM
  { id: 'iot-calculadora', nome: '↳ IOT - Calculadora', tipo: 'aba', modulo_pai: 'iot' },
  { id: 'iot-sequencias', nome: '↳ IOT - Sequências', tipo: 'aba', modulo_pai: 'iot' },
  { id: 'iot-planos', nome: '↳ IOT - Planos ABCD', tipo: 'aba', modulo_pai: 'iot' },
  { id: 'iot-avaliacao', nome: '↳ IOT - Aval Via Aérea', tipo: 'aba', modulo_pai: 'iot' },
  { id: 'iot-vm', nome: '↳ IOT - Ventilação Mec', tipo: 'aba', modulo_pai: 'iot' },
  { id: 'iot-checklist', nome: '↳ IOT - Checklist', tipo: 'aba', modulo_pai: 'iot' },
  
  // Sub-abas Modelos de Anamnese
  { id: 'modelos-meus', nome: '↳ Modelos - Meus', tipo: 'aba', modulo_pai: 'modelos' },
  { id: 'modelos-exame-fisico', nome: '↳ Modelos - Exame Físico', tipo: 'aba', modulo_pai: 'modelos' },
  
  // Sub-abas de Prescrição
  { id: 'prescricao-categorias', nome: '↳ Prescrição - Por Categoria', tipo: 'aba', modulo_pai: 'prescricao' },
  
  // Sub-abas de Pediatria
  { id: 'ped-crescimento', nome: '↳ Ped - Crescimento', tipo: 'aba', modulo_pai: 'pediatria' },
  { id: 'ped-vacinacao', nome: '↳ Ped - Vacinação', tipo: 'aba', modulo_pai: 'pediatria' },
  { id: 'ped-emergencias', nome: '↳ Ped - Emergências', tipo: 'aba', modulo_pai: 'pediatria' },
  { id: 'ped-neonatologia', nome: '↳ Ped - Neonatologia', tipo: 'aba', modulo_pai: 'pediatria' },
  
  // Sub-abas de Infectologia
  { id: 'infecto-antimicrobianos', nome: '↳ Infecto - Antimicrobianos', tipo: 'aba', modulo_pai: 'infectologia' },
  { id: 'infecto-ist', nome: '↳ Infecto - ISTs', tipo: 'aba', modulo_pai: 'infectologia' },
  { id: 'infecto-hiv', nome: '↳ Infecto - HIV/AIDS', tipo: 'aba', modulo_pai: 'infectologia' },
  
  // Sub-abas de Ginecologia
  { id: 'gine-medicamentos', nome: '↳ Gine - Medicamentos', tipo: 'aba', modulo_pai: 'ginecologia' },
  { id: 'gine-lactacao', nome: '↳ Gine - Lactação', tipo: 'aba', modulo_pai: 'ginecologia' },
  { id: 'gine-parto', nome: '↳ Gine - Parto/Puerpério', tipo: 'aba', modulo_pai: 'ginecologia' },
  { id: 'gine-ms', nome: '↳ Gine - Protocolos MS', tipo: 'aba', modulo_pai: 'ginecologia' },
  
  // Sub-abas de Modo Educacional
  { id: 'edu-questoes', nome: '↳ Edu - Questões', tipo: 'aba', modulo_pai: 'educacional' },
  { id: 'edu-flashcards', nome: '↳ Edu - Flashcards', tipo: 'aba', modulo_pai: 'educacional' },
  { id: 'edu-temas', nome: '↳ Edu - Temas Rápidos', tipo: 'aba', modulo_pai: 'educacional' },
  { id: 'edu-ranking', nome: '↳ Edu - Ranking', tipo: 'aba', modulo_pai: 'educacional' }
];

export default function GerenciamentoIcones() {
  const [uploading, setUploading] = useState(null);
  const queryClient = useQueryClient();

  const { data: iconesCustomizados = [] } = useQuery({
    queryKey: ['icones-customizados'],
    queryFn: () => base44.entities.IconeCustomizado.list()
  });

  const salvarIconeMutation = useMutation({
    mutationFn: async ({ modulo_id, nome_modulo, icone_url, tipo }) => {
      const existente = iconesCustomizados.find(ic => ic.modulo_id === modulo_id);
      
      if (existente) {
        return await base44.entities.IconeCustomizado.update(existente.id, {
          icone_url,
          ativo: true
        });
      }
      
      return await base44.entities.IconeCustomizado.create({
        modulo_id,
        nome_modulo,
        icone_url,
        tipo: tipo || 'modulo',
        ativo: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['icones-customizados']);
      toast.success('Ícone salvo com sucesso!');
      setUploading(null);
    },
    onError: (error) => {
      toast.error('Erro ao salvar ícone: ' + error.message);
      setUploading(null);
    }
  });

  const removerIconeMutation = useMutation({
    mutationFn: async (modulo_id) => {
      const icone = iconesCustomizados.find(ic => ic.modulo_id === modulo_id);
      if (icone) {
        return await base44.entities.IconeCustomizado.update(icone.id, { ativo: false });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['icones-customizados']);
      toast.success('Ícone removido - usando padrão');
    }
  });

  const limparTodosMutation = useMutation({
    mutationFn: async () => {
      const ativos = iconesCustomizados.filter(ic => ic.ativo);
      await Promise.all(
        ativos.map(ic => base44.entities.IconeCustomizado.update(ic.id, { ativo: false }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['icones-customizados']);
      toast.success('Todos os ícones foram removidos - usando padrões');
    },
    onError: () => {
      toast.error('Erro ao limpar ícones');
    }
  });

  const handleUpload = async (modulo, file) => {
    if (!file) return;
    
    const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Apenas PNG, SVG ou JPG são permitidos');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Tamanho máximo: 5MB');
      return;
    }

    try {
      setUploading(modulo.id);
      console.log('📤 Fazendo upload do ícone para:', modulo.nome);
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      console.log('✅ Upload concluído:', file_url);
      
      await salvarIconeMutation.mutateAsync({
        modulo_id: modulo.id,
        nome_modulo: modulo.nome,
        icone_url: file_url,
        tipo: modulo.tipo
      });
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      toast.error('Erro no upload: ' + error.message);
      setUploading(null);
    }
  };

  const getIconeCustomizado = (modulo_id) => {
    return iconesCustomizados.find(ic => ic.modulo_id === modulo_id && ic.ativo);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Gerenciamento de Ícones Customizados
              </CardTitle>
              <p className="text-sm text-slate-500">
                Faça upload de ícones personalizados para os módulos do sistema. <strong>Padrão iOS: 1024x1024px</strong> • Formatos: PNG, SVG, JPG (máx. 5MB)
              </p>
            </div>
            {iconesCustomizados.some(ic => ic.ativo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Deseja realmente remover TODOS os ícones customizados e voltar aos ícones padrão?')) {
                    limparTodosMutation.mutate();
                  }
                }}
                disabled={limparTodosMutation.isPending}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Todos
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {MODULOS_DISPONIVEIS.map(modulo => {
              const iconeCustom = getIconeCustomizado(modulo.id);
              const isUploading = uploading === modulo.id;

              return (
                <div key={modulo.id} className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-20 h-20 bg-white rounded-lg border-2 border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {iconeCustom ? (
                      <img 
                        src={`${iconeCustom.icone_url}?t=${Date.now()}`}
                        alt={modulo.nome}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm text-slate-800">{modulo.nome}</h3>
                      {iconeCustom && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Customizado
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">ID: {modulo.id}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/png,image/svg+xml,image/jpeg,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(modulo, file);
                      }}
                      className="hidden"
                      id={`upload-${modulo.id}`}
                      disabled={isUploading}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById(`upload-${modulo.id}`).click()}
                      disabled={isUploading || salvarIconeMutation.isPending}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>

                    {iconeCustom && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removerIconeMutation.mutate(modulo.id)}
                        disabled={removerIconeMutation.isPending}
                        className="border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <ImageIcon className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Dicas importantes:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Padrão iOS:</strong> Ícones quadrados de <strong>1024x1024px</strong> (serão redimensionados automaticamente)</li>
                <li>• Formatos alternativos aceitos: 512x512px, 256x256px ou 180x180px</li>
                <li>• Use imagens com fundo transparente (PNG ou SVG) para melhor resultado</li>
                <li>• Após upload, o novo ícone aparecerá imediatamente na sidebar</li>
                <li>• Clique em "↻" para restaurar o ícone padrão do sistema</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
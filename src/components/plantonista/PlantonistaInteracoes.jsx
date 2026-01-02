import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  X, 
  AlertTriangle, 
  Loader2,
  Pill,
  Info,
  CheckCircle2,
  XCircle,
  Search,
  Trash2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import DisclaimerFooter from '../compliance/DisclaimerFooter';
import ContentVersionBadge from '../content/ContentVersionBadge';
import OfflineIndicator from '../content/OfflineIndicator';

// Medicamentos comuns (autocomplete)
const medicamentosComuns = [
  'Amiodarona', 'Varfarina', 'Digoxina', 'Levotiroxina', 'Omeprazol',
  'Clopidogrel', 'Sinvastatina', 'Atorvastatina', 'Metformina', 'Insulina',
  'Losartana', 'Enalapril', 'Captopril', 'Hidroclorotiazida', 'Furosemida',
  'Espironolactona', 'Carvedilol', 'Metoprolol', 'Diltiazem', 'Anlodipino',
  'AAS', 'Rivaroxabana', 'Enoxaparina', 'Heparina', 'Apixabana',
  'Fluoxetina', 'Sertralina', 'Amitriptilina', 'Haloperidol', 'Risperidona',
  'Diazepam', 'Clonazepam', 'Fenitoína', 'Carbamazepina', 'Ácido Valproico',
  'Tramadol', 'Morfina', 'Codeína', 'Dipirona', 'Paracetamol',
  'Ibuprofeno', 'Diclofenaco', 'Prednisona', 'Dexametasona', 'Hidrocortisona',
  'Amoxicilina', 'Azitromicina', 'Ciprofloxacino', 'Levofloxacino', 'Ceftriaxona',
  'Metronidazol', 'Claritromicina', 'Cefalexina', 'Sulfametoxazol-Trimetoprim'
];

const getSeverityConfig = (gravidade) => {
  const configs = {
    grave: { 
      color: 'bg-red-100 text-red-700 border-red-200', 
      icon: '🔴',
      label: 'Grave',
      description: 'Evitar combinação. Risco significativo.'
    },
    moderada: { 
      color: 'bg-amber-100 text-amber-700 border-amber-200', 
      icon: '🟠',
      label: 'Moderada',
      description: 'Cautela. Monitoramento pode ser necessário.'
    },
    leve: { 
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
      icon: '🟡',
      label: 'Leve',
      description: 'Interação descrita, geralmente sem relevância clínica.'
    },
    nenhuma: { 
      color: 'bg-green-100 text-green-700 border-green-200', 
      icon: '🟢',
      label: 'Nenhuma',
      description: 'Nenhuma interação conhecida.'
    }
  };
  return configs[gravidade] || configs.nenhuma;
};

export default function PlantonistaInteracoes() {
  const [medicamentosSelecionados, setMedicamentosSelecionados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMeds, setFilteredMeds] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [interacoes, setInteracoes] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = medicamentosComuns.filter(med =>
        med.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !medicamentosSelecionados.includes(med)
      );
      setFilteredMeds(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredMeds([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, medicamentosSelecionados]);

  const handleAddMedicamento = (med) => {
    if (!medicamentosSelecionados.includes(med)) {
      setMedicamentosSelecionados([...medicamentosSelecionados, med]);
      setSearchTerm('');
      setShowSuggestions(false);
      toast.success(`${med} adicionado`);
    }
  };

  const handleRemoveMedicamento = (med) => {
    setMedicamentosSelecionados(medicamentosSelecionados.filter(m => m !== med));
    toast.success(`${med} removido`);
  };

  const handleClearAll = () => {
    setMedicamentosSelecionados([]);
    setInteracoes(null);
    toast.success('Lista limpa');
  };

  const handleImportFromPrescription = () => {
    // Buscar prescrição atual do localStorage
    const prescricaoAtual = localStorage.getItem('prescricao_rascunho');
    if (prescricaoAtual) {
      try {
        const prescricao = JSON.parse(prescricaoAtual);
        const meds = prescricao.medications?.map(m => m.name) || [];
        if (meds.length > 0) {
          setMedicamentosSelecionados([...new Set([...medicamentosSelecionados, ...meds])]);
          toast.success(`${meds.length} medicamentos importados`);
        } else {
          toast.info('Nenhum medicamento na prescrição atual');
        }
      } catch (e) {
        toast.error('Erro ao importar prescrição');
      }
    } else {
      toast.info('Nenhuma prescrição em rascunho encontrada');
    }
  };

  const analisarInteracoes = async () => {
    if (medicamentosSelecionados.length < 2) {
      toast.error('Adicione pelo menos 2 medicamentos');
      return;
    }

    setIsAnalyzing(true);
    setIsLoadingFromDB(true);

    try {
      const { contentManager } = await import('../content/ContentManager');
      
      // Gerar slug único baseado na lista de medicamentos
      const slug = `interacoes-${medicamentosSelecionados.sort().join('-').toLowerCase().replace(/\s+/g, '-')}`;
      
      const content = await contentManager.get(slug, {
        modulo: 'interacoes',
        tipo: 'guideline',
        customPrompt: buildInteracoesPrompt(medicamentosSelecionados)
      });

      contentManager.trackAccess(slug);
      
      // Normalizar estrutura de resposta
      const resultado = {
        medicamentos_analisados: content.medicamentos_analisados || medicamentosSelecionados,
        total_interacoes: content.total_interacoes || content.conteudo?.interacoes?.length || 0,
        interacoes: content.conteudo?.interacoes || content.interacoes || [],
        _metadata: {
          versao: content.versao || '1.0',
          data_atualizacao: content.ultima_atualizacao || content.created_date,
          fonte: content.fonte_primaria || 'Literatura Farmacológica',
          do_banco: true,
          diretrizes: content.diretrizes || [],
          livros_utilizados: content.livros_utilizados || []
        }
      };
      
      setInteracoes(resultado);
      setIsLoadingFromDB(false);
    } catch (error) {
      console.error('Erro ao analisar interações:', error);
      setInteracoes(null);
    } finally {
      setIsAnalyzing(false);
      setIsLoadingFromDB(false);
    }
  };

  const buildInteracoesPrompt = (medicamentos) => {
    const anoAtual = new Date().getFullYear();
    return `
      ANÁLISE DE INTERAÇÕES MEDICAMENTOSAS
      
      MEDICAMENTOS: ${medicamentos.join(', ')}
      
      DATA ATUAL: ${new Date().toLocaleDateString('pt-BR')} (${anoAtual})
      
      REGRA IMPERATIVA:
      - Use APENAS fontes de ${anoAtual-1} ou ${anoAtual}
      - Priorize: Micromedex, UpToDate Drug Interactions, Lexicomp, Medscape
      - Diretrizes: ISMP, FDA Drug Safety, EMA
      
      ========================
      ANÁLISE COMPLETA DE INTERAÇÕES
      ========================
      
      Para CADA PAR de medicamentos que interage, forneça:
      
      1. Medicamentos envolvidos (par específico)
      2. Tipo de interação:
         - Farmacodinâmica (efeito farmacológico)
         - Farmacocinética (absorção, metabolismo, eliminação)
         - Farmacêutica (incompatibilidade física)
      3. Gravidade:
         - grave (evitar combinação, risco significativo)
         - moderada (cautela, pode precisar monitoramento)
         - leve (descrita, geralmente sem relevância clínica)
      4. Descrição objetiva do mecanismo
      5. Consequência clínica potencial
      6. Nível de evidência:
         - estabelecida (múltiplos estudos)
         - provável (relatos de caso, farmacocinética)
         - teórica (baseada em mecanismo)
      7. Tempo de início (agudo, subagudo, crônico)
      8. Fatores que aumentam risco (idade, insuf. renal/hepática)
      
      CRÍTICO - MODELO 2 (Educacional):
      - NÃO sugira trocar medicamentos
      - NÃO sugira ajustes de dose
      - NÃO prescreva conduta
      - Use: "interação descrita", "pode resultar em", "literatura reporta"
      - Evite: "deve trocar", "ajustar para", "prescrever"
      - Apenas INFORME sobre a interação
      
      ========================
      SE NÃO HOUVER INTERAÇÕES RELEVANTES
      ========================
      
      Retornar explicitamente que não há interações conhecidas entre os medicamentos listados.
      
      ========================
      FORMATO DE RETORNO
      ========================
      
      Retorne JSON estruturado:
      
      {
        "medicamentos_analisados": ["Med1", "Med2", ...],
        "total_interacoes": número,
        "interacoes": [
          {
            "medicamento_a": "string",
            "medicamento_b": "string",
            "tipo_interacao": "farmacodinâmica|farmacocinética|farmacêutica",
            "gravidade": "grave|moderada|leve",
            "descricao": "string",
            "consequencia_clinica": "string",
            "nivel_evidencia": "estabelecida|provável|teórica",
            "tempo_inicio": "string",
            "fatores_risco": ["string"]
          }
        ],
        "diretrizes_utilizadas": [{
          "nome_completo": "string",
          "sociedade": "string",
          "ano": "string"
        }],
        "livros_utilizados": [{
          "autor_sobrenome": "string",
          "autor_nome": "string",
          "titulo_completo": "string",
          "edicao": "string",
          "local": "string",
          "editora": "string",
          "ano": "string"
        }]
      }
      
      FONTES PRIORITÁRIAS:
      - Micromedex Drug Interactions
      - UpToDate Drug Interactions
      - Lexicomp
      - Medscape Drug Interaction Checker
      - FDA Drug Safety Communications
      - ISMP (Institute for Safe Medication Practices)
      - Stockley's Drug Interactions
    `;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-600" />
                Análise de Interações Medicamentosas
              </h2>
              <p className="text-xs text-slate-500 mt-1">Ferramenta educacional de apoio à segurança</p>
            </div>
            <div className="flex items-center gap-2">
              <OfflineIndicator />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Medicamentos */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            1. Selecionar Medicamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input com autocomplete */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Digite o nome do medicamento..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
              />
            </div>
            
            {/* Sugestões */}
            {showSuggestions && filteredMeds.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredMeds.slice(0, 8).map((med, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddMedicamento(med)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-sm"
                  >
                    {med}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botões de ação rápida */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportFromPrescription}
              className="text-xs h-8"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Importar da Prescrição
            </Button>
            {medicamentosSelecionados.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-xs h-8 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Limpar Tudo
              </Button>
            )}
          </div>

          {/* Lista de medicamentos selecionados */}
          {medicamentosSelecionados.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                Medicamentos selecionados ({medicamentosSelecionados.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {medicamentosSelecionados.map((med, i) => (
                  <Badge
                    key={i}
                    className="bg-purple-100 text-purple-700 px-3 py-1.5 text-xs flex items-center gap-2"
                  >
                    {med}
                    <button
                      onClick={() => handleRemoveMedicamento(med)}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                Nenhum medicamento selecionado. Digite acima para adicionar.
              </p>
            </div>
          )}

          {/* Botão Analisar */}
          {medicamentosSelecionados.length >= 2 && (
            <Button
              onClick={analisarInteracoes}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Analisar Interações
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoadingFromDB && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
            <p className="text-sm text-slate-600">Carregando do banco local...</p>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && !isLoadingFromDB && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
            <p className="text-sm text-slate-600">Analisando interações...</p>
            <p className="text-xs text-slate-400 mt-2">Salvando para acesso offline</p>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {interacoes && !isAnalyzing && (
        <div className="space-y-4">
          {/* Header de Resultados */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                2. Resultados da Análise
              </h3>
              <p className="text-xs text-slate-500">
                {interacoes.total_interacoes || 0} interação(ões) encontrada(s)
              </p>
            </div>
            {interacoes._metadata && (
              <ContentVersionBadge content={interacoes._metadata} variant="compact" />
            )}
          </div>

          {/* Medicamentos Analisados */}
          <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="p-3">
              <p className="text-xs text-blue-600 font-medium mb-2">Medicamentos analisados:</p>
              <div className="flex flex-wrap gap-1">
                {interacoes.medicamentos_analisados?.map((med, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-white">
                    {med}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Interações */}
          {interacoes.interacoes && interacoes.interacoes.length > 0 ? (
            <div className="space-y-3">
              {interacoes.interacoes.map((interacao, i) => {
                const config = getSeverityConfig(interacao.gravidade);
                return (
                  <Card key={i} className={`border-2 ${config.color.includes('red') ? 'border-red-200' : config.color.includes('amber') ? 'border-amber-200' : 'border-slate-200'}`}>
                    <CardContent className="p-4 space-y-3">
                      {/* Header da Interação */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{config.icon}</span>
                            <h4 className="text-sm font-bold text-slate-800">
                              {interacao.medicamento_a} ↔ {interacao.medicamento_b}
                            </h4>
                          </div>
                          <Badge className={`text-[9px] ${config.color}`}>
                            {config.label} • {interacao.tipo_interacao}
                          </Badge>
                        </div>
                      </div>

                      {/* Descrição */}
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {interacao.descricao}
                        </p>
                      </div>

                      {/* Consequência Clínica */}
                      {interacao.consequencia_clinica && (
                        <div className={`p-2 rounded border ${
                          interacao.gravidade === 'grave' 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                          <p className="text-xs font-medium text-slate-700 mb-1">
                            ⚠️ Consequência clínica potencial:
                          </p>
                          <p className="text-xs text-slate-600">{interacao.consequencia_clinica}</p>
                        </div>
                      )}

                      {/* Metadados */}
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        {interacao.nivel_evidencia && (
                          <span>📊 Evidência: <strong>{interacao.nivel_evidencia}</strong></span>
                        )}
                        {interacao.tempo_inicio && (
                          <span>⏱️ Início: <strong>{interacao.tempo_inicio}</strong></span>
                        )}
                      </div>

                      {/* Fatores de Risco */}
                      {interacao.fatores_risco?.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className="text-xs font-medium text-slate-600 mb-1">
                            Fatores que aumentam risco:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {interacao.fatores_risco.map((fator, fi) => (
                              <Badge key={fi} variant="outline" className="text-[9px]">
                                {fator}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-green-50/50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-green-800">
                  Nenhuma interação relevante conhecida
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Não foram encontradas interações documentadas entre os medicamentos selecionados
                </p>
              </CardContent>
            </Card>
          )}

          {/* Referências */}
          {interacoes._metadata && (interacoes._metadata.diretrizes?.length > 0 || interacoes._metadata.livros_utilizados?.length > 0) && (
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  📚 Referências Utilizadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {interacoes._metadata.diretrizes?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-blue-600 font-semibold mb-2">Bases de Dados:</p>
                    {interacoes._metadata.diretrizes.map((dir, i) => (
                      <div key={i} className="p-2 bg-blue-50 rounded border border-blue-100 mb-1">
                        <p className="text-xs text-blue-900 font-semibold">{dir.nome_completo}</p>
                        <p className="text-[10px] text-blue-700">{dir.sociedade} • {dir.ano}</p>
                      </div>
                    ))}
                  </div>
                )}

                {interacoes._metadata.livros_utilizados?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-600 font-semibold mb-2">Livros-texto:</p>
                    {interacoes._metadata.livros_utilizados.map((livro, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100 mb-1">
                        <p className="text-xs text-slate-800">
                          {livro.autor_sobrenome}, {livro.autor_nome}. {livro.titulo_completo}. {livro.edicao}. {livro.local}: {livro.editora}; {livro.ano}.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Versão Detalhada */}
          {interacoes._metadata && (
            <ContentVersionBadge content={interacoes._metadata} variant="detailed" />
          )}
        </div>
      )}

      {/* Aviso Legal Fixo */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-3">
          <p className="text-[10px] text-amber-800 text-center">
            <strong>Ferramenta educacional de apoio à decisão.</strong> Não substitui o julgamento clínico individualizado. 
            A presença ou ausência de interação documentada não determina automaticamente a segurança ou contraindicação absoluta de uma combinação.
          </p>
        </CardContent>
      </Card>

      <DisclaimerFooter variant="medicamento" />
    </div>
  );
}
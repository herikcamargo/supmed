import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { 
  FileText, 
  Search,
  Loader2,
  Pill,
  AlertTriangle,
  Baby,
  Heart,
  Beaker,
  Clock,
  ShieldAlert,
  Zap,
  Thermometer,
  BookOpen,
  ChevronRight,
  Activity
} from 'lucide-react';
import ContentVersionBadge from '../components/content/ContentVersionBadge';
import OfflineIndicator from '../components/content/OfflineIndicator';

// Classes terapêuticas para navegação rápida
const classesTerapeuticas = [
  { id: 'analgesicos', nome: 'Analgésicos/Antipiréticos', icon: Thermometer, cor: 'bg-red-500' },
  { id: 'antibioticos', nome: 'Antibióticos', icon: Beaker, cor: 'bg-blue-500' },
  { id: 'anti_inflamatorios', nome: 'Anti-inflamatórios', icon: Zap, cor: 'bg-orange-500' },
  { id: 'cardiovascular', nome: 'Cardiovascular', icon: Heart, cor: 'bg-pink-500' },
  { id: 'snc', nome: 'Sistema Nervoso Central', icon: Activity, cor: 'bg-purple-500' },
  { id: 'gastro', nome: 'Gastrointestinal', icon: Pill, cor: 'bg-green-500' },
  { id: 'respiratorio', nome: 'Respiratório', icon: Activity, cor: 'bg-cyan-500' },
  { id: 'endocrino', nome: 'Endócrino/Metabólico', icon: Beaker, cor: 'bg-amber-500' }
];

// Medicamentos comuns para acesso rápido
const medicamentosRapidos = [
  'Dipirona', 'Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Azitromicina',
  'Omeprazol', 'Losartana', 'Metformina', 'Captopril', 'Furosemida',
  'Prednisona', 'Dexametasona', 'Tramadol', 'Morfina', 'Ceftriaxona',
  'Ciprofloxacino', 'Metoclopramida', 'Ondansetrona', 'Enoxaparina', 'AAS'
];

export default function Bulario() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [medicamento, setMedicamento] = useState(null);
  const [historico, setHistorico] = useState([]);

  const buscarMedicamento = async (nome) => {
    const termoBusca = nome || searchTerm;
    if (!termoBusca.trim()) return;

    setIsSearching(true);
    setSearchTerm(termoBusca);

    try {
      const { contentManager } = await import('../components/content/ContentManager');
      
      const slug = `bulario-${termoBusca.toLowerCase().replace(/\s+/g, '-')}`;
      const content = await contentManager.get(slug, {
        modulo: 'bulario',
        tipo: 'guideline'
      });

      contentManager.trackAccess(slug);
      setMedicamento(content.conteudo);
      
      if (!historico.includes(termoBusca)) {
        setHistorico(prev => [termoBusca, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Erro ao buscar medicamento:', error);
      
      // Fallback direto apenas se falhar completamente
      const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um farmacêutico clínico experiente. Forneça informações completas sobre o medicamento "${termoBusca}" seguindo EXATAMENTE o modelo de bulário abaixo. Use informações atualizadas e baseadas em evidências.

MODELO PADRÃO DE BULÁRIO:

1. NOME DO MEDICAMENTO
2. CLASSE TERAPÊUTICA
3. APRESENTAÇÕES (formas, concentrações, vias)
4. MECANISMO DE AÇÃO
5. INDICAÇÕES
6. POSOLOGIA (adulto, pediátrico, idoso)
7. AJUSTES DE DOSE (renal, hepático)
8. CONTRAINDICAÇÕES
9. PRECAUÇÕES E ALERTAS
10. INTERAÇÕES MEDICAMENTOSAS (principais)
11. EFEITOS ADVERSOS
12. SUPERDOSAGEM
13. FARMACOCINÉTICA
14. GESTAÇÃO E LACTAÇÃO
15. ARMAZENAMENTO

Forneça informações completas e práticas para uso médico.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          nome_generico: { type: 'string' },
          nomes_comerciais: { type: 'array', items: { type: 'string' } },
          classe_terapeutica: { type: 'string' },
          apresentacoes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                forma: { type: 'string' },
                concentracao: { type: 'string' },
                via: { type: 'string' }
              }
            }
          },
          mecanismo_acao: { type: 'string' },
          indicacoes: { type: 'array', items: { type: 'string' } },
          posologia: {
            type: 'object',
            properties: {
              adulto: {
                type: 'object',
                properties: {
                  dose: { type: 'string' },
                  intervalo: { type: 'string' },
                  duracao: { type: 'string' }
                }
              },
              pediatrico: {
                type: 'object',
                properties: {
                  dose: { type: 'string' },
                  intervalo: { type: 'string' },
                  duracao: { type: 'string' }
                }
              },
              idoso: { type: 'string' }
            }
          },
          ajuste_renal: { type: 'string' },
          ajuste_hepatico: { type: 'string' },
          contraindicacoes: { type: 'array', items: { type: 'string' } },
          precaucoes: { type: 'array', items: { type: 'string' } },
          monitorizacao: { type: 'array', items: { type: 'string' } },
          interacoes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                medicamento: { type: 'string' },
                tipo: { type: 'string' },
                descricao: { type: 'string' }
              }
            }
          },
          efeitos_adversos: {
            type: 'object',
            properties: {
              comuns: { type: 'array', items: { type: 'string' } },
              graves: { type: 'array', items: { type: 'string' } }
            }
          },
          superdosagem: {
            type: 'object',
            properties: {
              manifestacoes: { type: 'string' },
              conduta: { type: 'string' }
            }
          },
          farmacocinetica: {
            type: 'object',
            properties: {
              absorcao: { type: 'string' },
              metabolismo: { type: 'string' },
              meia_vida: { type: 'string' },
              excrecao: { type: 'string' }
            }
          },
          gestacao_lactacao: {
            type: 'object',
            properties: {
              categoria: { type: 'string' },
              orientacoes: { type: 'string' }
            }
          },
          armazenamento: { type: 'string' },
          observacoes: { type: 'string' },
          fonte: { type: 'string' },
          versao: { type: 'string' },
          data_atualizacao: { type: 'string' }
        }
      }
      });

      setMedicamento(response);
      
      if (!historico.includes(termoBusca)) {
        setHistorico(prev => [termoBusca, ...prev.slice(0, 9)]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Bulário Médico</h1>
              <p className="text-xs text-slate-500">Informações farmacológicas completas</p>
            </div>
          </div>

          {/* Search */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 mb-4">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar medicamento (nome genérico ou comercial)..."
                    className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarMedicamento()}
                  />
                </div>
                <Button 
                  onClick={() => buscarMedicamento()}
                  disabled={isSearching}
                  className="h-9 bg-blue-900 hover:bg-blue-800 text-xs"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                </Button>
              </div>

              {/* Medicamentos rápidos */}
              <div className="flex flex-wrap gap-1 mt-3">
                {medicamentosRapidos.slice(0, 12).map((med) => (
                  <button
                    key={med}
                    onClick={() => buscarMedicamento(med)}
                    className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    {med}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {isSearching ? (
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-600">Buscando informações do medicamento...</p>
              </CardContent>
            </Card>
          ) : medicamento ? (
            // Resultado do Bulário
            <div className="space-y-4">
              {/* Cabeçalho do Medicamento */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{medicamento.nome_generico}</h2>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medicamento.nomes_comerciais?.map((nc, i) => (
                          <Badge key={i} variant="outline" className="text-[9px]">{nc}</Badge>
                        ))}
                      </div>
                      <Badge className="mt-2 text-[10px] bg-blue-100 text-blue-700">
                        {medicamento.classe_terapeutica}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <OfflineIndicator />
                      <Button variant="outline" size="sm" onClick={() => setMedicamento(null)} className="text-xs h-7">
                        Nova busca
                      </Button>
                    </div>
                    </div>
                    </CardContent>
                    </Card>

                    {/* Versão do conteúdo */}
                    {medicamento.versao && (
                    <ContentVersionBadge content={medicamento} variant="detailed" />
                    )}

              {/* Apresentações */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-blue-500" /> Apresentações
                  </h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {medicamento.apresentacoes?.map((ap, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100">
                        <p className="text-xs font-medium text-slate-700">{ap.forma}</p>
                        <p className="text-[10px] text-slate-500">{ap.concentracao} • {ap.via}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mecanismo de Ação */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1">
                    <Beaker className="w-3.5 h-3.5 text-purple-500" /> Mecanismo de Ação
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{medicamento.mecanismo_acao}</p>
                </CardContent>
              </Card>

              {/* Indicações */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Indicações</h3>
                  <ul className="space-y-1">
                    {medicamento.indicacoes?.map((ind, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {ind}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Posologia */}
              <Card className="bg-emerald-50 border border-emerald-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase mb-3 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Posologia
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {/* Adulto */}
                    <div className="p-3 bg-white rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase mb-2">Adulto</p>
                      <div className="space-y-1 text-xs text-slate-600">
                        <p><strong>Dose:</strong> {medicamento.posologia?.adulto?.dose}</p>
                        <p><strong>Intervalo:</strong> {medicamento.posologia?.adulto?.intervalo}</p>
                        <p><strong>Duração:</strong> {medicamento.posologia?.adulto?.duracao}</p>
                      </div>
                    </div>
                    {/* Pediátrico */}
                    <div className="p-3 bg-white rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase mb-2 flex items-center gap-1">
                        <Baby className="w-3 h-3" /> Pediátrico
                      </p>
                      <div className="space-y-1 text-xs text-slate-600">
                        <p><strong>Dose:</strong> {medicamento.posologia?.pediatrico?.dose}</p>
                        <p><strong>Intervalo:</strong> {medicamento.posologia?.pediatrico?.intervalo}</p>
                        <p><strong>Duração:</strong> {medicamento.posologia?.pediatrico?.duracao}</p>
                      </div>
                    </div>
                    {/* Idoso */}
                    <div className="p-3 bg-white rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase mb-2">Idoso</p>
                      <p className="text-xs text-slate-600">{medicamento.posologia?.idoso}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ajustes de Dose */}
              <Card className="bg-amber-50 border border-amber-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-amber-800 uppercase mb-3">Ajustes de Dose</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-amber-100">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase mb-1">Renal</p>
                      <p className="text-xs text-slate-600">{medicamento.ajuste_renal}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-amber-100">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase mb-1">Hepático</p>
                      <p className="text-xs text-slate-600">{medicamento.ajuste_hepatico}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contraindicações */}
              <Card className="bg-red-50 border border-red-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-red-800 uppercase mb-2 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Contraindicações
                  </h3>
                  <ul className="space-y-1">
                    {medicamento.contraindicacoes?.map((ci, i) => (
                      <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                        <span className="text-red-500">✗</span> {ci}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Precauções e Monitorização */}
              <Card className="bg-orange-50 border border-orange-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-orange-800 uppercase mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Precauções e Alertas
                  </h3>
                  <ul className="space-y-1 mb-3">
                    {medicamento.precaucoes?.map((p, i) => (
                      <li key={i} className="text-xs text-orange-700">⚠️ {p}</li>
                    ))}
                  </ul>
                  {medicamento.monitorizacao?.length > 0 && (
                    <div className="p-2 bg-white rounded border border-orange-100">
                      <p className="text-[10px] font-semibold text-orange-700 mb-1">Monitorização necessária:</p>
                      <div className="flex flex-wrap gap-1">
                        {medicamento.monitorizacao.map((m, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] border-orange-300 text-orange-700">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interações Medicamentosas */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" /> Interações Medicamentosas
                  </h3>
                  <div className="space-y-2">
                    {medicamento.interacoes?.map((int, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-800">{int.medicamento}</span>
                          <Badge className={`text-[8px] ${
                            int.tipo?.toLowerCase().includes('grave') ? 'bg-red-500' : 
                            int.tipo?.toLowerCase().includes('moderada') ? 'bg-amber-500' : 'bg-blue-500'
                          }`}>
                            {int.tipo}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-600">{int.descricao}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Efeitos Adversos */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">Efeitos Adversos</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-600 mb-2">Comuns:</p>
                      <ul className="space-y-0.5">
                        {medicamento.efeitos_adversos?.comuns?.map((ea, i) => (
                          <li key={i} className="text-xs text-slate-600">• {ea}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <p className="text-[10px] font-semibold text-red-700 mb-2">Graves:</p>
                      <ul className="space-y-0.5">
                        {medicamento.efeitos_adversos?.graves?.map((ea, i) => (
                          <li key={i} className="text-xs text-red-700">⚠️ {ea}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Superdosagem */}
              <Card className="bg-red-50 border border-red-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-red-800 uppercase mb-2">Superdosagem</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] font-semibold text-red-700">Manifestações:</p>
                      <p className="text-xs text-red-800">{medicamento.superdosagem?.manifestacoes}</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-red-100">
                      <p className="text-[10px] font-semibold text-red-700">Conduta:</p>
                      <p className="text-xs text-slate-700">{medicamento.superdosagem?.conduta}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Farmacocinética */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">Farmacocinética</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-[9px] text-slate-500 uppercase">Absorção</p>
                      <p className="text-xs text-slate-700">{medicamento.farmacocinetica?.absorcao}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-[9px] text-slate-500 uppercase">Metabolismo</p>
                      <p className="text-xs text-slate-700">{medicamento.farmacocinetica?.metabolismo}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-[9px] text-slate-500 uppercase">Meia-vida</p>
                      <p className="text-xs text-slate-700">{medicamento.farmacocinetica?.meia_vida}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-[9px] text-slate-500 uppercase">Excreção</p>
                      <p className="text-xs text-slate-700">{medicamento.farmacocinetica?.excrecao}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gestação e Lactação */}
              <Card className="bg-pink-50 border border-pink-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-pink-800 uppercase mb-2 flex items-center gap-1">
                    <Baby className="w-3.5 h-3.5" /> Gestação e Lactação
                  </h3>
                  <div className="flex items-start gap-3">
                    <Badge className="text-xs bg-pink-500">{medicamento.gestacao_lactacao?.categoria}</Badge>
                    <p className="text-xs text-pink-800">{medicamento.gestacao_lactacao?.orientacoes}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Armazenamento */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Armazenamento</h3>
                  <p className="text-xs text-slate-600">{medicamento.armazenamento}</p>
                </CardContent>
              </Card>

              {/* Observações */}
              {medicamento.observacoes && (
                <Card className="bg-blue-50 border border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">Observações Adicionais</h3>
                    <p className="text-xs text-blue-700">{medicamento.observacoes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Fonte e Versão */}
              <Card className="bg-slate-100 border border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <strong>Fonte:</strong> {medicamento.fonte || 'ANVISA, Micromedex, UpToDate'}
                      </span>
                      <span><strong>Versão:</strong> {medicamento.versao || '1.0'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Atualizado em: {medicamento.data_atualizacao || new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 text-center">
                    ⚕️ As informações são para fins educacionais. Consulte sempre a bula oficial e protocolos institucionais.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Tela inicial
            <div className="space-y-4">
              {/* Classes Terapêuticas */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-slate-700 mb-3">Classes Terapêuticas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {classesTerapeuticas.map((classe) => {
                      const Icon = classe.icon;
                      return (
                        <button
                          key={classe.id}
                          onClick={() => {
                            setSearchTerm(classe.nome);
                          }}
                          className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-left"
                        >
                          <div className={`w-6 h-6 rounded ${classe.cor} flex items-center justify-center mb-2`}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <p className="text-[10px] font-medium text-slate-700">{classe.nome}</p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Medicamentos Comuns */}
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold text-slate-700 mb-3">Medicamentos Mais Consultados</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {medicamentosRapidos.map((med) => (
                      <button
                        key={med}
                        onClick={() => buscarMedicamento(med)}
                        className="p-2 rounded bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all text-xs text-slate-700 hover:text-blue-700"
                      >
                        {med}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Histórico */}
              {historico.length > 0 && (
                <Card className="bg-white border border-slate-200">
                  <CardContent className="p-4">
                    <h3 className="text-xs font-semibold text-slate-700 mb-2">Histórico de Buscas</h3>
                    <div className="flex flex-wrap gap-1">
                      {historico.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => buscarMedicamento(h)}
                          className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Placeholder */}
              <Card className="bg-slate-50 border border-slate-200">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">Digite o nome do medicamento para consultar</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Informações completas: posologia, interações, contraindicações e mais
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
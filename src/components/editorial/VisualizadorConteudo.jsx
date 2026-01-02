import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calculator, ExternalLink, Stethoscope, Activity, FileText, ClipboardList } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Visualizador completo de Afecção (espelhando Ações Clínicas)
function VisualizadorAfeccao({ conteudo }) {
  const dados = conteudo.conteudo || conteudo;
  
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Definição */}
      {(dados.definicao || conteudo.definicao) && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Definição
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed">{dados.definicao || conteudo.definicao}</p>
        </div>
      )}

      {/* Avaliação Inicial */}
      {(dados.avaliacao_inicial?.length > 0 || conteudo.avaliacao_inicial?.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" /> Avaliação Inicial
          </h3>
          <ul className="space-y-2">
            {(dados.avaliacao_inicial || conteudo.avaliacao_inicial || []).map((item, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2 bg-slate-50 p-2 rounded">
                <span className="text-blue-600 font-bold shrink-0">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diagnóstico Clínico */}
      {(dados.diagnostico || conteudo.diagnostico_clinico) && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">Diagnóstico Clínico</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{dados.diagnostico || conteudo.diagnostico_clinico}</p>
        </div>
      )}

      {/* Diagnósticos Diferenciais */}
      {(dados.diagnostico_diferencial?.length > 0 || conteudo.diagnosticos_diferenciais?.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">Diagnósticos Diferenciais</h3>
          <div className="flex flex-wrap gap-2">
            {(dados.diagnostico_diferencial || conteudo.diagnosticos_diferenciais || []).map((item, i) => (
              <Badge key={i} className="bg-purple-100 text-purple-800 text-xs">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Exames */}
      {(dados.exames?.length > 0 || conteudo.exames_indicados?.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-600" /> Exames Complementares
          </h3>
          <ul className="space-y-2">
            {(dados.exames || conteudo.exames_indicados || []).map((item, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2 bg-green-50 p-2 rounded">
                <span className="text-green-600 font-bold shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conduta Imediata */}
      {(dados.conduta_imediata?.length > 0 || conteudo.conduta_imediata_pa?.length > 0) && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            CONDUTA IMEDIATA NO PA
          </h3>
          <ul className="space-y-2">
            {(dados.conduta_imediata || conteudo.conduta_imediata_pa || []).map((item, i) => (
              <li key={i} className="text-sm text-blue-950 flex items-start gap-3 bg-white/70 p-3 rounded-lg">
                <span className="text-blue-600 font-bold text-lg shrink-0">{i + 1}</span>
                <span className="font-medium leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tratamento / Manejo */}
      {(dados.tratamento?.length > 0 || conteudo.tratamento_manejo?.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-600" /> Tratamento / Manejo
          </h3>
          <ul className="space-y-2">
            {(dados.tratamento || conteudo.tratamento_manejo || []).map((item, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2 bg-indigo-50 p-2 rounded">
                <span className="text-indigo-600 font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red Flags */}
      {conteudo.red_flags?.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Red Flags
          </h3>
          <ul className="space-y-2">
            {conteudo.red_flags.map((item, i) => (
              <li key={i} className="text-sm text-red-900 flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">⚠</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Desfecho/Internação */}
      {(dados.desfecho?.length > 0 || conteudo.criterios_internacao?.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
            {dados.desfecho ? 'Desfecho' : 'Critérios de Internação'}
          </h3>
          <ul className="space-y-2">
            {(dados.desfecho || conteudo.criterios_internacao || []).map((item, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2 bg-orange-50 p-2 rounded">
                <span className="text-orange-600 font-bold shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contraindicações */}
      {(dados.contraindicacoes?.length > 0 || conteudo.contraindicacoes?.length > 0) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Contraindicações
          </h3>
          <ul className="space-y-2">
            {(dados.contraindicacoes || conteudo.contraindicacoes || []).map((item, i) => (
              <li key={i} className="text-sm text-amber-950 flex items-start gap-2 bg-white/60 p-2 rounded">
                <span className="text-amber-600 font-bold shrink-0">✖</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medicações */}
      {(dados.medicacoes?.length > 0 || conteudo.medicamentos_texto_livre) && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">Medicações</h3>
          {conteudo.medicamentos_texto_livre ? (
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {conteudo.medicamentos_texto_livre}
            </div>
          ) : dados.medicacoes ? (
            <div className="space-y-2">
              {dados.medicacoes.map((med, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-slate-800">{med.nome || med.medicamento}</p>
                  {med.dose && <p className="text-xs text-slate-600 mt-1">Dose: {med.dose}</p>}
                  {med.via && <p className="text-xs text-slate-600">Via: {med.via}</p>}
                  {med.observacoes && <p className="text-xs text-slate-600 mt-1">{med.observacoes}</p>}
                </div>
              ))}
            </div>
          ) : null}
          <p className="text-xs text-slate-500 mt-2 italic">
            ⚠️ Conteúdo educacional, não substitui prescrição individualizada
          </p>
        </div>
      )}

      {/* Escalas/Calculadoras - Botões Clicáveis */}
      {(dados.escalas?.length > 0 || dados.calculadoras?.length > 0 || 
        conteudo.escalas_associadas?.length > 0 || conteudo.calculadoras_relacionadas?.length > 0 ||
        conteudo.scores_relacionados?.length > 0) && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Ferramentas Relacionadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {(dados.escalas || conteudo.escalas_associadas || []).map((escala, i) => (
              <Link key={i} to={createPageUrl('Calculadoras')}>
                <Button variant="outline" size="sm" className="bg-white hover:bg-purple-50 border-purple-300">
                  <Calculator className="w-3 h-3 mr-1" />
                  {escala.nome || escala}
                </Button>
              </Link>
            ))}
            {(dados.calculadoras || conteudo.calculadoras_relacionadas || []).map((calc, i) => (
              <Link key={i} to={createPageUrl('Calculadoras')}>
                <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 border-blue-300">
                  <Calculator className="w-3 h-3 mr-1" />
                  {calc.nome || calc}
                </Button>
              </Link>
            ))}
            {(conteudo.scores_relacionados || []).map((score, i) => (
              <Link key={i} to={createPageUrl('Calculadoras')}>
                <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 border-blue-300">
                  <Activity className="w-3 h-3 mr-1" />
                  Score: {score}
                </Button>
              </Link>
            ))}
            {(conteudo.procedimentos_relacionados || []).map((proc, i) => (
              <Link key={i} to={createPageUrl('Procedimentos')}>
                <Button variant="outline" size="sm" className="bg-white hover:bg-violet-50 border-violet-300">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {proc}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notificação Compulsória */}
      {conteudo.notificacao_compulsoria && (
        <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-red-800 mb-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Doença de Notificação Compulsória (SINAN)
          </h3>
          {conteudo.orientacoes_notificacao && (
            <p className="text-sm text-red-900 mt-2">{conteudo.orientacoes_notificacao}</p>
          )}
        </div>
      )}

      {/* Referências */}
      {conteudo.referencias_utilizadas?.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-300 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Referências Bibliográficas Utilizadas
          </h3>
          <div className="space-y-3">
            {conteudo.referencias_utilizadas.map((ref, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Badge className={`shrink-0 text-xs ${
                    ref.tipo === 'diretriz' ? 'bg-blue-100 text-blue-800' :
                    ref.tipo === 'livro' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {ref.tipo === 'diretriz' ? '📋 Diretriz' : 
                     ref.tipo === 'livro' ? '📚 Livro' : 
                     '📄 Artigo'}
                  </Badge>
                  <p className="text-sm text-slate-700 leading-relaxed flex-1">
                    {ref.referencia_completa}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 italic">
            Total: {conteudo.referencias_utilizadas.length} referência(s)
          </p>
        </div>
      )}

      {/* Disclaimer */}
      {conteudo.disclaimer && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> {conteudo.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}

// Visualizador completo de Semiologia
function VisualizadorSemiologia({ conteudo }) {
  return (
    <div className="space-y-6">
      {/* Objetivo Clínico */}
      {conteudo.objetivo_clinico && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Objetivo Clínico</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{conteudo.objetivo_clinico}</p>
        </div>
      )}

      {/* Fundamentos Fisiopatológicos */}
      {conteudo.fundamentos_fisiopatologicos && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Fundamentos Fisiopatológicos</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{conteudo.fundamentos_fisiopatologicos}</p>
        </div>
      )}

      {/* Anamnese Dirigida */}
      {conteudo.anamnese_dirigida?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Anamnese Dirigida</h3>
          <ul className="space-y-1">
            {conteudo.anamnese_dirigida.map((item, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sinais e Sintomas */}
      {conteudo.sinais_sintomas_relevantes?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Sinais e Sintomas Relevantes</h3>
          <div className="flex flex-wrap gap-2">
            {conteudo.sinais_sintomas_relevantes.map((item, i) => (
              <Badge key={i} variant="outline" className="bg-green-50 text-green-700">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Exame Físico */}
      {conteudo.exame_fisico_passos?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Exame Físico - Passo a Passo</h3>
          <ol className="space-y-2">
            {conteudo.exame_fisico_passos.map((passo, i) => (
              <li key={i} className="text-sm text-blue-900">
                <span className="font-semibold">{passo.ordem || i + 1}.</span> {passo.passo}
                {passo.tecnica && (
                  <p className="text-xs text-blue-700 mt-1 ml-4">{passo.tecnica}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Achados Normais */}
      {conteudo.achados_normais?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Achados Normais</h3>
          <ul className="space-y-1">
            {conteudo.achados_normais.map((item, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Achados Patológicos */}
      {conteudo.achados_patologicos?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Achados Patológicos</h3>
          {conteudo.achados_patologicos.map((achado, i) => (
            <div key={i} className="mb-2">
              <p className="text-sm text-red-900 font-medium">{achado.achado}</p>
              {achado.interpretacao && (
                <p className="text-xs text-red-700 ml-4 mt-1">→ {achado.interpretacao}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Red Flags Semiológicas */}
      {conteudo.red_flags_semiologicas?.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Red Flags Semiológicas
          </h3>
          <ul className="space-y-2">
            {conteudo.red_flags_semiologicas.map((item, i) => (
              <li key={i} className="text-sm text-red-900 flex items-start gap-2">
                <span className="text-red-600 font-bold">⚠</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Correlação com Hipóteses */}
      {conteudo.correlacao_hipoteses?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Correlação com Hipóteses Diagnósticas</h3>
          <ul className="space-y-1">
            {conteudo.correlacao_hipoteses.map((item, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Aplicação Prática */}
      {conteudo.aplicacao_pratica && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Aplicação Prática (PA e APS)</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{conteudo.aplicacao_pratica}</p>
        </div>
      )}

      {/* Referências */}
      {conteudo.referencias_utilizadas?.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-300 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Referências Bibliográficas Utilizadas
          </h3>
          <div className="space-y-3">
            {conteudo.referencias_utilizadas.map((ref, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Badge className={`shrink-0 text-xs ${
                    ref.tipo === 'diretriz' ? 'bg-blue-100 text-blue-800' :
                    ref.tipo === 'livro' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {ref.tipo === 'diretriz' ? '📋 Diretriz' : 
                     ref.tipo === 'livro' ? '📚 Livro' : 
                     '📄 Artigo'}
                  </Badge>
                  <p className="text-sm text-slate-700 leading-relaxed flex-1">
                    {ref.referencia_completa}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 italic">
            Total: {conteudo.referencias_utilizadas.length} referência(s)
          </p>
        </div>
      )}
    </div>
  );
}

// Visualizador completo de Procedimento
function VisualizadorProcedimento({ conteudo }) {
  return (
    <div className="space-y-6">
      {/* Indicações */}
      {conteudo.indicacoes?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Indicações</h3>
          <ul className="space-y-1">
            {conteudo.indicacoes.map((item, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contraindicações */}
      {conteudo.contraindicacoes?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Contraindicações</h3>
          <ul className="space-y-1">
            {conteudo.contraindicacoes.map((item, i) => (
              <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                <span className="text-amber-600 font-bold">✖</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Material Necessário */}
      {conteudo.materiais?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Material Necessário</h3>
          <ul className="space-y-1">
            {conteudo.materiais.map((mat, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  {mat.item} {mat.quantidade && `(${mat.quantidade})`}
                  {mat.essencial && <Badge className="ml-2 text-xs bg-red-100 text-red-700">Essencial</Badge>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Passo a Passo */}
      {conteudo.passos?.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Passo a Passo Técnico</h3>
          <ol className="space-y-3">
            {conteudo.passos.map((passo, i) => (
              <li key={i} className="text-sm text-blue-900">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">{passo.ordem || i + 1}.</span>
                  <div>
                    <p className="font-semibold">{passo.titulo}</p>
                    <p className="text-blue-800 mt-1">{passo.descricao}</p>
                    {passo.critico && (
                      <Badge className="mt-1 text-xs bg-red-100 text-red-700">Passo Crítico</Badge>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Particularidades */}
      {conteudo.particularidades?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Particularidades Técnicas</h3>
          <ul className="space-y-1">
            {conteudo.particularidades.map((item, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-purple-600 font-bold">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Complicações */}
      {conteudo.complicacoes?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Complicações Possíveis</h3>
          {conteudo.complicacoes.map((comp, i) => (
            <div key={i} className="mb-2">
              <p className="text-sm text-red-900 font-medium">
                {comp.nome} {comp.frequencia && <span className="text-xs">({comp.frequencia})</span>}
              </p>
              {comp.conduta && (
                <p className="text-xs text-red-700 ml-4 mt-1">→ Conduta: {comp.conduta}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Observações */}
      {conteudo.observacoes && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Observações Importantes</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{conteudo.observacoes}</p>
        </div>
      )}

      {/* Referências (Procedimento) */}
      {conteudo.fontes?.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-300 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Fontes e Referências
          </h3>
          <div className="space-y-2">
            {conteudo.fontes.map((fonte, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-sm text-slate-700 leading-relaxed">{fonte}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 italic">
            Total: {conteudo.fontes.length} fonte(s)
          </p>
        </div>
      )}
    </div>
  );
}

// Componente principal que detecta o tipo e renderiza o visualizador apropriado
export default function VisualizadorConteudo({ conteudo }) {
  if (!conteudo) {
    return <p className="text-sm text-slate-500">Selecione um conteúdo para visualizar</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header minimalista */}
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          {conteudo.nome_afeccao || conteudo.nome_topico || conteudo.nome || conteudo.titulo}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {(conteudo.especialidade || conteudo.sistema_dominio || conteudo.categoria) && (
            <Badge variant="outline" className="capitalize text-xs">
              {(conteudo.especialidade || conteudo.sistema_dominio || conteudo.categoria)?.replace(/_/g, ' ')}
            </Badge>
          )}
          {conteudo.nivel_complexidade && (
            <Badge variant="outline" className="capitalize text-xs">
              {conteudo.nivel_complexidade}
            </Badge>
          )}
          {conteudo.versao && (
            <Badge variant="outline" className="text-xs">v{conteudo.versao}</Badge>
          )}
          <Badge className="text-xs bg-blue-100 text-blue-700">
            Visualização como usuário final
          </Badge>
        </div>
      </div>

      {/* Renderizar visualizador específico baseado no tipo */}
      {(conteudo._tipo === 'afeccao' || conteudo.nome_afeccao) && (
        <VisualizadorAfeccao conteudo={conteudo} />
      )}
      
      {(conteudo._tipo === 'semiologia' || conteudo.nome_topico) && (
        <VisualizadorSemiologia conteudo={conteudo} />
      )}
      
      {(conteudo._tipo === 'procedimento' || conteudo.passos) && (
        <VisualizadorProcedimento conteudo={conteudo} />
      )}

      {/* Para outros tipos (calculadoras, escalas, protocolos) */}
      {!conteudo.nome_afeccao && !conteudo.nome_topico && !conteudo.passos && (
        <div className="space-y-4">
          {conteudo.conteudo_estruturado && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-700 mb-2">Conteúdo Estruturado</h3>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                {JSON.stringify(conteudo.conteudo_estruturado, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
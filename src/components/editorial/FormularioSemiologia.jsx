import React, { useState } from 'react';
import { isDemoMode } from '../auth/DevConfig';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Save, FileText } from 'lucide-react';

export default function FormularioSemiologia({ topico, onChange, onSalvar, onCancelar, salvando }) {
  const updateField = (field, value) => {
    onChange({ ...topico, [field]: value });
  };

  const addArrayItem = (field, item) => {
    if (!item.trim()) return;
    onChange({ ...topico, [field]: [...(topico[field] || []), item] });
  };

  const removeArrayItem = (field, index) => {
    onChange({ ...topico, [field]: topico[field].filter((_, i) => i !== index) });
  };

  const addPassoExame = () => {
    onChange({
      ...topico,
      exame_fisico_passos: [...(topico.exame_fisico_passos || []), { ordem: (topico.exame_fisico_passos?.length || 0) + 1, passo: '', tecnica: '' }]
    });
  };

  const updatePassoExame = (index, field, value) => {
    const novosPassos = [...topico.exame_fisico_passos];
    novosPassos[index][field] = value;
    onChange({ ...topico, exame_fisico_passos: novosPassos });
  };

  const addAchadoPatologico = () => {
    onChange({
      ...topico,
      achados_patologicos: [...(topico.achados_patologicos || []), { achado: '', interpretacao: '' }]
    });
  };

  const updateAchadoPatologico = (index, field, value) => {
    const novosAchados = [...topico.achados_patologicos];
    novosAchados[index][field] = value;
    onChange({ ...topico, achados_patologicos: novosAchados });
  };

  const addReferencia = () => {
    onChange({
      ...topico,
      referencias_utilizadas: [...(topico.referencias_utilizadas || []), { tipo: 'livro', referencia_completa: '' }]
    });
  };

  const updateReferencia = (index, field, value) => {
    const novasRefs = [...topico.referencias_utilizadas];
    novasRefs[index][field] = value;
    onChange({ ...topico, referencias_utilizadas: novasRefs });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {topico.id ? 'Editar Tópico de Semiologia' : 'Novo Tópico de Semiologia'}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancelar} disabled={salvando}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={onSalvar} disabled={salvando} className="bg-blue-600 hover:bg-blue-700">
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
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Nome do Tópico *</label>
            <Input
              value={topico.nome_topico}
              onChange={(e) => updateField('nome_topico', e.target.value)}
              placeholder="Ex: Ausculta Cardíaca"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Sistema/Domínio *</label>
            <Select value={topico.sistema_dominio} onValueChange={(v) => updateField('sistema_dominio', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="cardiologia">Cardiovascular</SelectItem>
                <SelectItem value="pneumologia">Respiratório</SelectItem>
                <SelectItem value="neurologia">Neurológico</SelectItem>
                <SelectItem value="gastroenterologia">Gastroenterológico</SelectItem>
                <SelectItem value="musculoesqueletico">Musculoesquelético</SelectItem>
                <SelectItem value="psiquiatria">Psiquiátrico</SelectItem>
                <SelectItem value="pediatria">Pediátrico</SelectItem>
                <SelectItem value="ginecologia">Ginecológico</SelectItem>
                <SelectItem value="dermatologia">Dermatológico</SelectItem>
                <SelectItem value="oftalmologia">Oftalmológico</SelectItem>
                <SelectItem value="otorrinolaringologia">Otorrinolaringológico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Status</label>
            <Select value={topico.status} onValueChange={(v) => updateField('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="em_revisao">Em Revisão</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Versão</label>
            <Input value={topico.versao || '1.0'} disabled className="bg-slate-50" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Objetivo Clínico *</label>
          <Textarea
            value={topico.objetivo_clinico}
            onChange={(e) => updateField('objetivo_clinico', e.target.value)}
            rows={2}
            placeholder="Objetivo do exame semiológico"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Fundamentos Fisiopatológicos</label>
          <Textarea
            value={topico.fundamentos_fisiopatologicos}
            onChange={(e) => updateField('fundamentos_fisiopatologicos', e.target.value)}
            rows={3}
            placeholder="Fundamentos resumidos"
          />
        </div>

        <ArrayField
          label="Anamnese Dirigida"
          items={topico.anamnese_dirigida}
          onAdd={(item) => addArrayItem('anamnese_dirigida', item)}
          onRemove={(i) => removeArrayItem('anamnese_dirigida', i)}
          placeholder="Ex: História de dispneia aos esforços?"
        />

        <ArrayField
          label="Sinais e Sintomas Relevantes"
          items={topico.sinais_sintomas_relevantes}
          onAdd={(item) => addArrayItem('sinais_sintomas_relevantes', item)}
          onRemove={(i) => removeArrayItem('sinais_sintomas_relevantes', i)}
          placeholder="Ex: Dispneia, dor torácica"
        />

        {/* Exame Físico Passo a Passo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">Exame Físico Passo a Passo</label>
            <Button variant="outline" size="sm" onClick={addPassoExame}>
              <Plus className="w-3 h-3 mr-1" /> Adicionar Passo
            </Button>
          </div>
          {topico.exame_fisico_passos?.map((passo, i) => (
            <div key={i} className="grid gap-2 mb-2 p-3 bg-slate-50 rounded border">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="#"
                  value={passo.ordem}
                  onChange={(e) => updatePassoExame(i, 'ordem', parseInt(e.target.value))}
                  className="w-16 text-sm"
                />
                <Input
                  placeholder="Nome do passo"
                  value={passo.passo}
                  onChange={(e) => updatePassoExame(i, 'passo', e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button variant="ghost" size="sm" onClick={() => removeArrayItem('exame_fisico_passos', i)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Textarea
                placeholder="Técnica detalhada"
                value={passo.tecnica}
                onChange={(e) => updatePassoExame(i, 'tecnica', e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          ))}
        </div>

        <ArrayField
          label="Achados Normais"
          items={topico.achados_normais}
          onAdd={(item) => addArrayItem('achados_normais', item)}
          onRemove={(i) => removeArrayItem('achados_normais', i)}
          placeholder="Ex: Bulhas normofonéticas em 2T"
        />

        {/* Achados Patológicos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">Achados Patológicos</label>
            <Button variant="outline" size="sm" onClick={addAchadoPatologico}>
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </Button>
          </div>
          {topico.achados_patologicos?.map((achado, i) => (
            <div key={i} className="grid gap-2 mb-2 p-2 bg-amber-50 rounded border border-amber-100">
              <Input
                placeholder="Achado"
                value={achado.achado}
                onChange={(e) => updateAchadoPatologico(i, 'achado', e.target.value)}
                className="text-sm"
              />
              <Textarea
                placeholder="Interpretação clínica"
                value={achado.interpretacao}
                onChange={(e) => updateAchadoPatologico(i, 'interpretacao', e.target.value)}
                rows={2}
                className="text-sm"
              />
              <Button variant="ghost" size="sm" onClick={() => removeArrayItem('achados_patologicos', i)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        <ArrayField
          label="Red Flags Semiológicas"
          items={topico.red_flags_semiologicas}
          onAdd={(item) => addArrayItem('red_flags_semiologicas', item)}
          onRemove={(i) => removeArrayItem('red_flags_semiologicas', i)}
          placeholder="Ex: Hipotensão + taquicardia"
          highlight
        />

        <ArrayField
          label="Quando Avançar Investigação"
          items={topico.quando_avancar_investigacao}
          onAdd={(item) => addArrayItem('quando_avancar_investigacao', item)}
          onRemove={(i) => removeArrayItem('quando_avancar_investigacao', i)}
          placeholder="Ex: Sopro sistólico > grau 3"
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Aplicação Prática no PA e APS</label>
          <Textarea
            value={topico.aplicacao_pratica}
            onChange={(e) => updateField('aplicacao_pratica', e.target.value)}
            rows={3}
            placeholder="Como aplicar na prática"
          />
        </div>

        <ArrayField
          label="Afecções Relacionadas (slugs)"
          items={topico.afeccoes_relacionadas}
          onAdd={(item) => addArrayItem('afeccoes_relacionadas', item)}
          onRemove={(i) => removeArrayItem('afeccoes_relacionadas', i)}
          placeholder="Ex: infarto-agudo-miocardio"
        />

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
          
          {(!topico.referencias_utilizadas || topico.referencias_utilizadas.length === 0) && (
            <div className="bg-red-50 border border-red-200 p-3 rounded mb-2">
              <p className="text-xs text-red-800">
                ⚠️ <strong>Atenção:</strong> É obrigatório adicionar pelo menos uma referência científica.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            {topico.referencias_utilizadas?.map((ref, i) => (
              <div key={i} className="flex gap-2 p-3 bg-white border border-blue-200 rounded-lg">
                <Select value={ref.tipo} onValueChange={(v) => updateReferencia(i, 'tipo', v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livro">Livro</SelectItem>
                    <SelectItem value="artigo">Artigo</SelectItem>
                    <SelectItem value="diretriz">Diretriz</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Ex: BATES, B. Propedêutica Médica. 11ª ed. Rio de Janeiro: Guanabara Koogan, 2013."
                  value={ref.referencia_completa}
                  onChange={(e) => updateReferencia(i, 'referencia_completa', e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button variant="ghost" size="sm" onClick={() => removeArrayItem('referencias_utilizadas', i)} className="hover:bg-red-50">
                  <X className="w-3 h-3 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-[10px] text-blue-700 mt-2">
            ℹ️ Formato ABNT. Ex: BATES, B. Propedêutica Médica. 11ª ed. Rio de Janeiro: Guanabara Koogan, 2013.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> {topico.disclaimer || "Conteúdo educacional. Não substitui exame clínico adequado nem julgamento médico individual."}
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
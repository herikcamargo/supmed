import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Save, FileText, Trash2 } from 'lucide-react';

export default function FormularioGenerico({ conteudo, onChange, onSalvar, onCancelar, salvando }) {
  const [campoNovo, setCampoNovo] = useState({ chave: '', valor: '' });

  const updateField = (field, value) => {
    onChange({ ...conteudo, [field]: value });
  };

  const updateConteudo = (chave, valor) => {
    onChange({
      ...conteudo,
      conteudo_estruturado: {
        ...conteudo.conteudo_estruturado,
        [chave]: valor
      }
    });
  };

  const adicionarCampo = () => {
    if (!campoNovo.chave) return;
    updateConteudo(campoNovo.chave, campoNovo.valor);
    setCampoNovo({ chave: '', valor: '' });
  };

  const removerCampo = (chave) => {
    const novoConteudo = { ...conteudo.conteudo_estruturado };
    delete novoConteudo[chave];
    onChange({ ...conteudo, conteudo_estruturado: novoConteudo });
  };

  const addReferencia = () => {
    onChange({
      ...conteudo,
      referencias: [...(conteudo.referencias || []), { tipo: 'livro', referencia_completa: '' }]
    });
  };

  const updateReferencia = (index, field, value) => {
    const novasRefs = [...conteudo.referencias];
    novasRefs[index][field] = value;
    onChange({ ...conteudo, referencias: novasRefs });
  };

  const removeReferencia = (index) => {
    onChange({ ...conteudo, referencias: conteudo.referencias.filter((_, i) => i !== index) });
  };

  const addTag = (tag) => {
    if (!tag.trim()) return;
    onChange({ ...conteudo, tags: [...(conteudo.tags || []), tag] });
  };

  const removeTag = (index) => {
    onChange({ ...conteudo, tags: conteudo.tags.filter((_, i) => i !== index) });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {conteudo.id ? 'Editar Conteúdo' : 'Novo Conteúdo'}
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
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Título *</label>
            <Input
              value={conteudo.titulo}
              onChange={(e) => updateField('titulo', e.target.value)}
              placeholder="Título do conteúdo"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Categoria</label>
            <Input
              value={conteudo.categoria}
              onChange={(e) => updateField('categoria', e.target.value)}
              placeholder="Ex: cardiologia, geral"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Status</label>
            <Select value={conteudo.status} onValueChange={(v) => updateField('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="pendente">Pendente Aprovação</SelectItem>
                <SelectItem value="em_revisao">Em Revisão</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Versão</label>
            <Input value={conteudo.versao || '1.0'} disabled className="bg-slate-50" />
          </div>
        </div>

        {/* Calculadora - Tabela de Pontuação */}
        {conteudo.tipo_modulo === 'calculadora' && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tabela de Pontuação</h3>
            <TabelaPontuacao
              parametros={conteudo.conteudo_estruturado?.parametros || []}
              onChange={(parametros) => onChange({
                ...conteudo,
                conteudo_estruturado: { ...conteudo.conteudo_estruturado, parametros }
              })}
            />
          </div>
        )}

        {/* Conteúdo Estruturado */}
        <div className="border rounded-lg p-4 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Conteúdo Estruturado</h3>
          
          {/* Campos Existentes */}
          {Object.entries(conteudo.conteudo_estruturado || {}).map(([chave, valor]) => (
            <div key={chave} className="mb-3 p-3 bg-white rounded border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">{chave}</span>
                <Button variant="ghost" size="sm" onClick={() => removerCampo(chave)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Textarea
                value={typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)}
                onChange={(e) => updateConteudo(chave, e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          ))}

          {/* Adicionar Novo Campo */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Input
              placeholder="Nome do campo"
              value={campoNovo.chave}
              onChange={(e) => setCampoNovo({ ...campoNovo, chave: e.target.value })}
              className="text-sm"
            />
            <Input
              placeholder="Valor"
              value={campoNovo.valor}
              onChange={(e) => setCampoNovo({ ...campoNovo, valor: e.target.value })}
              className="text-sm"
            />
            <Button variant="outline" size="sm" onClick={adicionarCampo}>
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-2 block">Tags</label>
          <TagInput
            tags={conteudo.tags || []}
            onAdd={addTag}
            onRemove={removeTag}
          />
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
          
          {(!conteudo.referencias || conteudo.referencias.length === 0) && (
            <div className="bg-red-50 border border-red-200 p-3 rounded mb-2">
              <p className="text-xs text-red-800">
                ⚠️ <strong>Atenção:</strong> É obrigatório adicionar pelo menos uma referência científica.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            {conteudo.referencias?.map((ref, i) => (
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
                  placeholder="Ex: SOCIEDADE. Diretriz sobre Tema. Revista, v.X, n.Y, p.Z, 2024."
                  value={ref.referencia_completa}
                  onChange={(e) => updateReferencia(i, 'referencia_completa', e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button variant="ghost" size="sm" onClick={() => removeReferencia(i)} className="hover:bg-red-50">
                  <X className="w-3 h-3 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-[10px] text-blue-700 mt-2">
            ℹ️ Adicione as fontes científicas utilizadas na elaboração deste conteúdo
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> {conteudo.disclaimer || "Conteúdo educacional. Não substitui julgamento clínico individual nem prescrição médica."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TabelaPontuacao({ parametros, onChange }) {
  const addParametro = () => {
    onChange([...parametros, { nome: '', opcoes: [{ descricao: '', pontos: 0 }] }]);
  };

  const updateParametro = (index, field, value) => {
    const novos = [...parametros];
    novos[index][field] = value;
    onChange(novos);
  };

  const addOpcao = (paramIndex) => {
    const novos = [...parametros];
    novos[paramIndex].opcoes.push({ descricao: '', pontos: 0 });
    onChange(novos);
  };

  const updateOpcao = (paramIndex, opcaoIndex, field, value) => {
    const novos = [...parametros];
    novos[paramIndex].opcoes[opcaoIndex][field] = value;
    onChange(novos);
  };

  const removeOpcao = (paramIndex, opcaoIndex) => {
    const novos = [...parametros];
    novos[paramIndex].opcoes.splice(opcaoIndex, 1);
    onChange(novos);
  };

  const removeParametro = (index) => {
    onChange(parametros.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {parametros.map((param, pIdx) => (
        <div key={pIdx} className="bg-white rounded-lg p-3 border">
          <div className="flex items-center gap-2 mb-2">
            <Input
              placeholder="Nome do parâmetro (ex: Idade)"
              value={param.nome}
              onChange={(e) => updateParametro(pIdx, 'nome', e.target.value)}
              className="flex-1 text-sm font-medium"
            />
            <Button variant="ghost" size="sm" onClick={() => removeParametro(pIdx)}>
              <X className="w-4 h-4 text-red-500" />
            </Button>
          </div>
          
          {param.opcoes?.map((opcao, oIdx) => (
            <div key={oIdx} className="flex items-center gap-2 mb-1 ml-4">
              <Input
                placeholder="Descrição (ex: < 40 anos)"
                value={opcao.descricao}
                onChange={(e) => updateOpcao(pIdx, oIdx, 'descricao', e.target.value)}
                className="flex-1 text-xs"
              />
              <Input
                type="number"
                placeholder="Pontos"
                value={opcao.pontos}
                onChange={(e) => updateOpcao(pIdx, oIdx, 'pontos', parseInt(e.target.value) || 0)}
                className="w-20 text-xs"
              />
              <Button variant="ghost" size="sm" onClick={() => removeOpcao(pIdx, oIdx)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          <Button variant="outline" size="sm" onClick={() => addOpcao(pIdx)} className="ml-4 mt-1">
            <Plus className="w-3 h-3 mr-1" /> Opção
          </Button>
        </div>
      ))}
      
      <Button variant="outline" onClick={addParametro} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Adicionar Parâmetro
      </Button>
    </div>
  );
}

function TagInput({ tags, onAdd, onRemove }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    onAdd(input);
    setInput('');
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Adicionar tag"
          className="text-sm"
        />
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <div key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
            {tag}
            <button onClick={() => onRemove(i)} className="hover:text-blue-900">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
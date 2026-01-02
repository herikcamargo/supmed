import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import useOptimizedSearch from '../search/useOptimizedSearch';
import {
  Pill,
  Plus,
  Trash2,
  Copy,
  Check,
  FolderPlus,
  FileText,
  Search,
  Edit2,
  ChevronRight,
  Shield,
  Loader2
} from 'lucide-react';

// Categorias vazias - usuário preenche manualmente
const modelosPadrao = {
  'Infecções': [],
  'Dor e Inflamação': [],
  'Gastrointestinal': [],
  'Respiratório': [],
  'Dermatológico': []
};

export default function PlantonistaPrescricao() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  // Dialog states
  const [showNovaCategoria, setShowNovaCategoria] = useState(false);
  const [showNovaPrescricao, setShowNovaPrescricao] = useState(false);
  const [showEditPrescricao, setShowEditPrescricao] = useState(false);
  
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaPrescricao, setNovaPrescricao] = useState({ nome: '', conteudo: '' });
  const [editPrescricao, setEditPrescricao] = useState({ id: '', nome: '', conteudo: '', categoria: '' });

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('supmed_prescricoes');
    if (saved) {
      setCategorias(JSON.parse(saved));
    } else {
      // Inicializar com modelos padrão
      const initial = Object.entries(modelosPadrao).map(([nome, prescricoes]) => ({
        id: nome.toLowerCase().replace(/\s+/g, '_'),
        nome,
        prescricoes: prescricoes.map(p => ({ ...p, id: `${nome}_${p.id}` }))
      }));
      setCategorias(initial);
      localStorage.setItem('supmed_prescricoes', JSON.stringify(initial));
    }
  }, []);

  // Salvar no localStorage
  const salvar = (novasCategorias) => {
    setCategorias(novasCategorias);
    localStorage.setItem('supmed_prescricoes', JSON.stringify(novasCategorias));
  };

  // Adicionar categoria
  const adicionarCategoria = () => {
    if (!novaCategoria.trim()) return;
    const nova = {
      id: Date.now().toString(),
      nome: novaCategoria,
      prescricoes: []
    };
    salvar([...categorias, nova]);
    setNovaCategoria('');
    setShowNovaCategoria(false);
    setCategoriaAtiva(nova.id);
  };

  // Remover categoria
  const removerCategoria = (id) => {
    if (confirm('Tem certeza que deseja remover esta categoria e todas as prescrições dentro dela?')) {
      salvar(categorias.filter(c => c.id !== id));
      if (categoriaAtiva === id) setCategoriaAtiva('');
    }
  };

  // Adicionar prescrição
  const adicionarPrescricao = () => {
    if (!novaPrescricao.nome.trim() || !novaPrescricao.conteudo.trim()) return;
    const novasCategorias = categorias.map(c => {
      if (c.id === categoriaAtiva) {
        return {
          ...c,
          prescricoes: [...c.prescricoes, { 
            id: Date.now().toString(), 
            nome: novaPrescricao.nome, 
            conteudo: novaPrescricao.conteudo 
          }]
        };
      }
      return c;
    });
    salvar(novasCategorias);
    setNovaPrescricao({ nome: '', conteudo: '' });
    setShowNovaPrescricao(false);
  };

  // Editar prescrição
  const salvarEdicao = () => {
    const novasCategorias = categorias.map(c => {
      if (c.id === editPrescricao.categoria) {
        return {
          ...c,
          prescricoes: c.prescricoes.map(p => 
            p.id === editPrescricao.id 
              ? { ...p, nome: editPrescricao.nome, conteudo: editPrescricao.conteudo }
              : p
          )
        };
      }
      return c;
    });
    salvar(novasCategorias);
    setShowEditPrescricao(false);
  };

  // Remover prescrição
  const removerPrescricao = (categoriaId, prescricaoId) => {
    if (confirm('Tem certeza que deseja remover esta prescrição?')) {
      const novasCategorias = categorias.map(c => {
        if (c.id === categoriaId) {
          return {
            ...c,
            prescricoes: c.prescricoes.filter(p => p.id !== prescricaoId)
          };
        }
        return c;
      });
      salvar(novasCategorias);
    }
  };

  // Copiar prescrição
  const copiar = async (prescricao) => {
    await navigator.clipboard.writeText(prescricao.conteudo);
    setCopiedId(prescricao.id);
    toast.success('Prescrição copiada!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { 
    searchTerm, 
    setSearchTerm, 
    results: categoriasFiltradas,
    isSearching 
  } = useOptimizedSearch(categorias, ['nome', 'prescricoes'], { debounceMs: 150 });

  const categoriaAtual = categorias.find(c => c.id === categoriaAtiva);

  return (
    <div className="space-y-4">
      {/* Banner de Responsabilidade */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <strong>Área de apoio à prescrição.</strong> Revisar antes de utilizar.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Modelos de prescrição por categoria</p>
        <Dialog open={showNovaCategoria} onOpenChange={setShowNovaCategoria}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
              <FolderPlus className="w-3 h-3 mr-1" /> Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm">Nova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input
                placeholder="Nome da categoria (ex: Pediatria, Cardiologia...)"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                className="h-8 text-sm"
              />
              <Button onClick={adicionarCategoria} className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                Criar Categoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-white/80 border border-slate-200/50">
        <CardContent className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Buscar categoria ou prescrição..."
              className="pl-8 pr-8 h-8 text-xs bg-slate-50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500 animate-spin" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-3">
        {/* Categorias (Sidebar) */}
        <Card className="bg-white/80 border border-slate-200/50 lg:col-span-1">
          <CardContent className="p-2">
            <p className="text-[9px] text-slate-500 uppercase font-semibold px-2 py-1">Categorias</p>
            <div className="space-y-0.5">
              {categoriasFiltradas.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaAtiva(cat.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                    categoriaAtiva === cat.id 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-medium truncate">{cat.nome}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-[8px] h-3.5 px-1">
                      {cat.prescricoes.length}
                    </Badge>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prescrições da Categoria */}
        <Card className="bg-white/80 border border-slate-200/50 lg:col-span-3">
          <CardContent className="p-3">
            {categoriaAtual ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-800">{categoriaAtual.nome}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 text-red-500 hover:bg-red-50"
                      onClick={() => removerCategoria(categoriaAtual.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Dialog open={showNovaPrescricao} onOpenChange={setShowNovaPrescricao}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-sm">Nova Prescrição - {categoriaAtual.nome}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 mt-2">
                        <div>
                          <Label className="text-xs">Nome da Prescrição</Label>
                          <Input
                            placeholder="Ex: Amigdalite Bacteriana"
                            value={novaPrescricao.nome}
                            onChange={(e) => setNovaPrescricao({...novaPrescricao, nome: e.target.value})}
                            className="h-8 text-sm mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Conteúdo da Prescrição</Label>
                          <Textarea
                            placeholder="Digite a prescrição completa..."
                            value={novaPrescricao.conteudo}
                            onChange={(e) => setNovaPrescricao({...novaPrescricao, conteudo: e.target.value})}
                            className="min-h-[120px] text-xs mt-1"
                          />
                        </div>
                        <Button onClick={adicionarPrescricao} className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                          Salvar Prescrição
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {categoriaAtual.prescricoes.length > 0 ? (
                  <Tabs defaultValue={categoriaAtual.prescricoes[0]?.id} className="w-full">
                    <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-slate-50 p-1">
                      {categoriaAtual.prescricoes.map((presc) => (
                        <TabsTrigger 
                          key={presc.id} 
                          value={presc.id}
                          className="text-[10px] h-6 px-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                        >
                          {presc.nome}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {categoriaAtual.prescricoes.map((presc) => (
                      <TabsContent key={presc.id} value={presc.id} className="mt-2">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-slate-700">{presc.nome}</h4>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-slate-500 hover:text-slate-700"
                                onClick={() => {
                                  setEditPrescricao({ ...presc, categoria: categoriaAtual.id });
                                  setShowEditPrescricao(true);
                                }}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                onClick={() => removerPrescricao(categoriaAtual.id, presc.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className={`h-6 text-[10px] gap-1 ${copiedId === presc.id ? 'bg-green-50 text-green-700 border-green-300' : ''}`}
                                onClick={() => copiar(presc)}
                              >
                                {copiedId === presc.id ? (
                                  <><Check className="w-3 h-3" /> Copiado!</>
                                ) : (
                                  <><Copy className="w-3 h-3" /> Copiar</>
                                )}
                              </Button>
                            </div>
                          </div>
                          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-slate-100">
                            {presc.conteudo}
                          </pre>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Nenhuma prescrição nesta categoria</p>
                    <p className="text-[10px] text-slate-400">Clique em "Adicionar" para começar</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Pill className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Selecione uma categoria</p>
                <p className="text-xs text-slate-400">ou crie uma nova para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Editar */}
      <Dialog open={showEditPrescricao} onOpenChange={setShowEditPrescricao}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Editar Prescrição</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input
                value={editPrescricao.nome}
                onChange={(e) => setEditPrescricao({...editPrescricao, nome: e.target.value})}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Conteúdo</Label>
              <Textarea
                value={editPrescricao.conteudo}
                onChange={(e) => setEditPrescricao({...editPrescricao, conteudo: e.target.value})}
                className="min-h-[120px] text-xs mt-1"
              />
            </div>
            <Button onClick={salvarEdicao} className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
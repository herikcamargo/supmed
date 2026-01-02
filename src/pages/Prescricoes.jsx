import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
  X
} from 'lucide-react';

// Modelos padrão de prescrições por categoria
const modelosPadrao = {
  'Infecções': [
    { id: 'amigdalite', nome: 'Amigdalite Bacteriana', conteudo: 'Amoxicilina 500mg VO 8/8h por 10 dias\nIbuprofeno 400mg VO 8/8h se dor/febre\nCloreto de sódio 0,9% gargarejos 3x/dia' },
    { id: 'itu', nome: 'ITU não complicada', conteudo: 'Nitrofurantoína 100mg VO 6/6h por 5 dias\nPyridium 200mg VO 8/8h por 2 dias (se disúria intensa)\nHidratação oral abundante' },
    { id: 'pneumonia', nome: 'Pneumonia Comunitária', conteudo: 'Azitromicina 500mg VO 1x/dia por 5 dias\nou\nAmoxicilina + Clavulanato 875/125mg VO 12/12h por 7 dias\nDipirona 1g VO 6/6h se febre > 37,8°C' }
  ],
  'Dor e Inflamação': [
    { id: 'lombalgia', nome: 'Lombalgia Aguda', conteudo: 'Ciclobenzaprina 5mg VO 8/8h por 5-7 dias\nCetoprofeno 100mg VO 12/12h por 5 dias (após refeições)\nCompressas mornas no local 3x/dia' },
    { id: 'cefaleia', nome: 'Cefaleia Tensional', conteudo: 'Dipirona 1g VO dose única (pode repetir 6/6h se necessário)\nOrfenadrina 35mg + Dipirona 300mg VO 8/8h por 3 dias\nRepouso em ambiente escuro' },
    { id: 'artrite', nome: 'Artrite/Artralgia', conteudo: 'Diclofenaco 50mg VO 8/8h por 5-7 dias\nOmeprazol 20mg VO em jejum\nGelo local 20min 3-4x/dia' }
  ],
  'Gastrointestinal': [
    { id: 'geca', nome: 'Gastroenterite Aguda', conteudo: 'SRO (Sais de Reidratação Oral) 200ml após cada evacuação\nRacecadotrila 100mg VO 8/8h até cessar diarreia\nDieta branda, evitar laticínios' },
    { id: 'drge', nome: 'DRGE', conteudo: 'Omeprazol 20mg VO em jejum 1x/dia por 4-8 semanas\nDomperidona 10mg VO 15min antes das refeições\nCabeceira elevada, evitar deitar após refeições' },
    { id: 'dispepsia', nome: 'Dispepsia Funcional', conteudo: 'Pantoprazol 40mg VO em jejum por 4 semanas\nDimeticona 40 gotas VO após refeições se flatulência\nEvitar alimentos gordurosos, café e álcool' }
  ],
  'Respiratório': [
    { id: 'ivas', nome: 'IVAS / Resfriado', conteudo: 'Paracetamol 750mg VO 6/6h se febre ou dor\nLoratadina 10mg VO 1x/dia se sintomas alérgicos\nLavagem nasal com SF 0,9% várias vezes ao dia\nHidratação abundante' },
    { id: 'sinusite', nome: 'Sinusite Aguda', conteudo: 'Amoxicilina 500mg VO 8/8h por 10-14 dias\nBudesonida nasal 64mcg 2 jatos cada narina 2x/dia\nLavagem nasal com SF 0,9%\nDescongestionante oral por até 5 dias' },
    { id: 'asma_crise', nome: 'Crise Asmática Leve', conteudo: 'Salbutamol spray 100mcg 4-8 jatos com espaçador a cada 20min (até 3 doses)\nPrednisona 40-60mg VO dose única pela manhã por 5-7 dias\nManter medicação de controle se em uso' }
  ],
  'Dermatológico': [
    { id: 'micose', nome: 'Micose Cutânea', conteudo: 'Cetoconazol creme 2% aplicar 2x/dia por 2-4 semanas\nou\nTerbinafina creme 1% aplicar 1-2x/dia por 1-2 semanas\nManter área seca e limpa' },
    { id: 'impetigo', nome: 'Impetigo', conteudo: 'Mupirocina pomada 2% aplicar 3x/dia por 5-7 dias\nSe extenso: Cefalexina 500mg VO 6/6h por 7 dias\nLimpeza com água e sabão neutro' },
    { id: 'urticaria', nome: 'Urticária Aguda', conteudo: 'Loratadina 10mg VO 1x/dia ou Cetirizina 10mg VO 1x/dia\nSe grave: Prednisona 40mg VO 1x/dia por 3-5 dias\nEvitar gatilhos identificados' }
  ]
};

export default function Prescricoes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
    salvar(categorias.filter(c => c.id !== id));
    if (categoriaAtiva === id) setCategoriaAtiva('');
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
  };

  // Copiar prescrição
  const copiar = async (prescricao) => {
    await navigator.clipboard.writeText(prescricao.conteudo);
    setCopiedId(prescricao.id);
    toast.success('Prescrição copiada!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtrar categorias e prescrições
  const categoriasFiltradas = categorias.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.prescricoes.some(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categoriaAtual = categorias.find(c => c.id === categoriaAtiva);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Modelos de Prescrição</h1>
                <p className="text-xs text-slate-500">Suas prescrições salvas por doença</p>
              </div>
            </div>
            
            <Dialog open={showNovaCategoria} onOpenChange={setShowNovaCategoria}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                  <FolderPlus className="w-3.5 h-3.5 mr-1" /> Nova Categoria
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
                    className="h-9 text-sm"
                  />
                  <Button onClick={adicionarCategoria} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                    Criar Categoria
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card className="bg-white/80 border border-slate-200/50 mb-4">
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar categoria ou prescrição..."
                  className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Categorias (Sidebar) */}
            <Card className="bg-white/80 border border-slate-200/50 lg:col-span-1">
              <CardContent className="p-2">
                <p className="text-[10px] text-slate-500 uppercase font-semibold px-2 py-1">Categorias</p>
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
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
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
                          className="h-6 w-6 text-red-500 hover:bg-red-50"
                          onClick={() => removerCategoria(categoriaAtual.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Dialog open={showNovaPrescricao} onOpenChange={setShowNovaPrescricao}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Plus className="w-3 h-3 mr-1" /> Adicionar Prescrição
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
                                className="h-9 text-sm mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Conteúdo da Prescrição</Label>
                              <Textarea
                                placeholder="Digite a prescrição completa..."
                                value={novaPrescricao.conteudo}
                                onChange={(e) => setNovaPrescricao({...novaPrescricao, conteudo: e.target.value})}
                                className="min-h-[150px] text-sm mt-1"
                              />
                            </div>
                            <Button onClick={adicionarPrescricao} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
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
                          <TabsContent key={presc.id} value={presc.id} className="mt-3">
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
                        <p className="text-[10px] text-slate-400">Clique em "Adicionar Prescrição" para começar</p>
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
                    className="h-9 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Conteúdo</Label>
                  <Textarea
                    value={editPrescricao.conteudo}
                    onChange={(e) => setEditPrescricao({...editPrescricao, conteudo: e.target.value})}
                    className="min-h-[150px] text-sm mt-1"
                  />
                </div>
                <Button onClick={salvarEdicao} className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                  Salvar Alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
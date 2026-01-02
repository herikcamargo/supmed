import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Copy,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Heart,
  Brain,
  Wind,
  Bone,
  Plus,
  Trash2,
  Star,
  Save,
  Edit2,
  AlertTriangle
} from 'lucide-react';

const modelosPreDefinidos = [
  { id: 'dor_toracica', titulo: 'Dor Torácica', categoria: 'Cardiologia', modelo: `ID: Paciente de ___ anos, sexo ___.
QP: "Dor no peito" há ___.
HDA: Dor torácica de início ___, localizada em ___, caráter ___, intensidade ___/10, irradiação para ___. Associada a ___.
HPP: ___
Medicações: ___
Alergias: ___` },
  { id: 'dispneia', titulo: 'Dispneia', categoria: 'Pneumologia', modelo: `ID: Paciente de ___ anos, sexo ___.
QP: "Falta de ar" há ___.
HDA: Dispneia de início ___, progressiva/súbita, repouso/esforços. Ortopneia: ___. DPN: ___.
HPP: ___
Tabagismo: ___ maços-ano
Medicações: ___` },
  { id: 'dor_abdominal', titulo: 'Dor Abdominal', categoria: 'Gastro', modelo: `ID: Paciente de ___ anos, sexo ___.
QP: "Dor na barriga" há ___.
HDA: Dor abdominal em ___, caráter ___, intensidade ___/10. Náuseas/vômitos: ___. Última evacuação: ___.
HPP: ___
Cirurgias prévias: ___` },
  { id: 'cefaleia', titulo: 'Cefaleia', categoria: 'Neurologia', modelo: `ID: Paciente de ___ anos, sexo ___.
QP: "Dor de cabeça" há ___.
HDA: Cefaleia de início ___, localizada em ___, caráter ___, intensidade ___/10. Fotofobia/fonofobia: ___. Febre: ___. "Pior dor da vida": ___.
HPP: ___` },
  { id: 'trauma', titulo: 'Trauma - SAMPLE', categoria: 'Emergência', modelo: `S - Sintomas: ___
A - Alergias: ___
M - Medicações: ___
P - Passado médico: ___
L - Última refeição: ___
E - Eventos: ___

MECANISMO: ___
XABCDE: ___` }
];

const exameFisicoModelos = [
  { area: 'Geral', icon: Stethoscope, itens: ['BEG/REG/MEG, LOTE, Glasgow ___', 'Mucosas coradas, hidratadas', 'Acianótico, anictérico', 'Perfusão < 2s'] },
  { area: 'Cardiovascular', icon: Heart, itens: ['BRNF 2T, sem sopros', 'Pulsos simétricos', 'PA: ___x___ mmHg', 'FC: ___ bpm'] },
  { area: 'Respiratório', icon: Wind, itens: ['MV presente bilateral, sem RA', 'Expansibilidade preservada', 'FR: ___ irpm', 'SpO2: ___%'] },
  { area: 'Abdome', icon: Stethoscope, itens: ['Flácido, RHA+, indolor', 'Sem VMG', 'Blumberg/Murphy: neg'] },
  { area: 'Neurológico', icon: Brain, itens: ['LOTE, pupilas isocóricas', 'Força grau V simétrica', 'Sem déficits focais', 'Rigidez nuca: ausente'] },
  { area: 'Extremidades', icon: Bone, itens: ['Sem edema', 'Panturrilhas livres', 'Pulsos periféricos +'] }
];



export default function PlantonistaModelos() {
  const [activeTab, setActiveTab] = useState('meus');
  const [meusModelos, setMeusModelos] = useState([]);
  const [meusExames, setMeusExames] = useState([]);
  const [expandedModelo, setExpandedModelo] = useState(null);
  const [expandedExame, setExpandedExame] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExameDialogOpen, setIsExameDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState(null);
  const [editingExame, setEditingExame] = useState(null);
  const [novoModelo, setNovoModelo] = useState({ titulo: '', categoria: '', modelo: '' });
  const [novoExame, setNovoExame] = useState({ titulo: '', categoria: '', modelo: '' });

  // Carregar modelos salvos
  useEffect(() => {
    const saved = localStorage.getItem('supmed_meus_modelos');
    if (saved) {
      setMeusModelos(JSON.parse(saved));
    }
    
    const savedExames = localStorage.getItem('supmed_meus_exames');
    if (savedExames) {
      setMeusExames(JSON.parse(savedExames));
    }
  }, []);

  // Salvar modelos
  const salvarModelos = (modelos) => {
    localStorage.setItem('supmed_meus_modelos', JSON.stringify(modelos));
    setMeusModelos(modelos);
  };

  // Salvar exames
  const salvarExames = (exames) => {
    localStorage.setItem('supmed_meus_exames', JSON.stringify(exames));
    setMeusExames(exames);
  };

  const adicionarModelo = () => {
    if (!novoModelo.titulo.trim()) return;
    
    const modelo = {
      id: Date.now().toString(),
      ...novoModelo,
      ordem: meusModelos.length
    };
    
    salvarModelos([...meusModelos, modelo]);
    setNovoModelo({ titulo: '', categoria: '', modelo: '' });
    setIsDialogOpen(false);
  };

  const atualizarModelo = () => {
    if (!editingModelo) return;
    
    const atualizados = meusModelos.map(m => 
      m.id === editingModelo.id ? editingModelo : m
    );
    salvarModelos(atualizados);
    setEditingModelo(null);
  };

  const removerModelo = (id) => {
    salvarModelos(meusModelos.filter(m => m.id !== id));
  };

  const moverModelo = (index, direction) => {
    const newModelos = [...meusModelos];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newModelos.length) return;
    
    [newModelos[index], newModelos[newIndex]] = [newModelos[newIndex], newModelos[index]];
    salvarModelos(newModelos);
  };

  // Funções para Exames Físicos
  const adicionarExame = () => {
    if (!novoExame.titulo.trim()) return;
    
    const exame = {
      id: Date.now().toString(),
      ...novoExame,
      ordem: meusExames.length
    };
    
    salvarExames([...meusExames, exame]);
    setNovoExame({ titulo: '', categoria: '', modelo: '' });
    setIsExameDialogOpen(false);
  };

  const atualizarExame = () => {
    if (!editingExame) return;
    
    const atualizados = meusExames.map(m => 
      m.id === editingExame.id ? editingExame : m
    );
    salvarExames(atualizados);
    setEditingExame(null);
  };

  const removerExame = (id) => {
    salvarExames(meusExames.filter(m => m.id !== id));
  };

  const moverExame = (index, direction) => {
    const newExames = [...meusExames];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newExames.length) return;
    
    [newExames[index], newExames[newIndex]] = [newExames[newIndex], newExames[index]];
    salvarExames(newExames);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 border border-slate-200/50 p-0.5 h-8">
          <TabsTrigger value="meus" className="text-[10px] h-7">
            <Star className="w-3 h-3 mr-1" /> Meus Modelos
          </TabsTrigger>
          <TabsTrigger value="exame" className="text-[10px] h-7">
            <Stethoscope className="w-3 h-3 mr-1" /> Exames Físicos
          </TabsTrigger>
        </TabsList>

        {/* Meus Modelos */}
        <TabsContent value="meus" className="mt-3">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-slate-500">{meusModelos.length} modelo(s) salvo(s)</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 text-xs bg-blue-900 hover:bg-blue-800">
                  <Plus className="w-3 h-3 mr-1" /> Novo Modelo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-sm">Criar Novo Modelo</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="text-xs text-slate-600">Título</label>
                    <Input
                      placeholder="Ex: Minha Anamnese Padrão"
                      className="h-8 text-sm"
                      value={novoModelo.titulo}
                      onChange={(e) => setNovoModelo({...novoModelo, titulo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Categoria</label>
                    <Input
                      placeholder="Ex: Cardiologia"
                      className="h-8 text-sm"
                      value={novoModelo.categoria}
                      onChange={(e) => setNovoModelo({...novoModelo, categoria: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Modelo</label>
                    <Textarea
                      placeholder="Digite seu modelo..."
                      className="text-sm h-40"
                      value={novoModelo.modelo}
                      onChange={(e) => setNovoModelo({...novoModelo, modelo: e.target.value})}
                    />
                  </div>
                  <Button onClick={adicionarModelo} className="w-full h-8 text-xs bg-blue-900">
                    <Save className="w-3 h-3 mr-1" /> Salvar Modelo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {meusModelos.length > 0 ? (
            <div className="space-y-2">
              {meusModelos.map((modelo, index) => (
                <Card key={modelo.id} className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 p-2 border-b border-slate-100">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moverModelo(index, -1)} disabled={index === 0} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moverModelo(index, 1)} disabled={index === meusModelos.length - 1} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => setExpandedModelo(expandedModelo === modelo.id ? null : modelo.id)}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-medium text-slate-700">{modelo.titulo}</span>
                        {modelo.categoria && <Badge variant="outline" className="text-[8px]">{modelo.categoria}</Badge>}
                      </button>
                      <button onClick={() => setEditingModelo(modelo)} className="p-1 hover:bg-slate-100 rounded">
                        <Edit2 className="w-3 h-3 text-slate-400" />
                      </button>
                      <button onClick={() => removerModelo(modelo.id)} className="p-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                    {expandedModelo === modelo.id && (
                      <div className="p-3">
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 p-2 rounded">
                          {modelo.modelo}
                        </pre>
                        <Button size="sm" variant="outline" className="mt-2 text-[10px] h-6" onClick={() => copyToClipboard(modelo.modelo)}>
                          <Copy className="w-2.5 h-2.5 mr-1" /> Copiar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-6 text-center">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum modelo salvo</p>
                <p className="text-[10px] text-slate-300 mt-1">Crie ou copie modelos das outras abas</p>
              </CardContent>
            </Card>
          )}

          {/* Dialog de edição */}
          {editingModelo && (
            <Dialog open={!!editingModelo} onOpenChange={() => setEditingModelo(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-sm">Editar Modelo</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <Input
                    className="h-8 text-sm"
                    value={editingModelo.titulo}
                    onChange={(e) => setEditingModelo({...editingModelo, titulo: e.target.value})}
                  />
                  <Input
                    className="h-8 text-sm"
                    value={editingModelo.categoria}
                    onChange={(e) => setEditingModelo({...editingModelo, categoria: e.target.value})}
                  />
                  <Textarea
                    className="text-sm h-40"
                    value={editingModelo.modelo}
                    onChange={(e) => setEditingModelo({...editingModelo, modelo: e.target.value})}
                  />
                  <Button onClick={atualizarModelo} className="w-full h-8 text-xs bg-blue-900">
                    Salvar Alterações
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>



        {/* Exames Físicos - Idêntico a Meus Modelos */}
        <TabsContent value="exame" className="mt-3">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs text-slate-500">{meusExames.length} exame(s) salvo(s)</p>
            <Dialog open={isExameDialogOpen} onOpenChange={setIsExameDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 text-xs bg-blue-900 hover:bg-blue-800">
                  <Plus className="w-3 h-3 mr-1" /> Novo Exame
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-sm">Criar Novo Exame Físico</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="text-xs text-slate-600">Título</label>
                    <Input
                      placeholder="Ex: Exame Cardiovascular Completo"
                      className="h-8 text-sm"
                      value={novoExame.titulo}
                      onChange={(e) => setNovoExame({...novoExame, titulo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Categoria</label>
                    <Input
                      placeholder="Ex: Cardiologia"
                      className="h-8 text-sm"
                      value={novoExame.categoria}
                      onChange={(e) => setNovoExame({...novoExame, categoria: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Modelo</label>
                    <Textarea
                      placeholder="Digite seu modelo de exame físico..."
                      className="text-sm h-40"
                      value={novoExame.modelo}
                      onChange={(e) => setNovoExame({...novoExame, modelo: e.target.value})}
                    />
                  </div>
                  <Button onClick={adicionarExame} className="w-full h-8 text-xs bg-blue-900">
                    <Save className="w-3 h-3 mr-1" /> Salvar Exame
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {meusExames.length > 0 ? (
            <div className="space-y-2">
              {meusExames.map((exame, index) => (
                <Card key={exame.id} className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 p-2 border-b border-slate-100">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moverExame(index, -1)} disabled={index === 0} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moverExame(index, 1)} disabled={index === meusExames.length - 1} className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => setExpandedExame(expandedExame === exame.id ? null : exame.id)}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-slate-700">{exame.titulo}</span>
                        {exame.categoria && <Badge variant="outline" className="text-[8px]">{exame.categoria}</Badge>}
                      </button>
                      <button onClick={() => setEditingExame(exame)} className="p-1 hover:bg-slate-100 rounded">
                        <Edit2 className="w-3 h-3 text-slate-400" />
                      </button>
                      <button onClick={() => removerExame(exame.id)} className="p-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                    {expandedExame === exame.id && (
                      <div className="p-3">
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 p-2 rounded">
                          {exame.modelo}
                        </pre>
                        <Button size="sm" variant="outline" className="mt-2 text-[10px] h-6" onClick={() => copyToClipboard(exame.modelo)}>
                          <Copy className="w-2.5 h-2.5 mr-1" /> Copiar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
              <CardContent className="p-6 text-center">
                <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum exame físico salvo</p>
                <p className="text-[10px] text-slate-300 mt-1">Crie seus próprios modelos de exame físico</p>
              </CardContent>
            </Card>
          )}

          {/* Dialog de edição de exame */}
          {editingExame && (
            <Dialog open={!!editingExame} onOpenChange={() => setEditingExame(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-sm">Editar Exame Físico</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <Input
                    className="h-8 text-sm"
                    value={editingExame.titulo}
                    onChange={(e) => setEditingExame({...editingExame, titulo: e.target.value})}
                  />
                  <Input
                    className="h-8 text-sm"
                    value={editingExame.categoria}
                    onChange={(e) => setEditingExame({...editingExame, categoria: e.target.value})}
                  />
                  <Textarea
                    className="text-sm h-40"
                    value={editingExame.modelo}
                    onChange={(e) => setEditingExame({...editingExame, modelo: e.target.value})}
                  />
                  <Button onClick={atualizarExame} className="w-full h-8 text-xs bg-blue-900">
                    Salvar Alterações
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
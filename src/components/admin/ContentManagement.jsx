import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit, Trash2, Save, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { addAdminLog } from './AdminLogs';

export default function ContentManagement({ currentUser }) {
  const [activeTab, setActiveTab] = useState('jornal');
  const [edicoes, setEdicoes] = useState([]);
  const [editingEdicao, setEditingEdicao] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadEdicoes();
  }, []);

  const loadEdicoes = () => {
    const stored = JSON.parse(localStorage.getItem('supmed_jornal_edicoes') || '[]');
    setEdicoes(stored);
  };

  const saveEdicao = () => {
    if (!editingEdicao.numero_edicao || !editingEdicao.data_inicio) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const allEdicoes = [...edicoes];
    const existingIndex = allEdicoes.findIndex(e => e.id === editingEdicao.id);

    if (existingIndex >= 0) {
      const previous = allEdicoes[existingIndex];
      allEdicoes[existingIndex] = editingEdicao;
      addAdminLog(
        currentUser.id,
        currentUser.fullName,
        'content_updated',
        `Edição #${editingEdicao.numero_edicao} do Jornal SUPMED atualizada`,
        previous,
        editingEdicao
      );
      toast.success('Edição atualizada!');
    } else {
      editingEdicao.id = Date.now().toString();
      allEdicoes.unshift(editingEdicao);
      addAdminLog(
        currentUser.id,
        currentUser.fullName,
        'content_updated',
        `Nova edição #${editingEdicao.numero_edicao} do Jornal SUPMED criada`,
        null,
        editingEdicao
      );
      toast.success('Edição criada!');
    }

    localStorage.setItem('supmed_jornal_edicoes', JSON.stringify(allEdicoes));
    loadEdicoes();
    setShowDialog(false);
    setEditingEdicao(null);
  };

  const deleteEdicao = (edicao) => {
    if (!confirm(`Deseja realmente excluir a edição #${edicao.numero_edicao}?`)) return;

    const filtered = edicoes.filter(e => e.id !== edicao.id);
    localStorage.setItem('supmed_jornal_edicoes', JSON.stringify(filtered));
    addAdminLog(
      currentUser.id,
      currentUser.fullName,
      'content_updated',
      `Edição #${edicao.numero_edicao} do Jornal SUPMED excluída`,
      edicao,
      null
    );
    loadEdicoes();
    toast.success('Edição excluída');
  };

  const novaEdicao = () => {
    const nextNumber = edicoes.length > 0 ? Math.max(...edicoes.map(e => e.numero_edicao || 0)) + 1 : 1;
    setEditingEdicao({
      numero_edicao: nextNumber,
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'rascunho',
      atualizacoes_semana: [],
      curiosidades: [],
      agenda: [],
      coluna_estudos: []
    });
    setShowDialog(true);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 border border-slate-200/50">
          <TabsTrigger value="jornal" className="text-xs">Jornal SUPMED</TabsTrigger>
          <TabsTrigger value="guidelines" className="text-xs">Guidelines</TabsTrigger>
          <TabsTrigger value="escalas" className="text-xs">Escalas</TabsTrigger>
        </TabsList>

        {/* JORNAL */}
        <TabsContent value="jornal" className="mt-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Edições do Jornal</h3>
            <Button size="sm" onClick={novaEdicao} className="h-8 text-xs bg-blue-900">
              <Plus className="w-3 h-3 mr-1" /> Nova Edição
            </Button>
          </div>

          <div className="space-y-2">
            {edicoes.map((edicao) => (
              <Card key={edicao.id} className="bg-white/80 border border-slate-200/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">
                          Edição #{edicao.numero_edicao}
                        </span>
                        <Badge className={`text-[9px] ${edicao.status === 'publicado' ? 'bg-green-500' : 'bg-amber-500'}`}>
                          {edicao.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(edicao.data_inicio).toLocaleDateString('pt-BR')} até {new Date(edicao.data_fim).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => { setEditingEdicao(edicao); setShowDialog(true); }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500"
                        onClick={() => deleteEdicao(edicao)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dialog de Edição */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-sm">
                  {editingEdicao?.id ? 'Editar Edição' : 'Nova Edição'}
                </DialogTitle>
              </DialogHeader>
              {editingEdicao && (
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Número</Label>
                      <Input
                        type="number"
                        className="h-8 text-sm"
                        value={editingEdicao.numero_edicao}
                        onChange={(e) => setEditingEdicao({...editingEdicao, numero_edicao: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Data Início</Label>
                      <Input
                        type="date"
                        className="h-8 text-sm"
                        value={editingEdicao.data_inicio}
                        onChange={(e) => setEditingEdicao({...editingEdicao, data_inicio: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Data Fim</Label>
                      <Input
                        type="date"
                        className="h-8 text-sm"
                        value={editingEdicao.data_fim}
                        onChange={(e) => setEditingEdicao({...editingEdicao, data_fim: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={editingEdicao.status} onValueChange={(v) => setEditingEdicao({...editingEdicao, status: v})}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="publicado">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={saveEdicao} className="w-full h-8 text-xs bg-blue-900">
                    <Save className="w-3 h-3 mr-1" /> Salvar Edição
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* GUIDELINES */}
        <TabsContent value="guidelines" className="mt-3">
          <Card className="bg-white/80 border border-slate-200/50">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Gestão de Guidelines</p>
              <p className="text-xs text-slate-400 mt-1">Em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ESCALAS */}
        <TabsContent value="escalas" className="mt-3">
          <Card className="bg-white/80 border border-slate-200/50">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Gestão de Escalas</p>
              <p className="text-xs text-slate-400 mt-1">Em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
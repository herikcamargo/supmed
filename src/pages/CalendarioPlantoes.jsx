import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import {
  Calendar,
  Plus,
  Clock,
  Building,
  DollarSign,
  Bell,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  User,
  Calculator
} from 'lucide-react';

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Alíquotas de imposto
const aliquotasPJ = [
  { valor: 6, label: 'Simples Nacional (6%)' },
  { valor: 11, label: 'Lucro Presumido (11%)' },
  { valor: 15, label: 'ISS + IRPJ (15%)' }
];

const aliquotasPF = [
  { valor: 0, label: 'Isento (até R$ 2.259)' },
  { valor: 7.5, label: '7,5% (R$ 2.259 - R$ 2.826)' },
  { valor: 15, label: '15% (R$ 2.826 - R$ 3.751)' },
  { valor: 22.5, label: '22,5% (R$ 3.751 - R$ 4.664)' },
  { valor: 27.5, label: '27,5% (acima de R$ 4.664)' }
];

export default function CalendarioPlantoes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState(null);
  const [plantoes, setPlantoes] = useState([]);

  const [novoPlantao, setNovoPlantao] = useState({
    data: '',
    hora_inicio: '07:00',
    hora_fim: '19:00',
    instituicao: '',
    setor: '',
    valor_bruto: '',
    tipo_contrato: 'pj',
    aliquota_imposto: 6,
    observacoes: '',
    alerta_ativo: true
  });

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('supmed_plantoes');
    if (saved) setPlantoes(JSON.parse(saved));
  }, []);

  const salvar = (novosPlantoes) => {
    setPlantoes(novosPlantoes);
    localStorage.setItem('supmed_plantoes', JSON.stringify(novosPlantoes));
  };

  // Calcular valor líquido
  const calcularLiquido = (bruto, aliquota) => {
    const imposto = bruto * (aliquota / 100);
    return bruto - imposto;
  };

  // Adicionar/Editar plantão
  const handleSalvar = () => {
    if (!novoPlantao.data || !novoPlantao.instituicao || !novoPlantao.valor_bruto) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const valorBruto = parseFloat(novoPlantao.valor_bruto);
    const valorLiquido = calcularLiquido(valorBruto, novoPlantao.aliquota_imposto);

    const plantao = {
      ...novoPlantao,
      id: editando?.id || Date.now().toString(),
      valor_bruto: valorBruto,
      valor_liquido: valorLiquido,
      status: 'agendado'
    };

    let novosPlantoes;
    if (editando) {
      novosPlantoes = plantoes.map(p => p.id === editando.id ? plantao : p);
    } else {
      novosPlantoes = [...plantoes, plantao];
    }

    salvar(novosPlantoes);
    setShowDialog(false);
    setEditando(null);
    resetForm();
    toast.success(editando ? 'Plantão atualizado!' : 'Plantão adicionado!');
  };

  const resetForm = () => {
    setNovoPlantao({
      data: '',
      hora_inicio: '07:00',
      hora_fim: '19:00',
      instituicao: '',
      setor: '',
      valor_bruto: '',
      tipo_contrato: 'pj',
      aliquota_imposto: 6,
      observacoes: '',
      alerta_ativo: true
    });
  };

  const excluirPlantao = (id) => {
    salvar(plantoes.filter(p => p.id !== id));
    toast.success('Plantão excluído');
  };

  const editarPlantao = (plantao) => {
    setEditando(plantao);
    setNovoPlantao({
      ...plantao,
      valor_bruto: plantao.valor_bruto.toString()
    });
    setShowDialog(true);
  };

  // Gerar dias do calendário
  const gerarDias = () => {
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaInicio = primeiroDia.getDay();

    const dias = [];
    for (let i = 0; i < diaInicio; i++) {
      dias.push(null);
    }
    for (let i = 1; i <= diasNoMes; i++) {
      dias.push(i);
    }
    return dias;
  };

  const getPlantoesDia = (dia) => {
    if (!dia) return [];
    const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return plantoes.filter(p => p.data === dataStr);
  };

  // Cálculos de resumo
  const plantoesMes = plantoes.filter(p => {
    const d = new Date(p.data);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  });

  const totalBrutoMes = plantoesMes.reduce((acc, p) => acc + p.valor_bruto, 0);
  const totalLiquidoMes = plantoesMes.reduce((acc, p) => acc + p.valor_liquido, 0);
  const totalImpostos = totalBrutoMes - totalLiquidoMes;

  const navegarMes = (direcao) => {
    if (direcao === -1) {
      if (mesAtual === 0) {
        setMesAtual(11);
        setAnoAtual(anoAtual - 1);
      } else {
        setMesAtual(mesAtual - 1);
      }
    } else {
      if (mesAtual === 11) {
        setMesAtual(0);
        setAnoAtual(anoAtual + 1);
      } else {
        setMesAtual(mesAtual + 1);
      }
    }
  };

  const hoje = new Date();
  const isHoje = (dia) => dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Calendário de Plantões</h1>
                <p className="text-xs text-slate-500">Gerencie seus plantões e ganhos</p>
              </div>
            </div>
            
            <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditando(null); resetForm(); } }}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Novo Plantão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-sm">{editando ? 'Editar Plantão' : 'Novo Plantão'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2 max-h-[70vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Data *</Label>
                      <Input
                        type="date"
                        className="h-9 text-sm"
                        value={novoPlantao.data}
                        onChange={(e) => setNovoPlantao({...novoPlantao, data: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <Label className="text-xs">Início</Label>
                        <Input
                          type="time"
                          className="h-9 text-sm"
                          value={novoPlantao.hora_inicio}
                          onChange={(e) => setNovoPlantao({...novoPlantao, hora_inicio: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fim</Label>
                        <Input
                          type="time"
                          className="h-9 text-sm"
                          value={novoPlantao.hora_fim}
                          onChange={(e) => setNovoPlantao({...novoPlantao, hora_fim: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Instituição *</Label>
                    <Input
                      placeholder="Hospital, UPA, clínica..."
                      className="h-9 text-sm"
                      value={novoPlantao.instituicao}
                      onChange={(e) => setNovoPlantao({...novoPlantao, instituicao: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Setor</Label>
                    <Input
                      placeholder="PS, UTI, Enfermaria..."
                      className="h-9 text-sm"
                      value={novoPlantao.setor}
                      onChange={(e) => setNovoPlantao({...novoPlantao, setor: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Valor Bruto (R$) *</Label>
                    <Input
                      type="number"
                      placeholder="1500.00"
                      className="h-9 text-sm"
                      value={novoPlantao.valor_bruto}
                      onChange={(e) => setNovoPlantao({...novoPlantao, valor_bruto: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Tipo de Contrato</Label>
                      <Select
                        value={novoPlantao.tipo_contrato}
                        onValueChange={(value) => {
                          const aliquotas = value === 'pj' ? aliquotasPJ : aliquotasPF;
                          setNovoPlantao({...novoPlantao, tipo_contrato: value, aliquota_imposto: aliquotas[0].valor});
                        }}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pj">
                            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Pessoa Jurídica</span>
                          </SelectItem>
                          <SelectItem value="pf">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> Pessoa Física</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Alíquota Imposto</Label>
                      <Select
                        value={novoPlantao.aliquota_imposto.toString()}
                        onValueChange={(value) => setNovoPlantao({...novoPlantao, aliquota_imposto: parseFloat(value)})}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(novoPlantao.tipo_contrato === 'pj' ? aliquotasPJ : aliquotasPF).map(a => (
                            <SelectItem key={a.valor} value={a.valor.toString()}>{a.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Preview do cálculo */}
                  {novoPlantao.valor_bruto && (
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="flex items-center gap-1 mb-2">
                        <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-medium text-indigo-700">Cálculo</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-slate-500">Bruto</p>
                          <p className="text-xs font-bold text-slate-700">R$ {parseFloat(novoPlantao.valor_bruto).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Imposto ({novoPlantao.aliquota_imposto}%)</p>
                          <p className="text-xs font-bold text-red-600">-R$ {(parseFloat(novoPlantao.valor_bruto) * novoPlantao.aliquota_imposto / 100).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Líquido</p>
                          <p className="text-xs font-bold text-green-600">R$ {calcularLiquido(parseFloat(novoPlantao.valor_bruto), novoPlantao.aliquota_imposto).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Observações</Label>
                    <Textarea
                      placeholder="Anotações..."
                      className="text-sm min-h-[60px]"
                      value={novoPlantao.observacoes}
                      onChange={(e) => setNovoPlantao({...novoPlantao, observacoes: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <Label className="text-xs flex items-center gap-1">
                      <Bell className="w-3 h-3" /> Ativar alerta
                    </Label>
                    <Switch
                      checked={novoPlantao.alerta_ativo}
                      onCheckedChange={(checked) => setNovoPlantao({...novoPlantao, alerta_ativo: checked})}
                    />
                  </div>

                  <Button onClick={handleSalvar} className="w-full h-9 text-xs bg-indigo-600 hover:bg-indigo-700">
                    {editando ? 'Salvar Alterações' : 'Adicionar Plantão'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Resumo Financeiro - Fixo no canto */}
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-200">Resumo de {meses[mesAtual]}</p>
                  <p className="text-[10px] text-indigo-300">{plantoesMes.length} plantão(ões)</p>
                </div>
                <div className="grid grid-cols-3 gap-6 text-right">
                  <div>
                    <p className="text-[10px] text-indigo-200">Bruto</p>
                    <p className="text-lg font-bold">R$ {totalBrutoMes.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-red-300">Impostos</p>
                    <p className="text-lg font-bold text-red-300">-R$ {totalImpostos.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-300">Líquido</p>
                    <p className="text-lg font-bold text-green-300">R$ {totalLiquidoMes.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendário */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navegarMes(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <CardTitle className="text-sm">{meses[mesAtual]} {anoAtual}</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navegarMes(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {diasSemana.map(dia => (
                  <div key={dia} className="text-center text-[10px] font-medium text-slate-500 py-1">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-1">
                {gerarDias().map((dia, i) => {
                  const plantoesDia = getPlantoesDia(dia);
                  return (
                    <div
                      key={i}
                      className={`min-h-[80px] p-1 border rounded text-xs ${
                        dia ? (isHoje(dia) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100 bg-white') : 'bg-slate-50'
                      }`}
                    >
                      {dia && (
                        <>
                          <span className={`text-[10px] font-medium ${isHoje(dia) ? 'text-indigo-600' : 'text-slate-600'}`}>
                            {dia}
                          </span>
                          <div className="space-y-0.5 mt-1">
                            {plantoesDia.map((p) => (
                              <div
                                key={p.id}
                                className="p-1 bg-indigo-100 rounded text-[8px] text-indigo-700 cursor-pointer hover:bg-indigo-200"
                                onClick={() => editarPlantao(p)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="truncate font-medium">{p.instituicao}</span>
                                  {p.alerta_ativo && <Bell className="w-2 h-2" />}
                                </div>
                                <span className="text-indigo-500">{p.hora_inicio}-{p.hora_fim}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Plantões do Mês */}
          {plantoesMes.length > 0 && (
            <Card className="bg-white border-slate-200 mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Plantões de {meses[mesAtual]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plantoesMes.sort((a, b) => a.data.localeCompare(b.data)).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center">
                          <Building className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-800">{p.instituicao}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>{new Date(p.data).toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>{p.hora_inicio} - {p.hora_fim}</span>
                            {p.setor && <><span>•</span><span>{p.setor}</span></>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-[8px] ${p.tipo_contrato === 'pj' ? 'text-blue-600' : 'text-purple-600'}`}>
                              {p.tipo_contrato === 'pj' ? 'PJ' : 'PF'}
                            </Badge>
                            {p.alerta_ativo && (
                              <Badge className="text-[8px] bg-amber-100 text-amber-700">
                                <Bell className="w-2 h-2 mr-0.5" /> Alerta
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">R$ {p.valor_bruto.toFixed(2)}</p>
                          <p className="text-sm font-bold text-green-600">R$ {p.valor_liquido.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editarPlantao(p)}>
                            <Edit2 className="w-3 h-3 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => excluirPlantao(p.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
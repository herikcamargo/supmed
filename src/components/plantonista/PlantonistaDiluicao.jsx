import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Syringe,
  Calculator,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react';

const categoryColors = {
  vasoativas: 'bg-red-100 text-red-700 border-red-200',
  sedacao_analgesia: 'bg-purple-100 text-purple-700 border-purple-200',
  antibioticos: 'bg-green-100 text-green-700 border-green-200',
  emergencia_cardiologica: 'bg-rose-100 text-rose-700 border-rose-200',
  metabolicas_endocrinas: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  outros: 'bg-slate-100 text-slate-700 border-slate-200'
};

const categoryConfig = {
  vasoativas: { nome: 'Drogas Vasoativas', color: 'bg-red-500' },
  sedacao_analgesia: { nome: 'Sedação / Analgesia', color: 'bg-purple-500' },
  antibioticos: { nome: 'Antibióticos EV', color: 'bg-green-500' },
  emergencia_cardiologica: { nome: 'Emergência Cardiológica', color: 'bg-rose-500' },
  metabolicas_endocrinas: { nome: 'Metabólicas / Endócrinas', color: 'bg-cyan-500' },
  outros: { nome: 'Outros', color: 'bg-slate-500' }
};

export default function PlantonistaDiluicao() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [patientWeight, setPatientWeight] = useState('');
  const [desiredDose, setDesiredDose] = useState('');
  const [concentration, setConcentration] = useState('');
  const [calculatedRate, setCalculatedRate] = useState(null);

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['diluicao-medicamentos'],
    queryFn: async () => {
      const result = await base44.entities.DiluicaoMedicamento.list();
      return result.sort((a, b) => {
        const prioA = a.data?.prioridade || 999;
        const prioB = b.data?.prioridade || 999;
        return prioA - prioB;
      });
    },
    staleTime: Infinity
  });

  const drugCategories = useMemo(() => {
    const categories = {};
    
    medications.forEach(med => {
      const medData = med.data || med;
      const cat = medData.categoria || 'outros';
      
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(med);
    });

    return Object.keys(categoryConfig).map(catId => ({
      id: catId,
      nome: categoryConfig[catId].nome,
      color: categoryConfig[catId].color,
      drugs: categories[catId] || []
    })).filter(cat => cat.drugs.length > 0);
  }, [medications]);

  const calculateInfusionRate = () => {
    if (!patientWeight || !desiredDose || !concentration) {
      setCalculatedRate(null);
      return;
    }

    const weight = parseFloat(patientWeight);
    const dose = parseFloat(desiredDose);
    const conc = parseFloat(concentration);

    // Fórmula: (Dose mcg/kg/min × Peso kg × 60) / Concentração mcg/ml = ml/h
    const ratePerHour = (dose * weight * 60) / conc;
    
    setCalculatedRate({
      mlPerHour: ratePerHour.toFixed(1),
      mlPerMin: (ratePerHour / 60).toFixed(2),
      doseTotal: (dose * weight).toFixed(2)
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        <span className="ml-2 text-sm text-slate-500">Carregando medicações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-medium">Atenção</p>
            <p>Sempre confira as diluições com o protocolo institucional. Esta calculadora é apenas uma ferramenta de apoio.</p>
          </div>
        </CardContent>
      </Card>

      {selectedDrug ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedDrug(null)} className="text-xs h-7 mb-3">
              ← Voltar
            </Button>
            <Card className="bg-white/80 border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 text-base">{selectedDrug.data?.nome || selectedDrug.nome}</h3>
                  <Badge className={`${categoryColors[selectedDrug.data?.categoria || 'outros']} text-[9px]`}>
                    {selectedDrug.data?.subtitulo || selectedDrug.subtitulo}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 space-y-2">
                  <p><span className="text-slate-400">Apresentação:</span> {selectedDrug.data?.apresentacao || selectedDrug.apresentacao}</p>
                  {(selectedDrug.data?.indicacao_principal || selectedDrug.indicacao_principal) && (
                    <p><span className="text-slate-400">Indicação:</span> {selectedDrug.data?.indicacao_principal || selectedDrug.indicacao_principal}</p>
                  )}
                  
                  <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-xs font-semibold text-teal-800 mb-2">Diluição Padrão</p>
                    <div className="space-y-1 text-xs text-teal-700">
                      <p><span className="font-medium">Solvente:</span> {selectedDrug.data?.diluicao_solvente || selectedDrug.diluicao_solvente}</p>
                      <p><span className="font-medium">Volume Final:</span> {selectedDrug.data?.diluicao_volume_final || selectedDrug.diluicao_volume_final}</p>
                      <p><span className="font-medium">Concentração:</span> {selectedDrug.data?.diluicao_concentracao || selectedDrug.diluicao_concentracao}</p>
                    </div>
                  </div>

                  <p><span className="text-slate-400">Dose inicial:</span> {selectedDrug.data?.dose_inicial || selectedDrug.dose_inicial}</p>
                  {(selectedDrug.data?.dose_maxima || selectedDrug.dose_maxima) && (
                    <p><span className="text-slate-400">Dose máxima:</span> {selectedDrug.data?.dose_maxima || selectedDrug.dose_maxima}</p>
                  )}
                  {(selectedDrug.data?.velocidade_infusao || selectedDrug.velocidade_infusao) && (
                    <p><span className="text-slate-400">Infusão:</span> {selectedDrug.data?.velocidade_infusao || selectedDrug.velocidade_infusao}</p>
                  )}

                  {(selectedDrug.data?.alertas || selectedDrug.alertas)?.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Alertas Importantes
                      </p>
                      <ul className="space-y-1">
                        {(selectedDrug.data?.alertas || selectedDrug.alertas).map((alerta, i) => (
                          <li key={i} className="text-[10px] text-red-700 flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            {alerta}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(selectedDrug.data?.observacoes || selectedDrug.observacoes) && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold text-slate-700 mb-1">Observações</p>
                      <p className="text-[10px] text-slate-600">{selectedDrug.data?.observacoes || selectedDrug.observacoes}</p>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 mt-3">
                    <strong>Referência:</strong> {selectedDrug.data?.referencia || selectedDrug.referencia || 'Manual de Medicina de Emergência FMUSP 18ª ed'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="bg-white/80 border-slate-200 sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-teal-500" />
                  Calculadora de Infusão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Peso do Paciente (kg)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 70"
                    value={patientWeight}
                    onChange={(e) => setPatientWeight(e.target.value)}
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Dose Desejada (mcg/kg/min)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 0.5"
                    value={desiredDose}
                    onChange={(e) => setDesiredDose(e.target.value)}
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Concentração da Solução (mcg/ml)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 64"
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <Button 
                  onClick={calculateInfusionRate}
                  className="w-full bg-teal-600 hover:bg-teal-700 h-8 text-xs"
                >
                  Calcular
                </Button>

                {calculatedRate && (
                  <div className="mt-3 p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg text-white">
                    <p className="text-teal-100 text-[10px] uppercase tracking-wider mb-1">
                      Velocidade de Infusão
                    </p>
                    <p className="text-2xl font-bold">{calculatedRate.mlPerHour} ml/h</p>
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-teal-400/30">
                      <div>
                        <p className="text-teal-100 text-[10px]">ml/min</p>
                        <p className="font-medium text-sm">{calculatedRate.mlPerMin}</p>
                      </div>
                      <div>
                        <p className="text-teal-100 text-[10px]">mcg/min total</p>
                        <p className="font-medium text-sm">{calculatedRate.doseTotal}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formula Info */}
            <Card className="bg-white/80 border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Fórmula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-2 bg-slate-50 rounded-lg font-mono text-xs text-slate-600">
                  ml/h = (Dose × Peso × 60) ÷ Concentração
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Dose em mcg/kg/min, Peso em kg, Concentração em mcg/ml
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : selectedCategory ? (
        <div>
          <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)} className="text-xs h-7 mb-3">
            ← Voltar às Categorias
          </Button>
          <div className="grid md:grid-cols-2 gap-3">
            {selectedCategory.drugs.map((drug) => {
              const drugData = drug.data || drug;
              return (
                <Card 
                  key={drug.id} 
                  className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:shadow-md hover:border-teal-300 transition-all cursor-pointer"
                  onClick={() => setSelectedDrug(drug)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800 text-sm">{drugData.nome}</h3>
                      <Syringe className="w-4 h-4 text-teal-500" />
                    </div>
                    <p className="text-[10px] text-slate-600 mb-1">{drugData.subtitulo}</p>
                    <p className="text-[10px] text-slate-500">{drugData.apresentacao}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {drugCategories.map((cat) => (
            <Card 
              key={cat.id} 
              className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer"
              onClick={() => setSelectedCategory(cat)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg ${cat.color} flex items-center justify-center`}>
                    <Syringe className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">{cat.nome}</h3>
                    <p className="text-[10px] text-slate-500">{cat.drugs.length} medicação(ões)</p>
                  </div>
                </div>
                <div className="flex items-center justify-end text-xs text-teal-600 font-medium">
                  Ver medicações →
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
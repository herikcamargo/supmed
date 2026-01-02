import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Syringe,
  Calculator,
  AlertTriangle,
  Info
} from 'lucide-react';

const commonDrugs = [
  {
    name: 'Noradrenalina',
    presentation: '4mg/4ml (1mg/ml)',
    standardDilution: '4 ampolas (16mg) + 234ml SF 0.9% = 64mcg/ml',
    doseRange: '0.05-3.3 mcg/kg/min',
    category: 'vasopressor'
  },
  {
    name: 'Dobutamina',
    presentation: '250mg/20ml (12.5mg/ml)',
    standardDilution: '1 ampola (250mg) + 230ml SF 0.9% = 1mg/ml',
    doseRange: '2.5-20 mcg/kg/min',
    category: 'inotrópico'
  },
  {
    name: 'Dopamina',
    presentation: '50mg/10ml (5mg/ml)',
    standardDilution: '5 ampolas (250mg) + 200ml SF 0.9% = 1mg/ml',
    doseRange: '2-20 mcg/kg/min',
    category: 'vasopressor'
  },
  {
    name: 'Midazolam',
    presentation: '50mg/10ml (5mg/ml) ou 15mg/3ml',
    standardDilution: '5 ampolas (250mg) + 200ml SF 0.9% = 1mg/ml',
    doseRange: '0.02-0.1 mg/kg/h',
    category: 'sedativo'
  },
  {
    name: 'Fentanil',
    presentation: '0.5mg/10ml (50mcg/ml)',
    standardDilution: '10 ampolas (5mg) + SF 0.9% q.s.p. 250ml = 20mcg/ml',
    doseRange: '1-4 mcg/kg/h',
    category: 'analgésico'
  },
  {
    name: 'Heparina',
    presentation: '5000UI/0.25ml',
    standardDilution: 'Puro ou diluído conforme protocolo',
    doseRange: '12-18 UI/kg/h (ajustar por TTPa)',
    category: 'anticoagulante'
  },
  {
    name: 'Nitroglicerina',
    presentation: '50mg/10ml (5mg/ml)',
    standardDilution: '1 ampola (50mg) + 240ml SG 5% = 200mcg/ml',
    doseRange: '5-200 mcg/min',
    category: 'vasodilatador'
  },
  {
    name: 'Nitroprussiato',
    presentation: '50mg/2ml',
    standardDilution: '1 ampola (50mg) + 248ml SG 5% = 200mcg/ml (proteger da luz)',
    doseRange: '0.3-10 mcg/kg/min',
    category: 'vasodilatador'
  }
];

export default function Diluicao() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [patientWeight, setPatientWeight] = useState('');
  const [desiredDose, setDesiredDose] = useState('');
  const [concentration, setConcentration] = useState('');
  const [calculatedRate, setCalculatedRate] = useState(null);

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

  const categoryColors = {
    vasopressor: 'bg-red-100 text-red-700 border-red-200',
    inotrópico: 'bg-blue-100 text-blue-700 border-blue-200',
    sedativo: 'bg-purple-100 text-purple-700 border-purple-200',
    analgésico: 'bg-amber-100 text-amber-700 border-amber-200',
    anticoagulante: 'bg-orange-100 text-orange-700 border-orange-200',
    vasodilatador: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <Syringe className="w-6 h-6 text-teal-500" />
              Diluição de Drogas
            </h1>
            <p className="text-slate-500 mt-1">Calculadora de diluições e velocidade de infusão</p>
          </div>

          {/* Warning */}
          <Card className="backdrop-blur-xl bg-amber-50/80 border-amber-200 shadow-lg mb-6">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Atenção</p>
                <p>Sempre confira as diluições com o protocolo institucional. Esta calculadora é apenas uma ferramenta de apoio e não substitui o julgamento clínico.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Drug List */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    Drogas Comuns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {commonDrugs.map((drug, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedDrug?.name === drug.name
                            ? 'bg-teal-50 border-teal-300'
                            : 'bg-slate-50 border-transparent hover:border-slate-200'
                        }`}
                        onClick={() => setSelectedDrug(drug)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-800">{drug.name}</h3>
                          <Badge className={categoryColors[drug.category]}>
                            {drug.category}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p><span className="text-slate-400">Apresentação:</span> {drug.presentation}</p>
                          <p><span className="text-slate-400">Diluição padrão:</span> {drug.standardDilution}</p>
                          <p><span className="text-slate-400">Dose:</span> {drug.doseRange}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calculator */}
            <div className="space-y-6">
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-teal-500" />
                    Calculadora de Infusão
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDrug && (
                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 mb-4">
                      <p className="font-medium text-teal-800">{selectedDrug.name}</p>
                      <p className="text-xs text-teal-600 mt-1">{selectedDrug.doseRange}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Peso do Paciente (kg)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 70"
                      value={patientWeight}
                      onChange={(e) => setPatientWeight(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Dose Desejada (mcg/kg/min)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 0.5"
                      value={desiredDose}
                      onChange={(e) => setDesiredDose(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Concentração da Solução (mcg/ml)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 64"
                      value={concentration}
                      onChange={(e) => setConcentration(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={calculateInfusionRate}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                  >
                    Calcular
                  </Button>

                  {calculatedRate && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg text-white">
                      <p className="text-teal-100 text-xs uppercase tracking-wider mb-2">
                        Velocidade de Infusão
                      </p>
                      <p className="text-3xl font-bold">{calculatedRate.mlPerHour} ml/h</p>
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-teal-400/30">
                        <div>
                          <p className="text-teal-100 text-xs">ml/min</p>
                          <p className="font-medium">{calculatedRate.mlPerMin}</p>
                        </div>
                        <div>
                          <p className="text-teal-100 text-xs">mcg/min total</p>
                          <p className="font-medium">{calculatedRate.doseTotal}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Formula Info */}
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Fórmula Utilizada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-slate-50 rounded-lg font-mono text-sm text-slate-600">
                    ml/h = (Dose × Peso × 60) ÷ Concentração
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Onde: Dose em mcg/kg/min, Peso em kg, Concentração em mcg/ml
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
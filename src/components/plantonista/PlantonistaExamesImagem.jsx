import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ImageIcon, Upload, X, Info, Shield, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useOptimizedSearch from '../search/useOptimizedSearch';

// Base de patologias com imagens de referência
const patologiasReferencia = {
  'rx-torax': [
    {
      nome: 'Pneumonia',
      achados: ['Opacidade alveolar', 'Broncograma aéreo', 'Consolidação'],
      gravidade: 'alta',
      imagemUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8fafc" width="400" height="300"/%3E%3Crect fill="%23e2e8f0" x="100" y="50" width="200" height="200" rx="10"/%3E%3Ccircle fill="%23cbd5e1" cx="150" cy="120" r="30" opacity="0.5"/%3E%3Ctext x="200" y="260" font-family="Arial" font-size="14" fill="%23475569" text-anchor="middle"%3EPneumonia%3C/text%3E%3C/svg%3E'
    },
    {
      nome: 'Pneumotórax',
      achados: ['Linha pleural', 'Ausência de trama vascular', 'Hipertransparência'],
      gravidade: 'crítica',
      imagemUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8fafc" width="400" height="300"/%3E%3Cellipse fill="%23e2e8f0" cx="200" cy="150" rx="80" ry="100"/%3E%3Cpath d="M 140 150 Q 180 120 220 150" stroke="%23ef4444" stroke-width="3" fill="none"/%3E%3Ctext x="200" y="260" font-family="Arial" font-size="14" fill="%23475569" text-anchor="middle"%3EPneumotórax%3C/text%3E%3C/svg%3E'
    },
    {
      nome: 'Derrame Pleural',
      achados: ['Opacidade basal', 'Apagamento costofrênico', 'Menisco'],
      gravidade: 'média',
      imagemUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8fafc" width="400" height="300"/%3E%3Crect fill="%23e2e8f0" x="100" y="50" width="200" height="200" rx="10"/%3E%3Cpath d="M 100 200 Q 200 180 300 200 L 300 250 L 100 250 Z" fill="%2364748b" opacity="0.4"/%3E%3Ctext x="200" y="280" font-family="Arial" font-size="14" fill="%23475569" text-anchor="middle"%3EDerrame Pleural%3C/text%3E%3C/svg%3E'
    },
    {
      nome: 'Edema Pulmonar',
      achados: ['Opacidades difusas', 'Padrão asa de borboleta', 'Linhas B'],
      gravidade: 'crítica',
      imagemUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8fafc" width="400" height="300"/%3E%3Crect fill="%23e2e8f0" x="100" y="50" width="200" height="200" rx="10"/%3E%3Ccircle fill="%23cbd5e1" cx="200" cy="150" r="60" opacity="0.6"/%3E%3Ctext x="200" y="280" font-family="Arial" font-size="14" fill="%23475569" text-anchor="middle"%3EEdema%3C/text%3E%3C/svg%3E'
    },
    {
      nome: 'Cardiomegalia',
      achados: ['ICT > 0.5', 'Aumento silhueta cardíaca'],
      gravidade: 'média',
      imagemUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8fafc" width="400" height="300"/%3E%3Crect fill="%23e2e8f0" x="100" y="50" width="200" height="200" rx="10"/%3E%3Cellipse fill="%2394a3b8" cx="200" cy="180" rx="70" ry="60" opacity="0.6"/%3E%3Ctext x="200" y="280" font-family="Arial" font-size="14" fill="%23475569" text-anchor="middle"%3ECardiomegalia%3C/text%3E%3C/svg%3E'
    }
  ],
  'tc-cranio': [
    {
      nome: 'AVC Isquêmico',
      achados: ['Hipodensidade', 'Perda diferenciação', 'Território vascular'],
      gravidade: 'crítica',
      imagemUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8fafc" width="400" height="300"/%3E%3Ccircle fill="%23e2e8f0" cx="200" cy="150" r="80"/%3E%3Cpath d="M 160 130 Q 180 140 200 130 Q 220 120 240 130" fill="%2364748b" opacity="0.4"/%3E%3Ctext x="200" y="260" font-family="Arial" font-size="14" fill="%23475569" text-anchor="middle"%3EAVC Isquêmico%3C/text%3E%3C/svg%3E'
    },
    {
      nome: 'Hemorragia',
      achados: ['Hiperdensidade', 'Efeito massa', 'Desvio linha média'],
      gravidade: 'crítica',
      imagemUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8fafc" width="400" height="300"/%3E%3Ccircle fill="%23e2e8f0" cx="200" cy="150" r="80"/%3E%3Ccircle fill="%23ef4444" cx="180" cy="140" r="25" opacity="0.6"/%3E%3Ctext x="200" y="260" font-family="Arial" font-size="14" fill="%23475569" text-anchor="middle"%3EHemorragia%3C/text%3E%3C/svg%3E'
    }
  ],
  'abdome': [
    {
      nome: 'Obstrução Intestinal',
      achados: ['Níveis hidroaéreos', 'Dilatação alças'],
      gravidade: 'alta',
      imagemUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8fafc" width="400" height="300"/%3E%3Crect fill="%23e2e8f0" x="80" y="60" width="240" height="180" rx="8"/%3E%3Crect fill="%23cbd5e1" x="120" y="100" width="60" height="40" rx="4" opacity="0.6"/%3E%3Ctext x="200" y="270" font-family="Arial" font-size="14" fill="%23475569" text-anchor="middle"%3EObstrução%3C/text%3E%3C/svg%3E'
    },
    {
      nome: 'Pneumoperitônio',
      achados: ['Ar livre', 'Ar subfrênico'],
      gravidade: 'crítica',
      imagemUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8fafc" width="400" height="300"/%3E%3Crect fill="%23e2e8f0" x="80" y="60" width="240" height="180" rx="8"/%3E%3Cellipse fill="%23fef3c7" cx="200" cy="80" rx="40" ry="15" opacity="0.6"/%3E%3Ctext x="200" y="270" font-family="Arial" font-size="14" fill="%23475569" text-anchor="middle"%3EPneumoperitônio%3C/text%3E%3C/svg%3E'
    }
  ]
};

export default function PlantonistaExamesImagem() {
  const [selectedCategory, setSelectedCategory] = useState('rx-torax');
  const [userImage, setUserImage] = useState(null);
  const [selectedReference, setSelectedReference] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  const currentPatologias = patologiasReferencia[selectedCategory] || [];
  
  const { 
    searchTerm, 
    setSearchTerm, 
    results: filtered,
    isSearching 
  } = useOptimizedSearch(currentPatologias, ['nome', 'achados'], { debounceMs: 150 });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target.result);
        toast.success('Imagem carregada com sucesso');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = (patologia) => {
    setSelectedReference(patologia);
    setCompareMode(true);
  };

  const getGravidadeColor = (grav) => {
    const colors = {
      'crítica': 'bg-red-100 text-red-700 border-red-200',
      'alta': 'bg-orange-100 text-orange-700 border-orange-200',
      'média': 'bg-amber-100 text-amber-700 border-amber-200',
      'baixa': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[grav] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <strong>Ferramenta de comparação.</strong> Faça upload do exame para comparar com banco de referências educacionais.
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={compareMode ? 'compare' : 'gallery'} onValueChange={(v) => setCompareMode(v === 'compare')}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="gallery" className="text-xs">
            <ImageIcon className="w-3.5 h-3.5 mr-1" /> Galeria
          </TabsTrigger>
          <TabsTrigger value="compare" className="text-xs" disabled={!userImage}>
            <Eye className="w-3.5 h-3.5 mr-1" /> Comparar
          </TabsTrigger>
        </TabsList>

        {/* ABA GALERIA */}
        <TabsContent value="gallery">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Banco de Patologias
                </CardTitle>
                <label htmlFor="upload-image">
                  <Button size="sm" variant="outline" className="h-7 text-xs cursor-pointer" asChild>
                    <span>
                      <Upload className="w-3 h-3 mr-1" /> Upload
                    </span>
                  </Button>
                </label>
                <input
                  id="upload-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar patologia..."
                  className="pl-9 pr-9 h-9 text-sm bg-slate-50 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 animate-spin" />
                )}
              </div>

              {/* Tabs Modalidade */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="rx-torax" className="text-xs">RX Tórax</TabsTrigger>
                  <TabsTrigger value="tc-cranio" className="text-xs">TC Crânio</TabsTrigger>
                  <TabsTrigger value="abdome" className="text-xs">Abdome</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    {filtered.map((patologia, i) => (
                      <Card
                        key={i}
                        className={`cursor-pointer hover:shadow-md transition-all ${getGravidadeColor(patologia.gravidade)} border-2`}
                        onClick={() => handleCompare(patologia)}
                      >
                        <CardContent className="p-3">
                          <div className="relative mb-2 rounded-lg overflow-hidden bg-white">
                            <img 
                              src={patologia.imagemUrl} 
                              alt={patologia.nome}
                              className="w-full h-24 object-cover"
                            />
                          </div>
                          <h4 className="text-xs font-semibold text-slate-800 mb-1">{patologia.nome}</h4>
                          <div className="flex flex-wrap gap-1">
                            {patologia.achados.slice(0, 2).map((achado, j) => (
                              <Badge key={j} variant="outline" className="text-[9px]">{achado}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA COMPARAÇÃO */}
        <TabsContent value="compare">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Modo Comparação</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setUserImage(null);
                    setSelectedReference(null);
                    setCompareMode(false);
                  }}
                  className="h-7 text-xs"
                >
                  <X className="w-3 h-3 mr-1" /> Limpar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Imagem do Usuário */}
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">Seu Exame</p>
                  <div className="relative rounded-lg overflow-hidden bg-slate-50 border-2 border-slate-200 h-64">
                    {userImage ? (
                      <img src={userImage} alt="Exame do usuário" className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">Nenhuma imagem carregada</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Imagem de Referência */}
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    Referência: {selectedReference?.nome || 'Selecione na galeria'}
                  </p>
                  <div className="relative rounded-lg overflow-hidden bg-slate-50 border-2 border-blue-200 h-64">
                    {selectedReference ? (
                      <>
                        <img 
                          src={selectedReference.imagemUrl} 
                          alt={selectedReference.nome} 
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="text-[9px] bg-blue-600 text-white">Referência</Badge>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">Selecione uma patologia</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Achados da Referência */}
              {selectedReference && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-2">Achados Típicos:</p>
                  <ul className="space-y-1">
                    {selectedReference.achados.map((achado, i) => (
                      <li key={i} className="text-xs text-blue-600 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        {achado}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <Card className="bg-amber-50 border-amber-200 mt-4">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <strong>Ferramenta educacional.</strong> Comparação visual não substitui laudo médico. Sempre consulte radiologista.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
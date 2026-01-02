import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import {
  BookOpen,
  Search,
  Heart,
  Brain,
  Stethoscope,
  Baby,
  Bone,
  Eye,
  Activity,
  Loader2,
  ExternalLink,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import DisclaimerFooter from '../components/compliance/DisclaimerFooter';
import ContentVersionBadge from '../components/content/ContentVersionBadge';
import OfflineIndicator from '../components/content/OfflineIndicator';

const specialties = [
  { id: 'cardiologia', label: 'Cardiologia', icon: Heart, color: 'from-red-500 to-rose-600' },
  { id: 'neurologia', label: 'Neurologia', icon: Brain, color: 'from-purple-500 to-violet-600' },
  { id: 'pneumologia', label: 'Pneumologia', icon: Stethoscope, color: 'from-blue-500 to-cyan-600' },
  { id: 'pediatria', label: 'Pediatria', icon: Baby, color: 'from-pink-500 to-rose-500' },
  { id: 'ortopedia', label: 'Ortopedia', icon: Bone, color: 'from-amber-500 to-orange-500' },
  { id: 'oftalmologia', label: 'Oftalmologia', icon: Eye, color: 'from-green-500 to-emerald-600' },
  { id: 'emergencia', label: 'Emergência', icon: Activity, color: 'from-red-600 to-rose-700' }
];

const commonGuidelines = [
  { title: 'ACLS - Suporte Avançado de Vida', specialty: 'Emergência', year: '2023' },
  { title: 'Infarto Agudo do Miocárdio', specialty: 'Cardiologia', year: '2023' },
  { title: 'AVC Isquêmico Agudo', specialty: 'Neurologia', year: '2023' },
  { title: 'Pneumonia Adquirida na Comunidade', specialty: 'Pneumologia', year: '2022' },
  { title: 'Sepse e Choque Séptico', specialty: 'Emergência', year: '2023' },
  { title: 'Diabetes Mellitus Tipo 2', specialty: 'Endocrinologia', year: '2023' }
];

export default function Guidelines() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (term = searchTerm) => {
    if (!term.trim()) return;
    
    setIsSearching(true);
    
    try {
      const { contentManager } = await import('../components/content/ContentManager');
      
      const slug = `guideline-${term.toLowerCase().replace(/\s+/g, '-')}`;
      const content = await contentManager.get(slug, {
        modulo: 'guidelines',
        tipo: 'guideline'
      });

      contentManager.trackAccess(slug);
      setSearchResult(content.conteudo);
    } catch (error) {
      console.error('Erro ao buscar guideline:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-500" />
              Guidelines Médicos
            </h1>
            <p className="text-slate-500 mt-1">Diretrizes e protocolos atualizados</p>
          </div>

          {/* Search */}
          <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar guideline (ex: IAM, AVC, Sepse)..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={() => handleSearch()} 
                  disabled={isSearching}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                </Button>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2">
                {specialties.map((spec) => {
                  const Icon = spec.icon;
                  const isSelected = selectedSpecialty === spec.id;
                  return (
                    <Button
                      key={spec.id}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSpecialty(isSelected ? null : spec.id)}
                      className={isSelected ? `bg-gradient-to-r ${spec.color} border-0` : ''}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {spec.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {isSearching && (
            <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Buscando diretrizes atualizadas...</p>
              </CardContent>
            </Card>
          )}

          {searchResult && !isSearching && (
            <div className="space-y-6">
              {/* Versão e Offline */}
              <div className="flex items-center justify-end gap-2">
                <OfflineIndicator />
                <ContentVersionBadge content={searchResult} variant="compact" />
              </div>

              {/* Guideline Header */}
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{searchResult.guideline_name || searchResult.titulo}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{searchResult.source || searchResult.fonte_primaria}</Badge>
                        <Badge className="bg-cyan-100 text-cyan-700">{searchResult.year || '2024'}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Key Recommendations - EDUCACIONAL */}
              <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    Principais Conceitos da Diretriz (educacional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {searchResult.key_recommendations?.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-xs flex items-center justify-center flex-shrink-0 font-medium">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[9px] text-amber-700 mt-3 pt-3 border-t border-slate-200 font-medium">
                    ⚠️ Conceitos educacionais. A aplicação clínica depende de avaliação individualizada.
                  </p>
                </CardContent>
              </Card>

              {/* Evidence Levels */}
              {searchResult.evidence_levels?.length > 0 && (
                <Card className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                      Níveis de Evidência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {searchResult.evidence_levels.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Badge className="bg-blue-100 text-blue-700 shrink-0">
                            {item.level}
                          </Badge>
                          <p className="text-sm text-slate-600">{item.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Clinical Pearls */}
              {searchResult.clinical_pearls?.length > 0 && (
                <Card className="backdrop-blur-xl bg-emerald-50/80 border-emerald-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-emerald-700">
                      💡 Dicas Clínicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {searchResult.clinical_pearls.map((pearl, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                          {pearl}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Contraindications */}
              {searchResult.contraindications?.length > 0 && (
                <Card className="backdrop-blur-xl bg-red-50/80 border-red-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-red-700">
                      ⚠️ Contraindicações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {searchResult.contraindications.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Common Guidelines */}
          {!searchResult && !isSearching && (
            <>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                Guidelines Populares
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commonGuidelines.map((guide, i) => (
                  <Card
                    key={i}
                    className="backdrop-blur-xl bg-white/80 border-white/50 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => {
                      setSearchTerm(guide.title);
                      handleSearch(guide.title);
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-slate-800 group-hover:text-cyan-600 transition-colors">
                            {guide.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {guide.specialty}
                            </Badge>
                            <span className="text-xs text-slate-400">{guide.year}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          <DisclaimerFooter variant="ia" />
        </div>
      </main>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import ImagePlaceholder from '../components/medical/ImagePlaceholder';
import {
  ImageIcon,
  Search,
  Filter,
  AlertTriangle,
  Zap,
  Eye,
  Upload,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  Sun,
  Moon,
  Maximize2,
  Grid3x3,
  BookOpen,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  X,
  Info,
  Lightbulb
} from 'lucide-react';

// Dados iniciais de patologias (seed)
const patologiasIniciais = [
  {
    nome: 'Pneumonia Lobar',
    modalidade: 'RX',
    regiao: 'torax',
    contexto_clinico: 'Febre, tosse produtiva, dor torácica pleurítica',
    sintomas_associados: ['febre', 'tosse', 'dispneia', 'dor torácica'],
    achados_chave: ['Consolidação homogênea', 'Broncograma aéreo', 'Perda de volume lobar', 'Sinal da silhueta'],
    diferenciais: ['Atelectasia', 'Neoplasia', 'Edema pulmonar', 'Hemorragia'],
    armadilhas: ['Pode mimetizar neoplasia em idosos', 'Derrame pleural associado comum'],
    nao_confundir_com: ['Atelectasia (retração vs expansão)', 'Edema (distribuição bilateral)'],
    nivel_urgencia: 'moderado',
    faixa_etaria: 'ambos',
    frequencia: 'muito_comum'
  },
  {
    nome: 'Pneumotórax',
    modalidade: 'RX',
    regiao: 'torax',
    contexto_clinico: 'Dor torácica súbita, dispneia, trauma',
    sintomas_associados: ['dor torácica', 'dispneia', 'taquipneia'],
    achados_chave: ['Linha pleural visceral', 'Ausência de trama vascular periférica', 'Hipertransparência', 'Desvio mediastinal (se hipertensivo)'],
    diferenciais: ['Bolha enfisematosa', 'Dobra cutânea', 'Cisto pulmonar'],
    armadilhas: ['Pode ser sutil em RX em AP', 'Melhor visualizado em expiração'],
    nao_confundir_com: ['Bolha subpleural', 'Dobra de pele'],
    nivel_urgencia: 'alto',
    faixa_etaria: 'ambos',
    frequencia: 'comum'
  },
  {
    nome: 'Edema Agudo de Pulmão',
    modalidade: 'RX',
    regiao: 'torax',
    contexto_clinico: 'Dispneia súbita, ortopneia, história de ICC',
    sintomas_associados: ['dispneia', 'ortopneia', 'tosse'],
    achados_chave: ['Padrão alveolar bilateral', 'Distribuição perihilar (asa de morcego)', 'Linhas B de Kerley', 'Cardiomegalia', 'Derrame pleural'],
    diferenciais: ['Pneumonia bilateral', 'SDRA', 'Hemorragia alveolar'],
    armadilhas: ['DPOC pode mascarar achados', 'Pode ser assimétrico'],
    nao_confundir_com: ['Pneumonia bilateral', 'SDRA (contexto clínico diferente)'],
    nivel_urgencia: 'alto',
    faixa_etaria: 'adulto',
    frequencia: 'muito_comum'
  },
  {
    nome: 'AVC Isquêmico Inicial',
    modalidade: 'TC',
    regiao: 'cranio',
    contexto_clinico: 'Déficit neurológico focal súbito, < 4.5h',
    sintomas_associados: ['hemiparesia', 'afasia', 'desvio de olhar'],
    achados_chave: ['Hipodensidade precoce', 'Perda de diferenciação substância branca/cinzenta', 'Sinal da artéria cerebral média hiperdensa', 'Sinal da ínsula apagada'],
    diferenciais: ['AVC hemorrágico', 'Tumor', 'Infecção', 'Desmielinização'],
    armadilhas: ['TC pode ser normal nas primeiras 6h', 'Usar escala ASPECTS'],
    nao_confundir_com: ['Infarto antigo', 'Leucoaraiose'],
    nivel_urgencia: 'critico',
    faixa_etaria: 'adulto',
    frequencia: 'muito_comum'
  },
  {
    nome: 'AVC Hemorrágico',
    modalidade: 'TC',
    regiao: 'cranio',
    contexto_clinico: 'Cefaleia súbita intensa, alteração de consciência, HAS',
    sintomas_associados: ['cefaleia', 'vômitos', 'alteração consciência'],
    achados_chave: ['Hiperdensidade espontânea', 'Efeito de massa', 'Desvio de linha média', 'Sangue nos ventrículos'],
    diferenciais: ['HSA', 'Tumor hemorrágico', 'Malformação vascular'],
    armadilhas: ['Sangue pode ser isodênsico após 7-10 dias'],
    nao_confundir_com: ['Calcificação', 'Contraste'],
    nivel_urgencia: 'critico',
    faixa_etaria: 'adulto',
    frequencia: 'comum'
  },
  {
    nome: 'Colecistite Aguda',
    modalidade: 'USG',
    regiao: 'abdome',
    contexto_clinico: 'Dor em HCD, febre, Murphy positivo',
    sintomas_associados: ['dor abdominal', 'febre', 'náuseas'],
    achados_chave: ['Espessamento da parede vesicular >3mm', 'Cálculo impactado', 'Sinal de Murphy ultrassonográfico', 'Líquido perivesicular'],
    diferenciais: ['Colecistite crônica', 'Coledocolitíase', 'Pancreatite', 'Úlcera perfurada'],
    armadilhas: ['Murphy negativo em idosos/diabéticos', 'Colecistite alitiásica existe'],
    nao_confundir_com: ['Colecistite crônica', 'Lama biliar isolada'],
    nivel_urgencia: 'alto',
    faixa_etaria: 'adulto',
    frequencia: 'muito_comum'
  }
];

export default function ExamesImagem({ embedded = false }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('atlas');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadeFiltro, setModalidadeFiltro] = useState('todas');
  const [regiaoFiltro, setRegiaoFiltro] = useState('todas');
  const [urgenciaFiltro, setUrgenciaFiltro] = useState('todas');
  
  // Comparação
  const [modoComparacao, setModoComparacao] = useState(false);
  const [imagemUsuario, setImagemUsuario] = useState(null);
  const [imagemReferencia, setImagemReferencia] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Biblioteca pessoal
  const [bibliotecaPessoal, setBibliotecaPessoal] = useState([]);
  
  // Carregar patologias
  const { data: patologias = [], isLoading } = useQuery({
    queryKey: ['patologias_imagem'],
    queryFn: async () => {
      try {
        const data = await base44.entities.PatologiaImagem.list();
        if (data.length === 0) {
          // Seed inicial
          return patologiasIniciais;
        }
        return data;
      } catch {
        return patologiasIniciais;
      }
    },
    initialData: patologiasIniciais
  });

  // Carregar biblioteca pessoal
  useEffect(() => {
    const saved = localStorage.getItem('supmed_biblioteca_imagem');
    if (saved) {
      setBibliotecaPessoal(JSON.parse(saved));
    }
  }, []);

  // Salvar na biblioteca pessoal
  const salvarNaBiblioteca = (imagem) => {
    const novoCaso = {
      id: Date.now().toString(),
      imagem,
      modalidade: '',
      regiao: '',
      notas: '',
      data: new Date().toISOString()
    };
    const nova = [...bibliotecaPessoal, novoCaso];
    setBibliotecaPessoal(nova);
    localStorage.setItem('supmed_biblioteca_imagem', JSON.stringify(nova));
    toast.success('Caso salvo na biblioteca pessoal');
  };

  // Remover da biblioteca
  const removerDaBiblioteca = (id) => {
    const nova = bibliotecaPessoal.filter(c => c.id !== id);
    setBibliotecaPessoal(nova);
    localStorage.setItem('supmed_biblioteca_imagem', JSON.stringify(nova));
    toast.success('Caso removido');
  };

  // Filtrar patologias
  const patologiasFiltradas = patologias.filter(p => {
    const matchSearch = !searchTerm || 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sintomas_associados?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.achados_chave?.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchModalidade = modalidadeFiltro === 'todas' || p.modalidade === modalidadeFiltro;
    const matchRegiao = regiaoFiltro === 'todas' || p.regiao === regiaoFiltro;
    const matchUrgencia = urgenciaFiltro === 'todas' || p.nivel_urgencia === urgenciaFiltro;
    
    return matchSearch && matchModalidade && matchRegiao && matchUrgencia;
  });

  return (
    <div className={embedded ? '' : 'min-h-screen bg-slate-100'}>
      {!embedded && <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />}
      
      <main className={embedded ? '' : `transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className={embedded ? '' : 'p-4 md:p-6'}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Atlas de Patologias por Imagem</h1>
                <p className="text-xs text-slate-500">Apoio educacional para interpretação de exames</p>
              </div>
            </div>
          </div>

          {/* Aviso Legal Fixo */}
          <Card className="mb-4 bg-amber-50 border-amber-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <strong>Aviso Legal:</strong> Este atlas é apenas para apoio educacional e comparação visual. 
                  NÃO substitui laudo radiológico profissional. Sempre solicite avaliação do radiologista.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/80 border border-slate-200/50 p-1 mb-4">
              <TabsTrigger value="atlas" className="text-xs gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Atlas
              </TabsTrigger>
              <TabsTrigger value="plantao" className="text-xs gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Modo Plantão
              </TabsTrigger>
              <TabsTrigger value="comparacao" className="text-xs gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Comparação
              </TabsTrigger>
              <TabsTrigger value="biblioteca" className="text-xs gap-1.5">
                <Grid3x3 className="w-3.5 h-3.5" /> Minha Biblioteca
              </TabsTrigger>
            </TabsList>

            {/* ATLAS */}
            <TabsContent value="atlas" className="mt-0">
              <AtlasView 
                patologias={patologiasFiltradas}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                modalidadeFiltro={modalidadeFiltro}
                setModalidadeFiltro={setModalidadeFiltro}
                regiaoFiltro={regiaoFiltro}
                setRegiaoFiltro={setRegiaoFiltro}
                urgenciaFiltro={urgenciaFiltro}
                setUrgenciaFiltro={setUrgenciaFiltro}
                onSelectForComparison={(p) => {
                  setImagemReferencia(p);
                  setActiveTab('comparacao');
                }}
              />
            </TabsContent>

            {/* MODO PLANTÃO */}
            <TabsContent value="plantao" className="mt-0">
              <ModoPlantao patologias={patologias} />
            </TabsContent>

            {/* COMPARAÇÃO */}
            <TabsContent value="comparacao" className="mt-0">
              <ComparacaoView 
                imagemUsuario={imagemUsuario}
                setImagemUsuario={setImagemUsuario}
                imagemReferencia={imagemReferencia}
                setImagemReferencia={setImagemReferencia}
                patologias={patologias}
                onSalvarBiblioteca={salvarNaBiblioteca}
              />
            </TabsContent>

            {/* BIBLIOTECA PESSOAL */}
            <TabsContent value="biblioteca" className="mt-0">
              <BibliotecaView 
                casos={bibliotecaPessoal}
                onRemover={removerDaBiblioteca}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// COMPONENTE: Atlas View
function AtlasView({ patologias, searchTerm, setSearchTerm, modalidadeFiltro, setModalidadeFiltro, regiaoFiltro, setRegiaoFiltro, urgenciaFiltro, setUrgenciaFiltro, onSelectForComparison }) {
  const [selectedPatologia, setSelectedPatologia] = useState(null);

  const urgenciaColors = {
    baixo: 'bg-green-100 text-green-700',
    moderado: 'bg-yellow-100 text-yellow-700',
    alto: 'bg-orange-100 text-orange-700',
    critico: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-4">
      {/* Busca e Filtros */}
      <Card className="bg-white/80 border-slate-200">
        <CardContent className="p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por patologia, sintomas ou achados..."
              className="pl-9 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Select value={modalidadeFiltro} onValueChange={setModalidadeFiltro}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="RX">RX</SelectItem>
                <SelectItem value="TC">TC</SelectItem>
                <SelectItem value="USG">USG</SelectItem>
              </SelectContent>
            </Select>

            <Select value={regiaoFiltro} onValueChange={setRegiaoFiltro}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="torax">Tórax</SelectItem>
                <SelectItem value="abdome">Abdome</SelectItem>
                <SelectItem value="cranio">Crânio</SelectItem>
                <SelectItem value="membros">Membros</SelectItem>
              </SelectContent>
            </Select>

            <Select value={urgenciaFiltro} onValueChange={setUrgenciaFiltro}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Urgência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
                <SelectItem value="moderado">Moderado</SelectItem>
                <SelectItem value="baixo">Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-slate-500">
            {patologias.length} patologia(s) encontrada(s)
          </div>
        </CardContent>
      </Card>

      {/* Lista de Patologias */}
      <div className="grid md:grid-cols-2 gap-3">
        {patologias.map((pat, i) => (
          <Card key={pat.id || i} className="bg-white/80 border-slate-200 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedPatologia(pat)}>
            <CardContent className="p-0">
              {/* Thumbnail da imagem */}
              <div className="w-full h-32 overflow-hidden relative">
                <ImagePlaceholder 
                  tipo={pat.modalidade}
                  titulo={pat.nome}
                  className="w-full h-full"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="text-[8px] bg-black/60 text-white backdrop-blur-sm">{pat.modalidade}</Badge>
                </div>
              </div>
              
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800">{pat.nome}</h3>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">{pat.regiao}</Badge>
                    </div>
                  </div>
                  <Badge className={`text-[8px] ${urgenciaColors[pat.nivel_urgencia]}`}>
                    {pat.nivel_urgencia}
                  </Badge>
                </div>
                
                <p className="text-xs text-slate-600 mb-2 line-clamp-2">{pat.contexto_clinico}</p>
                
                <div className="flex gap-1 flex-wrap">
                  {pat.achados_chave?.slice(0, 2).map((ach, j) => (
                    <Badge key={j} className="text-[8px] bg-blue-50 text-blue-700 px-1 py-0 h-4">{ach}</Badge>
                  ))}
                  {pat.achados_chave?.length > 2 && (
                    <Badge className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0 h-4">
                      +{pat.achados_chave.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de detalhes */}
      {selectedPatologia && (
        <Dialog open={!!selectedPatologia} onOpenChange={() => setSelectedPatologia(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedPatologia.nome}</span>
                <div className="flex gap-2">
                  <Badge className="text-[8px]">{selectedPatologia.modalidade}</Badge>
                  <Badge className={`text-[8px] ${urgenciaColors[selectedPatologia.nivel_urgencia]}`}>
                    {selectedPatologia.nivel_urgencia}
                  </Badge>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              {/* Imagem de Referência */}
              <div className="w-full rounded-lg overflow-hidden">
                <ImagePlaceholder 
                  tipo={selectedPatologia.modalidade}
                  titulo={selectedPatologia.nome}
                  descricao="Representação ilustrativa para fins educacionais"
                  className="w-full h-64"
                />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Contexto Clínico</h4>
                <p className="text-xs text-slate-700">{selectedPatologia.contexto_clinico}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Achados-Chave</h4>
                <ul className="space-y-0.5">
                  {selectedPatologia.achados_chave?.map((ach, i) => (
                    <li key={i} className="text-xs text-slate-700">• {ach}</li>
                  ))}
                </ul>
              </div>

              {selectedPatologia.diferenciais?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase mb-1">Diagnósticos Diferenciais</h4>
                  <ul className="space-y-0.5">
                    {selectedPatologia.diferenciais.map((dif, i) => (
                      <li key={i} className="text-xs text-slate-700">• {dif}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPatologia.armadilhas?.length > 0 && (
                <div className="p-2 bg-amber-50 rounded border border-amber-100">
                  <h4 className="text-xs font-semibold text-amber-700 uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Armadilhas
                  </h4>
                  <ul className="space-y-0.5">
                    {selectedPatologia.armadilhas.map((arm, i) => (
                      <li key={i} className="text-xs text-amber-700">• {arm}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              <Button size="sm" className="w-full h-8 text-xs" onClick={() => {
                onSelectForComparison(selectedPatologia);
                setSelectedPatologia(null);
              }}>
                <Eye className="w-3 h-3 mr-1" /> Usar na Comparação
              </Button>

              <div className="text-[10px] text-slate-400 border-t pt-2">
                <p>📚 Conteúdo baseado em literatura médica de referência</p>
                <p className="mt-1">⚠️ Não substitui avaliação radiológica profissional</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// COMPONENTE: Modo Plantão (Quick View)
function ModoPlantao({ patologias }) {
  const [modalidade, setModalidade] = useState('');
  const [regiao, setRegiao] = useState('');

  const filtradas = patologias.filter(p => 
    (!modalidade || p.modalidade === modalidade) &&
    (!regiao || p.regiao === regiao)
  );

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" /> Acesso Rápido (3 cliques)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-2">1. Selecione a modalidade:</p>
            <div className="grid grid-cols-3 gap-2">
              {['RX', 'TC', 'USG'].map(m => (
                <Button
                  key={m}
                  size="sm"
                  variant={modalidade === m ? 'default' : 'outline'}
                  className="h-10 text-xs"
                  onClick={() => setModalidade(m)}
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>

          {modalidade && (
            <div>
              <p className="text-xs text-slate-500 mb-2">2. Selecione a região:</p>
              <div className="grid grid-cols-2 gap-2">
                {['torax', 'abdome', 'cranio', 'membros'].map(r => (
                  <Button
                    key={r}
                    size="sm"
                    variant={regiao === r ? 'default' : 'outline'}
                    className="h-9 text-xs capitalize"
                    onClick={() => setRegiao(r)}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {modalidade && regiao && (
        <Card className="bg-white/80 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              3. Patologias mais prováveis ({modalidade} - {regiao})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtradas.length > 0 ? (
              <div className="space-y-2">
                {filtradas.map((pat, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-800">{pat.nome}</p>
                      <Badge className={`text-[8px] ${pat.nivel_urgencia === 'critico' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {pat.nivel_urgencia}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-600">{pat.contexto_clinico}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Nenhuma patologia cadastrada para esta combinação</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// COMPONENTE: Comparação
function ComparacaoView({ imagemUsuario, setImagemUsuario, imagemReferencia, setImagemReferencia, patologias, onSalvarBiblioteca }) {
  const [zoom, setZoom] = useState(100);
  const fileInputRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagemUsuario(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" /> Comparação Lado a Lado
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                <ZoomOut className="w-3 h-3" />
              </Button>
              <span className="text-xs text-slate-500">{zoom}%</span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            {/* Imagem do Usuário */}
            <div className="border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 aspect-square flex items-center justify-center overflow-hidden">
              {imagemUsuario ? (
                <div className="relative w-full h-full">
                  <img src={imagemUsuario} alt="Usuário" className="w-full h-full object-contain" style={{ transform: `scale(${zoom / 100})` }} />
                  <Button size="sm" variant="destructive" className="absolute top-2 right-2 h-7 text-xs" onClick={() => setImagemUsuario(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-3">Sua imagem</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-3 h-3 mr-1" /> Upload
                  </Button>
                </div>
              )}
            </div>

            {/* Imagem de Referência */}
            <div className="border-2 border-blue-200 rounded-lg bg-blue-50 aspect-square flex items-center justify-center overflow-hidden">
              {imagemReferencia ? (
                <div className="relative w-full h-full" style={{ transform: `scale(${zoom / 100})` }}>
                  <ImagePlaceholder 
                    tipo={imagemReferencia.modalidade}
                    titulo={imagemReferencia.nome}
                    descricao={`${imagemReferencia.modalidade} - ${imagemReferencia.regiao}`}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                  <p className="text-xs text-blue-400">Selecione uma patologia no Atlas</p>
                </div>
              )}
            </div>
          </div>

          {imagemUsuario && (
            <Button size="sm" className="w-full h-8 text-xs" onClick={() => onSalvarBiblioteca(imagemUsuario)}>
              Salvar na Minha Biblioteca
            </Button>
          )}

          <div className="p-2 bg-amber-50 rounded border border-amber-100 text-xs text-amber-700">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Comparação visual para apoio educacional. Não substitui laudo médico.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// COMPONENTE: Biblioteca Pessoal
function BibliotecaView({ casos, onRemover }) {
  return (
    <div className="space-y-4">
      <Card className="bg-white/80 border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-indigo-600" /> Minha Biblioteca de Casos
            </span>
            <Badge variant="outline" className="text-[8px]">{casos.length} caso(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {casos.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-3">
              {casos.map((caso) => (
                <div key={caso.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    <img src={caso.imagem} alt="Caso" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] text-slate-500">
                      {new Date(caso.data).toLocaleDateString('pt-BR')}
                    </p>
                    <Button size="sm" variant="destructive" className="w-full h-6 text-xs mt-2" onClick={() => onRemover(caso.id)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Grid3x3 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Nenhum caso salvo</p>
              <p className="text-xs text-slate-300 mt-1">
                Use o modo Comparação para salvar suas imagens
              </p>
            </div>
          )}

          <div className="mt-4 p-2 bg-blue-50 rounded border border-blue-100">
            <p className="text-[10px] text-blue-700">
              <Info className="w-3 h-3 inline mr-1" />
              <strong>Privacidade:</strong> Suas imagens ficam salvas localmente apenas no seu dispositivo. 
              Certifique-se de anonimizar todas as imagens antes de salvar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
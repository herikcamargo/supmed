import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, FlaskConical, Pill, BookOpen, AlertTriangle, Info } from 'lucide-react';
import ImagePlaceholder from '../medical/ImagePlaceholder';

// Base de ISTs (educacional)
const istDatabase = [
  {
    id: 'sifilis_primaria',
    nome: 'Sífilis Primária',
    agente: 'Treponema pallidum',
    categoria: 'Bacteriana',
    incubacao: '10-90 dias (média 21 dias)',
    descricao_visual: 'Cancro duro: úlcera única, indolor, bordas elevadas e endurecidas, fundo limpo',
    localizacao: 'Genitália, ânus, lábios, boca',
    quadro_clinico: [
      'Úlcera genital única (cancro duro)',
      'Indolor',
      'Linfadenopatia inguinal bilateral',
      'Resolução espontânea em 3-6 semanas'
    ],
    diagnostico: ['VDRL ou RPR', 'FTA-Abs ou TPHA', 'Teste rápido treponêmico'],
    tratamento_referencia: 'Penicilina G Benzatina 2.400.000 UI IM dose única',
    seguimento: 'VDRL mensal até 6º mês',
    notificacao: true,
    fonte: 'PCDT Sífilis MS 2022'
  },
  {
    id: 'gonorreia',
    nome: 'Gonorreia',
    agente: 'Neisseria gonorrhoeae',
    categoria: 'Bacteriana',
    incubacao: '2-5 dias',
    descricao_visual: 'Secreção uretral purulenta abundante amarelo-esverdeada',
    localizacao: 'Uretra, colo uterino, reto, faringe',
    quadro_clinico: [
      'Uretrite purulenta, disúria intensa',
      'Cervicite (pode ser assintomática)',
      'Proctite, faringite',
      'Disseminada: artrite, lesões cutâneas'
    ],
    diagnostico: ['NAAT (PCR)', 'Cultura', 'Gram de secreção'],
    tratamento_referencia: 'Ceftriaxona 500mg IM + Azitromicina 1g VO dose única',
    seguimento: 'Tratar parceiros dos últimos 60 dias',
    notificacao: true,
    fonte: 'CDC STI Guidelines 2021'
  },
  {
    id: 'clamidiase',
    nome: 'Clamidiose',
    agente: 'Chlamydia trachomatis',
    categoria: 'Bacteriana',
    incubacao: '7-21 dias',
    descricao_visual: 'Secreção uretral mucóide escassa, clara ou esbranquiçada',
    localizacao: 'Uretra, colo uterino',
    quadro_clinico: [
      'Uretrite com secreção clara/mucóide',
      'Cervicite (70% assintomática)',
      'DIP (Doença Inflamatória Pélvica)',
      'Epididimite'
    ],
    diagnostico: ['NAAT (PCR)', 'Swab uretral/endocervical ou urina 1º jato'],
    tratamento_referencia: 'Azitromicina 1g VO dose única OU Doxiciclina 100mg VO 12/12h por 7 dias',
    seguimento: 'Tratar parceiros',
    notificacao: false,
    fonte: 'CDC STI Guidelines 2021'
  },
  {
    id: 'herpes_genital',
    nome: 'Herpes Genital',
    agente: 'HSV-2 (90%) e HSV-1 (10%)',
    categoria: 'Viral',
    incubacao: '2-12 dias',
    descricao_visual: 'Vesículas agrupadas sobre base eritematosa, evoluem para úlceras rasas dolorosas',
    localizacao: 'Genitália, região perianal',
    quadro_clinico: [
      'Vesículas dolorosas agrupadas',
      'Úlceras múltiplas, rasas, dolorosas',
      'Adenopatia inguinal dolorosa',
      'Sintomas prodrômicos: parestesia'
    ],
    diagnostico: ['Clínico', 'PCR para HSV', 'Cultura viral'],
    tratamento_referencia: 'Aciclovir 400mg VO 8/8h por 7-10 dias OU Valaciclovir 1g VO 12/12h',
    seguimento: 'Orientar sobre recorrências',
    notificacao: false,
    fonte: 'CDC STI Guidelines 2021'
  },
  {
    id: 'hpv',
    nome: 'HPV - Condiloma Acuminado',
    agente: 'HPV (tipos 6 e 11)',
    categoria: 'Viral',
    incubacao: '3 semanas a 8 meses',
    descricao_visual: 'Verrugas anogenitais: lesões papilomatosas, aspecto de couve-flor',
    localizacao: 'Genitália, ânus',
    quadro_clinico: [
      'Verrugas genitais/anais',
      'Geralmente assintomático',
      'Prurido eventual'
    ],
    diagnostico: ['Clínico', 'Acetobranco', 'Biópsia se atípico'],
    tratamento_referencia: 'Crioterapia, ATA (ácido tricloroacético), Imiquimode tópico',
    seguimento: 'Vacina HPV (prevenção)',
    notificacao: false,
    fonte: 'CDC STI Guidelines 2021'
  },
  {
    id: 'hiv',
    nome: 'HIV/AIDS (conceito educacional)',
    agente: 'HIV-1 e HIV-2',
    categoria: 'Viral',
    incubacao: '2-4 semanas (síndrome retroviral)',
    descricao_visual: 'Síndrome retroviral: exantema maculopapular, úlceras orais, linfadenopatia',
    localizacao: 'Disseminado',
    quadro_clinico: [
      'Agudo: febre, adenopatia, faringite, exantema',
      'Latência: assintomático por anos',
      'AIDS: infecções oportunistas'
    ],
    diagnostico: ['Teste rápido + ELISA', 'Carga viral', 'CD4'],
    tratamento_referencia: 'TARV: TDF/3TC/DTG (esquema preferencial)',
    seguimento: 'CD4 e carga viral periódicos',
    notificacao: true,
    fonte: 'PCDT HIV/AIDS MS 2022'
  }
];

export default function AtlasIST() {
  const [istSelecionada, setIstSelecionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const istsFiltradas = istDatabase.filter(ist =>
    ist.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ist.agente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoriaColor = {
    'Bacteriana': 'bg-blue-100 text-blue-700 border-blue-200',
    'Viral': 'bg-purple-100 text-purple-700 border-purple-200',
    'Parasitária': 'bg-green-100 text-green-700 border-green-200'
  };

  if (istSelecionada) {
    return (
      <div className="space-y-3">
        <Button variant="outline" size="sm" onClick={() => setIstSelecionada(null)} className="text-xs h-7">
          <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
        </Button>

        <Card className="bg-white border border-slate-200">
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">{istSelecionada.nome}</h3>
              <div className="flex items-center gap-2">
                <Badge className={`text-[9px] ${categoriaColor[istSelecionada.categoria]}`}>
                  {istSelecionada.categoria}
                </Badge>
                <span className="text-[10px] text-slate-500">{istSelecionada.agente}</span>
              </div>
            </div>

            <ImagePlaceholder 
              tipo="dermatologia"
              titulo={istSelecionada.nome}
              descricao={istSelecionada.descricao_visual}
              className="w-full h-40"
            />

            <div className="p-2 bg-amber-50 rounded border border-amber-100">
              <h4 className="text-xs font-semibold text-amber-800 mb-1">Descrição Visual Típica</h4>
              <p className="text-[10px] text-amber-700">{istSelecionada.descricao_visual}</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Período de incubação:</span>
              <Badge variant="outline">{istSelecionada.incubacao}</Badge>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase mb-1.5">Quadro Clínico Comum</h4>
              <ul className="space-y-1">
                {istSelecionada.quadro_clinico.map((s, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                <FlaskConical className="w-3.5 h-3.5" /> Diagnóstico (métodos comuns)
              </h4>
              <div className="flex flex-wrap gap-1">
                {istSelecionada.diagnostico.map((d, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">{d}</Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                <Pill className="w-3.5 h-3.5" /> Esquema de Referência (educacional)
              </h4>
              <p className="text-xs text-emerald-800">{istSelecionada.tratamento_referencia}</p>
              <p className="text-[9px] text-emerald-700 mt-2 pt-2 border-t border-emerald-200">
                ⚠️ Esquema de referência. NÃO prescreve. Decisão depende de avaliação individualizada.
              </p>
            </div>

            {istSelecionada.seguimento && (
              <div className="p-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs text-blue-700">
                  <strong>Seguimento:</strong> {istSelecionada.seguimento}
                </p>
              </div>
            )}

            {istSelecionada.notificacao && (
              <div className="p-2 bg-red-50 rounded border border-red-100">
                <p className="text-xs text-red-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <strong>Notificação Compulsória</strong>
                </p>
              </div>
            )}

            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <p className="text-[9px] text-slate-500 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> <strong>Fonte:</strong> {istSelecionada.fonte}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar IST (sífilis, herpes, gonorreia...)"
              className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <p className="text-xs text-blue-800">
            <strong>Atlas educacional de ISTs.</strong> Apresentações típicas, diagnóstico e esquemas de referência. Para fins educacionais.
          </p>
        </CardContent>
      </Card>

      {/* Lista de ISTs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {istsFiltradas.map((ist) => (
          <Card 
            key={ist.id}
            className="bg-white border border-slate-200 hover:border-lime-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setIstSelecionada(ist)}
          >
            <CardContent className="p-0">
              <ImagePlaceholder 
                tipo="dermatologia"
                titulo={ist.nome}
                className="w-full h-24 rounded-t-lg"
              />
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`text-[8px] ${categoriaColor[ist.categoria]}`}>
                    {ist.categoria}
                  </Badge>
                  {ist.notificacao && (
                    <Badge className="text-[8px] bg-red-500 text-white">Notificação</Badge>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-slate-800 mb-1">{ist.nome}</h4>
                <p className="text-[10px] text-slate-500 italic mb-1">{ist.agente}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2">{ist.descricao_visual}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
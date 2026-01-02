import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Clipboard, 
  AlertTriangle,
  Copy,
  Skull,
  Bell,
  BookOpen,
  Search
} from 'lucide-react';

const declaracaoObito = {
  instrucoes: [
    'Bloco I: Identificação do falecido (nome, sexo, idade, naturalidade, estado civil)',
    'Bloco II: Residência (endereço completo)',
    'Bloco III: Ocorrência (local, data, hora do óbito)',
    'Bloco IV: Filiação (nome dos pais)',
    'Bloco V: Causas da morte (PRINCIPAL)',
    'Bloco VI: Médico (nome, CRM, assinatura)',
    'Bloco VII: Cartório (preenchido pelo cartório)',
    'Bloco VIII: Dados do Cemitério/Cremação'
  ],
  comoPreencherCausas: `
PARTE I - CADEIA DE CAUSAS (do efeito para a causa):
Linha (a) Causa IMEDIATA/Terminal: Última condição que levou diretamente ao óbito
   Ex: Insuficiência respiratória aguda

Linha (b) Causa INTERMEDIÁRIA: Condição que causou a linha (a)
   Ex: Pneumonia bacteriana

Linha (c) Causa BÁSICA/Fundamental: Doença ou condição que iniciou a cadeia
   Ex: DPOC

Linha (d) Outra causa básica (se necessário)

PARTE II - OUTRAS CONDIÇÕES significativas:
   Condições que contribuíram mas não fazem parte da cadeia
   Ex: Diabetes mellitus tipo 2, HAS
  `.trim(),
  modelo: `DECLARAÇÃO DE ÓBITO

PARTE I - Causas da morte (cadeia causal):
(a) Causa imediata: _________________________________
    Tempo aprox. entre início e morte: _______________

(b) Causa intermediária: ____________________________
    Tempo aprox.: __________________________________

(c) Causa básica: __________________________________
    Tempo aprox.: __________________________________

(d) _______________________________________________

PARTE II - Outras condições significativas:
________________________________________________
________________________________________________

CID-10 da Causa Básica: ________

Óbito durante gravidez/parto/puerpério: ( ) Sim ( ) Não
Óbito investigado: ( ) Sim ( ) Não
Circunstância: ( ) Natural ( ) Acidente ( ) Violência ( ) Ignorada`,
  alertas: [
    '⚠️ NUNCA usar PCR/Parada Cardiorrespiratória como causa básica',
    '⚠️ Mortes violentas, suspeitas ou acidentais → ENCAMINHAR AO IML',
    '⚠️ Óbito em menores de 1 ano → DO específica (rosa)',
    '⚠️ Óbito fetal (>500g ou >22 sem) → DO fetal (branca)',
    '⚠️ A causa básica deve ser a doença que INICIOU a cadeia',
    '⚠️ Guardar 2ª via no prontuário por 20 anos',
    '⚠️ Não abreviar diagnósticos',
    '⚠️ Não rasurar - se errar, inutilizar e preencher nova DO'
  ],
  exemplos: [
    {
      caso: 'Paciente com DPOC',
      causas: {
        a: 'Insuficiência respiratória aguda',
        b: 'Pneumonia bacteriana',
        c: 'Doença Pulmonar Obstrutiva Crônica (causa básica)',
        outras: 'Diabetes mellitus tipo 2'
      }
    },
    {
      caso: 'Paciente com IAM',
      causas: {
        a: 'Choque cardiogênico',
        b: 'Infarto agudo do miocárdio (causa básica)',
        outras: 'Hipertensão arterial sistêmica, Dislipidemia'
      }
    }
  ]
};

const catModelo = {
  campos: [
    'I - Emitente (empresa/CNPJ)',
    'II - Dados do Acidentado (nome, CPF, função, setor)',
    'III - Acidente (data, hora, local, descrição detalhada)',
    'IV - Tipo do Acidente',
    'V - Parte do Corpo Atingida',
    'VI - Agente Causador',
    'VII - Atestado Médico (CID-10, natureza da lesão)',
    'VIII - Testemunhas (se houver)'
  ],
  tiposAcidente: [
    'Típico: No exercício do trabalho',
    'Trajeto: Percurso residência ↔ trabalho',
    'Doença Ocupacional: Doença profissional ou do trabalho'
  ],
  prazo: '⚠️ PRAZO LEGAL: Emitir até o 1º dia útil após o acidente (ou diagnóstico de doença ocupacional)',
  prazoObito: '⚠️ Em caso de óbito: Comunicação IMEDIATA',
  multa: 'Multa por não emissão ou atraso: R$ 1.100,00 a R$ 5.500,00',
  instrucoes: `
COMO PREENCHER A CAT:

1. ACESSO: eSocial ou formulário físico
2. RESPONSÁVEL: Empresa é OBRIGADA a emitir
3. SE EMPRESA NÃO EMITIR: 
   - Médico pode emitir
   - Sindicato pode emitir
   - Próprio trabalhador pode emitir

4. VIAS:
   - 1ª via: INSS
   - 2ª via: Empresa
   - 3ª via: Segurado
   - 4ª via: Sindicato
   - 5ª via: SUS

5. NEXO CAUSAL:
   O médico deve estabelecer o NEXO entre a lesão/doença e o trabalho

6. CID-10 OBRIGATÓRIO:
   Especificar a natureza da lesão com CID-10
  `.trim(),
  modeloAtestado: `ATESTADO MÉDICO PARA CAT

Atesto para fins de CAT que o(a) Sr(a). ___________________,
portador(a) do CPF ____________, foi atendido(a) nesta data,
apresentando: _____________________________________________

Diagnóstico (CID-10): _____________________________________

Natureza da lesão: ________________________________________

Parte do corpo atingida: __________________________________

Houve afastamento: ( ) Sim ( ) Não
Período provável: ________________________________________

___________________, ___/___/______

_________________________________
Médico - CRM: ___________`
};

const cidsComuns = [
  { codigo: 'I10', doenca: 'Hipertensão arterial sistêmica' },
  { codigo: 'E11', doenca: 'Diabetes mellitus tipo 2' },
  { codigo: 'J45', doenca: 'Asma' },
  { codigo: 'F32', doenca: 'Depressão' },
  { codigo: 'I21', doenca: 'Infarto agudo do miocárdio' },
  { codigo: 'I64', doenca: 'Acidente vascular cerebral' },
  { codigo: 'J18', doenca: 'Pneumonia' },
  { codigo: 'K29', doenca: 'Gastrite' },
  { codigo: 'M54', doenca: 'Dorsalgia' },
  { codigo: 'N39', doenca: 'Infecção do trato urinário' },
  { codigo: 'F41', doenca: 'Transtorno de ansiedade' },
  { codigo: 'E66', doenca: 'Obesidade' },
  { codigo: 'I50', doenca: 'Insuficiência cardíaca' },
  { codigo: 'J44', doenca: 'Doença pulmonar obstrutiva crônica (DPOC)' },
  { codigo: 'N18', doenca: 'Doença renal crônica' },
  { codigo: 'E78', doenca: 'Dislipidemia' },
  { codigo: 'K21', doenca: 'Doença do refluxo gastroesofágico' },
  { codigo: 'G40', doenca: 'Epilepsia' },
  { codigo: 'L20', doenca: 'Dermatite atópica' },
  { codigo: 'B34', doenca: 'Infecção viral' }
];

export default function PlantonistaDocumentos() {
  const [searchCid, setSearchCid] = useState('');
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const filteredCids = cidsComuns.filter(item => 
    item.doenca.toLowerCase().includes(searchCid.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchCid.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="do">
        <TabsList className="bg-white/80 border border-slate-200/50 p-0.5 h-8">
          <TabsTrigger value="do" className="text-[10px] h-7">
            <Skull className="w-3 h-3 mr-1" /> Declaração de Óbito
          </TabsTrigger>
          <TabsTrigger value="cat" className="text-[10px] h-7">
            <Clipboard className="w-3 h-3 mr-1" /> CAT
          </TabsTrigger>
          <TabsTrigger value="sinan" className="text-[10px] h-7">
            <Bell className="w-3 h-3 mr-1" /> SINAN
          </TabsTrigger>
          <TabsTrigger value="cid" className="text-[10px] h-7">
            <BookOpen className="w-3 h-3 mr-1" /> CID
          </TabsTrigger>
        </TabsList>

        {/* Declaração de Óbito */}
        <TabsContent value="do" className="mt-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Skull className="w-4 h-4 text-slate-700" /> Declaração de Óbito (DO)
              </h3>
              
              {/* Blocos da DO */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Blocos da DO:</h4>
                <div className="grid md:grid-cols-2 gap-1 text-[10px] text-slate-600">
                  {declaracaoObito.instrucoes.map((i, idx) => (
                    <p key={idx} className="p-1.5 bg-slate-50 rounded">• {i}</p>
                  ))}
                </div>
              </div>

              {/* Como preencher causas */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-800 mb-2">📝 Como Preencher as Causas:</h4>
                <pre className="text-[10px] text-blue-700 whitespace-pre-wrap leading-relaxed">
                  {declaracaoObito.comoPreencherCausas}
                </pre>
              </div>

              {/* Modelo */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Modelo de Preenchimento:</h4>
                <pre className="text-[10px] text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded border">
                  {declaracaoObito.modelo}
                </pre>
                <Button size="sm" variant="outline" className="mt-2 text-[10px] h-7" onClick={() => copyToClipboard(declaracaoObito.modelo)}>
                  <Copy className="w-3 h-3 mr-1" /> Copiar Modelo
                </Button>
              </div>

              {/* Exemplos */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Exemplos Práticos:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {declaracaoObito.exemplos.map((ex, i) => (
                    <div key={i} className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                      <p className="text-[10px] font-semibold text-emerald-800 mb-1.5">{ex.caso}</p>
                      <p className="text-[9px] text-emerald-700">(a) {ex.causas.a}</p>
                      <p className="text-[9px] text-emerald-700">(b) {ex.causas.b}</p>
                      <p className="text-[9px] text-emerald-700">(c) {ex.causas.c}</p>
                      <p className="text-[9px] text-emerald-700 mt-1">Outras: {ex.causas.outras}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> ALERTAS IMPORTANTES
                </h4>
                <div className="space-y-1">
                  {declaracaoObito.alertas.map((a, i) => (
                    <p key={i} className="text-[10px] text-red-700 leading-relaxed">{a}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CAT */}
        <TabsContent value="cat" className="mt-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-orange-600" /> Comunicação de Acidente de Trabalho (CAT)
              </h3>

              {/* Prazos */}
              <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-bold text-amber-800">{catModelo.prazo}</p>
                <p className="text-[10px] text-amber-700 mt-1">{catModelo.prazoObito}</p>
                <p className="text-[10px] text-red-700 mt-2 font-semibold">{catModelo.multa}</p>
              </div>

              {/* Campos */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Campos Obrigatórios:</h4>
                <div className="grid md:grid-cols-2 gap-1 text-[10px] text-slate-600">
                  {catModelo.campos.map((c, i) => (
                    <p key={i} className="p-1.5 bg-slate-50 rounded">• {c}</p>
                  ))}
                </div>
              </div>

              {/* Tipos de Acidente */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Tipos de Acidente:</h4>
                <div className="space-y-1">
                  {catModelo.tiposAcidente.map((t, i) => (
                    <p key={i} className="text-[10px] text-slate-600 p-1.5 bg-blue-50 rounded">• {t}</p>
                  ))}
                </div>
              </div>

              {/* Instruções */}
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">📋 Instruções de Preenchimento:</h4>
                <pre className="text-[10px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {catModelo.instrucoes}
                </pre>
              </div>

              {/* Modelo de Atestado */}
              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-2">Modelo de Atestado Médico para CAT:</h4>
                <pre className="text-[10px] text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded border">
                  {catModelo.modeloAtestado}
                </pre>
                <Button size="sm" variant="outline" className="mt-2 text-[10px] h-7" onClick={() => copyToClipboard(catModelo.modeloAtestado)}>
                  <Copy className="w-3 h-3 mr-1" /> Copiar Atestado
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SINAN */}
        <TabsContent value="sinan" className="mt-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" /> SINAN - Sistema de Notificação Compulsória
              </h3>

              {/* Definições e Alertas */}
              <div className="space-y-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-800 mb-2">O que é o SINAN?</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Sistema de Informação de Agravos de Notificação, vinculado ao Ministério da Saúde. 
                    Registra e processa dados sobre doenças e agravos de notificação compulsória no Brasil, 
                    fundamentando ações de vigilância epidemiológica e controle de surtos.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="text-xs font-semibold text-amber-800 mb-2">⚠️ Obrigatoriedade Legal</h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• A notificação compulsória é <strong>obrigatória</strong> para serviços públicos e privados</li>
                    <li>• Independe de confirmação diagnóstica laboratorial</li>
                    <li>• Responsabilidade do profissional de saúde e do serviço</li>
                    <li>• Conforme Portaria GM/MS nº 6.734/2025</li>
                  </ul>
                </div>

                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="text-xs font-semibold text-red-800 mb-2">Consequências da Não Notificação</h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Compromete a vigilância epidemiológica e o controle de surtos</li>
                    <li>• Impacta negativamente a saúde coletiva</li>
                    <li>• Sujeito a sanções administrativas e legais conforme legislação sanitária vigente</li>
                    <li>• Infração ética com possível aplicação de multa</li>
                  </ul>
                </div>
              </div>

              {/* Subabas SINAN */}
              <Tabs defaultValue="imediata" className="mt-4">
                <TabsList className="bg-slate-100 border border-slate-200 p-0.5 h-auto grid grid-cols-3">
                  <TabsTrigger value="imediata" className="text-[9px] h-7 px-2">
                    Notificação Imediata
                  </TabsTrigger>
                  <TabsTrigger value="semanal" className="text-[9px] h-7 px-2">
                    Notificação Semanal
                  </TabsTrigger>
                  <TabsTrigger value="preenchimento" className="text-[9px] h-7 px-2">
                    Como Preencher
                  </TabsTrigger>
                </TabsList>

                {/* Notificação Imediata */}
                <TabsContent value="imediata" className="mt-3">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-300 mb-3">
                    <p className="text-xs font-bold text-red-800">🚨 NOTIFICAÇÃO IMEDIATA - Até 24 horas</p>
                  </div>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {[
                      'Acidente por animal peçonhento',
                      'Botulismo',
                      'Cólera',
                      'COVID-19',
                      'Doença de Chagas Aguda',
                      'Febre Amarela',
                      'Febre do Nilo Ocidental',
                      'Febre Maculosa',
                      'Hantavirose',
                      'Influenza humana por novo subtipo',
                      'Intoxicação Exógena (agrotóxicos, medicamentos, metais)',
                      'Malária',
                      'Meningite (viral, bacteriana, fúngica)',
                      'Peste',
                      'Poliomielite',
                      'Raiva humana',
                      'Sarampo',
                      'Síndrome Respiratória Aguda Grave (SRAG)',
                      'Tétano',
                      'Varíola'
                    ].map((doenca) => (
                      <div key={doenca} className="p-2 bg-white rounded border border-red-200 text-xs text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                        {doenca}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Notificação Semanal */}
                <TabsContent value="semanal" className="mt-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-300 mb-3">
                    <p className="text-xs font-bold text-blue-800">📋 NOTIFICAÇÃO SEMANAL</p>
                  </div>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {[
                      'Atendimento antirrábico',
                      'Dengue',
                      'Chikungunya',
                      'Zika',
                      'Difteria',
                      'Doença de Creutzfeldt-Jakob',
                      'Doença Meningocócica',
                      'Esquistossomose',
                      'Hanseníase',
                      'Hepatites Virais',
                      'HIV/AIDS',
                      'Leishmaniose Tegumentar',
                      'Leishmaniose Visceral',
                      'Leptospirose',
                      'Sífilis (adquirida, congênita, gestante)',
                      'Toxoplasmose gestacional e congênita',
                      'Tuberculose',
                      'Coqueluche',
                      'Rubéola',
                      'Síndrome da Rubéola Congênita'
                    ].map((doenca) => (
                      <div key={doenca} className="p-2 bg-white rounded border border-blue-200 text-xs text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                        {doenca}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Como Preencher */}
                <TabsContent value="preenchimento" className="mt-3">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Passo a Passo para Notificação no SINAN</h4>
                      <ol className="text-xs text-slate-600 space-y-2">
                        <li className="flex gap-2">
                          <span className="font-semibold text-blue-600">1.</span>
                          <span>Identificar a doença ou agravo de notificação compulsória</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-semibold text-blue-600">2.</span>
                          <span>Preencher a Ficha de Notificação específica da doença (disponível no sistema SINAN ou formulário físico)</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-semibold text-blue-600">3.</span>
                          <span>Informar dados do paciente, data de início dos sintomas, diagnóstico, exames</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-semibold text-blue-600">4.</span>
                          <span>Encaminhar imediatamente à Vigilância Epidemiológica municipal</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-semibold text-blue-600">5.</span>
                          <span>Manter cópia da notificação no prontuário do paciente</span>
                        </li>
                      </ol>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Quem Deve Notificar?</h4>
                      <p className="text-xs text-slate-600">
                        Qualquer profissional de saúde (médico, enfermeiro, farmacêutico, etc.) que atenda ou tome conhecimento de caso suspeito ou confirmado.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Fluxo da Notificação</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-600">
                        <span className="px-2 py-1 bg-blue-100 rounded">Serviço Notificante</span>
                        <span>→</span>
                        <span className="px-2 py-1 bg-blue-100 rounded">Vigilância Municipal</span>
                        <span>→</span>
                        <span className="px-2 py-1 bg-blue-100 rounded">Vigilância Estadual</span>
                        <span>→</span>
                        <span className="px-2 py-1 bg-blue-100 rounded">Ministério da Saúde</span>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="text-xs font-semibold text-green-800 mb-2">Dicas para Evitar Erros</h4>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Preencha todos os campos obrigatórios</li>
                        <li>• Use letra legível ou sistema eletrônico</li>
                        <li>• Confirme data de início dos sintomas</li>
                        <li>• Informe exames realizados ou solicitados</li>
                        <li>• Não aguarde confirmação laboratorial para notificar</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Fonte Oficial */}
              <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-300">
                <p className="text-[9px] text-slate-600">
                  <strong>Fonte:</strong> Portaria GM/MS nº 6.734, de 18 de março de 2025 - Ministério da Saúde
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CID */}
        <TabsContent value="cid" className="mt-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> CID - Classificação Internacional de Doenças
              </h3>

              {/* Caixa de Pesquisa */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar por doença ou código CID..."
                    value={searchCid}
                    onChange={(e) => setSearchCid(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Info OMS */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Fonte:</strong> Classificação Internacional de Doenças (CID-10) - Organização Mundial da Saúde (OMS)
                </p>
              </div>

              {/* Lista de CIDs */}
              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-3">
                  {searchCid ? `Resultados (${filteredCids.length})` : 'Afecções Comuns'}
                </h4>
                <div className="grid md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {filteredCids.map((item) => (
                    <div 
                      key={item.codigo} 
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">{item.doenca}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-mono rounded">
                          {item.codigo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredCids.length === 0 && searchCid && (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">Nenhum resultado encontrado para "{searchCid}"</p>
                  </div>
                )}
              </div>

              {/* Nota */}
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-[10px] text-amber-700">
                  <strong>Nota:</strong> Esta é uma lista exemplificativa de CIDs comuns. Para consulta completa e atualizada, 
                  acesse o site oficial da OMS ou utilize sistemas integrados de prontuário eletrônico.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
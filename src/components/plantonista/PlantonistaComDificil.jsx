import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Shield, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

// Protocolo SPIKES para más notícias
const protocoloSPIKES = {
  titulo: 'Protocolo SPIKES',
  subtitulo: 'Dar más notícias de forma estruturada',
  etapas: [
    {
      letra: 'S',
      nome: 'Setting',
      descricao: 'Preparar o ambiente',
      acoes: [
        'Encontre local privado e sem interrupções',
        'Sente-se ao lado ou em ângulo (não de frente)',
        'Desligue celular, evite pressa visível',
        'Convide familiar/acompanhante se paciente desejar'
      ]
    },
    {
      letra: 'P',
      nome: 'Perception',
      descricao: 'Avaliar percepção do paciente',
      acoes: [
        '"O que o(a) senhor(a) já sabe sobre sua situação?"',
        '"Os médicos anteriores comentaram algo?"',
        'Escute antes de falar',
        'Identifique o nível de compreensão'
      ]
    },
    {
      letra: 'I',
      nome: 'Invitation',
      descricao: 'Perguntar quanto quer saber',
      acoes: [
        '"Prefere que eu explique tudo ou quer que vá direto ao ponto?"',
        '"Gostaria de saber todos os detalhes ou prefere uma visão geral?"',
        'Respeite se não quiser saber tudo agora',
        'Alguns preferem receber aos poucos'
      ]
    },
    {
      letra: 'K',
      nome: 'Knowledge',
      descricao: 'Transmitir a informação',
      acoes: [
        'Aviso prévio: "Infelizmente tenho más notícias..."',
        'Use palavras simples, evite jargões',
        'Seja direto, mas compassivo',
        'Pause após dar a notícia, deixe processar',
        'Não use eufemismos que confundam ("não respondeu bem" → "faleceu")'
      ]
    },
    {
      letra: 'E',
      nome: 'Empathy',
      descricao: 'Acolher emoções',
      acoes: [
        'Observe reações: choque, raiva, choro, negação',
        'Valide: "Imagino o quanto isso é difícil"',
        'Silêncio respeitoso é válido',
        'Ofereça lenço, água, tempo',
        'Não diga "sei como se sente" (você não sabe)'
      ]
    },
    {
      letra: 'S',
      nome: 'Strategy',
      descricao: 'Planejar próximos passos',
      acoes: [
        '"Vamos pensar juntos no que fazer agora"',
        'Explique tratamento, cuidados paliativos, suporte',
        'Deixe claro que não abandonará o paciente',
        'Agende retorno ou contato',
        'Forneça contato para dúvidas'
      ]
    }
  ],
  erros_comuns: [
    'Dar notícia no corredor ou com pressa',
    'Usar termos técnicos demais',
    'Dar muita informação de uma vez',
    'Minimizar a situação ("pelo menos não é X")',
    'Dar falsas esperanças',
    'Evitar falar sobre morte quando é o caso'
  ]
};

// Técnicas para lidar com agressividade
const tecnicasAgressividade = {
  titulo: 'Desescalação de Conflitos',
  principios: [
    {
      nome: 'Segurança em primeiro lugar',
      descricao: 'Se houver risco físico, afaste-se e chame segurança',
      acoes: [
        'Mantenha distância de segurança (2-3 passos)',
        'Posicione-se próximo à porta',
        'Nunca bloqueie a saída do paciente/familiar',
        'Não toque na pessoa sem consentimento'
      ]
    },
    {
      nome: 'Não confrontar',
      descricao: 'Evite discussão ou defesa imediata',
      acoes: [
        'Não levante a voz',
        'Não cruze os braços (postura defensiva)',
        'Evite "mas", "porém", "você está errado"',
        'Não interrompa quando a pessoa estiver falando'
      ]
    },
    {
      nome: 'Validar sentimentos',
      descricao: 'Reconheça a emoção sem necessariamente concordar',
      frases: [
        '"Vejo que está muito frustrado(a)"',
        '"Entendo que essa situação está sendo difícil"',
        '"Sei que esperou muito tempo, isso é realmente chato"',
        '"Você tem razão de estar preocupado(a)"'
      ]
    },
    {
      nome: 'Usar tom calmo',
      descricao: 'Voz baixa e pausada acalma',
      acoes: [
        'Fale devagar, com pausas',
        'Tom de voz neutro e baixo',
        'Evite sarcasmo ou ironia',
        'Mantenha contato visual sem encarar'
      ]
    },
    {
      nome: 'Oferecer opções',
      descricao: 'Devolva sensação de controle',
      frases: [
        '"Podemos conversar aqui ou em uma sala mais reservada?"',
        '"Prefere que eu chame o chefe do plantão?"',
        '"Quer que eu explique o que aconteceu?"',
        '"Podemos resolver isso juntos. O que você acha que ajudaria?"'
      ]
    },
    {
      nome: 'Estabelecer limites',
      descricao: 'Se a agressividade persistir',
      frases: [
        '"Quero ajudar, mas preciso que baixe o tom de voz"',
        '"Vou encerrar a conversa se continuar gritando"',
        '"Não aceito palavrões, mas estou disposto a ouvir"',
        '"Vou chamar segurança se houver ameaça"'
      ]
    }
  ],
  frases_evitar: [
    '"Acalme-se" (piora a situação)',
    '"Não é para tanto"',
    '"Outros pacientes estão piores"',
    '"Você precisa entender"',
    '"Não grite comigo"',
    '"Eu sou o médico aqui"'
  ]
};

// Como explicar risco
const explicacaoRisco = {
  titulo: 'Comunicação de Risco',
  tecnicas: [
    {
      nome: 'Use números absolutos',
      ruim: '"Há 50% de chance de complicação"',
      bom: '"De cada 100 pessoas, 50 têm essa complicação"',
      porque: 'Números absolutos são mais concretos e compreensíveis'
    },
    {
      nome: 'Compare com algo familiar',
      ruim: '"O risco é de 1 em 10.000"',
      bom: '"O risco é menor que o de ser atingido por um raio"',
      porque: 'Comparações ajudam a dimensionar'
    },
    {
      nome: 'Evite só percentuais',
      ruim: '"99% de chance de dar certo"',
      bom: '"99 pessoas em 100 não têm problema. 1 em 100 pode ter"',
      porque: 'O cérebro processa melhor frequências'
    },
    {
      nome: 'Apresente ambos os lados',
      ruim: '"Pode ter hemorragia grave"',
      bom: '"95% não têm problemas. 5% podem ter sangramento, que tratamos"',
      porque: 'Equilíbrio entre informar e não assustar'
    },
    {
      nome: 'Use recursos visuais',
      exemplo: 'Desenhe 100 quadradinhos, pinte os que representam risco',
      porque: 'Visual ajuda compreensão'
    }
  ],
  termo_consentimento: {
    dicas: [
      'Explique antes de mostrar o papel',
      'Leia os riscos principais em voz alta',
      'Pergunte se há dúvidas a cada seção',
      'Não minimize: "é só assinar aqui"',
      'Documente que explicou e paciente compreendeu',
      'Ofereça cópia do termo'
    ]
  },
  frases_uteis: [
    '"Todo procedimento tem riscos, mas fazemos quando o benefício é maior"',
    '"O risco existe, mas é baixo e sabemos como lidar se acontecer"',
    '"Vou explicar o pior cenário, mas é raro"',
    '"Não fazer também tem riscos. Vamos comparar?"'
  ]
};

// Cuidados Paliativos (Baseado em diretrizes MS 2023/2024)
const cuidadosPaliativos = {
  titulo: 'Cuidados Paliativos',
  definicao: 'Abordagem que promove qualidade de vida de pacientes e familiares diante de doenças que ameaçam a continuidade da vida, através da prevenção e alívio do sofrimento físico, psicossocial e espiritual.',
  principios: [
    {
      nome: 'Controle de Sintomas',
      descricao: 'Avaliação sistemática e manejo de dor, dispneia, náusea, fadiga',
      acoes: [
        'Dor: uso adequado de opioides conforme escada OMS',
        'Dispneia: morfina, oxigênio, posicionamento',
        'Náusea/vômito: antiemético + controle de causa base',
        'Reavaliação contínua da eficácia'
      ]
    },
    {
      nome: 'Comunicação Clara',
      descricao: 'Conversar sobre prognóstico, metas e preferências',
      acoes: [
        'Discussão precoce sobre diretivas antecipadas',
        'Entender expectativas do paciente e família',
        'Explicar o que são cuidados paliativos ("não é desistir")',
        'Envolver equipe multiprofissional'
      ]
    },
    {
      nome: 'Abordagem Integral',
      descricao: 'Cuidar além do físico: emocional, social, espiritual',
      acoes: [
        'Suporte psicológico (psicólogo, psiquiatra)',
        'Assistência social (direitos, benefícios)',
        'Apoio espiritual (capelania se desejado)',
        'Atenção aos cuidadores e família'
      ]
    },
    {
      nome: 'Trabalho em Equipe',
      descricao: 'Atuação multiprofissional coordenada',
      acoes: [
        'Médico, enfermeiro, fisioterapeuta, nutricionista',
        'Reuniões de equipe para alinhamento',
        'Comunicação unificada com paciente/família',
        'Referenciar para serviço especializado quando necessário'
      ]
    }
  ],
  indicacoes: {
    titulo: 'Quando Iniciar Cuidados Paliativos',
    situacoes: [
      'Câncer metastático ou avançado sem resposta a tratamento curativo',
      'Insuficiência cardíaca avançada (CF IV, internações frequentes)',
      'DPOC grave (VEF1 < 30%, oxigênio domiciliar)',
      'Demências avançadas (estágio grave, acamado)',
      'Doença renal crônica terminal não elegível para diálise',
      'Doenças neurológicas progressivas (ELA, Parkinson avançado)',
      'Pergunta surpresa: "Eu me surpreenderia se esse paciente morresse nos próximos 12 meses?" Se NÃO = considerar paliativos'
    ]
  },
  manejo_sintomas: [
    {
      sintoma: 'Dor Oncológica',
      avaliar: 'Escala numérica (0-10), característica, localização',
      condutas: [
        'Leve (1-3): Paracetamol ou anti-inflamatório',
        'Moderada (4-6): Opioide fraco (tramadol, codeína) + analgésico',
        'Intensa (7-10): Opioide forte (morfina, oxicodona, fentanil)',
        'Dor neuropática: gabapentina, amitriptilina, duloxetina'
      ],
      obs: 'Titular dose até analgesia adequada. Prevenir constipação com laxante.'
    },
    {
      sintoma: 'Dispneia',
      avaliar: 'Intensidade, FR, SpO2, causa (derrame, TEP, anemia)',
      condutas: [
        'Morfina 2,5-5mg VO/SC 4/4h (reduz percepção de falta de ar)',
        'Oxigênio se hipoxemia (SpO2 < 90%)',
        'Ventilador, posição elevada',
        'Ansiolítico se componente ansioso (lorazepam, midazolam)'
      ],
      obs: 'Morfina é padrão-ouro mesmo sem hipoxemia.'
    },
    {
      sintoma: 'Náusea/Vômito',
      avaliar: 'Causa: quimioterapia, hipercalcemia, íleo, metástases cerebrais',
      condutas: [
        'Metoclopramida 10mg VO/IV 8/8h (gastroparesia, estase)',
        'Ondansetrona 4-8mg VO/IV 8/8h (quimioterapia)',
        'Haloperidol 0,5-2mg VO/IM à noite (metabólico, opioides)',
        'Tratar causa base se possível'
      ],
      obs: 'Associar antiácido e dieta leve.'
    },
    {
      sintoma: 'Delirium (Confusão Mental)',
      avaliar: 'CAM (Confusion Assessment Method), excluir causas reversíveis',
      condutas: [
        'Corrigir desidratação, eletrólitos, infecção',
        'Haloperidol 0,5-2mg VO/IM 8/8h se agitação',
        'Ambiente calmo, familiar presente',
        'Evitar contenção física'
      ],
      obs: 'Comum em fim de vida. Reversível em 30-50% dos casos.'
    }
  ],
  comunicacao_fim_vida: {
    titulo: 'Conversa sobre Fim de Vida',
    quando: 'Quando diagnóstico de doença terminal, piora clínica importante ou internação em UTI',
    perguntas_chave: [
      '"O que você entende sobre sua doença?"',
      '"O que é mais importante para você neste momento?"',
      '"Quais são seus medos e preocupações?"',
      '"Você pensou em como gostaria de ser cuidado se piorasse?"',
      '"Há algo que você gostaria de fazer ou resolver?"'
    ],
    diretivas_antecipadas: [
      'RCP (reanimação cardiopulmonar): deseja ou não?',
      'Intubação e ventilação mecânica: aceita ou não?',
      'Diálise: iniciar ou não?',
      'Alimentação por sonda: deseja ou não?',
      'Local de preferência: hospital, casa, hospice'
    ],
    frases_uteis: [
      '"Os cuidados paliativos não significam desistir, mas sim focar no que importa para você"',
      '"Vamos garantir que você não sinta dor e tenha conforto"',
      '"Estaremos ao seu lado em cada etapa"',
      '"Não há resposta certa ou errada, o importante é o que você deseja"'
    ]
  },
  sedacao_paliativa: {
    titulo: 'Sedação Paliativa',
    definicao: 'Uso de sedativos para alívio de sofrimento refratário em fase final',
    indicacoes: [
      'Sintoma refratário (dor, dispneia, delirium) sem resposta a medidas convencionais',
      'Prognóstico de dias a semanas',
      'Consentimento do paciente ou família',
      'Avaliação por equipe multiprofissional'
    ],
    medicamentos: [
      'Midazolam 2,5-5mg SC/IV bolus, seguido de 0,5-1mg/h infusão contínua',
      'Fenobarbital 100-200mg SC/IV a cada 8-12h',
      'Propofol (em ambiente hospitalar com monitorização)'
    ],
    obs: 'Sempre documentar indicação, consentimento e reavaliações.'
  },
  luto: {
    titulo: 'Suporte ao Luto',
    fases: 'Negação, raiva, barganha, depressão, aceitação (não lineares)',
    suporte_familia: [
      'Oferecer condolências sinceras',
      'Validar emoções: "É normal sentir..."',
      'Disponibilizar contato com psicologia',
      'Orientar sobre grupos de apoio ao luto',
      'Acompanhamento telefônico pós-óbito (se possível)'
    ]
  },
  referencias: [
    'Manual de Cuidados Paliativos MS/ANCP - 2ª Ed. 2023',
    'Portaria GM/MS nº 3.681/2024 - Cuidados Paliativos no SUS',
    'OMS - Definição de Cuidados Paliativos 2024',
    'ANCP - Academia Nacional de Cuidados Paliativos'
  ]
};

// Frases e scripts prontos
const scriptsProntos = {
  inicio_conversa: [
    '"Preciso conversar com você sobre algo importante. Tem alguns minutos?"',
    '"Há algo que precisamos discutir. Prefere que chamemos alguém da família?"',
    '"Tenho o resultado dos exames. Podemos sentar um momento?"'
  ],
  pausas_empatia: [
    '[Silêncio respeitoso de 5-10 segundos]',
    '"Sei que isso é muito difícil de ouvir"',
    '"Entendo que é muita informação de uma vez"',
    '"Quer um momento antes de continuarmos?"',
    '"Isso deve ser um choque"'
  ],
  nao_sabe_resposta: [
    '"Essa é uma ótima pergunta. Não tenho certeza agora, mas vou descobrir"',
    '"Não sei neste momento, mas vou consultar e te retorno"',
    '"Isso está fora da minha especialidade, vou pedir que o especialista converse com você"'
  ],
  encerrar_conversa: [
    '"Alguma dúvida que eu possa responder agora?"',
    '"Vou deixar meu contato. Me procure se surgirem dúvidas"',
    '"Não está sozinho(a) nisso. Estamos aqui para ajudar"',
    '"Vamos nos falar novamente em [prazo]. Até lá, qualquer coisa me chame"'
  ]
};

export default function PlantonistaComDificil() {
  const [activeTab, setActiveTab] = useState('mas-noticias');

  return (
    <div className="space-y-4">
      {/* Alerta Modelo 2 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <strong>Guia educacional.</strong> Cada situação é única e requer adaptação. Use como apoio ao seu julgamento clínico e experiência.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/80 border border-slate-200/50 p-1 grid grid-cols-5 w-full">
          <TabsTrigger value="mas-noticias" className="text-xs gap-1 data-[state=active]:bg-slate-100">
            <MessageSquare className="w-3.5 h-3.5" />
            Más Notícias
          </TabsTrigger>
          <TabsTrigger value="agressividade" className="text-xs gap-1 data-[state=active]:bg-slate-100">
            <Shield className="w-3.5 h-3.5" />
            Agressividade
          </TabsTrigger>
          <TabsTrigger value="risco" className="text-xs gap-1 data-[state=active]:bg-slate-100">
            <AlertCircle className="w-3.5 h-3.5" />
            Explicar Risco
          </TabsTrigger>
          <TabsTrigger value="paliativos" className="text-xs gap-1 data-[state=active]:bg-purple-100">
            <Info className="w-3.5 h-3.5" />
            Paliativos
          </TabsTrigger>
          <TabsTrigger value="scripts" className="text-xs gap-1 data-[state=active]:bg-slate-100">
            <MessageSquare className="w-3.5 h-3.5" />
            Scripts
          </TabsTrigger>
        </TabsList>

        {/* MÁS NOTÍCIAS - PROTOCOLO SPIKES */}
        <TabsContent value="mas-noticias" className="mt-3 space-y-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  {protocoloSPIKES.titulo}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{protocoloSPIKES.subtitulo}</p>
              </div>

              <div className="space-y-2">
                {protocoloSPIKES.etapas.map((etapa, idx) => (
                  <div key={idx} className="p-3 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        {etapa.letra}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800">{etapa.nome}</h4>
                        <p className="text-[10px] text-slate-600">{etapa.descricao}</p>
                      </div>
                    </div>
                    <ul className="space-y-1 ml-8">
                      {etapa.acoes.map((acao, i) => (
                        <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{acao}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Erros Comuns */}
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Erros Comuns a Evitar
                </h4>
                <ul className="space-y-1">
                  {protocoloSPIKES.erros_comuns.map((erro, idx) => (
                    <li key={idx} className="text-[10px] text-red-700 flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">×</span>
                      <span>{erro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AGRESSIVIDADE */}
        <TabsContent value="agressividade" className="mt-3 space-y-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  {tecnicasAgressividade.titulo}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Técnicas para desescalar conflitos</p>
              </div>

              <div className="space-y-2">
                {tecnicasAgressividade.principios.map((principio, idx) => (
                  <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="text-xs font-semibold text-amber-900 mb-1">{principio.nome}</h4>
                    <p className="text-[10px] text-slate-600 mb-2">{principio.descricao}</p>
                    
                    {principio.acoes && (
                      <ul className="space-y-1">
                        {principio.acoes.map((acao, i) => (
                          <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                            <span className="text-amber-600">•</span>
                            <span>{acao}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {principio.frases && (
                      <div className="mt-2 space-y-1">
                        {principio.frases.map((frase, i) => (
                          <div key={i} className="text-[10px] text-slate-700 bg-white/60 px-2 py-1 rounded italic">
                            {frase}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Frases a Evitar */}
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Frases que Pioram a Situação
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {tecnicasAgressividade.frases_evitar.map((frase, idx) => (
                    <div key={idx} className="text-[10px] text-red-700 bg-white/60 px-2 py-1 rounded flex items-start gap-1">
                      <span className="text-red-500 font-bold">×</span>
                      <span>{frase}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXPLICAR RISCO */}
        <TabsContent value="risco" className="mt-3 space-y-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                  {explicacaoRisco.titulo}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Como comunicar riscos de forma clara</p>
              </div>

              {/* Técnicas */}
              <div className="space-y-2">
                {explicacaoRisco.tecnicas.map((tecnica, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-xs font-semibold text-purple-900 mb-2">{tecnica.nome}</h4>
                    <div className="space-y-1.5">
                      <div className="bg-red-100 border border-red-200 px-2 py-1.5 rounded">
                        <p className="text-[9px] text-red-700 font-medium mb-0.5">❌ Evite:</p>
                        <p className="text-[10px] text-slate-700 italic">{tecnica.ruim}</p>
                      </div>
                      <div className="bg-green-100 border border-green-200 px-2 py-1.5 rounded">
                        <p className="text-[9px] text-green-700 font-medium mb-0.5">✓ Prefira:</p>
                        <p className="text-[10px] text-slate-700 italic">{tecnica.bom}</p>
                      </div>
                      <p className="text-[9px] text-slate-600 mt-1">
                        <strong>Por quê:</strong> {tecnica.porque}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Termo de Consentimento */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-800 mb-2">Dicas para Termo de Consentimento</h4>
                <ul className="space-y-1">
                  {explicacaoRisco.termo_consentimento.dicas.map((dica, idx) => (
                    <li key={idx} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{dica}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Frases Úteis */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-xs font-semibold text-green-800 mb-2">Frases Úteis</h4>
                <div className="space-y-1">
                  {explicacaoRisco.frases_uteis.map((frase, idx) => (
                    <div key={idx} className="text-[10px] text-slate-700 bg-white/60 px-2 py-1 rounded italic">
                      {frase}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUIDADOS PALIATIVOS */}
        <TabsContent value="paliativos" className="mt-3 space-y-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-600" />
                  {cuidadosPaliativos.titulo}
                </h3>
                <p className="text-[10px] text-slate-600 mt-1 italic">{cuidadosPaliativos.definicao}</p>
              </div>

              {/* Princípios */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-purple-800">Princípios Fundamentais</h4>
                {cuidadosPaliativos.principios.map((principio, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h5 className="text-xs font-semibold text-purple-900 mb-1">{principio.nome}</h5>
                    <p className="text-[10px] text-slate-600 mb-2">{principio.descricao}</p>
                    <ul className="space-y-1">
                      {principio.acoes.map((acao, i) => (
                        <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span>{acao}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Indicações */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-2">{cuidadosPaliativos.indicacoes.titulo}</h4>
                <ul className="space-y-1">
                  {cuidadosPaliativos.indicacoes.situacoes.map((sit, idx) => (
                    <li key={idx} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                      <span className="text-blue-600">•</span>
                      <span>{sit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Manejo de Sintomas */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-800">Manejo de Sintomas Comuns</h4>
                {cuidadosPaliativos.manejo_sintomas.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-semibold text-slate-800">{item.sintoma}</h5>
                      <Badge variant="outline" className="text-[9px]">Avaliar: {item.avaliar}</Badge>
                    </div>
                    <div className="space-y-1 mb-2">
                      {item.condutas.map((conduta, i) => (
                        <div key={i} className="text-[10px] text-slate-700 bg-white/60 px-2 py-1 rounded">
                          • {conduta}
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-500 italic border-t border-slate-200 pt-1">
                      <strong>Obs:</strong> {item.obs}
                    </p>
                  </div>
                ))}
              </div>

              {/* Comunicação Fim de Vida */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="text-xs font-semibold text-amber-900 mb-2">{cuidadosPaliativos.comunicacao_fim_vida.titulo}</h4>
                <p className="text-[10px] text-slate-600 mb-2">
                  <strong>Quando:</strong> {cuidadosPaliativos.comunicacao_fim_vida.quando}
                </p>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] text-amber-800 font-medium mb-1">Perguntas-Chave:</p>
                    {cuidadosPaliativos.comunicacao_fim_vida.perguntas_chave.map((perg, idx) => (
                      <div key={idx} className="text-[10px] text-slate-700 bg-white/60 px-2 py-1 rounded italic mb-1">
                        {perg}
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-[9px] text-amber-800 font-medium mb-1">Diretivas Antecipadas:</p>
                    <ul className="space-y-0.5">
                      {cuidadosPaliativos.comunicacao_fim_vida.diretivas_antecipadas.map((dir, idx) => (
                        <li key={idx} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                          <span className="text-amber-600">•</span>
                          <span>{dir}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[9px] text-green-700 font-medium mb-1">Frases Úteis:</p>
                    {cuidadosPaliativos.comunicacao_fim_vida.frases_uteis.map((frase, idx) => (
                      <div key={idx} className="text-[10px] text-slate-700 bg-green-100 px-2 py-1 rounded italic mb-1">
                        {frase}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sedação Paliativa */}
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-xs font-semibold text-red-900 mb-1">{cuidadosPaliativos.sedacao_paliativa.titulo}</h4>
                <p className="text-[10px] text-slate-600 mb-2 italic">{cuidadosPaliativos.sedacao_paliativa.definicao}</p>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] text-red-800 font-medium mb-1">Indicações:</p>
                    <ul className="space-y-0.5">
                      {cuidadosPaliativos.sedacao_paliativa.indicacoes.map((ind, idx) => (
                        <li key={idx} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                          <span className="text-red-600">•</span>
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[9px] text-red-800 font-medium mb-1">Medicamentos:</p>
                    {cuidadosPaliativos.sedacao_paliativa.medicamentos.map((med, idx) => (
                      <div key={idx} className="text-[10px] text-slate-700 bg-white/60 px-2 py-1 rounded mb-1">
                        • {med}
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-red-700 italic">
                    ⚠️ {cuidadosPaliativos.sedacao_paliativa.obs}
                  </p>
                </div>
              </div>

              {/* Suporte ao Luto */}
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="text-xs font-semibold text-indigo-900 mb-1">{cuidadosPaliativos.luto.titulo}</h4>
                <p className="text-[10px] text-slate-600 mb-2">
                  <strong>Fases do luto:</strong> {cuidadosPaliativos.luto.fases}
                </p>
                <p className="text-[9px] text-indigo-800 font-medium mb-1">Suporte à Família:</p>
                <ul className="space-y-1">
                  {cuidadosPaliativos.luto.suporte_familia.map((sup, idx) => (
                    <li key={idx} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>{sup}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Referências */}
              <div className="p-2 bg-slate-100 rounded border border-slate-200">
                <p className="text-[9px] text-slate-600 font-medium mb-1">Referências:</p>
                {cuidadosPaliativos.referencias.map((ref, idx) => (
                  <p key={idx} className="text-[8px] text-slate-500">• {ref}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCRIPTS PRONTOS */}
        <TabsContent value="scripts" className="mt-3 space-y-3">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Scripts e Frases Prontas
              </h3>

              {/* Início de Conversa */}
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="text-xs font-semibold text-indigo-900 mb-2">Iniciar Conversa Difícil</h4>
                <div className="space-y-1">
                  {scriptsProntos.inicio_conversa.map((frase, idx) => (
                    <div key={idx} className="text-[10px] text-slate-700 bg-white/60 px-2 py-1.5 rounded italic border border-indigo-100">
                      {frase}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pausas de Empatia */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-900 mb-2">Pausas e Empatia</h4>
                <div className="space-y-1">
                  {scriptsProntos.pausas_empatia.map((frase, idx) => (
                    <div key={idx} className="text-[10px] text-slate-700 bg-white/60 px-2 py-1.5 rounded italic border border-blue-100">
                      {frase}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quando Não Sabe */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="text-xs font-semibold text-amber-900 mb-2">Quando Não Sabe a Resposta</h4>
                <div className="space-y-1">
                  {scriptsProntos.nao_sabe_resposta.map((frase, idx) => (
                    <div key={idx} className="text-[10px] text-slate-700 bg-white/60 px-2 py-1.5 rounded italic border border-amber-100">
                      {frase}
                    </div>
                  ))}
                </div>
              </div>

              {/* Encerrar */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-xs font-semibold text-green-900 mb-2">Encerrar Conversa</h4>
                <div className="space-y-1">
                  {scriptsProntos.encerrar_conversa.map((frase, idx) => (
                    <div key={idx} className="text-[10px] text-slate-700 bg-white/60 px-2 py-1.5 rounded italic border border-green-100">
                      {frase}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
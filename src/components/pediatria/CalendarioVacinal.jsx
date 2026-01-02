import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Syringe,
  ChevronLeft,
  Info,
  AlertCircle,
  Calendar,
  Shield
} from 'lucide-react';
import DisclaimerFooter from '../compliance/DisclaimerFooter';

// Base de dados do calendário vacinal (PNI 2025 - Atualizado conforme Portaria MS)
const calendarioVacinal = {
  'ao-nascer': {
    titulo: 'Ao Nascer',
    idade: 'Até 30 dias de vida',
    vacinas: [
      {
        nome: 'BCG',
        doencas: ['Tuberculose (formas graves)', 'Hanseníase (efeito protetor)'],
        dose: '1 dose',
        via: 'Intradérmica (ID)',
        obs: 'Protege contra formas graves da tuberculose. Efeito protetor contra hanseníase.'
      },
      {
        nome: 'Hepatite B',
        doencas: ['Hepatite B'],
        dose: '1 dose',
        via: 'Intramuscular (IM)',
        obs: 'Dose ao nascer, preferencialmente nas primeiras 24 horas de vida.'
      }
    ]
  },
  '2-meses': {
    titulo: '2 Meses',
    idade: 'A partir de 2 meses de vida',
    vacinas: [
      {
        nome: 'Penta (DTP + Hib + HB)',
        doencas: ['Difteria', 'Tétano', 'Coqueluche', 'Haemophilus influenzae tipo b', 'Hepatite B'],
        dose: '1ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Vacina pentavalente: protege contra 5 doenças.'
      },
      {
        nome: 'Poliomielite inativada (VIP)',
        doencas: ['Poliomielite'],
        dose: '1ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Vacina inativada injetável.'
      },
      {
        nome: 'Pneumocócica 10-valente',
        doencas: ['Pneumonia', 'Meningite', 'Otite por pneumococo'],
        dose: '1ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Proteção contra doenças pneumocócicas.'
      },
      {
        nome: 'Rotavírus humano',
        doencas: ['Gastroenterite por rotavírus'],
        dose: '1ª dose',
        via: 'Oral (VO)',
        obs: 'Vacina oral contra diarreia grave.'
      }
    ]
  },
  '3-meses': {
    titulo: '3 Meses',
    idade: 'A partir de 3 meses de vida',
    vacinas: [
      {
        nome: 'Meningocócica C',
        doencas: ['Meningite e sepse por meningococo C'],
        dose: '1ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Proteção contra doença meningocócica C.'
      }
    ]
  },
  '4-meses': {
    titulo: '4 Meses',
    idade: 'A partir de 4 meses de vida',
    vacinas: [
      {
        nome: 'Penta (DTP + Hib + HB)',
        doencas: ['Difteria', 'Tétano', 'Coqueluche', 'Haemophilus influenzae tipo b', 'Hepatite B'],
        dose: '2ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Segunda dose da pentavalente.'
      },
      {
        nome: 'Poliomielite inativada (VIP)',
        doencas: ['Poliomielite'],
        dose: '2ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Continuação do esquema.'
      },
      {
        nome: 'Pneumocócica 10-valente',
        doencas: ['Pneumonia', 'Meningite', 'Otite por pneumococo'],
        dose: '2ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Segunda dose pneumocócica.'
      },
      {
        nome: 'Rotavírus humano',
        doencas: ['Gastroenterite por rotavírus'],
        dose: '2ª dose',
        via: 'Oral (VO)',
        obs: 'Última dose do esquema.'
      }
    ]
  },
  '5-meses': {
    titulo: '5 Meses',
    idade: 'A partir de 5 meses de vida',
    vacinas: [
      {
        nome: 'Meningocócica C',
        doencas: ['Meningite e sepse por meningococo C'],
        dose: '2ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Complementação do esquema básico.'
      }
    ]
  },
  '6-meses': {
    titulo: '6 Meses',
    idade: 'A partir de 6 meses de vida',
    vacinas: [
      {
        nome: 'Penta (DTP + Hib + HB)',
        doencas: ['Difteria', 'Tétano', 'Coqueluche', 'Haemophilus influenzae tipo b', 'Hepatite B'],
        dose: '3ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Última dose do esquema básico.'
      },
      {
        nome: 'Poliomielite inativada (VIP)',
        doencas: ['Poliomielite'],
        dose: '3ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Conclusão do esquema primário.'
      },
      {
        nome: 'Influenza',
        doencas: ['Influenza (gripe)'],
        dose: '1ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Primeira dose de influenza.'
      },
      {
        nome: 'Covid-19',
        doencas: ['Covid-19'],
        dose: '1ª dose',
        via: 'Intramuscular (IM)',
        obs: 'Início do esquema Covid-19.'
      }
    ]
  },
  '7-e-9-meses': {
    titulo: '7 e 9 Meses',
    idade: '7 e 9 meses de vida',
    vacinas: [
      {
        nome: 'Covid-19',
        doencas: ['Covid-19'],
        dose: '2ª e 3ª doses',
        via: 'Intramuscular (IM)',
        obs: 'Complementação do esquema vacinal Covid-19.'
      }
    ]
  },
  '9-meses': {
    titulo: '9 Meses',
    idade: 'A partir de 9 meses de vida',
    vacinas: [
      {
        nome: 'Febre Amarela',
        doencas: ['Febre Amarela'],
        dose: '1 dose',
        via: 'Subcutânea (SC)',
        obs: 'Dose inicial de febre amarela.'
      }
    ]
  },
  '12-meses': {
    titulo: '12 Meses',
    idade: 'A partir de 12 meses de vida',
    vacinas: [
      {
        nome: 'Pneumocócica 10-valente',
        doencas: ['Pneumonia', 'Meningite', 'Otite por pneumococo'],
        dose: 'Reforço',
        via: 'Intramuscular (IM)',
        obs: 'Dose de reforço.'
      },
      {
        nome: 'Meningocócica ACWY',
        doencas: ['Meningite por meningococos A, C, W, Y'],
        dose: '1 dose',
        via: 'Intramuscular (IM)',
        obs: 'Primeira dose da meningocócica ACWY.'
      },
      {
        nome: 'Tríplice viral (SCR)',
        doencas: ['Sarampo', 'Caxumba', 'Rubéola'],
        dose: '1 dose',
        via: 'Subcutânea (SC)',
        obs: 'Primeira dose da tríplice viral.'
      }
    ]
  },
  '15-meses': {
    titulo: '15 Meses',
    idade: 'A partir de 15 meses de vida',
    vacinas: [
      {
        nome: 'DTP',
        doencas: ['Difteria', 'Tétano', 'Coqueluche'],
        dose: 'Reforço',
        via: 'Intramuscular (IM)',
        obs: 'Dose de reforço da tríplice bacteriana.'
      },
      {
        nome: 'Poliomielite inativada (VIP)',
        doencas: ['Poliomielite'],
        dose: 'Reforço',
        via: 'Intramuscular (IM)',
        obs: 'Dose de reforço.'
      },
      {
        nome: 'Tetraviral (SCRV)',
        doencas: ['Sarampo', 'Caxumba', 'Rubéola', 'Varicela'],
        dose: '1 dose',
        via: 'Subcutânea (SC)',
        obs: 'Vacina quádrupla viral.'
      },
      {
        nome: 'Hepatite A',
        doencas: ['Hepatite A'],
        dose: '1 dose',
        via: 'Intramuscular (IM)',
        obs: 'Dose única de hepatite A.'
      }
    ]
  },
  '4-anos': {
    titulo: '4 Anos',
    idade: 'A partir de 4 anos de vida',
    vacinas: [
      {
        nome: 'DTP',
        doencas: ['Difteria', 'Tétano', 'Coqueluche'],
        dose: '2º reforço',
        via: 'Intramuscular (IM)',
        obs: 'Segundo reforço da tríplice bacteriana.'
      },
      {
        nome: 'Febre Amarela',
        doencas: ['Febre Amarela'],
        dose: 'Reforço',
        via: 'Subcutânea (SC)',
        obs: 'Dose de reforço.'
      },
      {
        nome: 'Varicela',
        doencas: ['Varicela (catapora)'],
        dose: '1 dose',
        via: 'Subcutânea (SC)',
        obs: 'Dose adicional de varicela, se aplicável.'
      }
    ]
  },
  'adolescentes-jovens': {
    titulo: 'Adolescentes e Jovens (10-24 anos)',
    idade: '10 a 24 anos, 11 meses e 29 dias',
    vacinas: [
      {
        nome: 'HPV4 (9-14 anos)',
        doencas: ['HPV', 'Câncer de colo de útero', 'Verrugas genitais'],
        dose: '1 dose (conforme histórico vacinal)',
        via: 'Intramuscular (IM)',
        obs: 'Indicada para meninos e meninas de 9 a 14 anos.'
      },
      {
        nome: 'Meningocócica ACWY (11-14 anos)',
        doencas: ['Meningite por meningococos A, C, W, Y'],
        dose: '1 dose',
        via: 'Intramuscular (IM)',
        obs: 'Reforço entre 11 e 14 anos.'
      },
      {
        nome: 'Hepatite B (10-24 anos)',
        doencas: ['Hepatite B'],
        dose: '3 doses (se esquema incompleto)',
        via: 'Intramuscular (IM)',
        obs: 'Completar esquema se incompleto.'
      },
      {
        nome: 'dT (10-24 anos)',
        doencas: ['Difteria', 'Tétano'],
        dose: '3 doses conforme histórico, com reforço periódico',
        via: 'Intramuscular (IM)',
        obs: 'Reforço a cada 10 anos.'
      },
      {
        nome: 'Febre Amarela (10-24 anos)',
        doencas: ['Febre Amarela'],
        dose: 'Conforme situação vacinal',
        via: 'Subcutânea (SC)',
        obs: 'Dose de reforço se aplicável.'
      },
      {
        nome: 'Tríplice viral (SCR) (10-24 anos)',
        doencas: ['Sarampo', 'Caxumba', 'Rubéola'],
        dose: '2 doses, conforme histórico',
        via: 'Subcutânea (SC)',
        obs: 'Verificar histórico vacinal.'
      },
      {
        nome: 'Pneumocócica 23-valente (situações especiais)',
        doencas: ['Pneumonia', 'Meningite por pneumococo'],
        dose: 'Conforme indicação',
        via: 'Intramuscular (IM)',
        obs: 'Somente população indígena sem esquema prévio.'
      },
      {
        nome: 'Varicela (situações especiais)',
        doencas: ['Varicela (catapora)'],
        dose: 'Conforme indicação',
        via: 'Subcutânea (SC)',
        obs: 'Indígenas e trabalhadores da saúde sem histórico vacinal ou da doença.'
      }
    ]
  },
};

// Fonte oficial
const fonteOficial = {
  titulo: 'Ministério da Saúde – Calendário Nacional de Vacinação',
  ano: '2025',
  documentos: [
    'Calendário Nacional de Vacinação – Criança (2025)',
    'Calendário Nacional de Vacinação – Adolescente e Jovem (2025)'
  ]
};

// Informações educacionais complementares
const infoComplementares = [
  {
    titulo: 'Diferença entre Esquema Básico e Reforço',
    conteudo: 'O esquema básico consiste nas primeiras doses que induzem a resposta imune inicial. Reforços são doses adicionais que amplificam e prolongam a proteção imunológica.'
  },
  {
    titulo: 'Calendário do PNI (Programa Nacional de Imunizações)',
    conteudo: 'As vacinas listadas fazem parte do calendário oficial do SUS, disponíveis gratuitamente em todas as UBS. A rede privada pode oferecer vacinas adicionais ou com composições diferentes.'
  },
  {
    titulo: 'Atraso Vacinal',
    conteudo: 'Nenhuma dose prévia deve ser desprezada. O esquema pode ser retomado de onde parou, respeitando os intervalos mínimos entre as doses. Não é necessário reiniciar o esquema.'
  },
  {
    titulo: 'Vacinas Especiais',
    conteudo: 'Existem vacinas disponíveis em Centros de Referência para Imunobiológicos Especiais (CRIE) para grupos específicos: imunodeprimidos, gestantes, pessoas com comorbidades.'
  },
  {
    titulo: 'Público-alvo',
    conteudo: 'Este calendário abrange: Crianças (0 a 9 anos, 11 meses e 29 dias), Adolescentes (10 a 19 anos, 11 meses e 29 dias), Jovens (20 a 24 anos, 11 meses e 29 dias).'
  }
];

export default function CalendarioVacinal() {
  const [faixaSelecionada, setFaixaSelecionada] = useState(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);

  // Detalhes de uma faixa etária
  if (faixaSelecionada) {
    const faixa = calendarioVacinal[faixaSelecionada];

    return (
      <div className="space-y-3">
        {/* Header com Voltar */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFaixaSelecionada(null)}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{faixa.titulo}</h3>
            <p className="text-[10px] text-slate-500">{faixa.idade}</p>
          </div>
        </div>

        {/* Vacinas */}
        <div className="space-y-2">
          {faixa.vacinas.map((vacina, idx) => (
            <Card key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-200">
              <CardContent className="p-3 space-y-2">
                {/* Nome e Dose */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{vacina.nome}</h4>
                    <Badge variant="secondary" className="text-[9px] mt-1 bg-purple-50 text-purple-700">
                      {vacina.dose}
                    </Badge>
                  </div>
                  <Syringe className="w-4 h-4 text-pink-500 flex-shrink-0" />
                </div>

                {/* Doenças Prevenidas */}
                <div>
                  <p className="text-[9px] font-semibold text-slate-600 mb-1">Previne:</p>
                  <div className="flex flex-wrap gap-1">
                    {vacina.doencas.map((doenca, i) => (
                      <Badge key={i} variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200">
                        {doenca}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Via */}
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-blue-600" />
                  <p className="text-[10px] text-slate-700">
                    <span className="font-semibold">Via:</span> {vacina.via}
                  </p>
                </div>

                {/* Observações */}
                {vacina.obs && (
                  <div className="p-2 bg-amber-50 rounded border border-amber-200">
                    <p className="text-[9px] font-semibold text-amber-800 mb-0.5 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Observações importantes:
                    </p>
                    <p className="text-[10px] text-amber-900">{vacina.obs}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Tela de informações complementares
  if (mostrarInfo) {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMostrarInfo(false)}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Informações Complementares</h3>
            <p className="text-[10px] text-slate-500">Conceitos importantes</p>
          </div>
        </div>

        {/* Cards Informativos */}
        <div className="space-y-2">
          {infoComplementares.map((info, idx) => (
            <Card key={idx} className="bg-white/80 backdrop-blur-sm border border-slate-200">
              <CardContent className="p-3">
                <h4 className="text-xs font-semibold text-slate-800 mb-1.5">{info.titulo}</h4>
                <p className="text-[10px] text-slate-700 leading-relaxed">{info.conteudo}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Tela inicial - Seleção de faixa etária
  return (
    <div className="space-y-4">
      {/* Título */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Calendário Vacinal Pediátrico (PNI 2025)</h3>
        <p className="text-[10px] text-slate-500">Atualizado com diretrizes 2025 - Selecione a faixa etária</p>
      </div>

      {/* Grid de Faixas Etárias */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(calendarioVacinal).map(([key, faixa]) => (
          <button
            key={key}
            onClick={() => setFaixaSelecionada(key)}
            className="group"
          >
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-pink-300 hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
                <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 block group-hover:text-pink-700">
                    {faixa.titulo}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    {faixa.vacinas.length} {faixa.vacinas.length === 1 ? 'vacina' : 'vacinas'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}

        {/* Botão Informações */}
        <button
          onClick={() => setMostrarInfo(true)}
          className="group"
        >
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Info className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                Informações
              </span>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Footer - Fonte Oficial */}
      <Card className="bg-slate-100 border-slate-300">
        <CardContent className="p-3">
          <p className="text-[9px] text-slate-700 text-center leading-relaxed">
            <strong>Fonte:</strong> {fonteOficial.titulo}
          </p>
          <p className="text-[9px] text-slate-600 text-center mt-1">
            Ano da última atualização: {fonteOficial.ano}
          </p>
          <p className="text-[9px] text-slate-600 text-center mt-1">
            Documentos de referência: {fonteOficial.documentos.join(' | ')}
          </p>
        </CardContent>
      </Card>

      <DisclaimerFooter />
    </div>
  );
}
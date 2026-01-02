import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Pill, 
  Droplet,
  Shield,
  Bug,
  ChevronLeft,
  Info,
  AlertTriangle,
  Search
} from 'lucide-react';
import DisclaimerFooter from '../compliance/DisclaimerFooter';

// Base de dados de antimicrobianos
const antimicrobianos = {
  antibioticos: {
    titulo: 'Antibióticos',
    icon: Pill,
    color: 'bg-blue-500',
    classes: [
      {
        nome: 'Penicilinas',
        drogas: [
          {
            nome: 'Penicilina G Cristalina',
            classe: 'Penicilina natural',
            espectro: 'Gram+ (estreptococos, meningococo sensível)',
            usos: ['Sífilis neurocardiovascular', 'Meningite meningocócica', 'Endocardite estreptocócica'],
            posologia: '2-4 milhões UI 4/4h EV',
            vias: ['EV'],
            ajustes: 'Reduzir dose em IRA grave',
            alertas: ['Reações de hipersensibilidade', 'Reação de Jarisch-Herxheimer em sífilis']
          },
          {
            nome: 'Ampicilina',
            classe: 'Aminopenicilina',
            espectro: 'Gram+ e alguns Gram- (H. influenzae, E. coli sensíveis)',
            usos: ['Meningite bacteriana', 'Endocardite por Enterococcus', 'Listeriose'],
            posologia: '1-2g 4/4h ou 6/6h EV',
            vias: ['EV', 'VO'],
            ajustes: 'Ajustar em disfunção renal',
            alertas: ['Rash não alérgico em mononucleose', 'Ampicilina + sulbactam amplia espectro']
          },
          {
            nome: 'Amoxicilina',
            classe: 'Aminopenicilina',
            espectro: 'Similar ampicilina, melhor absorção oral',
            usos: ['Infecções respiratórias', 'Otite', 'Sinusite', 'Profilaxia endocardite'],
            posologia: '500mg-1g 8/8h VO',
            vias: ['VO'],
            ajustes: 'Ajustar intervalo em IRA',
            alertas: ['Amoxicilina + clavulanato inibe beta-lactamases']
          },
          {
            nome: 'Oxacilina',
            classe: 'Penicilina resistente a penicilinase',
            espectro: 'Staphylococcus aureus oxacilina-sensível',
            usos: ['Infecções estafilocócicas graves', 'Endocardite', 'Osteomielite'],
            posologia: '1-2g 4/4h EV',
            vias: ['EV'],
            ajustes: 'Hepatotoxicidade em uso prolongado',
            alertas: ['Não cobre MRSA', 'Nefrite intersticial possível']
          },
          {
            nome: 'Piperacilina-Tazobactam',
            classe: 'Penicilina antipseudomonas + inibidor',
            espectro: 'Amplo: Gram+, Gram-, anaeróbios, Pseudomonas',
            usos: ['Sepse grave', 'Pneumonia nosocomial', 'Infecções intra-abdominais'],
            posologia: '4,5g 6/6h ou 8/8h EV',
            vias: ['EV'],
            ajustes: 'Reduzir em ClCr < 40',
            alertas: ['Droga de amplo espectro', 'Monitorar função renal']
          }
        ]
      },
      {
        nome: 'Cefalosporinas',
        drogas: [
          {
            nome: 'Cefalexina',
            classe: '1ª geração',
            espectro: 'Gram+ (S. aureus, estreptococos), E. coli',
            usos: ['Infecções de pele/partes moles', 'Profilaxia cirúrgica'],
            posologia: '500mg-1g 6/6h VO',
            vias: ['VO'],
            ajustes: 'Reduzir em IRA',
            alertas: ['Não cobre anaeróbios', 'Sem atividade para Pseudomonas']
          },
          {
            nome: 'Cefazolina',
            classe: '1ª geração',
            espectro: 'Similar cefalexina',
            usos: ['Profilaxia cirúrgica', 'Infecções de pele graves'],
            posologia: '1-2g 8/8h EV',
            vias: ['EV', 'IM'],
            ajustes: 'Ajustar em disfunção renal',
            alertas: ['Droga de escolha para profilaxia cirúrgica limpa']
          },
          {
            nome: 'Cefuroxima',
            classe: '2ª geração',
            espectro: 'Amplia para H. influenzae, Moraxella',
            usos: ['Pneumonia comunitária', 'Sinusite'],
            posologia: '750mg-1,5g 8/8h EV ou 500mg 12/12h VO',
            vias: ['EV', 'VO'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Boa penetração em SNC']
          },
          {
            nome: 'Ceftriaxona',
            classe: '3ª geração',
            espectro: 'Amplo Gram-, mantém Gram+, cruza barreira hematoencefálica',
            usos: ['Meningite', 'Gonorreia', 'Pneumonia grave', 'Sepse'],
            posologia: '1-2g 12/12h ou 24/24h EV',
            vias: ['EV', 'IM'],
            ajustes: 'Não ajustar em IRA isolada',
            alertas: ['Não usar com cálcio EV (precipitação)', 'Biliar excreção']
          },
          {
            nome: 'Ceftazidima',
            classe: '3ª geração antipseudomonas',
            espectro: 'Gram-, incluindo Pseudomonas',
            usos: ['Infecções por Pseudomonas', 'Neutropenia febril'],
            posologia: '1-2g 8/8h EV',
            vias: ['EV'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Menos ativo contra Gram+ que ceftriaxona']
          },
          {
            nome: 'Cefepima',
            classe: '4ª geração',
            espectro: 'Amplo: Gram+, Gram-, Pseudomonas',
            usos: ['Neutropenia febril', 'Pneumonia nosocomial', 'Sepse grave'],
            posologia: '1-2g 8/8h ou 12/12h EV',
            vias: ['EV'],
            ajustes: 'Reduzir em IRA',
            alertas: ['Neurotoxicidade em IRA', 'Amplo espectro']
          }
        ]
      },
      {
        nome: 'Carbapenêmicos',
        drogas: [
          {
            nome: 'Meropeném',
            classe: 'Carbapenêmico',
            espectro: 'Ultra amplo: Gram+, Gram-, anaeróbios, não cobre MRSA/Enterococcus faecium',
            usos: ['Sepse grave', 'Meningite bacteriana', 'Infecções por multirresistentes'],
            posologia: '1-2g 8/8h EV',
            vias: ['EV'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Reservar para casos graves', 'Menor risco convulsão que imipeném']
          },
          {
            nome: 'Imipeném-Cilastatina',
            classe: 'Carbapenêmico',
            espectro: 'Similar meropeném',
            usos: ['Infecções polimicrobianas', 'Sepse grave'],
            posologia: '500mg-1g 6/6h ou 8/8h EV',
            vias: ['EV'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Risco de convulsões (especialmente em IRA)', 'Cilastatina protege degradação renal']
          },
          {
            nome: 'Ertapeném',
            classe: 'Carbapenêmico',
            espectro: 'Não cobre Pseudomonas/Acinetobacter',
            usos: ['Infecções comunitárias complicadas', 'Uso ambulatorial EV'],
            posologia: '1g 24/24h EV/IM',
            vias: ['EV', 'IM'],
            ajustes: 'Ajustar em IRA grave',
            alertas: ['Dose única diária', 'Menos amplo que meropeném']
          }
        ]
      },
      {
        nome: 'Macrolídeos',
        drogas: [
          {
            nome: 'Azitromicina',
            classe: 'Macrolídeo',
            espectro: 'Gram+, atípicos (Mycoplasma, Chlamydia, Legionella)',
            usos: ['Pneumonia comunitária', 'Faringite', 'IST (Chlamydia)'],
            posologia: '500mg 24/24h VO (5 dias) ou 500mg EV',
            vias: ['VO', 'EV'],
            ajustes: 'Cautela em insuficiência hepática',
            alertas: ['Prolonga QT', 'Resistência crescente em pneumococo']
          },
          {
            nome: 'Claritromicina',
            classe: 'Macrolídeo',
            espectro: 'Similar azitromicina',
            usos: ['H. pylori', 'Micobactérias atípicas', 'Pneumonia'],
            posologia: '500mg 12/12h VO',
            vias: ['VO', 'EV'],
            ajustes: 'Reduzir em IRA grave',
            alertas: ['Interações medicamentosas (CYP3A4)', 'Sabor metálico']
          }
        ]
      },
      {
        nome: 'Quinolonas',
        drogas: [
          {
            nome: 'Ciprofloxacino',
            classe: 'Fluoroquinolona',
            espectro: 'Gram- (excelente), Pseudomonas, menos eficaz Gram+',
            usos: ['ITU complicada', 'Infecções por Pseudomonas', 'Diarreia bacteriana'],
            posologia: '400mg 12/12h EV ou 500mg 12/12h VO',
            vias: ['EV', 'VO'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Tendinopatia', 'Prolonga QT', 'Fototoxicidade']
          },
          {
            nome: 'Levofloxacino',
            classe: 'Fluoroquinolona respiratória',
            espectro: 'Gram+, Gram-, atípicos',
            usos: ['Pneumonia comunitária', 'ITU', 'Prostatite'],
            posologia: '500-750mg 24/24h EV/VO',
            vias: ['EV', 'VO'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Mesmos riscos ciprofloxacino', 'Melhor cobertura pneumococo']
          }
        ]
      },
      {
        nome: 'Glicopeptídeos',
        drogas: [
          {
            nome: 'Vancomicina',
            classe: 'Glicopeptídeo',
            espectro: 'Gram+ (incluindo MRSA, Enterococcus resistente)',
            usos: ['MRSA', 'Endocardite', 'Meningite', 'Colite por C. difficile (VO)'],
            posologia: '15-20mg/kg 8/12h EV (monitorar nível vale)',
            vias: ['EV', 'VO (colite)'],
            ajustes: 'Essencial monitorar função renal e nível',
            alertas: ['Nefrotoxicidade', 'Red man syndrome', 'Monitorar nível sérico']
          }
        ]
      },
      {
        nome: 'Aminoglicosídeos',
        drogas: [
          {
            nome: 'Gentamicina',
            classe: 'Aminoglicosídeo',
            espectro: 'Gram- (sinergia com beta-lactâmicos para Gram+)',
            usos: ['Sepse grave (terapia combinada)', 'Endocardite', 'Pielonefrite'],
            posologia: '5-7mg/kg 24/24h EV (dose única) ou 1-2mg/kg 8/8h',
            vias: ['EV', 'IM'],
            ajustes: 'Monitorar função renal e audição',
            alertas: ['Nefrotoxicidade', 'Ototoxicidade', 'Bloqueio neuromuscular']
          },
          {
            nome: 'Amicacina',
            classe: 'Aminoglicosídeo',
            espectro: 'Similar gentamicina, menos resistência',
            usos: ['Micobactérias', 'Gram- resistentes'],
            posologia: '15-20mg/kg 24/24h EV',
            vias: ['EV', 'IM'],
            ajustes: 'Monitorar função renal',
            alertas: ['Mesma toxicidade que gentamicina']
          }
        ]
      },
      {
        nome: 'Outros',
        drogas: [
          {
            nome: 'Metronidazol',
            classe: 'Nitroimidazol',
            espectro: 'Anaeróbios, protozoários',
            usos: ['Infecções intra-abdominais', 'Colite por C. difficile', 'Vaginose'],
            posologia: '500mg 8/8h EV/VO',
            vias: ['EV', 'VO', 'Tópico'],
            ajustes: 'Cautela em hepatopatia grave',
            alertas: ['Efeito dissulfiram (álcool)', 'Neuropatia periférica em uso prolongado']
          },
          {
            nome: 'Clindamicina',
            classe: 'Lincosamida',
            espectro: 'Gram+, anaeróbios',
            usos: ['Infecções de pele/partes moles', 'Pneumonia aspirativa', 'Toxoplasmose'],
            posologia: '600-900mg 8/8h EV ou 300-450mg 6/8h VO',
            vias: ['EV', 'VO', 'Tópico'],
            ajustes: 'Ajustar em hepatopatia',
            alertas: ['Colite pseudomembranosa', 'Bloqueio neuromuscular']
          },
          {
            nome: 'Sulfametoxazol-Trimetoprima',
            classe: 'Sulfa',
            espectro: 'Gram+, Gram-, Pneumocystis, Toxoplasma',
            usos: ['ITU', 'Pneumocystis', 'Nocardia', 'Toxoplasmose'],
            posologia: '800/160mg 12/12h VO ou 5-20mg/kg/dia (TMP) EV',
            vias: ['EV', 'VO'],
            ajustes: 'Evitar em IRA grave',
            alertas: ['Hipercalemia', 'Steven-Johnson', 'Cristalúria']
          },
          {
            nome: 'Linezolida',
            classe: 'Oxazolidinona',
            espectro: 'Gram+ (incluindo VRE, MRSA)',
            usos: ['MRSA', 'VRE', 'Pneumonia nosocomial'],
            posologia: '600mg 12/12h EV/VO',
            vias: ['EV', 'VO'],
            ajustes: 'Não necessário ajuste renal',
            alertas: ['Supressão medular', 'Neuropatia periférica', 'Síndrome serotonérgica']
          },
          {
            nome: 'Daptomicina',
            classe: 'Lipopeptídeo',
            espectro: 'Gram+ (MRSA, VRE, estafilococos)',
            usos: ['Bacteremia/endocardite por S. aureus', 'Infecções de pele complicadas'],
            posologia: '4-6mg/kg 24/24h EV (até 10mg/kg em bacteremia)',
            vias: ['EV'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Não usar em pneumonia (inativada por surfactante)', 'Rabdomiólise (monitorar CPK)']
          }
        ]
      }
    ]
  },
  antifungicos: {
    titulo: 'Antifúngicos',
    icon: Droplet,
    color: 'bg-purple-500',
    classes: [
      {
        nome: 'Azóis',
        drogas: [
          {
            nome: 'Fluconazol',
            classe: 'Triazol',
            espectro: 'Candida (exceto C. krusei/glabrata), Cryptococcus',
            usos: ['Candidíase', 'Criptococose', 'Profilaxia neutropenia'],
            posologia: '200-800mg 24/24h EV/VO (loading 2x)',
            vias: ['EV', 'VO'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Interação medicamentosa (CYP)', 'Hepatotoxicidade']
          },
          {
            nome: 'Voriconazol',
            classe: 'Triazol',
            espectro: 'Aspergillus, Candida, fungos filamentosos',
            usos: ['Aspergilose', 'Candidíase resistente', 'Fusariose'],
            posologia: '6mg/kg 12/12h x2 doses, depois 4mg/kg 12/12h EV ou 200mg 12/12h VO',
            vias: ['EV', 'VO'],
            ajustes: 'VO em IRA; evitar EV em IRA (ciclodextrina)',
            alertas: ['Hepatotoxicidade', 'Fotossensibilidade', 'Distúrbios visuais', 'Monitorar nível']
          },
          {
            nome: 'Itraconazol',
            classe: 'Triazol',
            espectro: 'Dermatófitos, histoplasmose, blastomicose',
            usos: ['Onicomicose', 'Histoplasmose', 'Paracoccidioidomicose'],
            posologia: '200mg 12/12h ou 24/24h VO',
            vias: ['VO'],
            ajustes: 'Evitar em ICC',
            alertas: ['ICC', 'Hepatotoxicidade', 'Interação medicamentosa']
          }
        ]
      },
      {
        nome: 'Equinocandinas',
        drogas: [
          {
            nome: 'Caspofungina',
            classe: 'Equinocandina',
            espectro: 'Candida (incluindo resistentes a azóis), Aspergillus',
            usos: ['Candidemia', 'Aspergilose refratária', 'Neutropenia febril'],
            posologia: '70mg no D1, depois 50mg 24/24h EV',
            vias: ['EV'],
            ajustes: 'Reduzir em hepatopatia moderada-grave',
            alertas: ['Bem tolerada', 'Hepatotoxicidade leve']
          },
          {
            nome: 'Micafungina',
            classe: 'Equinocandina',
            espectro: 'Similar caspofungina',
            usos: ['Candidemia', 'Profilaxia em TMO'],
            posologia: '100mg 24/24h EV',
            vias: ['EV'],
            ajustes: 'Não necessário ajuste',
            alertas: ['Hepatotoxicidade', 'Hemólise']
          }
        ]
      },
      {
        nome: 'Polienos',
        drogas: [
          {
            nome: 'Anfotericina B Desoxicolato',
            classe: 'Polieno',
            espectro: 'Amplo: leveduras, filamentosos, dimórficos',
            usos: ['Candidíase grave', 'Aspergilose', 'Criptococose', 'Leishmaniose'],
            posologia: '0,5-1,5mg/kg/dia EV (lento)',
            vias: ['EV'],
            ajustes: 'Nefrotoxicidade limita uso',
            alertas: ['Nefrotoxicidade', 'Hipocalemia/hipomagnesemia', 'Febre/calafrios', 'Pré-medicação']
          },
          {
            nome: 'Anfotericina B Lipossomal',
            classe: 'Polieno lipídico',
            espectro: 'Similar desoxicolato, menos tóxico',
            usos: ['Mesmos usos, preferir em IRA ou intolerância'],
            posologia: '3-5mg/kg/dia EV',
            vias: ['EV'],
            ajustes: 'Menor nefrotoxicidade',
            alertas: ['Alto custo', 'Menos tóxico que desoxicolato']
          }
        ]
      }
    ]
  },
  antivirais: {
    titulo: 'Antivirais',
    icon: Shield,
    color: 'bg-teal-500',
    classes: [
      {
        nome: 'Herpesvírus',
        drogas: [
          {
            nome: 'Aciclovir',
            classe: 'Análogo nucleosídeo',
            espectro: 'HSV-1, HSV-2, VZV',
            usos: ['Herpes simples', 'Herpes zoster', 'Encefalite herpética'],
            posologia: '5-10mg/kg 8/8h EV ou 400-800mg 5x/dia VO',
            vias: ['EV', 'VO', 'Tópico'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Nefrotoxicidade (cristalização)', 'Hidratação adequada', 'Neurotoxicidade']
          },
          {
            nome: 'Valaciclovir',
            classe: 'Pró-droga aciclovir',
            espectro: 'HSV, VZV',
            usos: ['Herpes simples', 'Zoster', 'Supressão HSV'],
            posologia: '500-1000mg 2-3x/dia VO',
            vias: ['VO'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Melhor biodisponibilidade que aciclovir VO']
          },
          {
            nome: 'Ganciclovir',
            classe: 'Análogo nucleosídeo',
            espectro: 'CMV',
            usos: ['Retinite por CMV', 'Doença invasiva por CMV'],
            posologia: '5mg/kg 12/12h EV (indução), depois 5mg/kg/dia',
            vias: ['EV', 'VO (valganciclovir)'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Mielossupressão', 'Teratogênico', 'Hemograma seriado']
          }
        ]
      },
      {
        nome: 'Influenza',
        drogas: [
          {
            nome: 'Oseltamivir',
            classe: 'Inibidor neuraminidase',
            espectro: 'Influenza A e B',
            usos: ['Influenza em < 48h sintomas', 'Casos graves', 'Profilaxia'],
            posologia: '75mg 12/12h VO por 5 dias',
            vias: ['VO'],
            ajustes: 'Ajustar em IRA',
            alertas: ['Iniciar precoce (< 48h)', 'Casos graves: tratar independente do tempo']
          },
          {
            nome: 'Zanamivir',
            classe: 'Inibidor neuraminidase',
            espectro: 'Influenza A e B',
            usos: ['Alternativa oseltamivir'],
            posologia: '10mg (2 inalações) 12/12h por 5 dias',
            vias: ['Inalatória'],
            ajustes: 'Não necessário',
            alertas: ['Broncoespasmo em asmáticos/DPOC']
          }
        ]
      },
      {
        nome: 'HIV (educacional)',
        drogas: [
          {
            nome: 'Tenofovir/Entricitabina',
            classe: 'ITRN',
            espectro: 'HIV',
            usos: ['Terapia combinada HIV', 'PrEP', 'PEP'],
            posologia: '300/200mg 24/24h VO (esquema completo requer 3ª droga)',
            vias: ['VO'],
            ajustes: 'Ajustar tenofovir em IRA',
            alertas: ['Nefrotoxicidade', 'Usar em esquema triplo', 'Não monoterapia']
          },
          {
            nome: 'Dolutegravir',
            classe: 'Inibidor integrase',
            espectro: 'HIV',
            usos: ['Terapia combinada HIV'],
            posologia: '50mg 24/24h VO',
            vias: ['VO'],
            ajustes: 'Não necessário ajuste renal',
            alertas: ['Alta barreira resistência', 'Bem tolerado']
          }
        ]
      },
      {
        nome: 'COVID-19 (educacional)',
        drogas: [
          {
            nome: 'Remdesivir',
            classe: 'Análogo nucleotídeo',
            espectro: 'SARS-CoV-2',
            usos: ['COVID-19 hospitalar com O2'],
            posologia: '200mg D1, depois 100mg/dia EV por 5-10 dias',
            vias: ['EV'],
            ajustes: 'Evitar se ClCr < 30',
            alertas: ['Hepatotoxicidade', 'Bradicardia', 'Uso limitado a casos específicos']
          },
          {
            nome: 'Nirmatrelvir-Ritonavir (Paxlovid)',
            classe: 'Inibidor protease',
            espectro: 'SARS-CoV-2',
            usos: ['COVID-19 leve-moderado, alto risco, < 5 dias sintomas'],
            posologia: '300/100mg 12/12h VO por 5 dias',
            vias: ['VO'],
            ajustes: 'Ajustar em IRA moderada-grave',
            alertas: ['Interações medicamentosas extensas', 'Rebound possível']
          }
        ]
      }
    ]
  },
  antiparasitarios: {
    titulo: 'Antiparasitários',
    icon: Bug,
    color: 'bg-green-600',
    classes: [
      {
        nome: 'Antiprotozoários',
        drogas: [
          {
            nome: 'Metronidazol',
            classe: 'Nitroimidazol',
            espectro: 'Giardia, Entamoeba, Trichomonas',
            usos: ['Giardíase', 'Amebíase', 'Tricomoníase'],
            posologia: '250-500mg 8/8h VO ou 500mg 8/8h EV',
            vias: ['VO', 'EV'],
            ajustes: 'Cautela em hepatopatia',
            alertas: ['Efeito dissulfiram', 'Neuropatia periférica']
          },
          {
            nome: 'Benznidazol',
            classe: 'Nitroimidazol',
            espectro: 'Trypanosoma cruzi',
            usos: ['Doença de Chagas (fase aguda)'],
            posologia: '5-7mg/kg/dia VO dividido 12/12h por 60 dias',
            vias: ['VO'],
            ajustes: 'Uso especializado',
            alertas: ['Reações cutâneas', 'Neuropatia periférica', 'Depressão medular']
          }
        ]
      },
      {
        nome: 'Anti-helmínticos',
        drogas: [
          {
            nome: 'Albendazol',
            classe: 'Benzimidazol',
            espectro: 'Amplo: Ascaris, Ancylostoma, Strongyloides, Enterobius, Taenia',
            usos: ['Parasitoses intestinais', 'Neurocisticercose', 'Hidatidose'],
            posologia: '400mg dose única VO (parasitoses) ou 15mg/kg/dia dividido (neurocisticercose)',
            vias: ['VO'],
            ajustes: 'Uso com cautela em hepatopatia',
            alertas: ['Hepatotoxicidade', 'Agranulocitose (raro)', 'Corticoide em neurocisticercose']
          },
          {
            nome: 'Mebendazol',
            classe: 'Benzimidazol',
            espectro: 'Parasitoses intestinais comuns',
            usos: ['Ascaridíase', 'Oxiuríase', 'Ancilostomíase'],
            posologia: '100mg 12/12h VO por 3 dias ou 500mg dose única',
            vias: ['VO'],
            ajustes: 'Não necessário',
            alertas: ['Dor abdominal', 'Diarreia transitória']
          },
          {
            nome: 'Ivermectina',
            classe: 'Avermectina',
            espectro: 'Strongyloides, Onchocerca, Sarcoptes (escabiose)',
            usos: ['Estrongiloidíase', 'Escabiose', 'Pediculose'],
            posologia: '200mcg/kg dose única VO (repetir em 7-14 dias)',
            vias: ['VO', 'Tópico'],
            ajustes: 'Não necessário',
            alertas: ['Reação Mazzotti (oncocercose)', 'Neurotoxicidade (altas doses)']
          },
          {
            nome: 'Praziquantel',
            classe: 'Pirazinoisoquinolina',
            espectro: 'Schistosoma, Taenia, cisticercose',
            usos: ['Esquistossomose', 'Teníase', 'Neurocisticercose'],
            posologia: '40-60mg/kg/dia VO dividido (varia por parasita)',
            vias: ['VO'],
            ajustes: 'Cautela em hepatopatia',
            alertas: ['Náusea', 'Tontura', 'Corticoide em neurocisticercose ativa']
          }
        ]
      }
    ]
  }
};

export default function GuiaAntimicrobiano() {
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Função para filtrar drogas por busca
  const filtrarDrogas = (drogas) => {
    if (!searchTerm) return drogas;
    return drogas.filter(droga => 
      droga.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      droga.espectro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      droga.usos.some(uso => uso.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Tela de detalhes de uma categoria
  if (categoriaAtiva) {
    const categoria = antimicrobianos[categoriaAtiva];
    const Icon = categoria.icon;

    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategoriaAtiva(null);
              setSearchTerm('');
            }}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className={`w-8 h-8 rounded-lg ${categoria.color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{categoria.titulo}</h3>
            <p className="text-[10px] text-slate-500">Posologias de referência educacional</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar medicamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm bg-white border-slate-200"
          />
        </div>

        {/* Classes */}
        <div className="space-y-4">
          {categoria.classes.map((classe, idx) => {
            const drogasFiltradas = filtrarDrogas(classe.drogas);
            if (drogasFiltradas.length === 0) return null;

            return (
              <div key={idx}>
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <div className="w-1 h-4 bg-slate-400 rounded-full" />
                  {classe.nome}
                </h4>
                <div className="space-y-2">
                  {drogasFiltradas.map((droga, dIdx) => (
                    <Card key={dIdx} className="bg-white/80 backdrop-blur-sm border border-slate-200">
                      <CardContent className="p-3 space-y-2">
                        {/* Nome e Classe */}
                        <div>
                          <h5 className="text-sm font-semibold text-slate-800">{droga.nome}</h5>
                          <Badge variant="outline" className="text-[9px] mt-1">
                            {droga.classe}
                          </Badge>
                        </div>

                        {/* Espectro */}
                        <div>
                          <p className="text-[9px] font-semibold text-slate-600 mb-0.5">Espectro:</p>
                          <p className="text-[10px] text-slate-700">{droga.espectro}</p>
                        </div>

                        {/* Usos Clínicos */}
                        <div>
                          <p className="text-[9px] font-semibold text-slate-600 mb-1">Usos clínicos comuns:</p>
                          <div className="flex flex-wrap gap-1">
                            {droga.usos.map((uso, i) => (
                              <Badge key={i} variant="secondary" className="text-[9px] bg-blue-50 text-blue-700">
                                {uso}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Posologia */}
                        <div className="p-2 bg-purple-50 rounded border border-purple-200">
                          <p className="text-[9px] font-semibold text-purple-800 mb-0.5">Posologia de referência:</p>
                          <p className="text-[10px] text-purple-900 font-medium">{droga.posologia}</p>
                          <p className="text-[9px] text-purple-700 mt-0.5">Vias: {droga.vias.join(', ')}</p>
                        </div>

                        {/* Ajustes */}
                        <div>
                          <p className="text-[9px] font-semibold text-slate-600 mb-0.5">Ajustes importantes:</p>
                          <p className="text-[10px] text-slate-700">{droga.ajustes}</p>
                        </div>

                        {/* Alertas */}
                        {droga.alertas && droga.alertas.length > 0 && (
                          <div className="p-2 bg-amber-50 rounded border border-amber-200">
                            <p className="text-[9px] font-semibold text-amber-800 mb-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Alertas de segurança:
                            </p>
                            <ul className="space-y-0.5">
                              {droga.alertas.map((alerta, i) => (
                                <li key={i} className="text-[10px] text-amber-900 flex items-start gap-1">
                                  <span className="text-amber-600">•</span>
                                  <span>{alerta}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Tela inicial - seleção de categoria
  return (
    <div className="space-y-4">
      {/* Título */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Guia Antimicrobiano</h3>
        <p className="text-[10px] text-slate-500">Selecione a categoria para consulta rápida</p>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(antimicrobianos).map(([key, categoria]) => {
          const Icon = categoria.icon;
          return (
            <button
              key={key}
              onClick={() => setCategoriaAtiva(key)}
              className="group"
            >
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
                  <div className={`w-12 h-12 rounded-xl ${categoria.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900">
                    {categoria.titulo}
                  </span>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <DisclaimerFooter variant="medicamento" />
    </div>
  );
}
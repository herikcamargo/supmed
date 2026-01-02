import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Syringe,
  ChevronLeft,
  Info,
  AlertCircle,
  Calendar,
  Shield,
  Baby,
  Users,
  Heart,
  Briefcase,
  Plane,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import DisclaimerFooter from '../compliance/DisclaimerFooter';

// Base de dados completa - PNI 2025 (Atualizado conforme MS)
const calendarioPorGrupo = {
  criancas: {
    nome: 'Pediatria – Criança',
    descricao: '0 a 9 anos, 11 meses e 29 dias',
    icon: Baby,
    color: 'bg-pink-500',
    faixas: {
      'ao-nascer': {
        titulo: 'Ao Nascer',
        idade: 'Nascimento',
        vacinas: [
          {
            nome: 'BCG',
            tipo: 'Bactéria viva atenuada',
            doencas: ['Formas graves da tuberculose', 'Efeito protetor contra hanseníase'],
            esquema: '1 dose',
            via: 'Intradérmica (ID)',
            composicao: 'Mycobacterium bovis atenuado',
            contraindicacoes: ['Imunodeprimidos', 'Lesões de pele no local', 'RN < 2kg'],
            obs: 'Protege contra formas graves da tuberculose. Efeito protetor contra hanseníase.'
          },
          {
            nome: 'Hepatite B',
            tipo: 'Recombinante',
            doencas: ['Hepatite B'],
            esquema: '1 dose',
            via: 'Intramuscular (IM)',
            composicao: 'HBsAg recombinante',
            contraindicacoes: ['Alergia grave a componentes'],
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
            tipo: 'Combinada',
            doencas: ['Difteria', 'Tétano', 'Coqueluche', 'Haemophilus influenzae tipo b', 'Hepatite B'],
            esquema: '1ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Toxoides tetânico e diftérico + B. pertussis inativada + polissacarídeo Hib conjugado + HBsAg',
            contraindicacoes: ['Encefalopatia 7 dias após dose prévia', 'Alergia grave'],
            obs: 'Vacina pentavalente: protege contra 5 doenças.'
          },
          {
            nome: 'Poliomielite inativada (VIP)',
            tipo: 'Vírus inativados',
            doencas: ['Poliomielite'],
            esquema: '1ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Poliovírus tipos 1, 2 e 3 inativados',
            contraindicacoes: ['Alergia a componentes'],
            obs: 'Vacina inativada injetável.'
          },
          {
            nome: 'Pneumocócica 10-valente',
            tipo: 'Conjugada',
            doencas: ['Pneumonia', 'Meningite', 'Otite por pneumococo'],
            esquema: '1ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Polissacarídeos capsulares de 10 sorotipos conjugados',
            contraindicacoes: ['Alergia grave a componentes'],
            obs: 'Proteção contra doenças pneumocócicas.'
          },
          {
            nome: 'Rotavírus humano',
            tipo: 'Vírus vivo atenuado',
            doencas: ['Gastroenterite por rotavírus'],
            esquema: '1ª dose',
            via: 'Oral (VO)',
            composicao: 'Rotavírus humano atenuado',
            contraindicacoes: ['Imunodeficiência', 'Invaginação intestinal prévia', 'Malformação GI'],
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
            tipo: 'Conjugada',
            doencas: ['Meningite e sepse por meningococo C'],
            esquema: '1ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Polissacarídeo capsular meningococo C conjugado',
            contraindicacoes: ['Alergia grave a componentes'],
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
            tipo: 'Combinada',
            doencas: ['Difteria', 'Tétano', 'Coqueluche', 'Haemophilus influenzae tipo b', 'Hepatite B'],
            esquema: '2ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Toxoides + pertussis + Hib + HBsAg',
            contraindicacoes: ['Encefalopatia pós-dose prévia'],
            obs: 'Segunda dose da pentavalente.'
          },
          {
            nome: 'Poliomielite inativada (VIP)',
            tipo: 'Vírus inativados',
            doencas: ['Poliomielite'],
            esquema: '2ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Poliovírus inativados',
            contraindicacoes: ['Alergia a componentes'],
            obs: 'Continuação do esquema.'
          },
          {
            nome: 'Pneumocócica 10-valente',
            tipo: 'Conjugada',
            doencas: ['Pneumonia', 'Meningite', 'Otite por pneumococo'],
            esquema: '2ª dose',
            via: 'Intramuscular (IM)',
            composicao: '10 sorotipos conjugados',
            contraindicacoes: ['Alergia'],
            obs: 'Segunda dose pneumocócica.'
          },
          {
            nome: 'Rotavírus humano',
            tipo: 'Vírus vivo atenuado',
            doencas: ['Gastroenterite por rotavírus'],
            esquema: '2ª dose',
            via: 'Oral (VO)',
            composicao: 'Rotavírus atenuado',
            contraindicacoes: ['Imunodeficiência', 'Invaginação prévia'],
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
            tipo: 'Conjugada',
            doencas: ['Meningite e sepse por meningococo C'],
            esquema: '2ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Polissacarídeo C conjugado',
            contraindicacoes: ['Alergia'],
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
            tipo: 'Combinada',
            doencas: ['Difteria', 'Tétano', 'Coqueluche', 'Haemophilus influenzae tipo b', 'Hepatite B'],
            esquema: '3ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Toxoides + pertussis + Hib + HBsAg',
            contraindicacoes: ['Encefalopatia'],
            obs: 'Última dose do esquema básico.'
          },
          {
            nome: 'Poliomielite inativada (VIP)',
            tipo: 'Vírus inativados',
            doencas: ['Poliomielite'],
            esquema: '3ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Poliovírus inativados',
            contraindicacoes: ['Alergia'],
            obs: 'Conclusão do esquema primário.'
          },
          {
            nome: 'Influenza',
            tipo: 'Vírus inativados',
            doencas: ['Influenza (gripe)'],
            esquema: '1ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Vírus influenza inativados',
            contraindicacoes: ['Alergia grave'],
            obs: 'Primeira dose de influenza.'
          },
          {
            nome: 'Covid-19',
            tipo: 'mRNA ou vetor viral',
            doencas: ['Covid-19'],
            esquema: '1ª dose',
            via: 'Intramuscular (IM)',
            composicao: 'Variável (mRNA, vetor viral, proteína)',
            contraindicacoes: ['Alergia a componentes'],
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
            tipo: 'mRNA ou vetor viral',
            doencas: ['Covid-19'],
            esquema: '2ª e 3ª doses',
            via: 'Intramuscular (IM)',
            composicao: 'Variável',
            contraindicacoes: ['Alergia a componentes'],
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
            tipo: 'Vírus vivo atenuado',
            doencas: ['Febre Amarela'],
            esquema: '1 dose',
            via: 'Subcutânea (SC)',
            composicao: 'Vírus amarílico atenuado (cepa 17DD)',
            contraindicacoes: ['Imunodeprimidos', 'Gestantes', 'Alergia a ovo'],
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
            tipo: 'Conjugada',
            doencas: ['Pneumonia', 'Meningite', 'Otite por pneumococo'],
            esquema: 'Reforço',
            via: 'Intramuscular (IM)',
            composicao: '10 sorotipos conjugados',
            contraindicacoes: ['Alergia'],
            obs: 'Dose de reforço.'
          },
          {
            nome: 'Meningocócica ACWY',
            tipo: 'Conjugada',
            doencas: ['Meningite por meningococos A, C, W, Y'],
            esquema: '1 dose',
            via: 'Intramuscular (IM)',
            composicao: 'Polissacarídeos A, C, W-135, Y conjugados',
            contraindicacoes: ['Alergia'],
            obs: 'Primeira dose da meningocócica ACWY.'
          },
          {
            nome: 'Tríplice viral (SCR)',
            tipo: 'Vírus vivos atenuados',
            doencas: ['Sarampo', 'Caxumba', 'Rubéola'],
            esquema: '1 dose',
            via: 'Subcutânea (SC)',
            composicao: 'Vírus sarampo, caxumba e rubéola atenuados',
            contraindicacoes: ['Gestação', 'Imunodepressão grave'],
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
            tipo: 'Toxoides + bactéria inativada',
            doencas: ['Difteria', 'Tétano', 'Coqueluche'],
            esquema: 'Reforço',
            via: 'Intramuscular (IM)',
            composicao: 'Toxoides diftérico e tetânico + B. pertussis inativada',
            contraindicacoes: ['Encefalopatia 7d pós-dose'],
            obs: 'Dose de reforço da tríplice bacteriana.'
          },
          {
            nome: 'Poliomielite inativada (VIP)',
            tipo: 'Vírus inativados',
            doencas: ['Poliomielite'],
            esquema: 'Reforço',
            via: 'Intramuscular (IM)',
            composicao: 'Poliovírus tipos 1, 2 e 3 inativados',
            contraindicacoes: ['Alergia a componentes'],
            obs: 'Dose de reforço.'
          },
          {
            nome: 'Tetraviral (SCRV)',
            tipo: 'Vírus vivos atenuados',
            doencas: ['Sarampo', 'Caxumba', 'Rubéola', 'Varicela'],
            esquema: '1 dose',
            via: 'Subcutânea (SC)',
            composicao: 'Vírus sarampo, caxumba, rubéola e varicela atenuados',
            contraindicacoes: ['Gestação', 'Imunodepressão'],
            obs: 'Vacina quádrupla viral.'
          },
          {
            nome: 'Hepatite A',
            tipo: 'Vírus inativado',
            doencas: ['Hepatite A'],
            esquema: '1 dose',
            via: 'Intramuscular (IM)',
            composicao: 'Vírus hepatite A inativado',
            contraindicacoes: ['Alergia grave'],
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
            tipo: 'Toxoides + bactéria inativada',
            doencas: ['Difteria', 'Tétano', 'Coqueluche'],
            esquema: '2º reforço',
            via: 'Intramuscular (IM)',
            composicao: 'Toxoides + B. pertussis',
            contraindicacoes: ['Encefalopatia'],
            obs: 'Segundo reforço da tríplice bacteriana.'
          },
          {
            nome: 'Febre Amarela',
            tipo: 'Vírus vivo atenuado',
            doencas: ['Febre Amarela'],
            esquema: 'Reforço',
            via: 'Subcutânea (SC)',
            composicao: 'Vírus amarílico atenuado',
            contraindicacoes: ['Imunodepressão', 'Alergia a ovo'],
            obs: 'Dose de reforço.'
          },
          {
            nome: 'Varicela',
            tipo: 'Vírus vivo atenuado',
            doencas: ['Varicela (catapora)'],
            esquema: '1 dose',
            via: 'Subcutânea (SC)',
            composicao: 'Vírus varicela-zoster atenuado',
            contraindicacoes: ['Gestação', 'Imunodepressão'],
            obs: 'Dose adicional de varicela, se aplicável.'
          }
        ]
      }
    }
  },
  adolescentes: {
    nome: 'Pediatria – Adolescente',
    descricao: '10 a 19 anos, 11 meses e 29 dias',
    icon: Users,
    color: 'bg-blue-500',
    vacinas: [
      {
        nome: 'HPV4 (9 a 14 anos)',
        tipo: 'Recombinante',
        doencas: ['HPV', 'Câncer de colo de útero', 'Verrugas genitais'],
        esquema: '1 dose (conforme histórico vacinal)',
        via: 'Intramuscular (IM)',
        composicao: 'Proteínas L1 dos HPV 6, 11, 16, 18',
        contraindicacoes: ['Alergia grave', 'Gestação'],
        precaucoes: ['Imunodeprimidos: esquema especial'],
        obs: 'Indicada para meninos e meninas de 9 a 14 anos.'
      },
      {
        nome: 'Meningocócica ACWY (11 a 14 anos)',
        tipo: 'Conjugada',
        doencas: ['Meningite por meningococos A, C, W, Y'],
        esquema: '1 dose',
        via: 'Intramuscular (IM)',
        composicao: 'Polissacarídeos A, C, W-135, Y conjugados',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Reforço entre 11 e 14 anos.'
      },
      {
        nome: 'Hepatite B (10 a 24 anos)',
        tipo: 'Recombinante',
        doencas: ['Hepatite B'],
        esquema: '3 doses (se esquema incompleto)',
        via: 'Intramuscular (IM)',
        composicao: 'HBsAg recombinante',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Completar esquema se incompleto.'
      },
      {
        nome: 'dT (10 a 24 anos)',
        tipo: 'Toxoides',
        doencas: ['Difteria', 'Tétano'],
        esquema: '3 doses conforme histórico, com reforço periódico',
        via: 'Intramuscular (IM)',
        composicao: 'Toxoides diftérico e tetânico',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Reforço a cada 10 anos.'
      },
      {
        nome: 'Febre Amarela (10 a 24 anos)',
        tipo: 'Vírus vivo atenuado',
        doencas: ['Febre Amarela'],
        esquema: 'Conforme situação vacinal',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus amarílico atenuado',
        contraindicacoes: ['Imunodepressão', 'Alergia a ovo', 'Gestação'],
        precaucoes: [],
        obs: 'Dose de reforço se aplicável.'
      },
      {
        nome: 'Tríplice viral (SCR) (10 a 24 anos)',
        tipo: 'Vírus vivos atenuados',
        doencas: ['Sarampo', 'Caxumba', 'Rubéola'],
        esquema: '2 doses, conforme histórico',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus atenuados',
        contraindicacoes: ['Gestação', 'Imunodepressão'],
        precaucoes: [],
        obs: 'Verificar histórico vacinal.'
      },
      {
        nome: 'Pneumocócica 23-valente (situações especiais)',
        tipo: 'Polissacarídica',
        doencas: ['Pneumonia', 'Meningite por pneumococo'],
        esquema: 'Conforme indicação',
        via: 'Intramuscular (IM)',
        composicao: '23 sorotipos polissacarídicos',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Somente população indígena sem esquema prévio.'
      },
      {
        nome: 'Varicela (situações especiais)',
        tipo: 'Vírus vivo atenuado',
        doencas: ['Varicela (catapora)'],
        esquema: 'Conforme indicação',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus varicela-zoster atenuado',
        contraindicacoes: ['Gestação', 'Imunodepressão'],
        precaucoes: [],
        obs: 'Indígenas e trabalhadores da saúde sem histórico vacinal ou da doença.'
      }
    ]
  },
  adultos: {
    nome: 'Adultos',
    descricao: '25 a 59 anos',
    icon: Users,
    color: 'bg-green-500',
    vacinas: [
      {
        nome: 'Hepatite B',
        tipo: 'Recombinante',
        doencas: ['Hepatite B'],
        esquema: '3 doses (se esquema incompleto ou não vacinado)',
        via: 'Intramuscular (IM)',
        composicao: 'HBsAg recombinante',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Completar esquema vacinal.'
      },
      {
        nome: 'dT',
        tipo: 'Toxoides',
        doencas: ['Difteria', 'Tétano'],
        esquema: 'Reforços periódicos',
        via: 'Intramuscular (IM)',
        composicao: 'Toxoides diftérico e tetânico',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Manter reforços a cada 10 anos.'
      },
      {
        nome: 'Febre Amarela',
        tipo: 'Vírus vivo atenuado',
        doencas: ['Febre Amarela'],
        esquema: 'Conforme situação vacinal',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus atenuado',
        contraindicacoes: ['Imunodepressão', 'Gestação'],
        precaucoes: [],
        obs: 'Dose de reforço se aplicável.'
      },
      {
        nome: 'Tríplice viral (SCR)',
        tipo: 'Vírus vivos atenuados',
        doencas: ['Sarampo', 'Caxumba', 'Rubéola'],
        esquema: 'Conforme histórico vacinal',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus atenuados',
        contraindicacoes: ['Gestação', 'Imunodepressão'],
        precaucoes: [],
        obs: 'Verificar histórico vacinal completo.'
      }
    ]
  },
  idosos: {
    nome: 'Idosos',
    descricao: '≥ 60 anos',
    icon: Heart,
    color: 'bg-purple-500',
    vacinas: [
      {
        nome: 'Hepatite B',
        tipo: 'Recombinante',
        doencas: ['Hepatite B'],
        esquema: 'Conforme histórico vacinal',
        via: 'Intramuscular (IM)',
        composicao: 'HBsAg recombinante',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Verificar e completar esquema se necessário.'
      },
      {
        nome: 'dT',
        tipo: 'Toxoides',
        doencas: ['Difteria', 'Tétano'],
        esquema: 'Reforço a cada 10 anos',
        via: 'Intramuscular (IM)',
        composicao: 'Toxoides diftérico e tetânico',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Manter reforços por toda a vida.'
      },
      {
        nome: 'Febre Amarela (situações excepcionais)',
        tipo: 'Vírus vivo atenuado',
        doencas: ['Febre Amarela'],
        esquema: 'Conforme avaliação risco-benefício',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus atenuado',
        contraindicacoes: ['Imunodepressão', 'Alergia a ovo'],
        precaucoes: ['Primeira dose ≥ 60 anos: avaliar risco-benefício'],
        obs: 'Apenas em situações excepcionais com avaliação médica.'
      },
      {
        nome: 'Tríplice viral (trabalhadores da saúde)',
        tipo: 'Vírus vivos atenuados',
        doencas: ['Sarampo', 'Caxumba', 'Rubéola'],
        esquema: 'Conforme histórico',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus atenuados',
        contraindicacoes: ['Imunodepressão grave'],
        precaucoes: [],
        obs: 'Indicada para trabalhadores da saúde.'
      },
      {
        nome: 'Pneumocócica 23-valente',
        tipo: 'Polissacarídica',
        doencas: ['Pneumonia', 'Meningite por pneumococo'],
        esquema: 'Conforme indicação',
        via: 'Intramuscular (IM)',
        composicao: '23 sorotipos polissacarídicos',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Idosos institucionalizados/acamados e povos indígenas.'
      },
      {
        nome: 'Varicela (grupos específicos)',
        tipo: 'Vírus vivo atenuado',
        doencas: ['Varicela (catapora)'],
        esquema: 'Conforme indicação',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus varicela-zoster atenuado',
        contraindicacoes: ['Imunodepressão grave'],
        precaucoes: [],
        obs: 'Somente para grupos específicos sem histórico de doença ou vacinação.'
      },
      {
        nome: 'Influenza',
        tipo: 'Vírus inativados',
        doencas: ['Influenza (gripe)'],
        esquema: 'Dose anual',
        via: 'Intramuscular (IM)',
        composicao: 'Vírus inativados',
        contraindicacoes: ['Alergia grave'],
        precaucoes: [],
        obs: 'Campanha anual para idosos.'
      },
      {
        nome: 'Covid-19',
        tipo: 'mRNA ou vetor viral',
        doencas: ['Covid-19'],
        esquema: 'Dose semestral',
        via: 'Intramuscular (IM)',
        composicao: 'Variável (mRNA, vetor viral, proteína)',
        contraindicacoes: ['Alergia a componentes'],
        precaucoes: [],
        obs: 'Manter esquema atualizado conforme calendário MS.'
      }
    ]
  },
  gestantes: {
    nome: 'Gestantes',
    descricao: 'Durante a gestação',
    icon: Heart,
    color: 'bg-rose-500',
    vacinas: [
      {
        nome: 'Hepatite B',
        tipo: 'Recombinante',
        doencas: ['Hepatite B'],
        esquema: 'Conforme esquema vacinal',
        via: 'Intramuscular (IM)',
        composicao: 'HBsAg recombinante',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Segura na gestação. Completar esquema se necessário.'
      },
      {
        nome: 'dT',
        tipo: 'Toxoides',
        doencas: ['Difteria', 'Tétano'],
        esquema: 'Conforme esquema vacinal',
        via: 'Intramuscular (IM)',
        composicao: 'Toxoides diftérico e tetânico',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Verificar e completar esquema.'
      },
      {
        nome: 'Influenza',
        tipo: 'Vírus inativados',
        doencas: ['Influenza (gripe)'],
        esquema: '1 dose por temporada',
        via: 'Intramuscular (IM)',
        composicao: 'Vírus inativados',
        contraindicacoes: ['Alergia grave'],
        precaucoes: [],
        obs: 'Dose anual durante a gestação.'
      },
      {
        nome: 'Covid-19',
        tipo: 'mRNA ou vetor viral',
        doencas: ['Covid-19'],
        esquema: '1 dose por gestação',
        via: 'Intramuscular (IM)',
        composicao: 'Variável (mRNA, vetor viral, proteína)',
        contraindicacoes: ['Alergia a componentes'],
        precaucoes: [],
        obs: 'Dose por gestação.'
      },
      {
        nome: 'dTpa',
        tipo: 'Toxoides + pertussis acelular',
        doencas: ['Difteria', 'Tétano', 'Coqueluche'],
        esquema: 'A partir da 20ª semana, em cada gestação',
        via: 'Intramuscular (IM)',
        composicao: 'Toxoides diftérico, tetânico + pertussis acelular',
        contraindicacoes: ['Alergia grave'],
        precaucoes: [],
        obs: 'Proteção materno-fetal. Aplicar a partir da 20ª semana.'
      },
      {
        nome: 'Febre Amarela (apenas em situações especiais)',
        tipo: 'Vírus vivo atenuado',
        doencas: ['Febre Amarela'],
        esquema: 'Conforme avaliação médica',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus atenuado',
        contraindicacoes: ['Gestação (avaliação risco-benefício obrigatória)'],
        precaucoes: ['Apenas em situações excepcionais'],
        obs: 'Apenas em situações especiais com avaliação médica detalhada.'
      }
    ],
    alertas: [
      {
        tipo: 'Avaliação risco-benefício',
        texto: 'Avaliação médica individualizada é essencial para gestantes.'
      },
      {
        tipo: 'Proteção materno-fetal',
        texto: 'Vacinação protege mãe e bebê, especialmente nos primeiros 1000 dias de vida.'
      },
      {
        tipo: 'Importância nos primeiros 1000 dias',
        texto: 'A imunização adequada impacta o desenvolvimento infantil desde a gestação.'
      }
    ],
    contraindicadas: [
      {
        nome: 'Vacinas de vírus/bactérias vivos atenuados',
        exemplos: ['Tríplice Viral', 'Varicela', 'Febre Amarela (exceto situações especiais)', 'BCG', 'VOP'],
        motivo: 'Risco teórico ao feto'
      }
    ]
  },

  profissionais_saude: {
    nome: 'Profissionais de Saúde',
    icon: Briefcase,
    color: 'bg-teal-500',
    vacinas: [
      {
        nome: 'Hepatite B',
        tipo: 'Recombinante',
        doencas: ['Hepatite B'],
        esquema: '3 doses + sorologia pós-vacinal',
        via: 'Intramuscular (IM)',
        composicao: 'HBsAg',
        contraindicacoes: ['Alergia'],
        precaucoes: ['Verificar anti-HBs > 10 mUI/mL'],
        obs: 'OBRIGATÓRIA. Sorologia 1-2 meses após última dose. Se anti-HBs < 10: revacinação.'
      },
      {
        nome: 'Tríplice Viral',
        tipo: 'Vírus vivos atenuados',
        doencas: ['Sarampo', 'Caxumba', 'Rubéola'],
        esquema: '2 doses',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus atenuados',
        contraindicacoes: ['Gestação', 'Imunodepressão'],
        precaucoes: [],
        obs: 'Profissionais nascidos após 1960: 2 doses. Antes: considerar sorologia.'
      },
      {
        nome: 'Varicela',
        tipo: 'Vírus vivo atenuado',
        doencas: ['Varicela'],
        esquema: '2 doses se não imune',
        via: 'Subcutânea (SC)',
        composicao: 'VZV atenuado',
        contraindicacoes: ['Gestação', 'Imunodepressão'],
        precaucoes: [],
        obs: 'Sorologia ou história confiável de doença. Se suscetível: vacinar.'
      },
      {
        nome: 'Influenza',
        tipo: 'Vírus inativados',
        doencas: ['Influenza'],
        esquema: 'Anual',
        via: 'Intramuscular (IM)',
        composicao: 'Vírus inativados',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'OBRIGATÓRIA. Proteção individual e dos pacientes.'
      },
      {
        nome: 'dTpa',
        tipo: 'Toxoides + pertussis acelular',
        doencas: ['Difteria', 'Tétano', 'Coqueluche'],
        esquema: '1 dose (substituir 1 reforço dT)',
        via: 'Intramuscular (IM)',
        composicao: 'Toxoides + pertussis acelular',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Proteção contra coqueluche. Demais reforços: dT a cada 10 anos.'
      },
      {
        nome: 'COVID-19',
        tipo: 'mRNA ou vetor viral',
        doencas: ['COVID-19'],
        esquema: 'Conforme calendário MS',
        via: 'Intramuscular (IM)',
        composicao: 'Variável',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Manter esquema atualizado.'
      }
    ]
  },
  viajantes: {
    nome: 'Viajantes',
    icon: Plane,
    color: 'bg-sky-500',
    vacinas: [
      {
        nome: 'Febre Amarela',
        tipo: 'Vírus vivo atenuado',
        doencas: ['Febre Amarela'],
        esquema: 'Dose única (10 dias antes)',
        via: 'Subcutânea (SC)',
        composicao: 'Vírus atenuado',
        contraindicacoes: ['Imunodepressão', 'Alergia ovo', '≥ 60 anos (avaliar)'],
        precaucoes: ['Primeira vacinação ≥ 60 anos: risco-benefício'],
        obs: 'Obrigatória para diversos países. CIVP (Certificado Internacional).'
      },
      {
        nome: 'Febre Tifoide',
        tipo: 'Polissacarídica ou viva atenuada',
        doencas: ['Febre tifoide'],
        esquema: 'Dose única (oral: 3 cápsulas)',
        via: 'IM (polissacarídica) ou VO (atenuada)',
        composicao: 'Polissacarídeo Vi ou Salmonella Typhi Ty21a',
        contraindicacoes: ['Imunodepressão (oral)', 'Alergia'],
        precaucoes: [],
        obs: 'Áreas endêmicas (Ásia, África, América Latina).'
      },
      {
        nome: 'Hepatite A',
        tipo: 'Vírus inativado',
        doencas: ['Hepatite A'],
        esquema: '2 doses (0-6 a 12 meses)',
        via: 'Intramuscular (IM)',
        composicao: 'Vírus inativado',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Áreas com saneamento precário.'
      },
      {
        nome: 'Raiva (pré-exposição)',
        tipo: 'Vírus inativado',
        doencas: ['Raiva'],
        esquema: '3 doses (D0, D7, D21-28)',
        via: 'Intramuscular (IM)',
        composicao: 'Vírus rábico inativado',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Viajantes com risco (contato animais, espeleologia). Sorologia opcional.'
      },
      {
        nome: 'Meningocócica ACWY',
        tipo: 'Conjugada',
        doencas: ['Meningite meningocócica'],
        esquema: '1 dose',
        via: 'Intramuscular (IM)',
        composicao: 'Polissacarídeos conjugados',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Cinturão da meningite (África subsaariana), peregrinos (Meca).'
      },
      {
        nome: 'Cólera',
        tipo: 'Oral inativada',
        doencas: ['Cólera'],
        esquema: '2 doses (oral, intervalo 1-6 semanas)',
        via: 'Oral (VO)',
        composicao: 'Vibrio cholerae inativado + subunidade B toxina',
        contraindicacoes: ['Imunodepressão', 'Alergia'],
        precaucoes: [],
        obs: 'Áreas com surto ativo. Proteção moderada.'
      },
      {
        nome: 'Encefalite Japonesa',
        tipo: 'Vírus inativado',
        doencas: ['Encefalite japonesa'],
        esquema: '2 doses (D0, D28)',
        via: 'Intramuscular (IM)',
        composicao: 'Vírus inativado',
        contraindicacoes: ['Alergia'],
        precaucoes: [],
        obs: 'Sudeste asiático, estadia prolongada em áreas rurais.'
      }
    ]
  },
  especiais: {
    nome: 'Grupos Especiais',
    icon: Shield,
    color: 'bg-amber-600',
    grupos: [
      {
        titulo: 'Imunodeprimidos (HIV, transplantados, quimioterapia)',
        vacinas: [
          {
            nome: 'Pneumocócica conjugada (PCV13 ou PCV15)',
            esquema: 'Esquema específico conforme CRIE',
            obs: 'Preferir conjugadas. Evitar polissacarídicas isoladas.'
          },
          {
            nome: 'Influenza (anual)',
            esquema: 'Dose anual',
            obs: 'Preferir vacina inativada quadrivalente.'
          },
          {
            nome: 'Hepatite B (dose dobrada)',
            esquema: '4 doses de 40 mcg (0-1-2-6m)',
            obs: 'Dose dobrada. Sorologia pós-vacinal obrigatória.'
          },
          {
            nome: 'Meningocócica ACWY + B',
            esquema: 'Conforme CRIE',
            obs: 'Indicação ampliada.'
          },
          {
            nome: 'Haemophilus influenzae b',
            esquema: 'Reforços conforme CRIE',
            obs: 'Mesmo se vacinado na infância.'
          }
        ],
        contraindicadas: ['BCG', 'VOP', 'Febre Amarela', 'Tríplice/Tetra Viral', 'Varicela', 'Rotavírus'],
        obs: 'Vacinas inativadas são seguras. Vírus vivos: contraindicados. CRIE: avaliar caso a caso.'
      },
      {
        titulo: 'Diabetes Mellitus',
        vacinas: [
          { nome: 'Influenza', esquema: 'Anual', obs: 'Prioritário' },
          { nome: 'Pneumocócica (PCV13 + PPV23)', esquema: 'PCV13 seguida de PPV23 após 8 semanas', obs: '' },
          { nome: 'Hepatite B', esquema: '3 doses se não vacinado', obs: '' }
        ],
        obs: 'Maior risco de infecções. Vacinas prioritárias.'
      },
      {
        titulo: 'Doença Renal Crônica / Hemodiálise',
        vacinas: [
          { nome: 'Hepatite B (dose dobrada)', esquema: '4 doses de 40 mcg (0-1-2-6m)', obs: 'Sorologia obrigatória' },
          { nome: 'Influenza', esquema: 'Anual', obs: '' },
          { nome: 'Pneumocócica (PCV13 + PPV23)', esquema: 'Esquema sequencial', obs: '' }
        ],
        obs: 'Resposta vacinal reduzida. Monitorar soroconversão.'
      },
      {
        titulo: 'Asplenia / Anemia Falciforme',
        vacinas: [
          { nome: 'Pneumocócica (PCV13 + PPV23)', esquema: 'Esquema reforçado', obs: 'Revacinação PPV23 após 5 anos' },
          { nome: 'Meningocócica ACWY + B', esquema: 'Conforme CRIE', obs: '' },
          { nome: 'Haemophilus influenzae b', esquema: 'Reforços', obs: '' },
          { nome: 'Influenza', esquema: 'Anual', obs: '' }
        ],
        obs: 'Alto risco de infecções por bactérias encapsuladas. Profilaxia antibiótica adicional.'
      },
      {
        titulo: 'Povos Indígenas',
        vacinas: [
          { nome: 'Todas do calendário PNI', esquema: 'Conforme faixa etária', obs: '' },
          { nome: 'Hepatite A', esquema: '2 doses (rede privada ou CRIE)', obs: 'Áreas endêmicas' },
          { nome: 'Varicela', esquema: '2 doses', obs: 'CRIE' }
        ],
        obs: 'Maior vulnerabilidade. Campanhas específicas DSEI.'
      }
    ]
  }
};

// Informações técnicas sobre tipos de vacinas
const tiposVacinas = [
  {
    tipo: 'Vírus Vivos Atenuados',
    exemplos: ['Tríplice Viral', 'Varicela', 'Febre Amarela', 'VOP'],
    mecanismo: 'Vírus enfraquecido replica em pequena escala, induzindo resposta imune robusta e duradoura.',
    vantagens: ['Resposta imune forte', 'Memória de longo prazo', 'Poucas doses'],
    desvantagens: ['Contraindicados em imunodeprimidos', 'Gestantes'],
    precaucoes: ['Não usar em imunodeficiência', 'Evitar gravidez pós-vacina']
  },
  {
    tipo: 'Vírus Inativados',
    exemplos: ['Influenza injetável', 'Hepatite A', 'VIP', 'Raiva'],
    mecanismo: 'Vírus morto não replica. Induz resposta imune sem risco de doença.',
    vantagens: ['Seguros para imunodeprimidos', 'Não causam doença'],
    desvantagens: ['Múltiplas doses', 'Resposta mais fraca'],
    precaucoes: ['Reforços necessários']
  },
  {
    tipo: 'Bactérias Inativadas',
    exemplos: ['Pertussis (DTP)'],
    mecanismo: 'Bactéria morta ou componentes bacterianos.',
    vantagens: ['Seguros'],
    desvantagens: ['Reatogenicidade local'],
    precaucoes: ['Reações locais comuns']
  },
  {
    tipo: 'Toxoides',
    exemplos: ['Difteria', 'Tétano'],
    mecanismo: 'Toxina bacteriana inativada. Induz anticorpos antitoxina.',
    vantagens: ['Muito seguros', 'Longa duração'],
    desvantagens: ['Reforços necessários'],
    precaucoes: ['Reforços a cada 10 anos']
  },
  {
    tipo: 'Subunidades / Recombinantes',
    exemplos: ['Hepatite B', 'HPV', 'Meningocócica conjugada', 'Pneumocócica conjugada'],
    mecanismo: 'Apenas fragmentos antigênicos (proteínas, polissacarídeos). Alta especificidade.',
    vantagens: ['Muito seguros', 'Poucos efeitos adversos'],
    desvantagens: ['Múltiplas doses', 'Adjuvantes necessários'],
    precaucoes: ['Esquemas precisos']
  },
  {
    tipo: 'Conjugadas',
    exemplos: ['Pneumocócica', 'Meningocócica', 'Hib'],
    mecanismo: 'Polissacarídeo capsular conjugado a proteína. Resposta T-dependente.',
    vantagens: ['Resposta forte em lactentes', 'Memória imunológica', 'Reduz portadores'],
    desvantagens: ['Custo elevado'],
    precaucoes: []
  }
];

// Contraindicações gerais e precauções
const contraindicacoesGerais = {
  absolutas: [
    {
      situacao: 'Reação anafilática a dose anterior ou componente vacinal',
      vacinas: 'Todas',
      conduta: 'Contraindicação permanente para aquela vacina específica'
    },
    {
      situacao: 'Encefalopatia nos 7 dias após dose de vacina com componente pertussis',
      vacinas: 'DTP, DTPa, Pentavalente',
      conduta: 'Não administrar doses subsequentes com pertussis (usar DT)'
    },
    {
      situacao: 'Imunodeficiência grave',
      vacinas: 'Vacinas de vírus/bactérias vivos atenuados (SCR, Varicela, FA, BCG, VOP)',
      conduta: 'Usar vacinas inativadas quando disponíveis. Avaliar CRIE.'
    },
    {
      situacao: 'Gestação',
      vacinas: 'Vacinas de vírus vivos (SCR, Varicela, FA)',
      conduta: 'Adiar para pós-parto. Exceção: risco-benefício em surtos.'
    }
  ],
  relativas: [
    {
      situacao: 'Doença aguda moderada/grave com febre',
      conduta: 'Adiar vacinação até melhora clínica. Doença leve: não é contraindicação.'
    },
    {
      situacao: 'Uso de imunoglobulina ou hemoderivados',
      conduta: 'Aguardar 3-11 meses para vacinas de vírus vivos (conforme dose de Ig).'
    },
    {
      situacao: 'Trombocitopenia ou distúrbios de coagulação',
      conduta: 'Preferir via SC. Se IM: pressão local 2 min. Evitar IM se plaquetas < 20.000.'
    }
  ],
  nao_sao_contraindicacoes: [
    'Doença aguda leve (resfriado, diarreia leve)',
    'Uso de antibióticos',
    'Desnutrição',
    'Prematuridade (vacinar conforme idade cronológica)',
    'Aleitamento materno',
    'História familiar de reação vacinal',
    'História de alergia inespecífica'
  ]
};

export default function CalendarioVacinalCompleto() {
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [faixaSelecionada, setFaixaSelecionada] = useState(null);
  const [vacinaSelecionada, setVacinaSelecionada] = useState(null);
  const [mostrarTipos, setMostrarTipos] = useState(false);
  const [mostrarContraindicacoes, setMostrarContraindicacoes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Voltar para grupos
  const voltarParaGrupos = () => {
    setGrupoSelecionado(null);
    setFaixaSelecionada(null);
    setVacinaSelecionada(null);
    setMostrarTipos(false);
    setMostrarContraindicacoes(false);
  };

  // Voltar para faixas
  const voltarParaFaixas = () => {
    setFaixaSelecionada(null);
    setVacinaSelecionada(null);
  };

  // Voltar para vacinas da faixa
  const voltarParaVacinas = () => {
    setVacinaSelecionada(null);
  };

  // Exibir tipos de vacinas
  if (mostrarTipos) {
    return (
      <div className="space-y-3">
        <Button variant="outline" size="sm" onClick={() => setMostrarTipos(false)} className="text-xs h-7">
          <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
        </Button>
        
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="p-4">
            <h2 className="text-white font-semibold text-base mb-1">Tipos de Vacinas</h2>
            <p className="text-blue-100 text-xs">Classificação por tecnologia e mecanismo de ação</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {tiposVacinas.map((tipo, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm border border-slate-200">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">{tipo.tipo}</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-blue-700">Exemplos:</span>
                    <p className="text-slate-700">{tipo.exemplos.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Mecanismo:</span>
                    <p className="text-slate-700">{tipo.mecanismo}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 mt-2">
                    <div className="p-2 bg-green-50 rounded">
                      <p className="font-semibold text-green-800 text-[10px] mb-1">✓ Vantagens</p>
                      <ul className="space-y-0.5">
                        {tipo.vantagens.map((v, j) => (
                          <li key={j} className="text-[10px] text-green-700">• {v}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2 bg-amber-50 rounded">
                      <p className="font-semibold text-amber-800 text-[10px] mb-1">⚠ Limitações</p>
                      <ul className="space-y-0.5">
                        {tipo.desvantagens.map((d, j) => (
                          <li key={j} className="text-[10px] text-amber-700">• {d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Exibir contraindicações
  if (mostrarContraindicacoes) {
    return (
      <div className="space-y-3">
        <Button variant="outline" size="sm" onClick={() => setMostrarContraindicacoes(false)} className="text-xs h-7">
          <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
        </Button>
        
        <Card className="bg-gradient-to-r from-red-600 to-red-700 border-0">
          <CardContent className="p-4">
            <h2 className="text-white font-semibold text-base mb-1">Contraindicações e Precauções</h2>
            <p className="text-red-100 text-xs">Quando NÃO vacinar e quando ter cautela</p>
          </CardContent>
        </Card>

        {/* Contraindicações Absolutas */}
        <Card className="bg-white/80 backdrop-blur-sm border border-red-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-1">
              <XCircle className="w-4 h-4" /> Contraindicações Absolutas
            </h3>
            <div className="space-y-2">
              {contraindicacoesGerais.absolutas.map((item, i) => (
                <div key={i} className="p-3 bg-red-50 rounded border border-red-100">
                  <p className="text-xs font-semibold text-red-900 mb-1">{item.situacao}</p>
                  <p className="text-[10px] text-red-700"><strong>Vacinas:</strong> {item.vacinas}</p>
                  <p className="text-[10px] text-red-700"><strong>Conduta:</strong> {item.conduta}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contraindicações Relativas / Precauções */}
        <Card className="bg-white/80 backdrop-blur-sm border border-amber-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Precauções (Contraindicações Temporárias)
            </h3>
            <div className="space-y-2">
              {contraindicacoesGerais.relativas.map((item, i) => (
                <div key={i} className="p-3 bg-amber-50 rounded border border-amber-100">
                  <p className="text-xs font-semibold text-amber-900 mb-1">{item.situacao}</p>
                  <p className="text-[10px] text-amber-700"><strong>Conduta:</strong> {item.conduta}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NÃO são contraindicações */}
        <Card className="bg-white/80 backdrop-blur-sm border border-green-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> NÃO são Contraindicações (Pode Vacinar)
            </h3>
            <ul className="space-y-1">
              {contraindicacoesGerais.nao_sao_contraindicacoes.map((item, i) => (
                <li key={i} className="text-xs text-green-700 flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exibir detalhes de uma vacina
  if (vacinaSelecionada) {
    return (
      <div className="space-y-3">
        <Button variant="outline" size="sm" onClick={voltarParaVacinas} className="text-xs h-7">
          <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
        </Button>

        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">{vacinaSelecionada.nome}</h2>
                <Badge className="mt-1 text-[9px] bg-blue-100 text-blue-700">{vacinaSelecionada.tipo}</Badge>
              </div>
              <Syringe className="w-5 h-5 text-blue-500" />
            </div>

            {/* Doenças prevenidas */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-600 mb-1">Doenças Prevenidas:</p>
              <div className="flex flex-wrap gap-1">
                {vacinaSelecionada.doencas.map((d, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Composição */}
            {vacinaSelecionada.composicao && (
              <div className="mb-3 p-2 bg-slate-50 rounded">
                <p className="text-xs font-semibold text-slate-600 mb-0.5">Composição:</p>
                <p className="text-[10px] text-slate-700">{vacinaSelecionada.composicao}</p>
              </div>
            )}

            {/* Esquema */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-600 mb-1">Esquema Vacinal:</p>
              <p className="text-xs text-slate-700">{vacinaSelecionada.esquema}</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-3 h-3 text-blue-600" />
                <p className="text-[10px] text-slate-600"><strong>Via:</strong> {vacinaSelecionada.via}</p>
              </div>
            </div>

            {/* Contraindicações */}
            {vacinaSelecionada.contraindicacoes && vacinaSelecionada.contraindicacoes.length > 0 && (
              <div className="mb-3 p-3 bg-red-50 rounded border border-red-100">
                <p className="text-xs font-semibold text-red-800 mb-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Contraindicações:
                </p>
                <ul className="space-y-0.5">
                  {vacinaSelecionada.contraindicacoes.map((c, i) => (
                    <li key={i} className="text-[10px] text-red-700">• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Precauções */}
            {vacinaSelecionada.precaucoes && vacinaSelecionada.precaucoes.length > 0 && (
              <div className="mb-3 p-3 bg-amber-50 rounded border border-amber-100">
                <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Precauções:
                </p>
                <ul className="space-y-0.5">
                  {vacinaSelecionada.precaucoes.map((p, i) => (
                    <li key={i} className="text-[10px] text-amber-700">• {p}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Observações */}
            {vacinaSelecionada.obs && (
              <div className="p-3 bg-blue-50 rounded border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Observações:
                </p>
                <p className="text-[10px] text-blue-700">{vacinaSelecionada.obs}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <DisclaimerFooter variant="protocolo" />
      </div>
    );
  }

  // Exibir vacinas de uma faixa etária (crianças)
  if (faixaSelecionada && grupoSelecionado?.faixas) {
    const faixa = grupoSelecionado.faixas[faixaSelecionada];

    return (
      <div className="space-y-3">
        <Button variant="outline" size="sm" onClick={voltarParaFaixas} className="text-xs h-7">
          <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
        </Button>

        <Card className={`${grupoSelecionado.color} border-0`}>
          <CardContent className="p-3">
            <h2 className="text-white font-semibold text-base">{faixa.titulo}</h2>
            <p className="text-white/80 text-xs">{faixa.idade}</p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {faixa.vacinas.map((vacina, idx) => (
            <Card 
              key={idx} 
              className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setVacinaSelecionada(vacina)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-800">{vacina.nome}</h4>
                    <Badge variant="secondary" className="text-[9px] mt-1 bg-purple-50 text-purple-700">
                      {vacina.esquema}
                    </Badge>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vacina.doencas.slice(0, 3).map((d, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] text-green-700 border-green-200">
                          {d}
                        </Badge>
                      ))}
                      {vacina.doencas.length > 3 && (
                        <Badge variant="outline" className="text-[9px]">
                          +{vacina.doencas.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Syringe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Exibir faixas etárias (crianças) ou vacinas diretas (outros grupos)
  if (grupoSelecionado) {
    // Grupo crianças: mostrar faixas
    if (grupoSelecionado.faixas) {
      return (
        <div className="space-y-3">
          <Button variant="outline" size="sm" onClick={voltarParaGrupos} className="text-xs h-7">
            <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
          </Button>

          <Card className={`${grupoSelecionado.color} border-0`}>
            <CardContent className="p-4">
              <h2 className="text-white font-semibold text-base mb-1 flex items-center gap-2">
                {React.createElement(grupoSelecionado.icon, { className: "w-5 h-5" })}
                {grupoSelecionado.nome}
              </h2>
              {grupoSelecionado.descricao && (
                <p className="text-white/80 text-xs mb-1">{grupoSelecionado.descricao}</p>
              )}
              <p className="text-white/80 text-xs">Selecione a faixa etária</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(grupoSelecionado.faixas).map(([key, faixa]) => (
              <button key={key} onClick={() => setFaixaSelecionada(key)}>
                <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all h-full">
                  <CardContent className="p-3 text-center">
                    <Calendar className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-800">{faixa.titulo}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{faixa.vacinas.length} vacinas</p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Grupos especiais: mostrar subgrupos
    if (grupoSelecionado.grupos) {
      return (
        <div className="space-y-3">
          <Button variant="outline" size="sm" onClick={voltarParaGrupos} className="text-xs h-7">
            <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
          </Button>

          <Card className={`${grupoSelecionado.color} border-0`}>
            <CardContent className="p-4">
              <h2 className="text-white font-semibold text-base mb-1 flex items-center gap-2">
                {React.createElement(grupoSelecionado.icon, { className: "w-5 h-5" })}
                {grupoSelecionado.nome}
              </h2>
              <p className="text-white/80 text-xs">Situações clínicas especiais</p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {grupoSelecionado.grupos.map((grupo, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">{grupo.titulo}</h3>
                  
                  <div className="space-y-2 mb-3">
                    {grupo.vacinas.map((vac, j) => (
                      <div key={j} className="p-2 bg-blue-50 rounded">
                        <p className="text-xs font-semibold text-blue-800">{vac.nome}</p>
                        <p className="text-[10px] text-blue-700">{vac.esquema}</p>
                        {vac.obs && <p className="text-[10px] text-blue-600 mt-0.5">• {vac.obs}</p>}
                      </div>
                    ))}
                  </div>

                  {grupo.contraindicadas && (
                    <div className="p-2 bg-red-50 rounded border border-red-100">
                      <p className="text-xs font-semibold text-red-800 mb-1">⛔ Contraindicadas:</p>
                      <p className="text-[10px] text-red-700">{grupo.contraindicadas.join(', ')}</p>
                    </div>
                  )}

                  {grupo.obs && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-100">
                      <p className="text-[10px] text-amber-800">{grupo.obs}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    // Grupos com vacinas diretas (adolescentes, adultos, idosos, gestantes, etc)
    if (grupoSelecionado.vacinas) {
      return (
        <div className="space-y-3">
          <Button variant="outline" size="sm" onClick={voltarParaGrupos} className="text-xs h-7">
            <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
          </Button>

          <Card className={`${grupoSelecionado.color} border-0`}>
            <CardContent className="p-4">
              <h2 className="text-white font-semibold text-base mb-1 flex items-center gap-2">
                {React.createElement(grupoSelecionado.icon, { className: "w-5 h-5" })}
                {grupoSelecionado.nome}
              </h2>
              {grupoSelecionado.descricao && (
                <p className="text-white/80 text-xs">{grupoSelecionado.descricao}</p>
              )}
              {!grupoSelecionado.descricao && (
                <p className="text-white/80 text-xs">Vacinas recomendadas</p>
              )}
            </CardContent>
          </Card>

          {/* Alertas importantes (gestantes) */}
          {grupoSelecionado.alertas && (
            <Card className="bg-amber-50 border border-amber-200">
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Alertas Importantes
                </h3>
                <div className="space-y-2">
                  {grupoSelecionado.alertas.map((alerta, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-amber-700">{alerta.tipo}</p>
                      <p className="text-[10px] text-amber-600">{alerta.texto}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vacinas contraindicadas (gestantes) */}
          {grupoSelecionado.contraindicadas && (
            <Card className="bg-red-50 border border-red-200">
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Vacinas Contraindicadas
                </h3>
                {grupoSelecionado.contraindicadas.map((item, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-xs font-semibold text-red-700">{item.nome}</p>
                    <p className="text-[10px] text-red-600">Exemplos: {item.exemplos.join(', ')}</p>
                    <p className="text-[10px] text-red-600">Motivo: {item.motivo}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {grupoSelecionado.vacinas.map((vacina, idx) => (
              <Card 
                key={idx} 
                className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setVacinaSelecionada(vacina)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-800">{vacina.nome}</h4>
                      <Badge variant="secondary" className="text-[9px] mt-1 bg-purple-50 text-purple-700">
                        {vacina.esquema}
                      </Badge>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {vacina.doencas.slice(0, 3).map((d, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] text-green-700 border-green-200">
                            {d}
                          </Badge>
                        ))}
                        {vacina.doencas.length > 3 && (
                          <Badge variant="outline" className="text-[9px]">+{vacina.doencas.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                    <Syringe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }
  }

  // Tela inicial - seleção de grupos
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
        <CardContent className="p-4">
          <h2 className="text-white font-semibold text-base mb-1">Calendário Vacinal PNI 2025</h2>
          <p className="text-blue-100 text-xs">Programa Nacional de Imunizações - Ministério da Saúde</p>
        </CardContent>
      </Card>

      {/* Grupos Populacionais */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(calendarioPorGrupo).map(([key, grupo]) => {
          const Icon = grupo.icon;
          let qtdVacinas = 0;
          if (grupo.faixas) {
            qtdVacinas = Object.values(grupo.faixas).reduce((acc, f) => acc + f.vacinas.length, 0);
          } else if (grupo.vacinas) {
            qtdVacinas = grupo.vacinas.length;
          } else if (grupo.grupos) {
            qtdVacinas = grupo.grupos.reduce((acc, g) => acc + g.vacinas.length, 0);
          }

          return (
            <button key={key} onClick={() => setGrupoSelecionado(grupo)} className="group">
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`w-12 h-12 rounded-xl ${grupo.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block group-hover:text-blue-700">
                      {grupo.nome}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      {qtdVacinas} {qtdVacinas === 1 ? 'vacina' : 'vacinas'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Recursos adicionais */}
      <div className="grid md:grid-cols-2 gap-3">
        <button onClick={() => setMostrarTipos(true)} className="group">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all h-full">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Info className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-700">Tipos de Vacinas</p>
                <p className="text-[10px] text-slate-500">Tecnologias e mecanismos</p>
              </div>
            </CardContent>
          </Card>
        </button>

        <button onClick={() => setMostrarContraindicacoes(true)} className="group">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-red-300 hover:shadow-md transition-all h-full">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-red-700">Contraindicações</p>
                <p className="text-[10px] text-slate-500">Quando não vacinar</p>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Footer - Fonte Oficial */}
      <Card className="bg-slate-100 border-slate-300">
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-slate-800 text-center mb-1">
            Fonte: Ministério da Saúde – Brasil
          </p>
          <p className="text-[9px] text-slate-600 text-center">
            Documento: Calendários Nacionais de Vacinação
          </p>
          <p className="text-[9px] text-slate-600 text-center mt-1">
            Ano da última atualização: 2025
          </p>
        </CardContent>
      </Card>

      <DisclaimerFooter variant="protocolo" />
    </div>
  );
}
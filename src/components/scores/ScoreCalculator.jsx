import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BlocoRastreabilidade from '../editorial/BlocoRastreabilidade';
import { 
  ArrowLeft, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2,
  BookOpen,
  Shield,
  Pill
} from 'lucide-react';
import DisclaimerFooter from '../compliance/DisclaimerFooter';

// Definições dos scores com critérios, interpretação e profilaxias
const scoreDefinitions = {
  // qSOFA
  qsofa: {
    nome: 'qSOFA',
    descricao: 'Quick Sequential Organ Failure Assessment - Triagem de sepse',
    criterios: [
      { id: 'fr', label: 'FR ≥ 22 irpm', pontos: 1 },
      { id: 'pas', label: 'PAS ≤ 100 mmHg', pontos: 1 },
      { id: 'mental', label: 'Alteração do estado mental (Glasgow < 15)', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 1, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Baixa probabilidade de sepse.' },
      { min: 2, max: 3, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Alta suspeita de sepse.' }
    ],
    fonte: 'Sepsis-3 Definitions - Singer et al., JAMA 2016'
  },

  // CURB-65
  curb65: {
    nome: 'CURB-65',
    descricao: 'Gravidade de pneumonia adquirida na comunidade',
    criterios: [
      { id: 'c', label: 'Confusão mental', pontos: 1 },
      { id: 'u', label: 'Ureia > 50 mg/dL (ou > 7 mmol/L)', pontos: 1 },
      { id: 'r', label: 'FR ≥ 30 irpm', pontos: 1 },
      { id: 'b', label: 'PA sistólica < 90 ou diastólica ≤ 60 mmHg', pontos: 1 },
      { id: '65', label: 'Idade ≥ 65 anos', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 1, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Mortalidade < 3%' },
      { min: 2, max: 2, nivel: 'Risco intermediário', cor: 'bg-yellow-500', texto: 'Mortalidade ~9%' },
      { min: 3, max: 5, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Mortalidade 15-40%' }
    ],
    fonte: 'British Thoracic Society - Lim et al., Thorax 2003'
  },

  // Glasgow
  glasgow: {
    nome: 'Escala de Coma de Glasgow',
    descricao: 'Avaliação do nível de consciência',
    tipo: 'seletivo',
    grupos: [
      {
        nome: 'Abertura Ocular (AO)',
        opcoes: [
          { valor: 4, label: 'Espontânea' },
          { valor: 3, label: 'Ao comando verbal' },
          { valor: 2, label: 'À dor' },
          { valor: 1, label: 'Ausente' }
        ]
      },
      {
        nome: 'Resposta Verbal (RV)',
        opcoes: [
          { valor: 5, label: 'Orientada' },
          { valor: 4, label: 'Confusa' },
          { valor: 3, label: 'Palavras inapropriadas' },
          { valor: 2, label: 'Sons incompreensíveis' },
          { valor: 1, label: 'Ausente' }
        ]
      },
      {
        nome: 'Resposta Motora (RM)',
        opcoes: [
          { valor: 6, label: 'Obedece comandos' },
          { valor: 5, label: 'Localiza dor' },
          { valor: 4, label: 'Retirada à dor' },
          { valor: 3, label: 'Flexão anormal (decorticação)' },
          { valor: 2, label: 'Extensão anormal (descerebração)' },
          { valor: 1, label: 'Ausente' }
        ]
      }
    ],
    interpretacao: [
      { min: 13, max: 15, nivel: 'TCE Leve', cor: 'bg-green-500', texto: 'Leve comprometimento' },
      { min: 9, max: 12, nivel: 'TCE Moderado', cor: 'bg-yellow-500', texto: 'Comprometimento moderado' },
      { min: 3, max: 8, nivel: 'TCE Grave', cor: 'bg-red-500', texto: 'Grave comprometimento' }
    ],
    fonte: 'Teasdale & Jennett, Lancet 1974'
  },

  // HEART Score
  heart: {
    nome: 'HEART Score',
    descricao: 'Estratificação de risco em dor torácica',
    tipo: 'seletivo',
    grupos: [
      {
        nome: 'History (História)',
        opcoes: [
          { valor: 0, label: 'Pouco suspeita' },
          { valor: 1, label: 'Moderadamente suspeita' },
          { valor: 2, label: 'Altamente suspeita' }
        ]
      },
      {
        nome: 'ECG',
        opcoes: [
          { valor: 0, label: 'Normal' },
          { valor: 1, label: 'Alteração inespecífica de repolarização' },
          { valor: 2, label: 'Desvio ST significativo' }
        ]
      },
      {
        nome: 'Age (Idade)',
        opcoes: [
          { valor: 0, label: '< 45 anos' },
          { valor: 1, label: '45-64 anos' },
          { valor: 2, label: '≥ 65 anos' }
        ]
      },
      {
        nome: 'Risk Factors',
        opcoes: [
          { valor: 0, label: 'Sem fatores de risco' },
          { valor: 1, label: '1-2 fatores de risco' },
          { valor: 2, label: '≥ 3 fatores ou DAC prévia' }
        ]
      },
      {
        nome: 'Troponina',
        opcoes: [
          { valor: 0, label: 'Normal' },
          { valor: 1, label: '1-3x limite superior' },
          { valor: 2, label: '> 3x limite superior' }
        ]
      }
    ],
    interpretacao: [
      { min: 0, max: 3, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'MACE 0.9-1.7%' },
      { min: 4, max: 6, nivel: 'Risco intermediário', cor: 'bg-yellow-500', texto: 'MACE 12-16%' },
      { min: 7, max: 10, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'MACE 50-65%' }
    ],
    fonte: 'Six et al., Neth Heart J 2008'
  },

  // Wells TEP
  wells_tep: {
    nome: 'Wells Score - TEP',
    descricao: 'Probabilidade pré-teste de tromboembolismo pulmonar',
    criterios: [
      { id: 'clinica_tvp', label: 'Sinais/sintomas clínicos de TVP', pontos: 3 },
      { id: 'alternativo', label: 'Diagnóstico alternativo menos provável que TEP', pontos: 3 },
      { id: 'fc', label: 'FC > 100 bpm', pontos: 1.5 },
      { id: 'imobilizacao', label: 'Imobilização ≥ 3 dias ou cirurgia nas últimas 4 semanas', pontos: 1.5 },
      { id: 'tep_tvp_previo', label: 'TEP ou TVP prévio', pontos: 1.5 },
      { id: 'hemoptise', label: 'Hemoptise', pontos: 1 },
      { id: 'neoplasia', label: 'Neoplasia ativa (tratamento nos últimos 6 meses)', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 1, nivel: 'Baixa probabilidade', cor: 'bg-green-500', texto: 'Probabilidade ~3%' },
      { min: 2, max: 6, nivel: 'Probabilidade intermediária', cor: 'bg-yellow-500', texto: 'Probabilidade ~28%' },
      { min: 7, max: 12.5, nivel: 'Alta probabilidade', cor: 'bg-red-500', texto: 'Probabilidade ~78%' }
    ],
    fonte: 'Wells et al., Ann Intern Med 2001'
  },

  // CHA2DS2-VASc
  chadsvasc: {
    nome: 'CHA₂DS₂-VASc',
    descricao: 'Risco de AVC em fibrilação atrial',
    criterios: [
      { id: 'c', label: 'ICC ou disfunção VE (FE ≤ 40%)', pontos: 1 },
      { id: 'h', label: 'Hipertensão arterial', pontos: 1 },
      { id: 'a2', label: 'Idade ≥ 75 anos', pontos: 2 },
      { id: 'd', label: 'Diabetes mellitus', pontos: 1 },
      { id: 's2', label: 'AVC/AIT/tromboembolismo prévio', pontos: 2 },
      { id: 'v', label: 'Doença vascular (IAM, DAP, placa aórtica)', pontos: 1 },
      { id: 'a', label: 'Idade 65-74 anos', pontos: 1 },
      { id: 'sc', label: 'Sexo feminino', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Risco anual 0%' },
      { min: 1, max: 1, nivel: 'Risco baixo-intermediário', cor: 'bg-yellow-500', texto: 'Risco anual 1.3%' },
      { min: 2, max: 9, nivel: 'Risco elevado', cor: 'bg-red-500', texto: 'Risco anual ≥ 2.2%' }
    ],
    fonte: 'Lip et al., Chest 2010 - ESC Guidelines 2020'
  },

  // HAS-BLED
  hasbled: {
    nome: 'HAS-BLED',
    descricao: 'Risco de sangramento em anticoagulação',
    criterios: [
      { id: 'h', label: 'Hipertensão (PAS > 160)', pontos: 1 },
      { id: 'a', label: 'Alteração renal/hepática (1 ponto cada)', pontos: 2 },
      { id: 's', label: 'Stroke (AVC prévio)', pontos: 1 },
      { id: 'b', label: 'Bleeding (sangramento prévio ou predisposição)', pontos: 1 },
      { id: 'l', label: 'Labile INR (TTR < 60%)', pontos: 1 },
      { id: 'e', label: 'Elderly (idade > 65)', pontos: 1 },
      { id: 'd', label: 'Drugs/Alcohol (AINEs, antiplaquetários, álcool)', pontos: 2 }
    ],
    interpretacao: [
      { min: 0, max: 2, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Risco anual < 2%' },
      { min: 3, max: 9, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Risco anual ≥ 3.7%' }
    ],
    fonte: 'Pisters et al., Chest 2010'
  },

  // Caprini
  caprini: {
    nome: 'Caprini Score',
    descricao: 'Risco de TEV em pacientes cirúrgicos',
    criterios: [
      { id: 'idade_41_60', label: 'Idade 41-60 anos', pontos: 1 },
      { id: 'cirurgia_menor', label: 'Cirurgia menor', pontos: 1 },
      { id: 'imc_25', label: 'IMC > 25', pontos: 1 },
      { id: 'edema_mmii', label: 'Edema MMII', pontos: 1 },
      { id: 'varizes', label: 'Varizes', pontos: 1 },
      { id: 'gestacao', label: 'Gestação ou pós-parto', pontos: 1 },
      { id: 'abortos', label: 'Abortos de repetição', pontos: 1 },
      { id: 'aco', label: 'Uso de ACO ou TRH', pontos: 1 },
      { id: 'sepse', label: 'Sepse (< 1 mês)', pontos: 1 },
      { id: 'dpoc', label: 'Doença pulmonar grave/DPOC', pontos: 1 },
      { id: 'idade_61_74', label: 'Idade 61-74 anos', pontos: 2 },
      { id: 'cirurgia_maior', label: 'Cirurgia maior (> 45 min)', pontos: 2 },
      { id: 'laparoscopia', label: 'Cirurgia laparoscópica > 45 min', pontos: 2 },
      { id: 'neoplasia', label: 'Neoplasia', pontos: 2 },
      { id: 'acamado', label: 'Acamado > 72h', pontos: 2 },
      { id: 'gesso', label: 'Imobilização gessada', pontos: 2 },
      { id: 'cvc', label: 'Cateter venoso central', pontos: 2 },
      { id: 'idade_75', label: 'Idade ≥ 75 anos', pontos: 3 },
      { id: 'tev_previo', label: 'TEV prévio', pontos: 3 },
      { id: 'historia_familiar', label: 'História familiar TEV', pontos: 3 },
      { id: 'fator_v', label: 'Fator V Leiden', pontos: 3 },
      { id: 'protrombina', label: 'Mutação protrombina', pontos: 3 },
      { id: 'anticoagulante_lupico', label: 'Anticoagulante lúpico', pontos: 3 },
      { id: 'avc', label: 'AVC (< 1 mês)', pontos: 5 },
      { id: 'artroplastia', label: 'Artroplastia', pontos: 5 },
      { id: 'fratura_quadril', label: 'Fratura de quadril/pelve/MMII', pontos: 5 },
      { id: 'politrauma', label: 'Politrauma (< 1 mês)', pontos: 5 },
      { id: 'lesao_medular', label: 'Lesão medular (< 1 mês)', pontos: 5 }
    ],
    interpretacao: [
      { min: 0, max: 1, nivel: 'Muito baixo risco', cor: 'bg-green-500', texto: 'Risco TEV < 0.5%' },
      { min: 2, max: 2, nivel: 'Baixo risco', cor: 'bg-blue-500', texto: 'Risco TEV ~1.5%' },
      { min: 3, max: 4, nivel: 'Risco moderado', cor: 'bg-yellow-500', texto: 'Risco TEV ~3%' },
      { min: 5, max: 100, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Risco TEV ~6%' }
    ],
    fonte: 'Caprini JA, Dis Mon 2005 - CHEST Guidelines 2012'
  },

  // Padua
  padua: {
    nome: 'Padua Score',
    descricao: 'Risco de TEV em pacientes clínicos hospitalizados',
    criterios: [
      { id: 'neoplasia', label: 'Neoplasia ativa', pontos: 3 },
      { id: 'tev_previo', label: 'TEV prévio (exceto trombose venosa superficial)', pontos: 3 },
      { id: 'mobilidade', label: 'Mobilidade reduzida', pontos: 3 },
      { id: 'trombofilia', label: 'Trombofilia conhecida', pontos: 3 },
      { id: 'trauma_cirurgia', label: 'Trauma/cirurgia recente (≤ 1 mês)', pontos: 2 },
      { id: 'idade_70', label: 'Idade ≥ 70 anos', pontos: 1 },
      { id: 'icc', label: 'ICC ou IR', pontos: 1 },
      { id: 'iam', label: 'IAM ou AVC isquêmico', pontos: 1 },
      { id: 'infeccao', label: 'Infecção aguda ou doença reumatológica', pontos: 1 },
      { id: 'obesidade', label: 'Obesidade (IMC ≥ 30)', pontos: 1 },
      { id: 'hormonio', label: 'Tratamento hormonal em andamento', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 3, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Risco TEV ~0.3%' },
      { min: 4, max: 20, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Risco TEV ~11%' }
    ],
    fonte: 'Barbar et al., J Thromb Haemost 2010'
  },

  // NIHSS
  nihss: {
    nome: 'NIHSS',
    descricao: 'NIH Stroke Scale - Gravidade do AVC',
    tipo: 'seletivo',
    grupos: [
      { nome: '1a. Nível de consciência', opcoes: [{ valor: 0, label: 'Alerta' }, { valor: 1, label: 'Não alerta, mas acorda' }, { valor: 2, label: 'Não alerta, requer estímulo repetido' }, { valor: 3, label: 'Coma' }] },
      { nome: '1b. Perguntas (mês e idade)', opcoes: [{ valor: 0, label: 'Responde ambas corretamente' }, { valor: 1, label: 'Responde uma corretamente' }, { valor: 2, label: 'Nenhuma correta' }] },
      { nome: '1c. Comandos (fechar olhos, apertar mão)', opcoes: [{ valor: 0, label: 'Realiza ambos' }, { valor: 1, label: 'Realiza um' }, { valor: 2, label: 'Nenhum' }] },
      { nome: '2. Olhar conjugado', opcoes: [{ valor: 0, label: 'Normal' }, { valor: 1, label: 'Paralisia parcial' }, { valor: 2, label: 'Desvio forçado' }] },
      { nome: '3. Campo visual', opcoes: [{ valor: 0, label: 'Sem perda' }, { valor: 1, label: 'Hemianopsia parcial' }, { valor: 2, label: 'Hemianopsia completa' }, { valor: 3, label: 'Cegueira bilateral' }] },
      { nome: '4. Paralisia facial', opcoes: [{ valor: 0, label: 'Normal' }, { valor: 1, label: 'Leve' }, { valor: 2, label: 'Parcial' }, { valor: 3, label: 'Completa' }] },
      { nome: '5a. Motor braço esquerdo', opcoes: [{ valor: 0, label: 'Sem queda' }, { valor: 1, label: 'Queda antes de 10s' }, { valor: 2, label: 'Esforço contra gravidade' }, { valor: 3, label: 'Sem esforço contra gravidade' }, { valor: 4, label: 'Sem movimento' }] },
      { nome: '5b. Motor braço direito', opcoes: [{ valor: 0, label: 'Sem queda' }, { valor: 1, label: 'Queda antes de 10s' }, { valor: 2, label: 'Esforço contra gravidade' }, { valor: 3, label: 'Sem esforço contra gravidade' }, { valor: 4, label: 'Sem movimento' }] },
      { nome: '6a. Motor perna esquerda', opcoes: [{ valor: 0, label: 'Sem queda' }, { valor: 1, label: 'Queda antes de 5s' }, { valor: 2, label: 'Esforço contra gravidade' }, { valor: 3, label: 'Sem esforço contra gravidade' }, { valor: 4, label: 'Sem movimento' }] },
      { nome: '6b. Motor perna direita', opcoes: [{ valor: 0, label: 'Sem queda' }, { valor: 1, label: 'Queda antes de 5s' }, { valor: 2, label: 'Esforço contra gravidade' }, { valor: 3, label: 'Sem esforço contra gravidade' }, { valor: 4, label: 'Sem movimento' }] },
      { nome: '7. Ataxia', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 1, label: 'Em um membro' }, { valor: 2, label: 'Em dois membros' }] },
      { nome: '8. Sensibilidade', opcoes: [{ valor: 0, label: 'Normal' }, { valor: 1, label: 'Perda leve-moderada' }, { valor: 2, label: 'Perda grave ou total' }] },
      { nome: '9. Linguagem', opcoes: [{ valor: 0, label: 'Normal' }, { valor: 1, label: 'Afasia leve-moderada' }, { valor: 2, label: 'Afasia grave' }, { valor: 3, label: 'Mudo ou afasia global' }] },
      { nome: '10. Disartria', opcoes: [{ valor: 0, label: 'Normal' }, { valor: 1, label: 'Leve-moderada' }, { valor: 2, label: 'Grave/anartria' }] },
      { nome: '11. Extinção/Inatenção', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 1, label: 'Parcial' }, { valor: 2, label: 'Completa' }] }
    ],
    interpretacao: [
      { min: 0, max: 4, nivel: 'AVC leve', cor: 'bg-green-500', texto: 'Déficit leve' },
      { min: 5, max: 15, nivel: 'AVC moderado', cor: 'bg-yellow-500', texto: 'Déficit moderado' },
      { min: 16, max: 20, nivel: 'AVC moderado-grave', cor: 'bg-orange-500', texto: 'Déficit moderado a grave' },
      { min: 21, max: 42, nivel: 'AVC grave', cor: 'bg-red-500', texto: 'Déficit grave' }
    ],
    fonte: 'NIH - Brott et al., Stroke 1989'
  },

  // Child-Pugh
  child_pugh: {
    nome: 'Child-Pugh',
    descricao: 'Gravidade da cirrose hepática',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Encefalopatia', opcoes: [{ valor: 1, label: 'Ausente' }, { valor: 2, label: 'Grau I-II' }, { valor: 3, label: 'Grau III-IV' }] },
      { nome: 'Ascite', opcoes: [{ valor: 1, label: 'Ausente' }, { valor: 2, label: 'Leve/controlada' }, { valor: 3, label: 'Moderada-grave' }] },
      { nome: 'Bilirrubina (mg/dL)', opcoes: [{ valor: 1, label: '< 2' }, { valor: 2, label: '2-3' }, { valor: 3, label: '> 3' }] },
      { nome: 'Albumina (g/dL)', opcoes: [{ valor: 1, label: '> 3.5' }, { valor: 2, label: '2.8-3.5' }, { valor: 3, label: '< 2.8' }] },
      { nome: 'INR', opcoes: [{ valor: 1, label: '< 1.7' }, { valor: 2, label: '1.7-2.3' }, { valor: 3, label: '> 2.3' }] }
    ],
    interpretacao: [
      { min: 5, max: 6, nivel: 'Child A', cor: 'bg-green-500', texto: 'Cirrose compensada. Sobrevida 1 ano: 100%' },
      { min: 7, max: 9, nivel: 'Child B', cor: 'bg-yellow-500', texto: 'Comprometimento significativo. Sobrevida 1 ano: 81%' },
      { min: 10, max: 15, nivel: 'Child C', cor: 'bg-red-500', texto: 'Doença descompensada. Sobrevida 1 ano: 45%' }
    ],
    fonte: 'Pugh et al., Br J Surg 1973'
  },

  // MELD
  meld: {
    nome: 'MELD',
    descricao: 'Model for End-Stage Liver Disease',
    tipo: 'numerico',
    campos: [
      { id: 'bilirrubina', label: 'Bilirrubina total (mg/dL)', min: 1, max: 50 },
      { id: 'inr', label: 'INR', min: 1, max: 10 },
      { id: 'creatinina', label: 'Creatinina (mg/dL)', min: 0.5, max: 15 },
      { id: 'dialise', label: 'Diálise ≥ 2x na última semana?', tipo: 'checkbox' }
    ],
    formula: 'MELD = 3.78 × ln(bilirrubina) + 11.2 × ln(INR) + 9.57 × ln(creatinina) + 6.43',
    interpretacao: [
      { min: 0, max: 9, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Mortalidade 3 meses: 1.9%' },
      { min: 10, max: 19, nivel: 'Risco intermediário', cor: 'bg-yellow-500', texto: 'Mortalidade 3 meses: 6%' },
      { min: 20, max: 29, nivel: 'Risco alto', cor: 'bg-orange-500', texto: 'Mortalidade 3 meses: 19.6%' },
      { min: 30, max: 40, nivel: 'Risco muito alto', cor: 'bg-red-500', texto: 'Mortalidade 3 meses: 52.6%' }
    ],
    fonte: 'Kamath et al., Hepatology 2001 - UNOS'
  },

  // APGAR
  apgar: {
    nome: 'APGAR',
    descricao: 'Avaliação da vitalidade neonatal',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Appearance (Cor)', opcoes: [{ valor: 0, label: 'Cianose/palidez total' }, { valor: 1, label: 'Cianose de extremidades' }, { valor: 2, label: 'Rosado' }] },
      { nome: 'Pulse (FC)', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 1, label: '< 100 bpm' }, { valor: 2, label: '≥ 100 bpm' }] },
      { nome: 'Grimace (Reflexos)', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 1, label: 'Alguma reação' }, { valor: 2, label: 'Choro vigoroso' }] },
      { nome: 'Activity (Tônus)', opcoes: [{ valor: 0, label: 'Flácido' }, { valor: 1, label: 'Alguma flexão' }, { valor: 2, label: 'Movimentos ativos' }] },
      { nome: 'Respiration', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 1, label: 'Irregular/fraca' }, { valor: 2, label: 'Choro forte' }] }
    ],
    interpretacao: [
      { min: 0, max: 3, nivel: 'Asfixia grave', cor: 'bg-red-500', texto: 'Vitalidade gravemente comprometida' },
      { min: 4, max: 6, nivel: 'Asfixia moderada', cor: 'bg-yellow-500', texto: 'Vitalidade moderadamente comprometida' },
      { min: 7, max: 10, nivel: 'Normal', cor: 'bg-green-500', texto: 'Boa vitalidade' }
    ],
    fonte: 'Virginia Apgar, 1953'
  },

  // CIWA-Ar
  ciwa: {
    nome: 'CIWA-Ar',
    descricao: 'Clinical Institute Withdrawal Assessment for Alcohol',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Náuseas/vômitos', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 2, label: 'Náuseas leves' }, { valor: 4, label: 'Náuseas intermitentes' }, { valor: 7, label: 'Náuseas constantes/vômitos' }] },
      { nome: 'Tremor', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 2, label: 'Leve' }, { valor: 4, label: 'Moderado' }, { valor: 7, label: 'Grave' }] },
      { nome: 'Sudorese', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 2, label: 'Palmas úmidas' }, { valor: 4, label: 'Sudorese visível' }, { valor: 7, label: 'Sudorese profusa' }] },
      { nome: 'Ansiedade', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 2, label: 'Leve' }, { valor: 4, label: 'Moderada' }, { valor: 7, label: 'Pânico' }] },
      { nome: 'Agitação', opcoes: [{ valor: 0, label: 'Normal' }, { valor: 2, label: 'Levemente inquieto' }, { valor: 4, label: 'Moderadamente inquieto' }, { valor: 7, label: 'Agitação intensa' }] },
      { nome: 'Distúrbios táteis', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 2, label: 'Prurido/formigamento leve' }, { valor: 4, label: 'Moderado' }, { valor: 7, label: 'Alucinações táteis' }] },
      { nome: 'Distúrbios auditivos', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 2, label: 'Leve' }, { valor: 4, label: 'Moderado' }, { valor: 7, label: 'Alucinações auditivas' }] },
      { nome: 'Distúrbios visuais', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 2, label: 'Sensibilidade leve' }, { valor: 4, label: 'Moderado' }, { valor: 7, label: 'Alucinações visuais' }] },
      { nome: 'Cefaleia', opcoes: [{ valor: 0, label: 'Ausente' }, { valor: 2, label: 'Leve' }, { valor: 4, label: 'Moderada' }, { valor: 7, label: 'Grave' }] },
      { nome: 'Orientação', opcoes: [{ valor: 0, label: 'Orientado' }, { valor: 2, label: 'Incerteza' }, { valor: 4, label: 'Desorientado para data' }] }
    ],
    interpretacao: [
      { min: 0, max: 9, nivel: 'Abstinência leve', cor: 'bg-green-500', texto: 'Sintomas leves' },
      { min: 10, max: 19, nivel: 'Abstinência moderada', cor: 'bg-yellow-500', texto: 'Sintomas moderados' },
      { min: 20, max: 67, nivel: 'Abstinência grave', cor: 'bg-red-500', texto: 'Sintomas graves' }
    ],
    fonte: 'Sullivan et al., Br J Addict 1989'
  },

  // ===== CALCULADORAS NUMÉRICAS =====
  
  // LDL Friedewald
  ldl_friedewald: {
    nome: 'LDL (Friedewald)',
    descricao: 'Cálculo de LDL colesterol pela fórmula de Friedewald',
    tipo: 'numerico',
    campos: [
      { id: 'ct', label: 'Colesterol Total (mg/dL)', min: 0, max: 500 },
      { id: 'hdl', label: 'HDL (mg/dL)', min: 0, max: 200 },
      { id: 'tg', label: 'Triglicerídeos (mg/dL)', min: 0, max: 1000 }
    ],
    formula: 'LDL = CT - HDL - (TG/5)',
    interpretacao: [
      { min: 0, max: 100, nivel: 'Ótimo', cor: 'bg-green-500', texto: '< 100 mg/dL - Ótimo' },
      { min: 100, max: 129, nivel: 'Ideal', cor: 'bg-blue-500', texto: '100-129 mg/dL - Desejável' },
      { min: 130, max: 159, nivel: 'Limítrofe', cor: 'bg-yellow-500', texto: '130-159 mg/dL - Limítrofe' },
      { min: 160, max: 189, nivel: 'Elevado', cor: 'bg-orange-500', texto: '160-189 mg/dL - Alto' },
      { min: 190, max: 500, nivel: 'Muito elevado', cor: 'bg-red-500', texto: '≥ 190 mg/dL - Muito alto' }
    ],
    fonte: 'Friedewald et al., Clin Chem 1972'
  },

  // LDL Martin
  ldl_martin: {
    nome: 'LDL (Martin/Hopkins)',
    descricao: 'Cálculo de LDL colesterol pela fórmula de Martin-Hopkins (mais precisa)',
    tipo: 'numerico',
    campos: [
      { id: 'ct', label: 'Colesterol Total (mg/dL)', min: 0, max: 500 },
      { id: 'hdl', label: 'HDL (mg/dL)', min: 0, max: 200 },
      { id: 'tg', label: 'Triglicerídeos (mg/dL)', min: 0, max: 1000 }
    ],
    formula: 'LDL = CT - HDL - (TG/fator ajustável)',
    interpretacao: [
      { min: 0, max: 100, nivel: 'Ótimo', cor: 'bg-green-500', texto: '< 100 mg/dL - Ótimo' },
      { min: 100, max: 129, nivel: 'Ideal', cor: 'bg-blue-500', texto: '100-129 mg/dL - Desejável' },
      { min: 130, max: 159, nivel: 'Limítrofe', cor: 'bg-yellow-500', texto: '130-159 mg/dL - Limítrofe' },
      { min: 160, max: 189, nivel: 'Elevado', cor: 'bg-orange-500', texto: '160-189 mg/dL - Alto' },
      { min: 190, max: 500, nivel: 'Muito elevado', cor: 'bg-red-500', texto: '≥ 190 mg/dL - Muito alto' }
    ],
    fonte: 'Martin et al., JAMA 2013'
  },

  // Colesterol não-HDL
  nao_hdl: {
    nome: 'Colesterol não-HDL',
    descricao: 'Colesterol Total - HDL',
    tipo: 'numerico',
    campos: [
      { id: 'ct', label: 'Colesterol Total (mg/dL)', min: 0, max: 500 },
      { id: 'hdl', label: 'HDL (mg/dL)', min: 0, max: 200 }
    ],
    formula: 'Não-HDL = CT - HDL',
    interpretacao: [
      { min: 0, max: 130, nivel: 'Ótimo', cor: 'bg-green-500', texto: '< 130 mg/dL - Ótimo' },
      { min: 130, max: 159, nivel: 'Desejável', cor: 'bg-blue-500', texto: '130-159 mg/dL - Desejável' },
      { min: 160, max: 189, nivel: 'Limítrofe', cor: 'bg-yellow-500', texto: '160-189 mg/dL - Limítrofe' },
      { min: 190, max: 219, nivel: 'Elevado', cor: 'bg-orange-500', texto: '190-219 mg/dL - Alto' },
      { min: 220, max: 500, nivel: 'Muito elevado', cor: 'bg-red-500', texto: '≥ 220 mg/dL - Muito alto' }
    ],
    fonte: 'ACC/AHA Guidelines'
  },

  // CT/HDL Ratio
  ct_hdl_ratio: {
    nome: 'Razão CT/HDL',
    descricao: 'Razão entre colesterol total e HDL',
    tipo: 'numerico',
    campos: [
      { id: 'ct', label: 'Colesterol Total (mg/dL)', min: 0, max: 500 },
      { id: 'hdl', label: 'HDL (mg/dL)', min: 0, max: 200 }
    ],
    formula: 'Razão = CT / HDL',
    interpretacao: [
      { min: 0, max: 3.5, nivel: 'Ótimo', cor: 'bg-green-500', texto: '< 3.5 - Baixo risco' },
      { min: 3.5, max: 5, nivel: 'Desejável', cor: 'bg-yellow-500', texto: '3.5-5 - Risco médio' },
      { min: 5, max: 20, nivel: 'Elevado', cor: 'bg-red-500', texto: '> 5 - Alto risco' }
    ],
    fonte: 'Framingham Study'
  },

  // IMC
  imc: {
    nome: 'IMC',
    descricao: 'Índice de Massa Corporal',
    tipo: 'numerico',
    campos: [
      { id: 'peso', label: 'Peso (kg)', min: 1, max: 300 },
      { id: 'altura', label: 'Altura (cm)', min: 50, max: 250 }
    ],
    formula: 'IMC = Peso (kg) / Altura² (m)',
    interpretacao: [
      { min: 0, max: 18.5, nivel: 'Baixo peso', cor: 'bg-blue-400', texto: '< 18.5 - Abaixo do peso' },
      { min: 18.5, max: 24.9, nivel: 'Normal', cor: 'bg-green-500', texto: '18.5-24.9 - Peso normal' },
      { min: 25, max: 29.9, nivel: 'Sobrepeso', cor: 'bg-yellow-500', texto: '25-29.9 - Sobrepeso' },
      { min: 30, max: 34.9, nivel: 'Obesidade I', cor: 'bg-orange-500', texto: '30-34.9 - Obesidade grau I' },
      { min: 35, max: 39.9, nivel: 'Obesidade II', cor: 'bg-red-500', texto: '35-39.9 - Obesidade grau II' },
      { min: 40, max: 100, nivel: 'Obesidade III', cor: 'bg-red-700', texto: '≥ 40 - Obesidade grau III' }
    ],
    fonte: 'OMS'
  },

  // BSA
  bsa: {
    nome: 'BSA (Mosteller)',
    descricao: 'Superfície Corporal pela fórmula de Mosteller',
    tipo: 'numerico',
    campos: [
      { id: 'peso', label: 'Peso (kg)', min: 1, max: 300 },
      { id: 'altura', label: 'Altura (cm)', min: 50, max: 250 }
    ],
    formula: 'BSA = √[(altura × peso) / 3600]',
    fonte: 'Mosteller, NEJM 1987'
  },

  // Osmolaridade
  osmolaridade: {
    nome: 'Osmolaridade Plasmática',
    descricao: 'Osmolaridade plasmática calculada',
    tipo: 'numerico',
    campos: [
      { id: 'na', label: 'Sódio (mEq/L)', min: 100, max: 200 },
      { id: 'glicose', label: 'Glicose (mg/dL)', min: 0, max: 1000 },
      { id: 'ureia', label: 'Ureia (mg/dL)', min: 0, max: 300 }
    ],
    formula: 'Osm = 2×Na + (Glicose/18) + (Ureia/6)',
    interpretacao: [
      { min: 0, max: 280, nivel: 'Baixa', cor: 'bg-blue-500', texto: '< 280 - Hipoosmolar' },
      { min: 280, max: 295, nivel: 'Normal', cor: 'bg-green-500', texto: '280-295 mOsm/kg - Normal' },
      { min: 295, max: 500, nivel: 'Elevada', cor: 'bg-red-500', texto: '> 295 - Hiperosmolar' }
    ],
    fonte: 'Fórmula clássica'
  },

  // Sódio corrigido
  na_corrigido: {
    nome: 'Sódio Corrigido pela Glicose',
    descricao: 'Correção do sódio para hiperglicemia',
    tipo: 'numerico',
    campos: [
      { id: 'na', label: 'Sódio medido (mEq/L)', min: 100, max: 200 },
      { id: 'glicose', label: 'Glicose (mg/dL)', min: 0, max: 1000 }
    ],
    formula: 'Na corrigido = Na + 0.016 × (Glicose - 100)',
    fonte: 'Katz, NEJM 1973'
  },

  // Gap osmolar
  gap_osmolar: {
    nome: 'Gap Osmolar',
    descricao: 'Diferença entre osmolaridade medida e calculada',
    tipo: 'numerico',
    campos: [
      { id: 'osm_medida', label: 'Osmolaridade medida (mOsm/kg)', min: 200, max: 500 },
      { id: 'na', label: 'Sódio (mEq/L)', min: 100, max: 200 },
      { id: 'glicose', label: 'Glicose (mg/dL)', min: 0, max: 1000 },
      { id: 'ureia', label: 'Ureia (mg/dL)', min: 0, max: 300 }
    ],
    formula: 'Gap = Osm medida - Osm calculada',
    interpretacao: [
      { min: 0, max: 10, nivel: 'Normal', cor: 'bg-green-500', texto: '< 10 - Normal' },
      { min: 10, max: 500, nivel: 'Aumentado', cor: 'bg-red-500', texto: '> 10 - Suspeita de intoxicação' }
    ],
    fonte: 'Kraut & Madias, Semin Dial 2011'
  },

  // Gradiente A-a
  gradiente_aa: {
    nome: 'Gradiente A-a O₂',
    descricao: 'Gradiente alvéolo-arterial de oxigênio',
    tipo: 'numerico',
    campos: [
      { id: 'fio2', label: 'FiO₂ (0.21-1.0)', min: 0.21, max: 1, step: 0.01 },
      { id: 'pao2', label: 'PaO₂ (mmHg)', min: 0, max: 600 },
      { id: 'paco2', label: 'PaCO₂ (mmHg)', min: 0, max: 150 }
    ],
    formula: 'A-a = PAO₂ - PaO₂, onde PAO₂ = FiO₂×(760-47) - PaCO₂/0.8',
    interpretacao: [
      { min: 0, max: 15, nivel: 'Normal', cor: 'bg-green-500', texto: '< 15 mmHg - Normal' },
      { min: 15, max: 600, nivel: 'Aumentado', cor: 'bg-red-500', texto: '> 15 mmHg - Alterado' }
    ],
    fonte: 'Gilbert & Keighley, Chest 1974'
  },

  // PaO2/FiO2
  pao2fio2: {
    nome: 'PaO₂/FiO₂',
    descricao: 'Relação PaO₂/FiO₂ (Índice de Kirby)',
    tipo: 'numerico',
    campos: [
      { id: 'pao2', label: 'PaO₂ (mmHg)', min: 0, max: 600 },
      { id: 'fio2', label: 'FiO₂ (0.21-1.0)', min: 0.21, max: 1, step: 0.01 }
    ],
    formula: 'P/F = PaO₂ / FiO₂',
    interpretacao: [
      { min: 0, max: 100, nivel: 'SDRA Grave', cor: 'bg-red-600', texto: '< 100 - SDRA grave' },
      { min: 100, max: 200, nivel: 'SDRA Moderada', cor: 'bg-orange-500', texto: '100-200 - SDRA moderada' },
      { min: 200, max: 300, nivel: 'SDRA Leve', cor: 'bg-yellow-500', texto: '200-300 - SDRA leve' },
      { min: 300, max: 1000, nivel: 'Normal', cor: 'bg-green-500', texto: '> 300 - Normal' }
    ],
    fonte: 'Berlin Definition ARDS'
  },

  // Clearance lactato
  clearance_lactato: {
    nome: 'Clearance de Lactato',
    descricao: 'Percentual de redução do lactato',
    tipo: 'numerico',
    campos: [
      { id: 'lactato_inicial', label: 'Lactato inicial (mmol/L)', min: 0, max: 30 },
      { id: 'lactato_final', label: 'Lactato final (mmol/L)', min: 0, max: 30 }
    ],
    formula: 'Clearance = [(Inicial - Final) / Inicial] × 100',
    interpretacao: [
      { min: 0, max: 10, nivel: 'Baixo', cor: 'bg-red-500', texto: '< 10% - Resposta inadequada' },
      { min: 10, max: 100, nivel: 'Adequado', cor: 'bg-green-500', texto: '≥ 10% - Resposta adequada' }
    ],
    fonte: 'Surviving Sepsis Campaign'
  },

  // Volume 30mL/kg
  volume_30ml: {
    nome: 'Volume 30mL/kg',
    descricao: 'Volume para ressuscitação inicial em sepse',
    tipo: 'numerico',
    campos: [
      { id: 'peso', label: 'Peso (kg)', min: 1, max: 300 }
    ],
    formula: 'Volume = 30 mL × Peso (kg)',
    fonte: 'Surviving Sepsis Campaign 2021'
  },

  // APRI
  apri: {
    nome: 'APRI',
    descricao: 'AST to Platelet Ratio Index',
    tipo: 'numerico',
    campos: [
      { id: 'ast', label: 'AST (U/L)', min: 0, max: 2000 },
      { id: 'plaquetas', label: 'Plaquetas (×10³/µL)', min: 1, max: 1000 }
    ],
    formula: 'APRI = [(AST/40) / Plaquetas] × 100',
    interpretacao: [
      { min: 0, max: 0.5, nivel: 'Fibrose improvável', cor: 'bg-green-500', texto: '< 0.5 - Baixa probabilidade' },
      { min: 0.5, max: 1.5, nivel: 'Indeterminado', cor: 'bg-yellow-500', texto: '0.5-1.5 - Indeterminado' },
      { min: 1.5, max: 100, nivel: 'Fibrose provável', cor: 'bg-red-500', texto: '> 1.5 - Alta probabilidade' }
    ],
    fonte: 'Wai et al., Hepatology 2003'
  },

  // FIB-4
  fib4: {
    nome: 'FIB-4',
    descricao: 'Índice de fibrose hepática',
    tipo: 'numerico',
    campos: [
      { id: 'idade', label: 'Idade (anos)', min: 1, max: 120 },
      { id: 'ast', label: 'AST (U/L)', min: 0, max: 2000 },
      { id: 'alt', label: 'ALT (U/L)', min: 0, max: 2000 },
      { id: 'plaquetas', label: 'Plaquetas (×10³/µL)', min: 1, max: 1000 }
    ],
    formula: 'FIB-4 = (Idade × AST) / (Plaquetas × √ALT)',
    interpretacao: [
      { min: 0, max: 1.45, nivel: 'Fibrose improvável', cor: 'bg-green-500', texto: '< 1.45 - Baixa probabilidade' },
      { min: 1.45, max: 3.25, nivel: 'Indeterminado', cor: 'bg-yellow-500', texto: '1.45-3.25 - Indeterminado' },
      { min: 3.25, max: 100, nivel: 'Fibrose avançada', cor: 'bg-red-500', texto: '> 3.25 - Alta probabilidade' }
    ],
    fonte: 'Sterling et al., Hepatology 2006'
  },

  // AST/ALT
  ast_alt: {
    nome: 'Razão AST/ALT',
    descricao: 'Relação entre transaminases (De Ritis)',
    tipo: 'numerico',
    campos: [
      { id: 'ast', label: 'AST (U/L)', min: 0, max: 2000 },
      { id: 'alt', label: 'ALT (U/L)', min: 0, max: 2000 }
    ],
    formula: 'Razão = AST / ALT',
    interpretacao: [
      { min: 0, max: 1, nivel: 'Hepatopatia crônica', cor: 'bg-blue-500', texto: '< 1 - Sugestivo de hepatite crônica' },
      { min: 1, max: 2, nivel: 'Indeterminado', cor: 'bg-yellow-500', texto: '1-2 - Inespecífico' },
      { min: 2, max: 100, nivel: 'Hepatopatia alcoólica', cor: 'bg-red-500', texto: '> 2 - Sugestivo de doença alcoólica' }
    ],
    fonte: 'De Ritis Ratio'
  },

  // CKD-EPI
  ckd_epi: {
    nome: 'CKD-EPI',
    descricao: 'Taxa de Filtração Glomerular estimada',
    tipo: 'numerico',
    campos: [
      { id: 'creatinina', label: 'Creatinina (mg/dL)', min: 0.1, max: 20 },
      { id: 'idade', label: 'Idade (anos)', min: 18, max: 120 },
      { id: 'sexo', label: 'Sexo', tipo: 'select', opcoes: ['M', 'F'] }
    ],
    formula: 'CKD-EPI 2021 (sem raça)',
    interpretacao: [
      { min: 90, max: 200, nivel: 'Normal', cor: 'bg-green-500', texto: '≥ 90 - TFG normal' },
      { min: 60, max: 89, nivel: 'Leve redução', cor: 'bg-blue-500', texto: '60-89 - Levemente reduzida' },
      { min: 45, max: 59, nivel: 'Redução leve-moderada', cor: 'bg-yellow-500', texto: '45-59 - DRC G3a' },
      { min: 30, max: 44, nivel: 'Redução moderada-grave', cor: 'bg-orange-500', texto: '30-44 - DRC G3b' },
      { min: 15, max: 29, nivel: 'Redução grave', cor: 'bg-red-500', texto: '15-29 - DRC G4' },
      { min: 0, max: 14, nivel: 'Falência renal', cor: 'bg-red-700', texto: '< 15 - DRC G5' }
    ],
    fonte: 'Levey et al., Ann Intern Med 2009'
  },

  // Cockcroft-Gault
  cockcroft: {
    nome: 'Cockcroft-Gault',
    descricao: 'Clearance de creatinina estimado',
    tipo: 'numerico',
    campos: [
      { id: 'idade', label: 'Idade (anos)', min: 18, max: 120 },
      { id: 'peso', label: 'Peso (kg)', min: 20, max: 300 },
      { id: 'creatinina', label: 'Creatinina (mg/dL)', min: 0.1, max: 20 },
      { id: 'sexo', label: 'Sexo', tipo: 'select', opcoes: ['M', 'F'] }
    ],
    formula: 'CrCl = [(140-idade) × peso] / (72 × Cr) × 0.85 (se F)',
    fonte: 'Cockcroft & Gault, Nephron 1976'
  },

  // MDRD
  mdrd: {
    nome: 'MDRD',
    descricao: 'Modification of Diet in Renal Disease',
    tipo: 'numerico',
    campos: [
      { id: 'creatinina', label: 'Creatinina (mg/dL)', min: 0.1, max: 20 },
      { id: 'idade', label: 'Idade (anos)', min: 18, max: 120 },
      { id: 'sexo', label: 'Sexo', tipo: 'select', opcoes: ['M', 'F'] }
    ],
    formula: 'TFG = 186 × Cr^(-1.154) × Idade^(-0.203) × 0.742 (se F)',
    fonte: 'Levey et al., Ann Intern Med 1999'
  },

  // Anion Gap
  anion_gap: {
    nome: 'Anion Gap',
    descricao: 'Diferença de ânions',
    tipo: 'numerico',
    campos: [
      { id: 'na', label: 'Sódio (mEq/L)', min: 100, max: 200 },
      { id: 'cl', label: 'Cloro (mEq/L)', min: 50, max: 150 },
      { id: 'hco3', label: 'Bicarbonato (mEq/L)', min: 5, max: 50 }
    ],
    formula: 'AG = Na - (Cl + HCO₃)',
    interpretacao: [
      { min: 0, max: 12, nivel: 'Normal', cor: 'bg-green-500', texto: '8-12 - Normal' },
      { min: 12, max: 100, nivel: 'Aumentado', cor: 'bg-red-500', texto: '> 12 - Acidose com AG aumentado' }
    ],
    fonte: 'Emmett & Narins, Medicine 1977'
  },

  // Anion Gap corrigido
  anion_gap_alb: {
    nome: 'Anion Gap Corrigido',
    descricao: 'Anion gap ajustado pela albumina',
    tipo: 'numerico',
    campos: [
      { id: 'na', label: 'Sódio (mEq/L)', min: 100, max: 200 },
      { id: 'cl', label: 'Cloro (mEq/L)', min: 50, max: 150 },
      { id: 'hco3', label: 'Bicarbonato (mEq/L)', min: 5, max: 50 },
      { id: 'albumina', label: 'Albumina (g/dL)', min: 1, max: 6 }
    ],
    formula: 'AG corrigido = AG + 2.5 × (4 - Albumina)',
    fonte: 'Figge et al., Crit Care Med 1998'
  },

  // FeNa
  fena: {
    nome: 'FeNa',
    descricao: 'Excreção fracionada de sódio',
    tipo: 'numerico',
    campos: [
      { id: 'na_urina', label: 'Na urinário (mEq/L)', min: 1, max: 300 },
      { id: 'na_plasma', label: 'Na plasmático (mEq/L)', min: 100, max: 200 },
      { id: 'cr_urina', label: 'Cr urinária (mg/dL)', min: 1, max: 500 },
      { id: 'cr_plasma', label: 'Cr plasmática (mg/dL)', min: 0.1, max: 20 }
    ],
    formula: 'FeNa = [(NaU × CrP) / (NaP × CrU)] × 100',
    interpretacao: [
      { min: 0, max: 1, nivel: 'Pré-renal', cor: 'bg-blue-500', texto: '< 1% - Sugestivo de pré-renal' },
      { min: 1, max: 2, nivel: 'Indeterminado', cor: 'bg-yellow-500', texto: '1-2% - Indeterminado' },
      { min: 2, max: 100, nivel: 'NTA', cor: 'bg-red-500', texto: '> 2% - Sugestivo de NTA' }
    ],
    fonte: 'Espinel, JAMA 1976'
  },

  // FeUreia
  feureia: {
    nome: 'FeUreia',
    descricao: 'Excreção fracionada de ureia',
    tipo: 'numerico',
    campos: [
      { id: 'ureia_urina', label: 'Ureia urinária (mg/dL)', min: 1, max: 3000 },
      { id: 'ureia_plasma', label: 'Ureia plasmática (mg/dL)', min: 1, max: 300 },
      { id: 'cr_urina', label: 'Cr urinária (mg/dL)', min: 1, max: 500 },
      { id: 'cr_plasma', label: 'Cr plasmática (mg/dL)', min: 0.1, max: 20 }
    ],
    formula: 'FeU = [(UU × CrP) / (UP × CrU)] × 100',
    interpretacao: [
      { min: 0, max: 35, nivel: 'Pré-renal', cor: 'bg-blue-500', texto: '< 35% - Sugestivo de pré-renal' },
      { min: 35, max: 100, nivel: 'NTA', cor: 'bg-red-500', texto: '> 35% - Sugestivo de NTA' }
    ],
    fonte: 'Carvounis et al., Am J Kidney Dis 2002'
  },

  // Osmolaridade urinária
  osm_urina: {
    nome: 'Osmolaridade Urinária',
    descricao: 'Osmolaridade urinária calculada',
    tipo: 'numerico',
    campos: [
      { id: 'na_urina', label: 'Na urinário (mEq/L)', min: 1, max: 300 },
      { id: 'k_urina', label: 'K urinário (mEq/L)', min: 1, max: 200 },
      { id: 'ureia_urina', label: 'Ureia urinária (mg/dL)', min: 1, max: 3000 }
    ],
    formula: 'Osm = 2 × (Na + K) + (Ureia/6)',
    fonte: 'Fórmula clássica'
  },

  // Déficit de água livre
  deficit_agua: {
    nome: 'Déficit de Água Livre',
    descricao: 'Cálculo para correção de hipernatremia',
    tipo: 'numerico',
    campos: [
      { id: 'na_atual', label: 'Na atual (mEq/L)', min: 100, max: 200 },
      { id: 'peso', label: 'Peso (kg)', min: 1, max: 300 }
    ],
    formula: 'Déficit = Peso × 0.6 × [(Na/140) - 1]',
    fonte: 'Adrogue & Madias, NEJM 2000'
  },

  // Shock Index
  shock_index: {
    nome: 'Shock Index',
    descricao: 'FC / PAS',
    tipo: 'numerico',
    campos: [
      { id: 'fc', label: 'Frequência Cardíaca (bpm)', min: 30, max: 250 },
      { id: 'pas', label: 'PAS (mmHg)', min: 40, max: 250 }
    ],
    formula: 'SI = FC / PAS',
    interpretacao: [
      { min: 0, max: 0.6, nivel: 'Normal', cor: 'bg-green-500', texto: '< 0.6 - Normal' },
      { min: 0.6, max: 1, nivel: 'Choque leve', cor: 'bg-yellow-500', texto: '0.6-1 - Atenção' },
      { min: 1, max: 10, nivel: 'Choque', cor: 'bg-red-500', texto: '> 1 - Choque' }
    ],
    fonte: 'Allgöwer & Burri, 1967'
  },

  // Cálcio corrigido
  calcio_corrigido: {
    nome: 'Cálcio Corrigido',
    descricao: 'Ajuste do cálcio pela albumina',
    tipo: 'numerico',
    campos: [
      { id: 'calcio', label: 'Cálcio (mg/dL)', min: 1, max: 20 },
      { id: 'albumina', label: 'Albumina (g/dL)', min: 1, max: 6 }
    ],
    formula: 'Ca corrigido = Ca + 0.8 × (4 - Albumina)',
    interpretacao: [
      { min: 0, max: 8.5, nivel: 'Hipocalcemia', cor: 'bg-blue-500', texto: '< 8.5 mg/dL - Baixo' },
      { min: 8.5, max: 10.5, nivel: 'Normal', cor: 'bg-green-500', texto: '8.5-10.5 mg/dL - Normal' },
      { min: 10.5, max: 30, nivel: 'Hipercalcemia', cor: 'bg-red-500', texto: '> 10.5 mg/dL - Elevado' }
    ],
    fonte: 'Payne et al., BMJ 1973'
  },

  // IMC Pediátrico
  imc_ped: {
    nome: 'IMC Pediátrico',
    descricao: 'IMC com referência para faixa etária',
    tipo: 'numerico',
    campos: [
      { id: 'peso', label: 'Peso (kg)', min: 1, max: 150 },
      { id: 'altura', label: 'Altura (cm)', min: 30, max: 200 }
    ],
    formula: 'IMC = Peso / Altura²',
    fonte: 'CDC/OMS'
  },

  // BSA Pediátrica
  bsa_ped: {
    nome: 'BSA Pediátrica',
    descricao: 'Superfície corporal pediátrica',
    tipo: 'numerico',
    campos: [
      { id: 'peso', label: 'Peso (kg)', min: 1, max: 150 },
      { id: 'altura', label: 'Altura (cm)', min: 30, max: 200 }
    ],
    formula: 'BSA = √[(altura × peso) / 3600]',
    fonte: 'Mosteller'
  },

  // Dose por peso
  dose_peso: {
    nome: 'Dose por Peso',
    descricao: 'Cálculo de dose pediátrica',
    tipo: 'numerico',
    campos: [
      { id: 'peso', label: 'Peso (kg)', min: 1, max: 150 },
      { id: 'dose_por_kg', label: 'Dose (mg/kg)', min: 0, max: 1000 }
    ],
    formula: 'Dose total = Peso × Dose/kg',
    fonte: 'Cálculo padrão'
  },

  // Holliday-Segar
  holliday_segar: {
    nome: 'Holliday-Segar',
    descricao: 'Manutenção hídrica pediátrica',
    tipo: 'numerico',
    campos: [
      { id: 'peso', label: 'Peso (kg)', min: 1, max: 100 }
    ],
    formula: '100 mL/kg (0-10kg) + 50 mL/kg (10-20kg) + 20 mL/kg (>20kg)',
    fonte: 'Holliday & Segar, Pediatrics 1957'
  },

  // Equivalência opioides
  equiv_opioides: {
    nome: 'Equivalência de Opioides',
    descricao: 'Conversão de morfina equivalente',
    tipo: 'numerico',
    campos: [
      { id: 'dose_atual', label: 'Dose atual (mg)', min: 0, max: 1000 },
      { id: 'fator_conversao', label: 'Fator de conversão', min: 0, max: 100, step: 0.1 }
    ],
    formula: 'Dose nova = Dose atual × Fator',
    fonte: 'CDC Opioid Guidelines'
  },

  // Gotejamento
  gotejamento: {
    nome: 'Gotejamento',
    descricao: 'Conversão mL/h para gotas/min',
    tipo: 'numerico',
    campos: [
      { id: 'ml_h', label: 'Volume (mL/h)', min: 0, max: 3000 }
    ],
    formula: 'Gotas/min = (mL/h × 20) / 60',
    fonte: 'Padrão: 20 gotas/mL'
  },

  // Wells TVP
  wells_tvp: {
    nome: 'Wells Score - TVP',
    descricao: 'Probabilidade de trombose venosa profunda',
    criterios: [
      { id: 'cancer', label: 'Câncer ativo', pontos: 1 },
      { id: 'paralisia', label: 'Paralisia/paresia/imobilização recente MMII', pontos: 1 },
      { id: 'acamado', label: 'Acamado > 3 dias ou cirurgia nas últimas 12 semanas', pontos: 1 },
      { id: 'dor_trajeto', label: 'Dor localizada no trajeto do sistema venoso profundo', pontos: 1 },
      { id: 'edema', label: 'Edema de toda a perna', pontos: 1 },
      { id: 'panturrilha', label: 'Panturrilha > 3cm maior que a contralateral', pontos: 1 },
      { id: 'cacifo', label: 'Edema com cacifo (> sintomático)', pontos: 1 },
      { id: 'veias_colaterais', label: 'Veias colaterais superficiais', pontos: 1 },
      { id: 'tvp_previa', label: 'TVP prévia documentada', pontos: 1 },
      { id: 'alternativo', label: 'Diagnóstico alternativo tão ou mais provável', pontos: -2 }
    ],
    interpretacao: [
      { min: -2, max: 0, nivel: 'Baixa probabilidade', cor: 'bg-green-500', texto: 'Probabilidade ~5%' },
      { min: 1, max: 2, nivel: 'Probabilidade moderada', cor: 'bg-yellow-500', texto: 'Probabilidade ~17%' },
      { min: 3, max: 10, nivel: 'Alta probabilidade', cor: 'bg-red-500', texto: 'Probabilidade ~53%' }
    ],
    fonte: 'Wells et al., Lancet 1997'
  },

  // PERC
  perc: {
    nome: 'PERC Rule',
    descricao: 'Pulmonary Embolism Rule-out Criteria',
    criterios: [
      { id: 'idade', label: 'Idade ≥ 50 anos', pontos: 1 },
      { id: 'fc', label: 'FC ≥ 100 bpm', pontos: 1 },
      { id: 'spo2', label: 'SpO₂ < 95%', pontos: 1 },
      { id: 'hemoptise', label: 'Hemoptise', pontos: 1 },
      { id: 'uso_estrogeno', label: 'Uso de estrógeno', pontos: 1 },
      { id: 'cirurgia', label: 'Cirurgia/trauma com anestesia geral nas últimas 4 semanas', pontos: 1 },
      { id: 'tep_tvp_previo', label: 'TEP ou TVP prévio', pontos: 1 },
      { id: 'edema_unilateral', label: 'Edema unilateral de MMII', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'PERC negativo', cor: 'bg-green-500', texto: 'TEP pode ser descartado clinicamente (risco < 1.4%)' },
      { min: 1, max: 8, nivel: 'PERC positivo', cor: 'bg-red-500', texto: 'Investigação adicional necessária' }
    ],
    fonte: 'Kline et al., J Thromb Haemost 2004'
  },

  // PESI
  pesi: {
    nome: 'PESI',
    descricao: 'Pulmonary Embolism Severity Index',
    criterios: [
      { id: 'idade', label: 'Idade (anos)', pontos: 'idade' },
      { id: 'sexo_masc', label: 'Sexo masculino', pontos: 10 },
      { id: 'cancer', label: 'Câncer', pontos: 30 },
      { id: 'icc', label: 'Insuficiência cardíaca', pontos: 10 },
      { id: 'dpoc', label: 'DPOC', pontos: 10 },
      { id: 'fc', label: 'FC ≥ 110 bpm', pontos: 20 },
      { id: 'pas', label: 'PAS < 100 mmHg', pontos: 30 },
      { id: 'fr', label: 'FR ≥ 30 irpm', pontos: 20 },
      { id: 'temp', label: 'Temperatura < 36°C', pontos: 20 },
      { id: 'mental', label: 'Alteração do estado mental', pontos: 60 },
      { id: 'spo2', label: 'SpO₂ < 90%', pontos: 20 }
    ],
    interpretacao: [
      { min: 0, max: 65, nivel: 'Classe I (Muito baixo risco)', cor: 'bg-green-500', texto: 'Mortalidade 30d: 0-1.6%' },
      { min: 66, max: 85, nivel: 'Classe II (Baixo risco)', cor: 'bg-blue-500', texto: 'Mortalidade 30d: 1.7-3.5%' },
      { min: 86, max: 105, nivel: 'Classe III (Risco moderado)', cor: 'bg-yellow-500', texto: 'Mortalidade 30d: 3.2-7.1%' },
      { min: 106, max: 125, nivel: 'Classe IV (Alto risco)', cor: 'bg-orange-500', texto: 'Mortalidade 30d: 4-11.4%' },
      { min: 126, max: 500, nivel: 'Classe V (Risco muito alto)', cor: 'bg-red-500', texto: 'Mortalidade 30d: 10-24.5%' }
    ],
    fonte: 'Aujesky et al., Lancet 2005'
  },

  // sPESI
  spesi: {
    nome: 'sPESI',
    descricao: 'Simplified Pulmonary Embolism Severity Index',
    criterios: [
      { id: 'idade', label: 'Idade > 80 anos', pontos: 1 },
      { id: 'cancer', label: 'História de câncer', pontos: 1 },
      { id: 'cardiopulmonar', label: 'Doença cardiopulmonar crônica', pontos: 1 },
      { id: 'fc', label: 'FC ≥ 110 bpm', pontos: 1 },
      { id: 'pas', label: 'PAS < 100 mmHg', pontos: 1 },
      { id: 'spo2', label: 'SpO₂ < 90%', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Mortalidade 30d: 1.1%' },
      { min: 1, max: 6, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Mortalidade 30d: 8.9%' }
    ],
    fonte: 'Jiménez et al., Am J Med 2010'
  },

  // ADD-RS
  add_rs: {
    nome: 'ADD-RS',
    descricao: 'Aortic Dissection Detection Risk Score',
    criterios: [
      { id: 'alto_risco', label: 'Condição de alto risco (Marfan, válvula bicúspide, cirurgia aórtica prévia)', pontos: 1 },
      { id: 'dor_alta_risco', label: 'Dor com características de alto risco (súbita, grave, lancinante)', pontos: 1 },
      { id: 'exame_alto_risco', label: 'Exame físico de alto risco (déficit pulso, sopro IAo, choque)', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Risco < 1%' },
      { min: 1, max: 3, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Indicação de imagem vascular' }
    ],
    fonte: 'Rogers et al., Circulation 2011'
  },

  // NYHA
  nyha: {
    nome: 'NYHA',
    descricao: 'Classificação Funcional da ICC',
    tipo: 'seletivo',
    grupos: [
      {
        nome: 'Classe Funcional',
        opcoes: [
          { valor: 1, label: 'Classe I - Sem limitação. Atividades habituais não causam fadiga' },
          { valor: 2, label: 'Classe II - Leve limitação. Confortável em repouso, mas fadiga em atividades habituais' },
          { valor: 3, label: 'Classe III - Limitação moderada. Confortável em repouso, mas fadiga em atividades leves' },
          { valor: 4, label: 'Classe IV - Sintomas em repouso. Incapaz de realizar qualquer atividade' }
        ]
      }
    ],
    interpretacao: [
      { min: 1, max: 1, nivel: 'NYHA I', cor: 'bg-green-500', texto: 'Sem limitação funcional' },
      { min: 2, max: 2, nivel: 'NYHA II', cor: 'bg-blue-500', texto: 'Limitação leve' },
      { min: 3, max: 3, nivel: 'NYHA III', cor: 'bg-orange-500', texto: 'Limitação moderada' },
      { min: 4, max: 4, nivel: 'NYHA IV', cor: 'bg-red-500', texto: 'Sintomas em repouso' }
    ],
    fonte: 'NYHA Functional Classification'
  },

  // mRS
  mrs: {
    nome: 'Modified Rankin Scale (mRS)',
    descricao: 'Escala de incapacidade funcional pós-AVC',
    tipo: 'seletivo',
    grupos: [
      {
        nome: 'Grau de Incapacidade',
        opcoes: [
          { valor: 0, label: '0 - Sem sintomas' },
          { valor: 1, label: '1 - Sem incapacidade significativa (pode fazer atividades habituais)' },
          { valor: 2, label: '2 - Incapacidade leve (incapaz de fazer todas as atividades, mas independente)' },
          { valor: 3, label: '3 - Incapacidade moderada (requer ajuda, mas anda sem assistência)' },
          { valor: 4, label: '4 - Incapacidade moderada-grave (incapaz de andar/cuidados sem ajuda)' },
          { valor: 5, label: '5 - Incapacidade grave (acamado, incontinente, necessita cuidados constantes)' },
          { valor: 6, label: '6 - Óbito' }
        ]
      }
    ],
    interpretacao: [
      { min: 0, max: 2, nivel: 'Independência funcional', cor: 'bg-green-500', texto: 'Sem ou com leve incapacidade' },
      { min: 3, max: 5, nivel: 'Dependência funcional', cor: 'bg-red-500', texto: 'Incapacidade moderada a grave' },
      { min: 6, max: 6, nivel: 'Óbito', cor: 'bg-black', texto: 'Óbito' }
    ],
    fonte: 'Rankin, 1957; van Swieten et al., Stroke 1988'
  },

  // ABCD2
  abcd2: {
    nome: 'ABCD² Score',
    descricao: 'Risco de AVC após ataque isquêmico transitório',
    tipo: 'seletivo',
    grupos: [
      { 
        nome: 'Age (Idade)', 
        opcoes: [
          { valor: 0, label: '< 60 anos' }, 
          { valor: 1, label: '≥ 60 anos' }
        ] 
      },
      { 
        nome: 'Blood Pressure (PA)', 
        opcoes: [
          { valor: 0, label: 'Normal' }, 
          { valor: 1, label: 'PAS ≥ 140 ou PAD ≥ 90 mmHg' }
        ] 
      },
      { 
        nome: 'Clinical Features', 
        opcoes: [
          { valor: 0, label: 'Outros sintomas' },
          { valor: 1, label: 'Déficit motor isolado' }, 
          { valor: 2, label: 'Distúrbio de fala sem déficit motor' }
        ] 
      },
      { 
        nome: 'Duration', 
        opcoes: [
          { valor: 0, label: '< 10 minutos' },
          { valor: 1, label: '10-59 minutos' }, 
          { valor: 2, label: '≥ 60 minutos' }
        ] 
      },
      { 
        nome: 'Diabetes', 
        opcoes: [
          { valor: 0, label: 'Ausente' }, 
          { valor: 1, label: 'Presente' }
        ] 
      }
    ],
    interpretacao: [
      { min: 0, max: 3, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Risco 2d: 1%; 7d: 1.2%' },
      { min: 4, max: 5, nivel: 'Risco moderado', cor: 'bg-yellow-500', texto: 'Risco 2d: 4.1%; 7d: 5.9%' },
      { min: 6, max: 7, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Risco 2d: 8.1%; 7d: 11.7%' }
    ],
    fonte: 'Johnston et al., Lancet 2007'
  },

  // ASPECTS
  aspects: {
    nome: 'ASPECTS',
    descricao: 'Alberta Stroke Program Early CT Score',
    criterios: [
      { id: 'c', label: 'Caudado', pontos: -1 },
      { id: 'l', label: 'Lentiforme', pontos: -1 },
      { id: 'ic', label: 'Cápsula interna', pontos: -1 },
      { id: 'ins', label: 'Ínsula', pontos: -1 },
      { id: 'm1', label: 'M1 (córtex frontal anterior ACM)', pontos: -1 },
      { id: 'm2', label: 'M2 (córtex frontal lateral ACM)', pontos: -1 },
      { id: 'm3', label: 'M3 (córtex parietal posterior ACM)', pontos: -1 },
      { id: 'm4', label: 'M4 (córtex temporal anterior)', pontos: -1 },
      { id: 'm5', label: 'M5 (córtex temporal lateral)', pontos: -1 },
      { id: 'm6', label: 'M6 (córtex temporal posterior)', pontos: -1 }
    ],
    base: 10,
    interpretacao: [
      { min: 0, max: 7, nivel: 'Prognóstico desfavorável', cor: 'bg-red-500', texto: '≤ 7 - Pior prognóstico, risco de hemorragia' },
      { min: 8, max: 10, nivel: 'Prognóstico favorável', cor: 'bg-green-500', texto: '8-10 - Melhor prognóstico' }
    ],
    fonte: 'Barber et al., Lancet 2000'
  },

  // CRB-65
  crb65: {
    nome: 'CRB-65',
    descricao: 'CURB-65 sem ureia (ambulatorial)',
    criterios: [
      { id: 'c', label: 'Confusão mental', pontos: 1 },
      { id: 'r', label: 'FR ≥ 30 irpm', pontos: 1 },
      { id: 'b', label: 'PAS < 90 ou PAD ≤ 60 mmHg', pontos: 1 },
      { id: '65', label: 'Idade ≥ 65 anos', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Mortalidade < 1%' },
      { min: 1, max: 2, nivel: 'Risco intermediário', cor: 'bg-yellow-500', texto: 'Mortalidade 2.7-8.15%' },
      { min: 3, max: 4, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Mortalidade 9.2-31%' }
    ],
    fonte: 'BTS Guidelines 2009'
  },

  // ROX Index
  rox_index: {
    nome: 'ROX Index',
    descricao: 'Preditor de falha de cateter nasal de alto fluxo',
    tipo: 'numerico',
    campos: [
      { id: 'spo2', label: 'SpO₂ (%)', min: 50, max: 100 },
      { id: 'fio2', label: 'FiO₂ (%)', min: 21, max: 100 },
      { id: 'fr', label: 'Frequência Respiratória (irpm)', min: 5, max: 60 }
    ],
    formula: 'ROX = (SpO₂/FiO₂) / FR',
    interpretacao: [
      { min: 0, max: 3.85, nivel: 'Alto risco de falha', cor: 'bg-red-500', texto: '< 3.85 - Alto risco IOT' },
      { min: 3.85, max: 4.88, nivel: 'Risco intermediário', cor: 'bg-yellow-500', texto: '3.85-4.88 - Monitorização' },
      { min: 4.88, max: 100, nivel: 'Baixo risco de falha', cor: 'bg-green-500', texto: '> 4.88 - Sucesso provável' }
    ],
    fonte: 'Roca et al., Intensive Care Med 2016'
  },

  // SOFA
  sofa: {
    nome: 'SOFA Score',
    descricao: 'Sequential Organ Failure Assessment',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Respiratório (PaO₂/FiO₂)', opcoes: [{ valor: 0, label: '≥ 400' }, { valor: 1, label: '< 400' }, { valor: 2, label: '< 300' }, { valor: 3, label: '< 200 (VM)' }, { valor: 4, label: '< 100 (VM)' }] },
      { nome: 'Coagulação (Plaquetas ×10³)', opcoes: [{ valor: 0, label: '≥ 150' }, { valor: 1, label: '< 150' }, { valor: 2, label: '< 100' }, { valor: 3, label: '< 50' }, { valor: 4, label: '< 20' }] },
      { nome: 'Hepático (Bilirrubina mg/dL)', opcoes: [{ valor: 0, label: '< 1.2' }, { valor: 1, label: '1.2-1.9' }, { valor: 2, label: '2-5.9' }, { valor: 3, label: '6-11.9' }, { valor: 4, label: '≥ 12' }] },
      { nome: 'Cardiovascular', opcoes: [{ valor: 0, label: 'PAM ≥ 70' }, { valor: 1, label: 'PAM < 70' }, { valor: 2, label: 'Dopamina ≤ 5 ou dobutamina' }, { valor: 3, label: 'Dopamina > 5 ou noradrenalina ≤ 0.1' }, { valor: 4, label: 'Dopamina > 15 ou noradrenalina > 0.1' }] },
      { nome: 'SNC (Glasgow)', opcoes: [{ valor: 0, label: '15' }, { valor: 1, label: '13-14' }, { valor: 2, label: '10-12' }, { valor: 3, label: '6-9' }, { valor: 4, label: '< 6' }] },
      { nome: 'Renal (Creatinina ou Diurese)', opcoes: [{ valor: 0, label: 'Cr < 1.2' }, { valor: 1, label: 'Cr 1.2-1.9' }, { valor: 2, label: 'Cr 2-3.4' }, { valor: 3, label: 'Cr 3.5-4.9 ou diurese < 500 mL' }, { valor: 4, label: 'Cr ≥ 5 ou diurese < 200 mL' }] }
    ],
    interpretacao: [
      { min: 0, max: 6, nivel: 'Baixa disfunção', cor: 'bg-green-500', texto: 'Mortalidade < 10%' },
      { min: 7, max: 9, nivel: 'Disfunção moderada', cor: 'bg-yellow-500', texto: 'Mortalidade 15-20%' },
      { min: 10, max: 12, nivel: 'Disfunção grave', cor: 'bg-orange-500', texto: 'Mortalidade 40-50%' },
      { min: 13, max: 24, nivel: 'Disfunção muito grave', cor: 'bg-red-500', texto: 'Mortalidade > 80%' }
    ],
    fonte: 'Vincent et al., Intensive Care Med 1996'
  },

  // NEWS2
  news2: {
    nome: 'NEWS2',
    descricao: 'National Early Warning Score 2',
    tipo: 'seletivo',
    grupos: [
      { nome: 'FR (irpm)', opcoes: [{ valor: 3, label: '≤ 8' }, { valor: 1, label: '9-11' }, { valor: 0, label: '12-20' }, { valor: 2, label: '21-24' }, { valor: 3, label: '≥ 25' }] },
      { nome: 'SpO₂ Escala 1 (%)', opcoes: [{ valor: 3, label: '≤ 91' }, { valor: 2, label: '92-93' }, { valor: 1, label: '94-95' }, { valor: 0, label: '≥ 96' }] },
      { nome: 'O₂ Suplementar', opcoes: [{ valor: 0, label: 'Ar ambiente' }, { valor: 2, label: 'Oxigênio' }] },
      { nome: 'PAS (mmHg)', opcoes: [{ valor: 3, label: '≤ 90' }, { valor: 2, label: '91-100' }, { valor: 1, label: '101-110' }, { valor: 0, label: '111-219' }, { valor: 3, label: '≥ 220' }] },
      { nome: 'FC (bpm)', opcoes: [{ valor: 3, label: '≤ 40' }, { valor: 1, label: '41-50' }, { valor: 0, label: '51-90' }, { valor: 1, label: '91-110' }, { valor: 2, label: '111-130' }, { valor: 3, label: '≥ 131' }] },
      { nome: 'Consciência', opcoes: [{ valor: 0, label: 'Alerta' }, { valor: 3, label: 'Confuso/Agitado/CVPU' }] },
      { nome: 'Temperatura (°C)', opcoes: [{ valor: 3, label: '≤ 35' }, { valor: 1, label: '35.1-36' }, { valor: 0, label: '36.1-38' }, { valor: 1, label: '38.1-39' }, { valor: 2, label: '≥ 39.1' }] }
    ],
    interpretacao: [
      { min: 0, max: 4, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Monitorização de rotina' },
      { min: 5, max: 6, nivel: 'Risco médio', cor: 'bg-yellow-500', texto: 'Alerta - Avaliação urgente' },
      { min: 7, max: 20, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Emergência - Avaliação imediata' }
    ],
    fonte: 'Royal College of Physicians 2017'
  },

  // Critérios de Duke
  duke: {
    nome: 'Critérios de Duke',
    descricao: 'Diagnóstico de endocardite infecciosa',
    tipo: 'criterios_complexos',
    info: 'Diagnóstico: 2 critérios maiores OU 1 maior + 3 menores OU 5 menores',
    fonte: 'Durack et al., Am J Med 1994; Li et al., Clin Infect Dis 2000'
  },

  // Glasgow-Blatchford
  blatchford: {
    nome: 'Glasgow-Blatchford Score',
    descricao: 'Risco em hemorragia digestiva alta',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Ureia (mmol/L)', opcoes: [{ valor: 0, label: '< 6.5' }, { valor: 2, label: '6.5-8' }, { valor: 3, label: '8-10' }, { valor: 4, label: '10-25' }, { valor: 6, label: '≥ 25' }] },
      { nome: 'Hemoglobina (g/dL) - Homem', opcoes: [{ valor: 0, label: '≥ 13' }, { valor: 1, label: '12-13' }, { valor: 3, label: '10-12' }, { valor: 6, label: '< 10' }] },
      { nome: 'PAS (mmHg)', opcoes: [{ valor: 0, label: '≥ 110' }, { valor: 1, label: '100-109' }, { valor: 2, label: '90-99' }, { valor: 3, label: '< 90' }] },
      { nome: 'FC (bpm)', opcoes: [{ valor: 0, label: '< 100' }, { valor: 1, label: '≥ 100' }] },
      { nome: 'Melena', opcoes: [{ valor: 0, label: 'Não' }, { valor: 1, label: 'Sim' }] },
      { nome: 'Síncope', opcoes: [{ valor: 0, label: 'Não' }, { valor: 2, label: 'Sim' }] },
      { nome: 'Hepatopatia', opcoes: [{ valor: 0, label: 'Não' }, { valor: 2, label: 'Sim' }] },
      { nome: 'ICC', opcoes: [{ valor: 0, label: 'Não' }, { valor: 2, label: 'Sim' }] }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'Muito baixo risco', cor: 'bg-green-500', texto: 'Alta ambulatorial possível' },
      { min: 1, max: 5, nivel: 'Baixo risco', cor: 'bg-blue-500', texto: 'Considerar alta precoce' },
      { min: 6, max: 23, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Necessita intervenção' }
    ],
    fonte: 'Blatchford et al., Lancet 2000'
  },

  // Rockall
  rockall: {
    nome: 'Rockall Score',
    descricao: 'Mortalidade e re-sangramento em HDA',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Idade', opcoes: [{ valor: 0, label: '< 60' }, { valor: 1, label: '60-79' }, { valor: 2, label: '≥ 80' }] },
      { nome: 'Choque', opcoes: [{ valor: 0, label: 'Sem choque (PAS ≥ 100, FC < 100)' }, { valor: 1, label: 'Taquicardia (FC ≥ 100)' }, { valor: 2, label: 'Hipotensão (PAS < 100)' }] },
      { nome: 'Comorbidades', opcoes: [{ valor: 0, label: 'Nenhuma' }, { valor: 2, label: 'ICC, DAC ou comorbidade maior' }, { valor: 3, label: 'IR, IH ou neoplasia disseminada' }] },
      { nome: 'Diagnóstico endoscópico', opcoes: [{ valor: 0, label: 'Mallory-Weiss/sem lesão' }, { valor: 1, label: 'Outras lesões' }, { valor: 2, label: 'Neoplasia GI' }] },
      { nome: 'Estigmas de sangramento', opcoes: [{ valor: 0, label: 'Ausente/mancha escura' }, { valor: 2, label: 'Sangue, vaso visível, coágulo' }] }
    ],
    interpretacao: [
      { min: 0, max: 2, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Mortalidade < 0.2%' },
      { min: 3, max: 4, nivel: 'Risco intermediário', cor: 'bg-yellow-500', texto: 'Mortalidade 2.9%' },
      { min: 5, max: 11, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Mortalidade 17-44%' }
    ],
    fonte: 'Rockall et al., Gut 1996'
  },

  // MELD-Na
  meld_na: {
    nome: 'MELD-Na',
    descricao: 'MELD com ajuste pelo sódio',
    tipo: 'numerico',
    campos: [
      { id: 'bilirrubina', label: 'Bilirrubina (mg/dL)', min: 1, max: 50 },
      { id: 'inr', label: 'INR', min: 1, max: 10 },
      { id: 'creatinina', label: 'Creatinina (mg/dL)', min: 0.5, max: 15 },
      { id: 'na', label: 'Sódio (mEq/L)', min: 100, max: 150 },
      { id: 'dialise', label: 'Diálise ≥ 2x última semana', tipo: 'checkbox' }
    ],
    formula: 'MELD-Na = MELD + 1.32 × (137 - Na) - [0.033 × MELD × (137 - Na)]',
    fonte: 'Kim et al., Gastroenterology 2008'
  },

  // BISAP
  bisap: {
    nome: 'BISAP',
    descricao: 'Gravidade de pancreatite aguda',
    criterios: [
      { id: 'b', label: 'BUN > 25 mg/dL', pontos: 1 },
      { id: 'i', label: 'Impaired mental status (alteração do estado mental)', pontos: 1 },
      { id: 's', label: 'SIRS presente', pontos: 1 },
      { id: 'a', label: 'Age > 60 anos', pontos: 1 },
      { id: 'p', label: 'Derrame pleural presente', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 2, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Mortalidade < 2%' },
      { min: 3, max: 5, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Mortalidade 15-35%' }
    ],
    fonte: 'Wu et al., Gut 2008'
  },

  // Alvarado
  alvarado: {
    nome: 'Alvarado Score',
    descricao: 'Probabilidade de apendicite aguda',
    criterios: [
      { id: 'dor_migratoria', label: 'Dor migratória para FID', pontos: 1 },
      { id: 'anorexia', label: 'Anorexia', pontos: 1 },
      { id: 'nausea', label: 'Náusea/vômito', pontos: 1 },
      { id: 'dor_fid', label: 'Dor à palpação em FID', pontos: 2 },
      { id: 'descompressao', label: 'Dor à descompressão brusca', pontos: 1 },
      { id: 'febre', label: 'Febre > 37.5°C', pontos: 1 },
      { id: 'leucocitose', label: 'Leucocitose > 10.000', pontos: 2 },
      { id: 'desvio', label: 'Desvio para esquerda', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 4, nivel: 'Baixa probabilidade', cor: 'bg-green-500', texto: 'Apendicite improvável' },
      { min: 5, max: 6, nivel: 'Probabilidade intermediária', cor: 'bg-yellow-500', texto: 'Observação/imagem' },
      { min: 7, max: 10, nivel: 'Alta probabilidade', cor: 'bg-red-500', texto: 'Indicação cirúrgica' }
    ],
    fonte: 'Alvarado, Ann Emerg Med 1986'
  },

  // AIR Score
  air: {
    nome: 'AIR Score',
    descricao: 'Appendicitis Inflammatory Response',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Vômitos', opcoes: [{ valor: 0, label: 'Não' }, { valor: 1, label: 'Sim' }] },
      { nome: 'Dor em FID', opcoes: [{ valor: 0, label: 'Leve' }, { valor: 1, label: 'Moderada' }, { valor: 2, label: 'Intensa' }] },
      { nome: 'Descompressão', opcoes: [{ valor: 0, label: 'Leve' }, { valor: 1, label: 'Moderada' }, { valor: 2, label: 'Intensa' }, { valor: 3, label: 'Muito intensa' }] },
      { nome: 'Temperatura (°C)', opcoes: [{ valor: 0, label: '< 38.5' }, { valor: 1, label: '≥ 38.5' }] },
      { nome: 'Leucócitos', opcoes: [{ valor: 0, label: 'Normal' }, { valor: 1, label: '10-15 mil' }, { valor: 2, label: '> 15 mil' }] },
      { nome: 'Neutrófilos (%)', opcoes: [{ valor: 0, label: '< 70' }, { valor: 1, label: '70-84' }, { valor: 2, label: '≥ 85' }] },
      { nome: 'PCR (mg/L)', opcoes: [{ valor: 0, label: '< 10' }, { valor: 1, label: '10-49' }, { valor: 2, label: '≥ 50' }] }
    ],
    interpretacao: [
      { min: 0, max: 4, nivel: 'Baixa probabilidade', cor: 'bg-green-500', texto: 'Apendicite improvável (6%)' },
      { min: 5, max: 8, nivel: 'Probabilidade intermediária', cor: 'bg-yellow-500', texto: 'Imagem recomendada (47%)' },
      { min: 9, max: 12, nivel: 'Alta probabilidade', cor: 'bg-red-500', texto: 'Cirurgia indicada (87%)' }
    ],
    fonte: 'Andersson et al., World J Surg 2008'
  },

  // KDIGO
  kdigo: {
    nome: 'KDIGO - IRA',
    descricao: 'Estadiamento de Injúria Renal Aguda',
    tipo: 'seletivo',
    grupos: [
      {
        nome: 'Critério de Creatinina ou Diurese',
        opcoes: [
          { valor: 0, label: 'Sem IRA' },
          { valor: 1, label: 'Estágio 1: Cr ↑ 0.3 mg/dL ou 1.5-1.9× basal OU diurese < 0.5 mL/kg/h por 6-12h' },
          { valor: 2, label: 'Estágio 2: Cr 2-2.9× basal OU diurese < 0.5 mL/kg/h por ≥ 12h' },
          { valor: 3, label: 'Estágio 3: Cr ≥ 3× basal ou ≥ 4 mg/dL OU diurese < 0.3 mL/kg/h ≥ 24h OU anúria ≥ 12h OU TRS' }
        ]
      }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'Sem IRA', cor: 'bg-green-500', texto: 'Função renal preservada' },
      { min: 1, max: 1, nivel: 'IRA Estágio 1', cor: 'bg-yellow-500', texto: 'IRA leve' },
      { min: 2, max: 2, nivel: 'IRA Estágio 2', cor: 'bg-orange-500', texto: 'IRA moderada' },
      { min: 3, max: 3, nivel: 'IRA Estágio 3', cor: 'bg-red-500', texto: 'IRA grave' }
    ],
    fonte: 'KDIGO Clinical Practice Guideline 2012'
  },

  // RTS
  rts: {
    nome: 'Revised Trauma Score (RTS)',
    descricao: 'Gravidade de trauma',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Glasgow', opcoes: [{ valor: 4, label: '13-15' }, { valor: 3, label: '9-12' }, { valor: 2, label: '6-8' }, { valor: 1, label: '4-5' }, { valor: 0, label: '3' }] },
      { nome: 'PAS (mmHg)', opcoes: [{ valor: 4, label: '> 89' }, { valor: 3, label: '76-89' }, { valor: 2, label: '50-75' }, { valor: 1, label: '1-49' }, { valor: 0, label: '0' }] },
      { nome: 'FR (irpm)', opcoes: [{ valor: 4, label: '10-29' }, { valor: 3, label: '> 29' }, { valor: 2, label: '6-9' }, { valor: 1, label: '1-5' }, { valor: 0, label: '0' }] }
    ],
    interpretacao: [
      { min: 0, max: 3, nivel: 'Crítico', cor: 'bg-red-700', texto: 'Sobrevida < 50%' },
      { min: 4, max: 8, nivel: 'Grave', cor: 'bg-red-500', texto: 'Sobrevida 50-80%' },
      { min: 9, max: 11, nivel: 'Moderado', cor: 'bg-yellow-500', texto: 'Sobrevida 80-95%' },
      { min: 12, max: 12, nivel: 'Leve', cor: 'bg-green-500', texto: 'Sobrevida > 95%' }
    ],
    fonte: 'Champion et al., J Trauma 1989'
  },

  // PEWS
  pews: {
    nome: 'PEWS',
    descricao: 'Pediatric Early Warning Score',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Comportamento', opcoes: [{ valor: 0, label: 'Brincando/apropriado' }, { valor: 1, label: 'Sonolento/irritado' }, { valor: 2, label: 'Letárgico/confuso' }, { valor: 3, label: 'Redução da resposta à dor' }] },
      { nome: 'Cardiovascular', opcoes: [{ valor: 0, label: 'Cor/FC/TEC normais' }, { valor: 1, label: 'Palidez/Taquicardia' }, { valor: 2, label: 'Pele fria/Taquicardia/TEC 3s' }, { valor: 3, label: 'Pele cinzenta/moteada/TEC > 4s' }] },
      { nome: 'Respiratório', opcoes: [{ valor: 0, label: 'Normal' }, { valor: 1, label: 'FR > 10 acima normal/O₂' }, { valor: 2, label: 'FR > 20 acima/retrações' }, { valor: 3, label: 'FR < 10 abaixo/gemência/apneia' }] }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'Verde', cor: 'bg-green-500', texto: 'Rotina' },
      { min: 1, max: 4, nivel: 'Amarelo', cor: 'bg-yellow-500', texto: 'Avaliar em 30 min' },
      { min: 5, max: 9, nivel: 'Vermelho', cor: 'bg-red-500', texto: 'Emergência médica' }
    ],
    fonte: 'Monaghan, Arch Dis Child 2005'
  },

  // Ballard
  ballard: {
    nome: 'Ballard Score',
    descricao: 'Idade gestacional por exame físico',
    tipo: 'criterios_complexos',
    info: 'Avaliação neuromuscular + física somada. Pontuação convertida em semanas de IG.',
    fonte: 'Ballard et al., J Pediatr 1991'
  },

  // PHQ-9
  phq9: {
    nome: 'PHQ-9',
    descricao: 'Patient Health Questionnaire - Depressão',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Pouco interesse/prazer', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Sentir-se deprimido', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Problemas de sono', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Cansaço/pouca energia', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Falta/excesso de apetite', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Sentir-se mal consigo', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Dificuldade de concentração', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Lentidão/agitação', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Pensamentos de morte', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] }
    ],
    interpretacao: [
      { min: 0, max: 4, nivel: 'Depressão mínima', cor: 'bg-green-500', texto: 'Sintomas mínimos' },
      { min: 5, max: 9, nivel: 'Depressão leve', cor: 'bg-blue-500', texto: 'Depressão leve' },
      { min: 10, max: 14, nivel: 'Depressão moderada', cor: 'bg-yellow-500', texto: 'Depressão moderada' },
      { min: 15, max: 19, nivel: 'Depressão moderadamente grave', cor: 'bg-orange-500', texto: 'Depressão moderadamente grave' },
      { min: 20, max: 27, nivel: 'Depressão grave', cor: 'bg-red-500', texto: 'Depressão grave' }
    ],
    fonte: 'Kroenke et al., J Gen Intern Med 2001'
  },

  // GAD-7
  gad7: {
    nome: 'GAD-7',
    descricao: 'Generalized Anxiety Disorder 7-item',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Sentir-se nervoso/ansioso', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Incapaz de controlar preocupações', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Preocupação excessiva', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Dificuldade de relaxar', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Inquietação', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Irritabilidade', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] },
      { nome: 'Medo de algo ruim acontecer', opcoes: [{ valor: 0, label: 'Nunca' }, { valor: 1, label: 'Vários dias' }, { valor: 2, label: 'Mais da metade' }, { valor: 3, label: 'Quase todos os dias' }] }
    ],
    interpretacao: [
      { min: 0, max: 4, nivel: 'Ansiedade mínima', cor: 'bg-green-500', texto: 'Sintomas mínimos' },
      { min: 5, max: 9, nivel: 'Ansiedade leve', cor: 'bg-blue-500', texto: 'Ansiedade leve' },
      { min: 10, max: 14, nivel: 'Ansiedade moderada', cor: 'bg-yellow-500', texto: 'Ansiedade moderada' },
      { min: 15, max: 21, nivel: 'Ansiedade grave', cor: 'bg-red-500', texto: 'Ansiedade grave' }
    ],
    fonte: 'Spitzer et al., Arch Intern Med 2006'
  },

  // RASS
  rass: {
    nome: 'RASS',
    descricao: 'Richmond Agitation-Sedation Scale',
    tipo: 'seletivo',
    grupos: [
      {
        nome: 'Nível de Sedação/Agitação',
        opcoes: [
          { valor: 4, label: '+4 Combativo - Violento, risco iminente' },
          { valor: 3, label: '+3 Muito agitado - Puxa tubos, agressivo' },
          { valor: 2, label: '+2 Agitado - Movimentos sem propósito frequentes' },
          { valor: 1, label: '+1 Inquieto - Ansioso, mas sem movimentos vigorosos' },
          { valor: 0, label: '0 Alerta e calmo' },
          { valor: -1, label: '-1 Sonolento - Acorda à voz (> 10s), mantém contato visual' },
          { valor: -2, label: '-2 Sedação leve - Acorda à voz (< 10s)' },
          { valor: -3, label: '-3 Sedação moderada - Movimenta-se à voz, sem contato visual' },
          { valor: -4, label: '-4 Sedação profunda - Sem resposta à voz, movimenta-se ao estímulo físico' },
          { valor: -5, label: '-5 Não despertável - Sem resposta' }
        ]
      }
    ],
    interpretacao: [
      { min: -5, max: -4, nivel: 'Sedação profunda', cor: 'bg-blue-700', texto: 'Profundamente sedado' },
      { min: -3, max: -1, nivel: 'Sedação leve-moderada', cor: 'bg-blue-500', texto: 'Sedação adequada' },
      { min: 0, max: 0, nivel: 'Alerta e calmo', cor: 'bg-green-500', texto: 'Ideal' },
      { min: 1, max: 2, nivel: 'Agitação', cor: 'bg-yellow-500', texto: 'Agitação leve' },
      { min: 3, max: 4, nivel: 'Agitação grave', cor: 'bg-red-500', texto: 'Agitação perigosa' }
    ],
    fonte: 'Sessler et al., Am J Respir Crit Care Med 2002'
  },

  // BARS
  bars: {
    nome: 'BARS',
    descricao: 'Brief Agitation Rating Scale',
    tipo: 'seletivo',
    grupos: [
      { nome: 'Grau de Agitação', opcoes: [{ valor: 1, label: '1 - Normal' }, { valor: 2, label: '2 - Leve inquietação' }, { valor: 3, label: '3 - Moderada inquietação' }, { valor: 4, label: '4 - Agitação sem agressão' }, { valor: 5, label: '5 - Agressão leve' }, { valor: 6, label: '6 - Agitação violenta' }, { valor: 7, label: '7 - Agressão perigosa' }] }
    ],
    interpretacao: [
      { min: 1, max: 2, nivel: 'Sem agitação', cor: 'bg-green-500', texto: 'Estado normal/calmo' },
      { min: 3, max: 4, nivel: 'Agitação leve-moderada', cor: 'bg-yellow-500', texto: 'Agitação sem agressão' },
      { min: 5, max: 7, nivel: 'Agitação grave/perigosa', cor: 'bg-red-500', texto: 'Agressão presente' }
    ],
    fonte: 'Swift et al., J Clin Psychiatry 2002'
  },

  // IMPROVE VTE
  improve_vte: {
    nome: 'IMPROVE VTE Score',
    descricao: 'Risco de tromboembolismo venoso em pacientes internados',
    criterios: [
      { id: 'tev_previo', label: 'TEV prévio', pontos: 3 },
      { id: 'trombofilia', label: 'Trombofilia conhecida', pontos: 2 },
      { id: 'paralisia_mmii', label: 'Paralisia de MMII', pontos: 2 },
      { id: 'cancer', label: 'Câncer ativo', pontos: 2 },
      { id: 'uti', label: 'Permanência em UTI/CCU', pontos: 1 },
      { id: 'mobilidade', label: 'Mobilidade reduzida ≥ 7 dias', pontos: 1 },
      { id: 'idade_60', label: 'Idade ≥ 60 anos', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 1, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Risco TEV 0.5%' },
      { min: 2, max: 3, nivel: 'Risco moderado', cor: 'bg-yellow-500', texto: 'Risco TEV 1.5%' },
      { min: 4, max: 15, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Risco TEV 5.7%' }
    ],
    fonte: 'Spyropoulos et al., Circulation 2011'
  },

  // IMPROVE Bleeding
  improve_bleeding: {
    nome: 'IMPROVE Bleeding Score',
    descricao: 'Risco de sangramento maior em pacientes internados',
    criterios: [
      { id: 'hepatico', label: 'Insuficiência hepática moderada-grave', pontos: 1 },
      { id: 'renal', label: 'Insuficiência renal grave (Cr > 2 mg/dL)', pontos: 1 },
      { id: 'plaquetas', label: 'Plaquetas < 50.000/µL', pontos: 1 },
      { id: 'idade_85', label: 'Idade ≥ 85 anos', pontos: 3.5 },
      { id: 'sangramento_previo', label: 'Sangramento nos últimos 3 meses', pontos: 4 },
      { id: 'uti', label: 'Admissão em UTI/CCU', pontos: 4.5 },
      { id: 'cateter', label: 'Cateter venoso central', pontos: 2 }
    ],
    interpretacao: [
      { min: 0, max: 6.5, nivel: 'Baixo risco', cor: 'bg-green-500', texto: 'Risco sangramento 1.1%' },
      { min: 7, max: 20, nivel: 'Alto risco', cor: 'bg-red-500', texto: 'Risco sangramento 4.1%' }
    ],
    fonte: 'Hostler et al., Chest 2016'
  },

  // LDL Martin
  ldl_martin: {
    nome: 'LDL (Martin/Hopkins)',
    descricao: 'LDL pela fórmula de Martin-Hopkins (mais precisa)',
    tipo: 'numerico',
    campos: [
      { id: 'ct', label: 'Colesterol Total (mg/dL)', min: 0, max: 500 },
      { id: 'hdl', label: 'HDL (mg/dL)', min: 0, max: 200 },
      { id: 'tg', label: 'Triglicerídeos (mg/dL)', min: 0, max: 1000 }
    ],
    formula: 'LDL = CT - HDL - (TG/fator ajustável por TG e não-HDL)',
    interpretacao: [
      { min: 0, max: 100, nivel: 'Ótimo', cor: 'bg-green-500', texto: '< 100 mg/dL' },
      { min: 100, max: 129, nivel: 'Desejável', cor: 'bg-blue-500', texto: '100-129 mg/dL' },
      { min: 130, max: 159, nivel: 'Limítrofe', cor: 'bg-yellow-500', texto: '130-159 mg/dL' },
      { min: 160, max: 189, nivel: 'Alto', cor: 'bg-orange-500', texto: '160-189 mg/dL' },
      { min: 190, max: 500, nivel: 'Muito alto', cor: 'bg-red-500', texto: '≥ 190 mg/dL' }
    ],
    fonte: 'Martin et al., JAMA 2013'
  },

  // MDRD
  mdrd: {
    nome: 'MDRD',
    descricao: 'Modification of Diet in Renal Disease',
    tipo: 'numerico',
    campos: [
      { id: 'creatinina', label: 'Creatinina (mg/dL)', min: 0.1, max: 20 },
      { id: 'idade', label: 'Idade (anos)', min: 18, max: 120 },
      { id: 'sexo', label: 'Sexo', tipo: 'select', opcoes: ['M', 'F'] }
    ],
    formula: 'TFG = 186 × Cr^(-1.154) × Idade^(-0.203) × 0.742 (se F)',
    interpretacao: [
      { min: 90, max: 200, nivel: 'Normal', cor: 'bg-green-500', texto: '≥ 90 mL/min/1.73m²' },
      { min: 60, max: 89, nivel: 'Leve redução', cor: 'bg-blue-500', texto: '60-89 - DRC G2' },
      { min: 30, max: 59, nivel: 'Moderada redução', cor: 'bg-yellow-500', texto: '30-59 - DRC G3' },
      { min: 15, max: 29, nivel: 'Grave redução', cor: 'bg-orange-500', texto: '15-29 - DRC G4' },
      { min: 0, max: 14, nivel: 'Falência renal', cor: 'bg-red-500', texto: '< 15 - DRC G5' }
    ],
    fonte: 'Levey et al., Ann Intern Med 1999'
  },

  // KFRE
  kfre: {
    nome: 'KFRE',
    descricao: 'Kidney Failure Risk Equation - Risco de diálise em 2-5 anos',
    tipo: 'numerico',
    campos: [
      { id: 'idade', label: 'Idade (anos)', min: 18, max: 120 },
      { id: 'sexo', label: 'Sexo', tipo: 'select', opcoes: ['M', 'F'] },
      { id: 'tfg', label: 'TFG estimada (mL/min/1.73m²)', min: 5, max: 60 },
      { id: 'alb_cr_ratio', label: 'Razão Albumina/Creatinina urinária (mg/g)', min: 0, max: 5000 }
    ],
    formula: 'Equação complexa validada (4 variáveis)',
    interpretacao: [
      { min: 0, max: 3, nivel: 'Baixo risco', cor: 'bg-green-500', texto: '< 3% em 2 anos' },
      { min: 3, max: 10, nivel: 'Risco moderado', cor: 'bg-yellow-500', texto: '3-10% em 2 anos' },
      { min: 10, max: 100, nivel: 'Alto risco', cor: 'bg-red-500', texto: '> 10% em 2 anos' }
    ],
    fonte: 'Tangri et al., JAMA 2011'
  },

  // ISS
  iss: {
    nome: 'ISS',
    descricao: 'Injury Severity Score',
    tipo: 'criterios_complexos',
    info: 'Soma dos quadrados das 3 lesões AIS mais graves em regiões diferentes. ISS > 15 = politrauma.',
    fonte: 'Baker et al., J Trauma 1974'
  },

  // Canadian C-Spine Rule
  ccsr: {
    nome: 'Canadian C-Spine Rule',
    descricao: 'Indicação de radiografia de coluna cervical',
    tipo: 'criterios_complexos',
    info: 'Avaliação por algoritmo: fatores de alto risco → fatores de baixo risco → capacidade de rotação cervical',
    fonte: 'Stiell et al., JAMA 2001'
  },

  // NEXUS
  nexus: {
    nome: 'NEXUS Criteria',
    descricao: 'Critérios para dispensar imagem de coluna cervical',
    criterios: [
      { id: 'dor_linha_media', label: 'Dor à palpação em linha média cervical', pontos: 1 },
      { id: 'intoxicacao', label: 'Intoxicação', pontos: 1 },
      { id: 'alteracao_mental', label: 'Alteração do estado mental', pontos: 1 },
      { id: 'deficit_neuro', label: 'Déficit neurológico focal', pontos: 1 },
      { id: 'lesao_dolorosa', label: 'Lesão dolorosa que distrai', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'Imagem desnecessária', cor: 'bg-green-500', texto: 'Todos os critérios NEGATIVOS - Dispensar RX' },
      { min: 1, max: 5, nivel: 'Imagem indicada', cor: 'bg-red-500', texto: 'Qualquer critério POSITIVO - Indicar RX' }
    ],
    fonte: 'Hoffman et al., NEJM 2000'
  },

  // Ottawa Ankle
  ottawa_ankle: {
    nome: 'Ottawa Ankle Rules',
    descricao: 'Indicação de RX de tornozelo',
    criterios: [
      { id: 'dor_maleoloM', label: 'Dor em região maleolar medial', pontos: 1 },
      { id: 'dor_maleoloL', label: 'Dor em região maleolar lateral', pontos: 1 },
      { id: 'incapaz_carga', label: 'Incapaz de dar 4 passos (imediatamente e no PS)', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'RX não indicado', cor: 'bg-green-500', texto: 'Fratura muito improvável' },
      { min: 1, max: 3, nivel: 'RX indicado', cor: 'bg-red-500', texto: 'Indicação de radiografia' }
    ],
    fonte: 'Stiell et al., JAMA 1993'
  },

  // Ottawa Knee
  ottawa_knee: {
    nome: 'Ottawa Knee Rules',
    descricao: 'Indicação de RX de joelho',
    criterios: [
      { id: 'idade_55', label: 'Idade ≥ 55 anos', pontos: 1 },
      { id: 'dor_patela', label: 'Dor isolada na patela', pontos: 1 },
      { id: 'dor_cabeca_fibula', label: 'Dor à palpação da cabeça da fíbula', pontos: 1 },
      { id: 'incapaz_flexao', label: 'Incapaz de fletir joelho a 90°', pontos: 1 },
      { id: 'incapaz_carga', label: 'Incapaz de dar 4 passos', pontos: 1 }
    ],
    interpretacao: [
      { min: 0, max: 0, nivel: 'RX não indicado', cor: 'bg-green-500', texto: 'Fratura muito improvável' },
      { min: 1, max: 5, nivel: 'RX indicado', cor: 'bg-red-500', texto: 'Indicação de radiografia' }
    ],
    fonte: 'Stiell et al., JAMA 1996'
  },

  // C-SSRS
  cssrs: {
    nome: 'Columbia-Suicide Severity Rating Scale',
    descricao: 'Avaliação de risco suicida',
    tipo: 'criterios_complexos',
    info: 'Avaliação estruturada: ideação → intensidade da ideação → comportamento suicida → tentativas',
    fonte: 'Posner et al., Am J Psychiatry 2011'
  },

  // Kaiser Neonatal Sepsis
  kaiser_sepsis: {
    nome: 'Kaiser Neonatal Sepsis Calculator',
    descricao: 'Risco de sepse neonatal precoce',
    tipo: 'criterios_complexos',
    info: 'Calculadora online que integra fatores maternos, clínicos e exame físico do RN',
    fonte: 'Kuzniewicz et al., Pediatrics 2017'
  }
};

export default function ScoreCalculator({ score, contextoOrigem, onBack }) {
  const [valores, setValores] = useState({});
  const [resultado, setResultado] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [conteudoEditorial, setConteudoEditorial] = useState(null);
  
  const definition = scoreDefinitions[score.id];

  useEffect(() => {
    const stored = localStorage.getItem('supmed_doctor');
    if (stored) setCurrentUser(JSON.parse(stored));

    const loadEditorialData = async () => {
      try {
        const conteudos = await base44.entities.ConteudoEditorial.filter({
          tipo_modulo: 'calculadora',
          slug: score.id
        });
        if (conteudos.length > 0) {
          setConteudoEditorial(conteudos[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados editoriais:', error);
      }
    };

    loadEditorialData();
  }, [score.id]);
  
  // Se não tiver definição detalhada, mostrar informações básicas
  if (!definition) {
    return (
      <div className="space-y-3">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs h-7">
          <ArrowLeft className="w-3 h-3 mr-1" /> Voltar
        </Button>
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-4">
            <h2 className="text-base font-semibold text-slate-800">{score.nome}</h2>
            <p className="text-xs text-slate-500 mt-1">{score.desc}</p>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
              <p className="text-xs text-blue-700 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Fonte: {score.fonte}
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-4">Calculadora detalhada em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Scores com critérios complexos (apenas informativos)
  if (definition.tipo === 'criterios_complexos') {
    return (
      <div className="space-y-3">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs h-7">
          <ArrowLeft className="w-3 h-3 mr-1" /> Voltar
        </Button>
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-4">
            <h2 className="text-base font-semibold text-slate-800">{definition.nome}</h2>
            <p className="text-xs text-slate-500 mt-1">{definition.descricao}</p>
            <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-100">
              <p className="text-xs text-amber-800">{definition.info}</p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
              <p className="text-xs text-blue-700 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Fonte: {definition.fonte}
              </p>
            </div>
          </CardContent>
        </Card>
        <DisclaimerFooter variant="calculadora" />
      </div>
    );
  }

  const calcularPontuacao = () => {
    let total = 0;
    
    if (definition.tipo === 'numerico') {
      // Calculadoras numéricas
      total = calcularFormula(score.id, valores);
      
      // Tratar casos de erro
      if (typeof total === 'string') {
        setResultado({ erro: total });
        return;
      }
      
      const interp = definition.interpretacao?.find(i => total >= i.min && total <= i.max);
      setResultado({ total, interpretacao: interp });
      return;
    }
    
    if (definition.tipo === 'seletivo') {
      definition.grupos.forEach((grupo, i) => {
        const val = valores[`grupo_${i}`];
        if (val !== undefined) total += parseInt(val);
      });
    } else if (definition.criterios) {
      // Casos especiais
      if (score.id === 'aspects') {
        total = 10; // Base ASPECTS
        definition.criterios.forEach(crit => {
          if (valores[crit.id]) total += crit.pontos; // pontos negativos
        });
      } else if (score.id === 'pesi') {
        // PESI tem idade como pontos variáveis
        definition.criterios.forEach(crit => {
          if (crit.pontos === 'idade') {
            total += parseInt(valores.idade_pesi || 0);
          } else if (valores[crit.id]) {
            total += crit.pontos;
          }
        });
      } else {
        definition.criterios.forEach(crit => {
          if (valores[crit.id]) total += crit.pontos;
        });
      }
    }
    
    // Encontrar interpretação
    const interp = definition.interpretacao?.find(i => total >= i.min && total <= i.max);
    setResultado({ total, interpretacao: interp });
  };

  const calcularFormula = (scoreId, vals) => {
    switch(scoreId) {
      case 'ldl_friedewald':
        if (!vals.ct || !vals.hdl || !vals.tg) return 0;
        if (vals.tg > 400) return 'Inválido para TG > 400 mg/dL';
        return Math.round(vals.ct - vals.hdl - (vals.tg / 5));
        
      case 'ldl_martin':
        if (!vals.ct || !vals.hdl || !vals.tg) return 0;
        const fator_ldl = vals.tg < 100 ? 6 : (vals.tg < 200 ? 5.5 : (vals.tg < 400 ? 5 : 4.5));
        return Math.round(vals.ct - vals.hdl - (vals.tg / fator_ldl));
        
      case 'nao_hdl':
        if (!vals.ct || !vals.hdl) return 0;
        return Math.round(vals.ct - vals.hdl);
        
      case 'ct_hdl_ratio':
        if (!vals.ct || !vals.hdl || vals.hdl === 0) return 0;
        return parseFloat((vals.ct / vals.hdl).toFixed(2));
        
      case 'imc':
      case 'imc_ped':
        if (!vals.peso || !vals.altura) return 0;
        return parseFloat((vals.peso / Math.pow(vals.altura / 100, 2)).toFixed(1));
        
      case 'bsa':
      case 'bsa_ped':
        if (!vals.peso || !vals.altura) return 0;
        return parseFloat(Math.sqrt((vals.altura * vals.peso) / 3600).toFixed(2));
        
      case 'osmolaridade':
        if (!vals.na) return 0;
        return Math.round(2 * vals.na + ((vals.glicose || 0) / 18) + ((vals.ureia || 0) / 6));
        
      case 'na_corrigido':
        if (!vals.na || !vals.glicose) return 0;
        return parseFloat((vals.na + 0.016 * (vals.glicose - 100)).toFixed(1));
        
      case 'gap_osmolar':
        if (!vals.osm_medida || !vals.na) return 0;
        const osm_calc_gap = 2 * vals.na + ((vals.glicose || 0) / 18) + ((vals.ureia || 0) / 6);
        return Math.round(vals.osm_medida - osm_calc_gap);
        
      case 'gradiente_aa':
        if (!vals.fio2 || !vals.pao2 || !vals.paco2) return 0;
        const pao2_alv = vals.fio2 * (760 - 47) - (vals.paco2 / 0.8);
        return Math.round(pao2_alv - vals.pao2);
        
      case 'pao2fio2':
        if (!vals.pao2 || !vals.fio2) return 0;
        return Math.round(vals.pao2 / vals.fio2);
        
      case 'spo2_pao2':
        if (!vals.spo2) return 0;
        return Math.round(vals.spo2 / 1.5 + 50);
        
      case 'clearance_lactato':
        if (!vals.lactato_inicial || vals.lactato_final === undefined) return 0;
        return parseFloat((((vals.lactato_inicial - vals.lactato_final) / vals.lactato_inicial) * 100).toFixed(1));
        
      case 'volume_30ml':
        if (!vals.peso) return 0;
        return Math.round(vals.peso * 30);
        
      case 'apri':
        if (!vals.ast || !vals.plaquetas || vals.plaquetas === 0) return 0;
        return parseFloat((((vals.ast / 40) / vals.plaquetas) * 100).toFixed(2));
        
      case 'fib4':
        if (!vals.idade || !vals.ast || !vals.alt || !vals.plaquetas) return 0;
        return parseFloat(((vals.idade * vals.ast) / (vals.plaquetas * Math.sqrt(vals.alt))).toFixed(2));
        
      case 'ast_alt':
        if (!vals.ast || !vals.alt || vals.alt === 0) return 0;
        return parseFloat((vals.ast / vals.alt).toFixed(2));
        
      case 'ckd_epi':
        if (!vals.creatinina || !vals.idade || !vals.sexo) return 0;
        const k_epi = vals.sexo === 'F' ? 0.7 : 0.9;
        const alfa_epi = vals.sexo === 'F' ? -0.329 : -0.411;
        const min_epi = Math.min(vals.creatinina / k_epi, 1);
        const max_epi = Math.max(vals.creatinina / k_epi, 1);
        const fator_sexo_epi = vals.sexo === 'F' ? 1.018 : 1;
        return Math.round(141 * Math.pow(min_epi, alfa_epi) * Math.pow(max_epi, -1.209) * Math.pow(0.993, vals.idade) * fator_sexo_epi);
        
      case 'cockcroft':
        if (!vals.idade || !vals.peso || !vals.creatinina || !vals.sexo) return 0;
        const ccr_cg = ((140 - vals.idade) * vals.peso) / (72 * vals.creatinina);
        return Math.round(vals.sexo === 'F' ? ccr_cg * 0.85 : ccr_cg);
        
      case 'mdrd':
        if (!vals.creatinina || !vals.idade || !vals.sexo) return 0;
        const base_mdrd = 186 * Math.pow(vals.creatinina, -1.154) * Math.pow(vals.idade, -0.203);
        return Math.round(vals.sexo === 'F' ? base_mdrd * 0.742 : base_mdrd);
        
      case 'anion_gap':
        if (!vals.na || !vals.cl || vals.hco3 === undefined) return 0;
        return Math.round(vals.na - vals.cl - vals.hco3);
        
      case 'anion_gap_alb':
        if (!vals.na || !vals.cl || vals.hco3 === undefined || !vals.albumina) return 0;
        const ag_alb = vals.na - vals.cl - vals.hco3;
        return parseFloat((ag_alb + 2.5 * (4 - vals.albumina)).toFixed(1));
        
      case 'fena':
        if (!vals.na_urina || !vals.na_plasma || !vals.cr_urina || !vals.cr_plasma || vals.cr_urina === 0 || vals.na_plasma === 0) return 0;
        return parseFloat((((vals.na_urina * vals.cr_plasma) / (vals.na_plasma * vals.cr_urina)) * 100).toFixed(2));
        
      case 'feureia':
        if (!vals.ureia_urina || !vals.ureia_plasma || !vals.cr_urina || !vals.cr_plasma || vals.cr_urina === 0 || vals.ureia_plasma === 0) return 0;
        return parseFloat((((vals.ureia_urina * vals.cr_plasma) / (vals.ureia_plasma * vals.cr_urina)) * 100).toFixed(2));
        
      case 'osm_urina':
        if (!vals.na_urina || !vals.k_urina) return 0;
        return Math.round(2 * (vals.na_urina + vals.k_urina) + ((vals.ureia_urina || 0) / 6));
        
      case 'deficit_agua':
        if (!vals.na_atual || !vals.peso) return 0;
        return parseFloat((vals.peso * 0.6 * ((vals.na_atual / 140) - 1)).toFixed(1));
        
      case 'shock_index':
        if (!vals.fc || !vals.pas || vals.pas === 0) return 0;
        return parseFloat((vals.fc / vals.pas).toFixed(2));
        
      case 'calcio_corrigido':
        if (!vals.calcio || !vals.albumina) return 0;
        return parseFloat((vals.calcio + 0.8 * (4 - vals.albumina)).toFixed(2));
        
      case 'dose_peso':
        if (!vals.peso || !vals.dose_por_kg) return 0;
        return parseFloat((vals.peso * vals.dose_por_kg).toFixed(1));
        
      case 'holliday_segar':
        if (!vals.peso) return 0;
        if (vals.peso <= 10) return vals.peso * 100;
        if (vals.peso <= 20) return 1000 + ((vals.peso - 10) * 50);
        return 1500 + ((vals.peso - 20) * 20);
        
      case 'gotejamento':
        if (!vals.ml_h) return 0;
        return Math.round((vals.ml_h * 20) / 60);
        
      case 'meld':
      case 'meld_na':
        if (!vals.bilirrubina || !vals.inr || !vals.creatinina) return 0;
        const bili_m = Math.max(1, vals.bilirrubina);
        const inr_m = Math.max(1, vals.inr);
        let cr_m = Math.max(1, vals.creatinina);
        if (vals.dialise) cr_m = 4;
        let meld_calc = 3.78 * Math.log(bili_m) + 11.2 * Math.log(inr_m) + 9.57 * Math.log(cr_m) + 6.43;
        meld_calc = Math.round(Math.max(6, Math.min(40, meld_calc)));
        
        if (scoreId === 'meld_na' && vals.na) {
          const na_adj = Math.min(137, Math.max(125, vals.na));
          meld_calc = meld_calc + 1.32 * (137 - na_adj) - (0.033 * meld_calc * (137 - na_adj));
          meld_calc = Math.round(Math.max(6, Math.min(40, meld_calc)));
        }
        return meld_calc;
        
      case 'rox_index':
        if (!vals.spo2 || !vals.fio2 || !vals.fr || vals.fr === 0 || vals.fio2 === 0) return 0;
        return parseFloat(((vals.spo2 / vals.fio2) / vals.fr).toFixed(2));
        
      case 'kfre':
        // Simplificação - calculadora real requer modelo mais complexo
        if (!vals.tfg || !vals.idade) return 0;
        return parseFloat(((60 - vals.tfg) / 2 + vals.idade / 20).toFixed(1));
        
      case 'equiv_opioides':
        if (!vals.dose_atual || !vals.fator_conversao) return 0;
        return parseFloat((vals.dose_atual * vals.fator_conversao).toFixed(1));
      
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (Object.keys(valores).length > 0) {
      calcularPontuacao();
    }
  }, [valores]);

  return (
    <div className="space-y-3">
      {/* Botão VOLTAR - SEMPRE retorna para a afecção de origem */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onBack}
        className={`text-xs h-7 ${
          contextoOrigem?.tipo && contextoOrigem?.afeccao
            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
            : ''
        }`}
      >
        <ArrowLeft className="w-3 h-3 mr-1" /> 
        {contextoOrigem?.tipo && contextoOrigem?.afeccao
          ? `Voltar para ${contextoOrigem.afeccao}`
          : 'Voltar ao Catálogo'}
      </Button>

      {/* Indicação de contexto de origem */}
      {contextoOrigem && contextoOrigem.afeccao && (
        <Card className="bg-blue-50/80 backdrop-blur-sm border border-blue-200">
          <CardContent className="p-2">
            <p className="text-[10px] text-blue-700">
              <strong>Origem:</strong> {contextoOrigem.afeccao} 
              {contextoOrigem.especialidade && ` · ${contextoOrigem.especialidade}`}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardContent className="p-4">
          <h2 className="text-base font-semibold text-slate-800">{definition.nome}</h2>
          <p className="text-xs text-slate-500 mt-1">{definition.descricao}</p>
          
          {/* Critérios checkbox */}
          {definition.criterios && (
            <div className="mt-4 space-y-2">
              {definition.criterios.map((crit) => (
                <label key={crit.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer">
                  <Checkbox
                    checked={valores[crit.id] || false}
                    onCheckedChange={(checked) => setValores({...valores, [crit.id]: checked})}
                  />
                  <span className="text-xs text-slate-700 flex-1">{crit.label}</span>
                  <Badge variant="outline" className="text-[9px]">{crit.pontos} pts</Badge>
                </label>
              ))}
            </div>
          )}

          {/* Grupos seletivos */}
          {definition.grupos && (
            <div className="mt-4 space-y-3">
              {definition.grupos.map((grupo, i) => (
                <div key={i}>
                  <Label className="text-xs text-slate-600">{grupo.nome}</Label>
                  <Select
                    value={valores[`grupo_${i}`]?.toString() || ''}
                    onValueChange={(val) => setValores({...valores, [`grupo_${i}`]: parseInt(val)})}
                  >
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupo.opcoes.map((op) => (
                        <SelectItem key={op.valor} value={op.valor.toString()}>
                          {op.label} ({op.valor} pts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {/* Campos numéricos */}
          {definition.campos && (
            <div className="mt-4 space-y-3">
              {definition.campos.map((campo) => (
                <div key={campo.id}>
                  <Label className="text-xs text-slate-600">{campo.label}</Label>
                  {campo.tipo === 'checkbox' ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Checkbox
                        checked={valores[campo.id] || false}
                        onCheckedChange={(checked) => setValores({...valores, [campo.id]: checked})}
                      />
                      <span className="text-xs text-slate-500">Sim</span>
                    </div>
                  ) : campo.tipo === 'select' ? (
                    <Select
                      value={valores[campo.id] || ''}
                      onValueChange={(val) => setValores({...valores, [campo.id]: val})}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {campo.opcoes.map((op) => (
                          <SelectItem key={op} value={op}>{op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="number"
                      placeholder={campo.placeholder || ''}
                      className="h-8 text-xs mt-1"
                      value={valores[campo.id] || ''}
                      onChange={(e) => setValores({...valores, [campo.id]: parseFloat(e.target.value) || 0})}
                      min={campo.min}
                      max={campo.max}
                      step={campo.step || 0.1}
                    />
                  )}
                </div>
              ))}
              
              {/* Campo especial para idade no PESI */}
              {score.id === 'pesi' && (
                <div>
                  <Label className="text-xs text-slate-600">Idade (anos) - pontos = idade</Label>
                  <Input
                    type="number"
                    min={18}
                    max={120}
                    value={valores.idade_pesi || ''}
                    onChange={(e) => setValores({...valores, idade_pesi: parseInt(e.target.value)})}
                    className="h-8 text-xs mt-1"
                    placeholder="Idade"
                  />
                </div>
              )}
            </div>
          )}

          {definition.formula && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-[9px] text-blue-700">
              <strong>Fórmula:</strong> {definition.formula}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado - EDUCACIONAL */}
      {resultado && (
        <Card className={`${resultado.interpretacao?.cor || 'bg-slate-500'} text-white`}>
          <CardContent className="p-4">
            {resultado.erro ? (
              <div>
                <AlertTriangle className="w-5 h-5 mb-2" />
                <p className="text-sm font-semibold">{resultado.erro}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs opacity-80">
                    {definition.tipo === 'numerico' ? 'Resultado' : 'Pontuação'}
                  </span>
                  <span className="text-2xl font-bold">
                    {resultado.total}
                    {definition.tipo === 'numerico' && definition.campos && (
                      <span className="text-sm ml-1 opacity-80">
                        {(() => {
                          switch(score.id) {
                            case 'imc':
                            case 'imc_ped': return 'kg/m²';
                            case 'bsa':
                            case 'bsa_ped': return 'm²';
                            case 'osmolaridade':
                            case 'osm_urina': return 'mOsm/kg';
                            case 'na_corrigido': return 'mEq/L';
                            case 'gradiente_aa': return 'mmHg';
                            case 'pao2fio2': return 'mmHg';
                            case 'spo2_pao2': return 'mmHg (est)';
                            case 'clearance_lactato': return '%';
                            case 'volume_30ml': return 'mL';
                            case 'ckd_epi':
                            case 'mdrd': return 'mL/min/1.73m²';
                            case 'cockcroft': return 'mL/min';
                            case 'anion_gap':
                            case 'anion_gap_alb': return 'mEq/L';
                            case 'fena':
                            case 'feureia': return '%';
                            case 'deficit_agua': return 'L';
                            case 'calcio_corrigido': return 'mg/dL';
                            case 'dose_peso': return 'mg';
                            case 'holliday_segar': return 'mL/dia';
                            case 'gotejamento': return 'gotas/min';
                            case 'ldl_friedewald':
                            case 'ldl_martin':
                            case 'nao_hdl': return 'mg/dL';
                            default: return '';
                          }
                        })()}
                      </span>
                    )}
                  </span>
                </div>
                
                {/* Informação adicional */}
                {score.id === 'holliday_segar' && resultado.total && (
                  <p className="text-xs opacity-90 mb-2">≈ {Math.round(resultado.total / 24)} mL/h</p>
                )}
                
                {resultado.interpretacao && (
                  <>
                    <p className="text-sm font-semibold">{resultado.interpretacao.nivel}</p>
                    <p className="text-xs opacity-90 mt-1">{resultado.interpretacao.texto}</p>
                  </>
                )}
                <p className="text-[9px] opacity-80 mt-2 pt-2 border-t border-white/20">
                  ⚠️ Resultado educacional. A decisão clínica depende da avaliação profissional completa.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fonte */}
      <Card className="bg-slate-50 border border-slate-200">
        <CardContent className="p-3">
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> <strong>Fonte:</strong> {definition.fonte}
          </p>
        </CardContent>
      </Card>

      <DisclaimerFooter variant="calculadora" />

      {/* Bloco de Rastreabilidade Editorial */}
      {conteudoEditorial && (
        <BlocoRastreabilidade 
          conteudo={conteudoEditorial} 
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
// Dicionário Médico Offline - Termos mais comuns
export const medicalTerms = [
  // Sintomas e sinais
  'dispneia', 'taquipneia', 'bradipneia', 'apneia', 'ortopneia', 'platipneia',
  'taquicardia', 'bradicardia', 'arritmia', 'palpitação', 'palpitações',
  'cefaleia', 'otalgia', 'odinofagia', 'disfagia', 'pirose', 'epigastralgia',
  'dor', 'toracica', 'abdominal', 'lombar', 'cervical',
  'náusea', 'náuseas', 'vômito', 'vômitos', 'êmese', 'hematêmese', 'melena',
  'diarreia', 'constipação', 'obstipação', 'hematoquezia', 'enterorragia',
  'febre', 'hipertermia', 'hipotermia', 'afebril', 'subfebril',
  'sudorese', 'diaforese', 'astenia', 'adinamia', 'hiporexia', 'anorexia',
  'poliúria', 'oligúria', 'anúria', 'disúria', 'hematúria', 'polaciúria',
  'epistaxe', 'hemoptise', 'tosse', 'expectoração', 'sibilância', 'sibilos',
  'cianose', 'palidez', 'icterícia', 'acianótico', 'anictérico',
  'edema', 'linfonodomegalia', 'hepatomegalia', 'esplenomegalia', 'ascite',
  'síncope', 'lipotimia', 'tontura', 'vertigem', 'convulsão', 'crise',
  
  // Anatomia
  'torácica', 'abdominal', 'pélvica', 'cervical', 'lombar', 'sacral',
  'anterior', 'posterior', 'lateral', 'medial', 'proximal', 'distal',
  'superior', 'inferior', 'cranial', 'caudal',
  'cardíaco', 'pulmonar', 'hepático', 'renal', 'cerebral', 'muscular',
  'ósseo', 'articular', 'vascular', 'nervoso', 'linfático',
  'esôfago', 'estômago', 'duodeno', 'jejuno', 'íleo', 'cólon', 'reto',
  'fígado', 'vesícula', 'pâncreas', 'baço', 'rim', 'ureter', 'bexiga',
  'traqueia', 'brônquio', 'pulmão', 'pleura', 'diafragma',
  'coração', 'aorta', 'ventrículo', 'átrio', 'valva', 'miocárdio', 'pericárdio',
  
  // Diagnósticos e doenças
  'pneumonia', 'bronquite', 'asma', 'dpoc', 'tuberculose', 'covid',
  'infarto', 'angina', 'insuficiência', 'hipertensão', 'hipotensão',
  'diabetes', 'cetoacidose', 'hipoglicemia', 'hiperglicemia',
  'sepse', 'choque', 'séptico', 'cardiogênico', 'hipovolêmico', 'anafilático',
  'avc', 'avci', 'avch', 'acidente', 'vascular', 'cerebral', 'isquêmico', 'hemorrágico',
  'pancreatite', 'colecistite', 'apendicite', 'diverticulite', 'peritonite',
  'gastrite', 'úlcera', 'refluxo', 'hemorragia', 'digestiva',
  'cirrose', 'hepatite', 'colangite', 'icterícia', 'colelitíase',
  'insuficiência', 'renal', 'cardíaca', 'respiratória', 'hepática',
  'trombose', 'embolia', 'tep', 'tvp', 'tromboembolismo', 'pulmonar', 'venosa',
  'meningite', 'encefalite', 'epilepsia', 'status', 'epilepticus',
  'fraturas', 'luxação', 'entorse', 'politrauma', 'tce', 'trauma', 'cranioencefálico',
  'queimadura', 'intoxicação', 'overdose', 'envenenamento',
  
  // Medicamentos comuns
  'dipirona', 'paracetamol', 'ibuprofeno', 'diclofenaco', 'cetoprofeno',
  'morfina', 'tramadol', 'codeína', 'fentanil', 'metadona',
  'omeprazol', 'pantoprazol', 'ranitidina', 'bromoprida', 'metoclopramida', 'ondansetrona',
  'captopril', 'enalapril', 'losartana', 'valsartana', 'hidralazina',
  'anlodipino', 'nifedipino', 'atenolol', 'metoprolol', 'propranolol', 'carvedilol',
  'furosemida', 'espironolactona', 'hidroclorotiazida',
  'insulina', 'metformina', 'glibenclamida', 'glicazida',
  'amoxicilina', 'azitromicina', 'ciprofloxacino', 'levofloxacino', 'ceftriaxona', 'cefepime',
  'ampicilina', 'penicilina', 'vancomicina', 'meropenem', 'piperacilina', 'tazobactam',
  'noradrenalina', 'dobutamina', 'dopamina', 'adrenalina', 'epinefrina',
  'heparina', 'enoxaparina', 'varfarina', 'rivaroxabana', 'apixabana',
  'atropina', 'amiodarona', 'lidocaína', 'adenosina', 'digoxina',
  'diazepam', 'midazolam', 'fenitoína', 'fenobarbital', 'clonazepam',
  'haloperidol', 'risperidona', 'quetiapina', 'olanzapina',
  'prednisona', 'prednisolona', 'hidrocortisona', 'dexametasona',
  'salbutamol', 'fenoterol', 'ipratrópio', 'brometo',
  
  // Siglas clínicas
  'ecg', 'eeg', 'rcp', 'bls', 'acls', 'atls', 'pals',
  'icc', 'iam', 'sca', 'hsa', 'hda', 'hdb', 'itu', 'iva', 'ivas',
  'irpa', 'sara', 'sdra', 'bcp', 'brnf', 'bnf', 'rha', 'mvbd', 'mvd',
  'pa', 'fc', 'fr', 'tax', 'spo2', 'glicemia', 'hgt',
  'beg', 'reg', 'meg', 'lote', 'hipocorado', 'hidratado', 'acianótico', 'anictérico',
  'mmss', 'mmii', 'msd', 'mse', 'mid', 'mie',
  'pcr', 'rni', 'ttpa', 'tp', 'ck', 'ckmb', 'troponina',
  'tgo', 'tgp', 'ggt', 'fa', 'bt', 'bi', 'bd', 'ureia', 'creatinina',
  'ssvv', 'ap', 'acv', 'ar', 'abdome', 'sn', 'extremidades',
  'vm', 'vni', 'o2', 'fio2', 'peep', 'pco2', 'po2', 'ph', 'hco3', 'be',
  'eav', 'nrs', 'glasgow', 'rass', 'sofa', 'qsofa', 'sirs',
  
  // Procedimentos
  'intubação', 'extubação', 'traqueostomia', 'cricotireoidostomia',
  'cardioversão', 'desfibrilação', 'marcapasso', 'pacemaker',
  'toracocentese', 'paracentese', 'drenagem', 'torácica', 'abdominal',
  'cateterização', 'cateter', 'venoso', 'central', 'arterial', 'vesical',
  'punção', 'lombar', 'liquórica', 'arterial', 'venosa',
  'lavagem', 'gástrica', 'peritoneal', 'vesical',
  'sutura', 'debridamento', 'curativo', 'tamponamento',
  
  // Exames
  'hemograma', 'leucograma', 'plaquetas', 'hemácias', 'hemoglobina', 'hematócrito',
  'leucócitos', 'neutrófilos', 'linfócitos', 'eosinófilos', 'basófilos', 'monócitos',
  'coagulograma', 'gasometria', 'eletrólitos', 'sódio', 'potássio', 'cálcio', 'magnésio',
  'função', 'renal', 'hepática', 'tireoidiana',
  'urocultura', 'hemocultura', 'coprocultura',
  'raio-x', 'radiografia', 'tomografia', 'ressonância', 'ultrassom', 'ecografia',
  'ecocardiograma', 'eletrocardiograma', 'eletroencefalograma',
  
  // Termos gerais
  'agudo', 'crônico', 'subagudo', 'recorrente', 'recidivante',
  'leve', 'moderado', 'grave', 'crítico',
  'controlado', 'descompensado', 'estável', 'instável',
  'compensado', 'refratário', 'responsivo',
  'positivo', 'negativo', 'reagente', 'não', 'reagente',
  'presente', 'ausente', 'preservado', 'alterado',
  'normal', 'anormal', 'patológico', 'fisiológico'
];

// Siglas que nunca devem ser corrigidas
export const medicalAcronyms = [
  'ECG', 'EEG', 'RCP', 'BLS', 'ACLS', 'ATLS', 'PALS',
  'ICC', 'IAM', 'SCA', 'HSA', 'HDA', 'HDB', 'ITU', 'IVA', 'IVAS',
  'IRPA', 'SARA', 'SDRA', 'BCP', 'BRNF', 'BNF', 'RHA', 'MVBD', 'MVD',
  'PA', 'FC', 'FR', 'TAX', 'SPO2', 'HGT',
  'BEG', 'REG', 'MEG', 'LOTE',
  'MMSS', 'MMII', 'MSD', 'MSE', 'MID', 'MIE',
  'PCR', 'RNI', 'TTPA', 'TP', 'CK', 'CKMB',
  'TGO', 'TGP', 'GGT', 'FA', 'BT', 'BI', 'BD',
  'SSVV', 'AP', 'ACV', 'AR', 'SN',
  'VM', 'VNI', 'O2', 'FIO2', 'PEEP', 'PCO2', 'PO2', 'PH', 'HCO3', 'BE',
  'EAV', 'NRS', 'RASS', 'SOFA', 'QSOFA', 'SIRS',
  'AAS', 'EV', 'VO', 'IM', 'SC', 'SL', 'ID',
  'CID', 'CRM', 'COREN', 'CPF', 'RG',
  'UTI', 'PS', 'PA', 'UBS', 'UPA',
  'SUS', 'ANVISA', 'OMS', 'WHO', 'CDC',
  'HIV', 'AIDS', 'TB', 'COVID', 'H1N1',
  'AVC', 'AVCI', 'AVCH', 'TCE', 'TEP', 'TVP',
  'DPOC', 'GOLD', 'NYHA', 'KILLIP'
];

// Unidades de medida
export const medicalUnits = [
  'mg', 'mcg', 'g', 'kg', 'ml', 'dl', 'l',
  'mmhg', 'cmh2o', 'bpm', 'irpm', 'rpm',
  'ui', 'meq', 'mmol', 'mol',
  'h', 'min', 'seg', 'dia', 'semana', 'mês', 'ano'
];

// Dicionário médico completo (Set para busca O(1))
export const medicalDictionary = new Set([
  ...medicalTerms.map(t => t.toLowerCase()),
  ...medicalAcronyms,
  ...medicalAcronyms.map(t => t.toLowerCase()),
  ...medicalUnits.map(t => t.toLowerCase())
]);

// Verificar se uma palavra é termo médico válido
export function isMedicalTerm(word) {
  const normalized = word.toLowerCase().trim();
  return medicalDictionary.has(normalized);
}

// Carregar dicionário personalizado do usuário
export function loadUserDictionary() {
  try {
    const saved = localStorage.getItem('supmed_user_dictionary');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Salvar termo no dicionário do usuário
export function addToUserDictionary(word) {
  const userDict = loadUserDictionary();
  if (!userDict.includes(word.toLowerCase())) {
    userDict.push(word.toLowerCase());
    localStorage.setItem('supmed_user_dictionary', JSON.stringify(userDict));
  }
}

// Verificar se palavra está no dicionário do usuário
export function isInUserDictionary(word) {
  const userDict = loadUserDictionary();
  return userDict.includes(word.toLowerCase());
}

// Verificar se palavra é válida (médico + usuário)
export function isValidWord(word) {
  return isMedicalTerm(word) || isInUserDictionary(word);
}
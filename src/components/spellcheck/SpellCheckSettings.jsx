// Gerenciar configurações de revisão ortográfica

export function getSpellCheckSettings() {
  try {
    const saved = localStorage.getItem('supmed_spellcheck_settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Erro ao carregar configurações de spell check:', error);
  }
  
  // Padrões
  return {
    enabled: true,
    autoCorrect: false,
    useMedicalDictionary: true
  };
}

export function saveSpellCheckSettings(settings) {
  try {
    localStorage.setItem('supmed_spellcheck_settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações de spell check:', error);
    return false;
  }
}
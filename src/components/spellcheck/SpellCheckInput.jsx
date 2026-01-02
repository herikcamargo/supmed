import React, { useState, useRef, useEffect } from 'react';
import { isValidWord } from './MedicalDictionary';
import { getSpellCheckSettings } from './SpellCheckSettings';
import SpellCheckMenu from './SpellCheckMenu';

// Correções comuns (português)
const commonCorrections = {
  'vc': 'você',
  'q': 'que',
  'qdo': 'quando',
  'tmbm': 'também',
  'tb': 'também',
  'hj': 'hoje',
  'mt': 'muito',
  'mto': 'muito',
  // Erros médicos comuns
  'dispineia': 'dispneia',
  'taquipeneia': 'taquipneia',
  'bradipneia': 'bradipneia',
  'cefaleia': 'cefaleia',
  'odenofagia': 'odinofagia',
  'epigastralgia': 'epigastralgia',
  'hematemese': 'hematêmese',
  'adinamia': 'adinamia',
  'poliuria': 'poliúria',
  'disuria': 'disúria',
  'hematuria': 'hematúria',
  'epistase': 'epistaxe',
  'acianotiko': 'acianótico',
  'anikterico': 'anictérico',
  'sincope': 'síncope',
  'nausea': 'náusea',
  'vomito': 'vômito',
  'diarreia': 'diarreia',
  'constipacao': 'constipação'
};

// Sugestões baseadas em distância de edição simples
function getSuggestions(word) {
  const lower = word.toLowerCase();
  
  // Verificar correções comuns primeiro
  if (commonCorrections[lower]) {
    return [commonCorrections[lower]];
  }
  
  // Sugestões básicas (pode ser expandido)
  const suggestions = [];
  
  // Tentar remover acentos errados comuns
  const withoutAccents = lower
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u');
  
  if (withoutAccents !== lower && isValidWord(withoutAccents)) {
    suggestions.push(withoutAccents);
  }
  
  return suggestions.slice(0, 3);
}

export default function SpellCheckInput({ 
  value, 
  onChange, 
  className = '', 
  placeholder = '',
  disabled = false,
  rows = 3,
  ...props 
}) {
  const [errors, setErrors] = useState([]);
  const [menuPosition, setMenuPosition] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const textareaRef = useRef(null);
  const settings = getSpellCheckSettings();

  // Verificar ortografia
  useEffect(() => {
    if (!settings.enabled || !value) {
      setErrors([]);
      return;
    }

    const words = value.split(/\s+/);
    const newErrors = [];
    let currentPos = 0;

    words.forEach((word) => {
      const cleanWord = word.replace(/[.,;:!?()[\]{}'"]/g, '');
      
      if (cleanWord.length > 2) {
        // Verificar se não é número
        if (!/^\d+$/.test(cleanWord)) {
          // Verificar se não está no dicionário
          if (!isValidWord(cleanWord)) {
            const suggestions = getSuggestions(cleanWord);
            
            // Se tem auto-correção ativada e há sugestão clara
            if (settings.autoCorrect && suggestions.length === 1) {
              // Auto-corrigir
              const corrected = value.replace(
                new RegExp(`\\b${cleanWord}\\b`, 'g'),
                suggestions[0]
              );
              onChange({ target: { value: corrected } });
            } else {
              // Adicionar aos erros
              newErrors.push({
                word: cleanWord,
                position: currentPos,
                suggestions
              });
            }
          }
        }
      }
      
      currentPos += word.length + 1;
    });

    setErrors(newErrors);
  }, [value, settings.enabled, settings.autoCorrect]);

  // Lidar com clique direito
  const handleContextMenu = (e) => {
    if (!settings.enabled || errors.length === 0) return;

    e.preventDefault();
    
    const textarea = textareaRef.current;
    const clickPos = textarea.selectionStart;
    
    // Encontrar erro próximo ao clique
    const error = errors.find(err => {
      const start = err.position;
      const end = start + err.word.length;
      return clickPos >= start && clickPos <= end;
    });

    if (error) {
      setSelectedError(error);
      setMenuPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Aplicar correção
  const applyCorrection = (suggestion) => {
    if (!selectedError) return;

    const newValue = value.replace(
      new RegExp(`\\b${selectedError.word}\\b`, 'g'),
      suggestion
    );
    
    onChange({ target: { value: newValue } });
    setMenuPosition(null);
    setSelectedError(null);
  };

  // Adicionar ao dicionário
  const addToDictionary = (word) => {
    const { addToUserDictionary } = require('./MedicalDictionary');
    addToUserDictionary(word);
    setMenuPosition(null);
    setSelectedError(null);
    
    // Forçar re-render para remover erro
    setErrors(prev => prev.filter(e => e.word !== word));
  };

  // Ignorar
  const ignore = () => {
    setMenuPosition(null);
    setSelectedError(null);
  };

  return (
    <>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onContextMenu={handleContextMenu}
        className={`${className} ${settings.enabled && errors.length > 0 ? 'spell-check-active' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...props}
      />

      {menuPosition && selectedError && (
        <SpellCheckMenu
          position={menuPosition}
          error={selectedError}
          onCorrect={applyCorrection}
          onAddToDictionary={addToDictionary}
          onIgnore={ignore}
          onClose={() => setMenuPosition(null)}
        />
      )}

      <style jsx>{`
        .spell-check-active {
          position: relative;
        }
      `}</style>
    </>
  );
}
import React, { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus, X } from 'lucide-react';

export default function SpellCheckMenu({ 
  position, 
  error, 
  onCorrect, 
  onAddToDictionary, 
  onIgnore, 
  onClose 
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!position || !error) return null;

  return (
    <Card
      ref={menuRef}
      className="fixed z-50 bg-white border border-slate-200 shadow-lg p-2 min-w-[180px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="space-y-1">
        {/* Palavra com erro */}
        <div className="px-2 py-1 border-b border-slate-100">
          <p className="text-xs text-slate-500">
            "<span className="font-medium text-red-600">{error.word}</span>"
          </p>
        </div>

        {/* Sugestões */}
        {error.suggestions && error.suggestions.length > 0 ? (
          <div className="space-y-0.5">
            {error.suggestions.map((suggestion, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className="w-full justify-start h-7 text-xs hover:bg-blue-50"
                onClick={() => onCorrect(suggestion)}
              >
                <Check className="w-3 h-3 mr-2 text-green-600" />
                {suggestion}
              </Button>
            ))}
          </div>
        ) : (
          <div className="px-2 py-1">
            <p className="text-[10px] text-slate-400 italic">Sem sugestões</p>
          </div>
        )}

        {/* Ações */}
        <div className="pt-1 border-t border-slate-100 space-y-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-7 text-xs hover:bg-emerald-50"
            onClick={() => onAddToDictionary(error.word)}
          >
            <Plus className="w-3 h-3 mr-2 text-emerald-600" />
            Adicionar ao dicionário
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-7 text-xs hover:bg-slate-50"
            onClick={onIgnore}
          >
            <X className="w-3 h-3 mr-2 text-slate-500" />
            Ignorar
          </Button>
        </div>
      </div>
    </Card>
  );
}
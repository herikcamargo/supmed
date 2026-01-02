import React from 'react';

export default function DisclaimerFooter({ variant = 'default' }) {
  const textos = {
    default: 'Conteúdo com finalidade educacional. O aplicativo não realiza diagnóstico, não prescreve tratamento e não substitui a avaliação profissional.',
    calculadora: 'Calculadora com finalidade educacional. Os resultados são cálculos matemáticos de referência e não constituem classificação clínica definitiva.',
    ia: 'Análise gerada por inteligência artificial com finalidade educacional. Não constitui diagnóstico ou indicação de tratamento.',
    medicamento: 'Informações de referência educacional. Não constituem prescrição. A escolha e o ajuste de medicações dependem de avaliação profissional.',
    protocolo: 'Protocolo de referência educacional. Não substitui protocolos institucionais ou avaliação clínica individualizada.'
  };

  return (
    <div className="mt-6 pt-4 border-t border-slate-200">
      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        {textos[variant]}
      </p>
    </div>
  );
}
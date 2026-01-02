import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Image, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImageUploader({ imagens = [], onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo deve ser uma imagem');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx 5MB)');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const novaImagem = {
        url: file_url,
        tipo: 'clinica',
        legenda: '',
        ordem: imagens.length
      };
      
      onChange([...imagens, novaImagem]);
      toast.success('Imagem adicionada');
    } catch (error) {
      toast.error('Erro ao fazer upload');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const updateImagem = (index, field, value) => {
    const novas = [...imagens];
    novas[index][field] = value;
    onChange(novas);
  };

  const removeImagem = (index) => {
    onChange(imagens.filter((_, i) => i !== index));
  };

  const moveImagem = (index, direction) => {
    const novas = [...imagens];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= novas.length) return;
    
    [novas[index], novas[newIndex]] = [novas[newIndex], novas[index]];
    
    // Atualizar ordem
    novas.forEach((img, i) => {
      img.ordem = i;
    });
    
    onChange(novas);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">
          Imagens Clínicas
        </label>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <Button variant="outline" size="sm" disabled={uploading} asChild>
            <span>
              {uploading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              Upload
            </span>
          </Button>
        </label>
      </div>

      {imagens.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
          <Image className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Nenhuma imagem adicionada</p>
        </div>
      )}

      <div className="space-y-2">
        {imagens.map((img, i) => (
          <div key={i} className="bg-slate-50 rounded-lg p-3 border">
            <div className="flex gap-3">
              <img 
                src={img.url} 
                alt={img.legenda || 'Imagem clínica'} 
                className="w-20 h-20 object-cover rounded border"
              />
              
              <div className="flex-1 space-y-2">
                <Select 
                  value={img.tipo} 
                  onValueChange={(v) => updateImagem(i, 'tipo', v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinica">Imagem Clínica</SelectItem>
                    <SelectItem value="fluxograma">Fluxograma</SelectItem>
                    <SelectItem value="esquema">Esquema</SelectItem>
                    <SelectItem value="figura">Figura Explicativa</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Legenda (opcional)"
                  value={img.legenda}
                  onChange={(e) => updateImagem(i, 'legenda', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveImagem(i, 'up')}
                  disabled={i === 0}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveImagem(i, 'down')}
                  disabled={i === imagens.length - 1}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImagem(i)}
                  className="text-red-500"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-500">
        • Formatos: JPG, PNG, WebP • Tamanho máx: 5MB • Sem dados identificáveis de pacientes
      </p>
    </div>
  );
}
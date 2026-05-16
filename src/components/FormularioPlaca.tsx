
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import ColorPicker from './ColorPicker';

interface PlacaData {
  id: string;
  texto: string;
  x: number;
  y: number;
  cor: string;
}

interface FormularioPlacaProps {
  placa: PlacaData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (placaData: PlacaData) => void;
}

const FormularioPlaca: React.FC<FormularioPlacaProps> = ({ 
  placa, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [texto, setTexto] = useState('');
  const [cor, setCor] = useState('#3B82F6');

  useEffect(() => {
    if (placa) {
      setTexto(placa.texto);
      setCor(placa.cor);
    } else {
      setTexto('');
      setCor('#3B82F6');
    }
  }, [placa]);

  const handleSave = () => {
    if (!texto.trim()) return;

    const placaAtualizada: PlacaData = {
      id: placa?.id || `placa_${Date.now()}`,
      texto: texto.trim(),
      cor,
      x: placa?.x || 100,
      y: placa?.y || 100
    };

    onSave(placaAtualizada);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-gray-800 flex items-center gap-2 justify-center">
            <MapPin size={24} />
            {placa ? 'Editar' : 'Adicionar'} Placa
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="texto" className="text-sm font-medium text-gray-700">
              Texto da Placa
            </Label>
            <Input
              id="texto"
              placeholder="Ex: Área VIP, Entrada Principal..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Cor da Placa</Label>
            <div className="flex items-center gap-2">
              <ColorPicker
                color={cor}
                onChange={setCor}
              />
              <span className="text-sm text-gray-600">{cor}</span>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Preview</Label>
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <div 
                className="px-4 py-2 rounded-lg shadow-lg border-2 border-white text-white font-bold text-sm flex items-center gap-2"
                style={{ backgroundColor: cor }}
              >
                <MapPin size={14} />
                <span>{texto || 'Texto da placa'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!texto.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6"
          >
            {placa ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioPlaca;

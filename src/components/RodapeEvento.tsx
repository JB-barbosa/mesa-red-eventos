
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Edit, Save, X } from 'lucide-react';

interface RodapeEventoProps {
  endereco: string;
  onEnderecoChange: (endereco: string) => void;
}

const RodapeEvento: React.FC<RodapeEventoProps> = ({
  endereco,
  onEnderecoChange
}) => {
  const [editandoEndereco, setEditandoEndereco] = useState(false);
  const [enderecoTemp, setEnderecoTemp] = useState(endereco);

  const handleSalvarEndereco = () => {
    onEnderecoChange(enderecoTemp);
    setEditandoEndereco(false);
  };

  const handleCancelarEdicao = () => {
    setEnderecoTemp(endereco);
    setEditandoEndereco(false);
  };

  const abrirGoogleMaps = () => {
    if (endereco) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Localização do Evento</h3>
        </div>
        
        {!editandoEndereco && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditandoEndereco(true)}
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Editar
          </Button>
        )}
      </div>

      {editandoEndereco ? (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Endereço do Evento
            </Label>
            <Input
              value={enderecoTemp}
              onChange={(e) => setEnderecoTemp(e.target.value)}
              placeholder="Digite o endereço completo do evento..."
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSalvarEndereco}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              Salvar
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelarEdicao}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {endereco ? (
            <>
              <p className="text-gray-700 bg-gray-50 p-3 rounded border">
                {endereco}
              </p>
              <Button
                onClick={abrirGoogleMaps}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <MapPin size={16} />
                Ver no Google Maps
              </Button>
            </>
          ) : (
            <p className="text-gray-500 italic">
              Nenhum endereço configurado. Clique em "Editar" para adicionar a localização do evento.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RodapeEvento;

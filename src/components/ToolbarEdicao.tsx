
import React from 'react';
import { Button } from '@/components/ui/button';
import { Store, Plus, Edit, Save, X, MapPin, DoorOpen } from 'lucide-react';

interface ToolbarEdicaoProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  onAddBarraquinha: () => void;
  onAddCadeiras: () => void;
  onAddPlaca: () => void;
  onAddSaida: () => void;
  onSaveConfig: () => void;
}

const ToolbarEdicao: React.FC<ToolbarEdicaoProps> = ({
  editMode,
  onToggleEditMode,
  onAddBarraquinha,
  onAddCadeiras,
  onAddPlaca,
  onAddSaida,
  onSaveConfig
}) => {
  return (
    <div className="flex gap-2 mb-4 p-4 bg-white rounded-lg shadow-md border flex-wrap">
      <Button
        onClick={onToggleEditMode}
        variant={editMode ? "destructive" : "default"}
        className="flex items-center gap-2"
      >
        {editMode ? <X size={16} /> : <Edit size={16} />}
        {editMode ? 'Sair da Edição' : 'Modo Edição'}
      </Button>
      
      {editMode && (
        <>
          <Button
            onClick={onAddBarraquinha}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Store size={16} />
            Adicionar Barraquinha
          </Button>
          
          <Button
            onClick={onAddCadeiras}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar Cadeiras
          </Button>
          
          <Button
            onClick={onAddPlaca}
            variant="outline"
            className="flex items-center gap-2"
          >
            <MapPin size={16} />
            Adicionar Placa
          </Button>
          
          <Button
            onClick={onAddSaida}
            variant="outline"
            className="flex items-center gap-2"
          >
            <DoorOpen size={16} />
            Adicionar Saída/Entrada
          </Button>
          
          <Button
            onClick={() => {
              onSaveConfig();
              onToggleEditMode();
            }}
            variant="default"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white ml-auto"
          >
            <Save size={16} />
            Salvar e Sair
          </Button>
        </>
      )}
    </div>
  );
};

export default ToolbarEdicao;

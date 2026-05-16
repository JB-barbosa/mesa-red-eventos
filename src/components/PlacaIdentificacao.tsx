
import React from 'react';
import { cn } from '@/lib/utils';
import { Flag } from 'lucide-react';

interface PlacaData {
  id: string;
  texto: string;
  x: number;
  y: number;
  cor: string;
}

interface PlacaIdentificacaoProps {
  placa: PlacaData;
  onEdit: (placa: PlacaData) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, placa: PlacaData) => void;
  editMode: boolean;
}

const PlacaIdentificacao: React.FC<PlacaIdentificacaoProps> = ({
  placa,
  onEdit,
  onDelete,
  onDragStart,
  editMode
}) => {
  return (
    <div
      className={cn(
        "absolute cursor-pointer transition-all duration-200 select-none",
        editMode ? "cursor-move hover:scale-110 hover:shadow-lg ring-2 ring-blue-400 ring-opacity-50" : "hover:scale-110 hover:shadow-lg"
      )}
      style={{ 
        left: placa.x - 12, // Ajuste fixo para centralizar a bandeira (24px / 2)
        top: placa.y - 12,  // Ajuste fixo para centralizar a bandeira (24px / 2)
      }}
      draggable={editMode}
      onDragStart={(e) => editMode && onDragStart(e, placa)}
      onClick={() => editMode && onEdit(placa)}
      title={placa.texto}
    >
      <div className="relative">
        {/* Ícone de bandeira */}
        <Flag 
          size={24} 
          className="text-white drop-shadow-lg transition-transform duration-200"
          style={{ color: placa.cor }}
          fill={placa.cor}
        />
        
        {editMode && (
          <button
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors duration-200 z-10 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(placa.id);
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default PlacaIdentificacao;

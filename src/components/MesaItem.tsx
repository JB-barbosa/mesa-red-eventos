
import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MesaData {
  id: number;
  numeroPessoas?: number;
  nomeComprador?: string;
  nomesPessoas?: string[];
  contato?: string;
  ocupada: boolean;
  numeroExibicao?: number; // Número que será exibido na mesa
}

interface MesaItemProps {
  mesa: MesaData;
  onClick: (mesa: MesaData) => void;
  onDelete?: (mesaId: number) => void;
  editMode?: boolean;
}

const MesaItem: React.FC<MesaItemProps> = ({ mesa, onClick, onDelete, editMode = false }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(mesa.id);
    }
  };

  // Usar numeroExibicao se disponível, senão usar o id
  const numeroParaExibir = mesa.numeroExibicao || mesa.id;

  return (
    <div
      className={cn(
        "relative w-8 h-8 border-2 border-black cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg flex items-center justify-center text-xs font-bold",
        mesa.ocupada ? "bg-red-500 text-white" : "bg-green-400 hover:bg-green-500"
      )}
      onClick={() => onClick(mesa)}
      title={mesa.ocupada ? `Mesa ${numeroParaExibir} - ${mesa.nomeComprador} (${mesa.numeroPessoas} pessoas)` : `Mesa ${numeroParaExibir} - Disponível`}
    >
      {numeroParaExibir}
      
      {mesa.ocupada && mesa.numeroPessoas && (
        <Badge 
          variant="secondary" 
          className="absolute -top-1 -left-1 w-4 h-4 p-0 text-[8px] bg-blue-600 text-white rounded-full flex items-center justify-center border border-white"
        >
          {mesa.numeroPessoas}
        </Badge>
      )}
      
      {editMode && onDelete && (
        <button
          onClick={handleDelete}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors z-10"
          title="Excluir mesa"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
};

export default MesaItem;

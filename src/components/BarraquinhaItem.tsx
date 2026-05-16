import React from 'react';
import { cn } from '@/lib/utils';
import { Store, Users, Toilet, FireExtinguisher, BriefcaseMedical, DoorOpen, Copy } from 'lucide-react';

interface BarraquinhaData {
  id: string;
  nome: string;
  x: number;
  y: number;
  tipo: 'barraquinha' | 'cadeira_extra' | 'banheiro' | 'extintor' | 'primeiros_socorros' | 'saida_entrada';
  largura?: number;
  altura?: number;
  observacao?: string;
  cor?: string;
}

interface BarraquinhaItemProps {
  barraquinha: BarraquinhaData;
  onEdit: (barraquinha: BarraquinhaData) => void;
  onDelete: (id: string) => void;
  onDuplicate: (barraquinha: BarraquinhaData) => void;
  onDragStart: (e: React.DragEvent, barraquinha: BarraquinhaData) => void;
  onResizeStart: (e: React.MouseEvent, barraquinha: BarraquinhaData, direction: string) => void;
  editMode: boolean;
}

const BarraquinhaItem: React.FC<BarraquinhaItemProps> = ({ 
  barraquinha, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onDragStart,
  onResizeStart,
  editMode 
}) => {
  const getIcon = () => {
    const iconProps = { size: 16, className: "text-white drop-shadow-sm" };
    switch (barraquinha.tipo) {
      case 'barraquinha':
        return <Store {...iconProps} />;
      case 'cadeira_extra':
        return <Users {...iconProps} />;
      case 'banheiro':
        return <Toilet {...iconProps} />;
      case 'extintor':
        return <FireExtinguisher {...iconProps} />;
      case 'primeiros_socorros':
        return <BriefcaseMedical {...iconProps} />;
      case 'saida_entrada':
        return <DoorOpen {...iconProps} />;
      default:
        return <Store {...iconProps} />;
    }
  };

  const getCorPadrao = () => {
    if (barraquinha.cor) return barraquinha.cor;
    
    switch (barraquinha.tipo) {
      case 'barraquinha': return '#F59E0B';
      case 'cadeira_extra': return '#3B82F6';
      case 'banheiro': return '#6B7280';
      case 'extintor': return '#EF4444';
      case 'primeiros_socorros': return '#10B981';
      case 'saida_entrada': return '#8B5CF6';
      default: return '#F59E0B';
    }
  };

  const largura = barraquinha.largura || 64;
  const altura = barraquinha.altura || 64;
  const cor = getCorPadrao();

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(e, barraquinha, direction);
  };

  return (
    <div
      className={cn(
        "absolute cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl group select-none flex items-center justify-center",
        editMode ? "cursor-move ring-2 ring-blue-400 ring-opacity-50 rounded-lg" : ""
      )}
      style={{ 
        left: barraquinha.x, 
        top: barraquinha.y,
        transform: 'translate(-50%, -50%)',
        width: largura,
        height: altura
      }}
      draggable={editMode}
      onDragStart={(e) => editMode && onDragStart(e, barraquinha)}
      onClick={() => !editMode && onEdit(barraquinha)}
      title={barraquinha.observacao || barraquinha.nome}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {barraquinha.tipo === 'saida_entrada' ? (
          <div className="flex flex-col items-center justify-center text-gray-800">
            <DoorOpen size={Math.min(largura, altura) * 0.8} />
            <span className="text-[10px] mt-1 font-bold text-center leading-tight">
              {barraquinha.nome}
            </span>
          </div>
        ) : (
          <div 
            className="w-full h-full border-2 border-white rounded-lg flex flex-col items-center justify-center text-xs font-bold shadow-lg transition-all duration-200 hover:shadow-xl"
            style={{ backgroundColor: cor }}
          >
            {getIcon()}
            <span className="text-[10px] mt-1 text-center leading-tight px-1 text-white drop-shadow-sm">
              {barraquinha.tipo === 'cadeira_extra' ? `+${barraquinha.nome}` : barraquinha.nome}
            </span>
          </div>
        )}
        
        {editMode && (
          <>
            <button
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors duration-200 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(barraquinha.id);
              }}
              title="Excluir"
            >
              ×
            </button>

            <button
              className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 shadow-lg transition-colors duration-200 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(barraquinha);
              }}
              title="Duplicar"
            >
              <Copy size={12} />
            </button>
            
            {/* Handles de redimensionamento */}
            {/* Canto inferior direito */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 shadow-lg z-10 border-2 border-white"
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
              title="Redimensionar"
            />
            
            {/* Lateral direita */}
            <div
              className="absolute top-1/2 -right-1 w-3 h-6 bg-blue-500 rounded cursor-e-resize hover:bg-blue-600 shadow-lg z-10 border border-white transform -translate-y-1/2"
              onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
              title="Redimensionar largura"
            />
            
            {/* Parte inferior */}
            <div
              className="absolute -bottom-1 left-1/2 w-6 h-3 bg-blue-500 rounded cursor-s-resize hover:bg-blue-600 shadow-lg z-10 border border-white transform -translate-x-1/2"
              onMouseDown={(e) => handleResizeMouseDown(e, 's')}
              title="Redimensionar altura"
            />
          </>
        )}

        {/* Indicador de observação */}
        {!editMode && barraquinha.observacao && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default BarraquinhaItem;


import React from 'react';
import { cn } from '@/lib/utils';

interface PalcoEditavelProps {
  largura: number;
  altura: number;
  distanciaMesas: number;
  onResize: (largura: number, altura: number) => void;
  onDistanceChange: (distancia: number) => void;
  editMode: boolean;
}

const PalcoEditavel: React.FC<PalcoEditavelProps> = ({
  largura,
  altura,
  distanciaMesas,
  onResize,
  onDistanceChange,
  editMode
}) => {
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startLargura = largura;
    const startAltura = altura;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newLargura = startLargura;
      let newAltura = startAltura;

      switch (direction) {
        case 'se':
          newLargura = Math.max(200, startLargura + deltaX);
          newAltura = Math.max(80, startAltura + deltaY);
          break;
        case 'e':
          newLargura = Math.max(200, startLargura + deltaX);
          break;
        case 's':
          newAltura = Math.max(80, startAltura + deltaY);
          break;
      }

      newLargura = Math.min(1200, newLargura);
      newAltura = Math.min(400, newAltura);

      onResize(newLargura, newAltura);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDistanceMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startY = e.clientY;
    const startDistance = distanciaMesas;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newDistance = Math.max(20, Math.min(300, startDistance + deltaY));
      onDistanceChange(newDistance);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex justify-center" style={{ marginBottom: distanciaMesas }}>
      <div className="relative">
        <div 
          className={cn(
            "border-4 border-gray-800 bg-gradient-to-br from-gray-100 to-gray-200 text-center rounded-xl shadow-lg flex items-center justify-center",
            editMode ? "ring-2 ring-blue-400 ring-opacity-50" : ""
          )}
          style={{ width: largura, height: altura, padding: '16px' }}
        >
          <h1 className="text-2xl font-bold tracking-wider text-gray-800">PALCO / DANÇA</h1>
        </div>
        
        {editMode && (
          <>
            {/* Handles de redimensionamento do palco */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full cursor-se-resize hover:bg-purple-600 shadow-lg z-10 border-2 border-white"
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
              title="Redimensionar palco"
            />
            <div
              className="absolute top-1/2 -right-1 w-3 h-6 bg-purple-500 rounded cursor-e-resize hover:bg-purple-600 shadow-lg z-10 border border-white transform -translate-y-1/2"
              onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
              title="Redimensionar largura"
            />
            <div
              className="absolute -bottom-1 left-1/2 w-6 h-3 bg-purple-500 rounded cursor-s-resize hover:bg-purple-600 shadow-lg z-10 border border-white transform -translate-x-1/2"
              onMouseDown={(e) => handleResizeMouseDown(e, 's')}
              title="Redimensionar altura"
            />
            
            {/* Handle para ajustar distância das mesas */}
            <div
              className="absolute -bottom-8 left-1/2 w-8 h-4 bg-orange-500 rounded cursor-s-resize hover:bg-orange-600 shadow-lg z-10 border border-white transform -translate-x-1/2 flex items-center justify-center"
              onMouseDown={handleDistanceMouseDown}
              title="Ajustar distância das mesas (20-300px)"
            >
              <div className="w-4 h-0.5 bg-white rounded"></div>
            </div>
            
            {/* Indicador visual da distância */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
              {distanciaMesas}px
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PalcoEditavel;


import { useCallback } from 'react';
import { findValidPositionForPlaca } from '@/utils/collisionDetection';

interface PlacaData {
  id: string;
  texto: string;
  x: number;
  y: number;
  cor: string;
}

interface BarraquinhaData {
  id: string;
  nome: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
  cor: string;
}

interface MesaData {
  id: number;
  x: number;
  y: number;
}

interface UsePlacaCollisionProps {
  placas: PlacaData[];
  barraquinhas: BarraquinhaData[];
  mesas: MesaData[];
  containerWidth?: number;
  containerHeight?: number;
}

export const usePlacaCollision = ({
  placas,
  barraquinhas,
  mesas,
  containerWidth = 1400,
  containerHeight = 900
}: UsePlacaCollisionProps) => {
  
  const getValidPositionForPlaca = useCallback((
    targetPlaca: PlacaData,
    excludeId?: string
  ): { x: number; y: number } => {
    // Filtrar placas existentes (excluindo a atual se estiver editando)
    const existingPlacas = placas
      .filter(p => p.id !== excludeId)
      .map(p => ({ x: p.x, y: p.y }));
    
    // Mapear barraquinhas para formato de posição
    const existingBarraquinhas = barraquinhas.map(b => ({
      x: b.x,
      y: b.y,
      largura: b.largura,
      altura: b.altura
    }));
    
    // Mapear mesas para formato de posição
    const existingMesas = mesas.map(m => ({ x: m.x, y: m.y }));
    
    return findValidPositionForPlaca(
      { x: targetPlaca.x, y: targetPlaca.y },
      existingPlacas,
      existingBarraquinhas,
      existingMesas,
      containerWidth,
      containerHeight,
      32, // tamanho da placa
      32  // tamanho da mesa
    );
  }, [placas, barraquinhas, mesas, containerWidth, containerHeight]);
  
  return { getValidPositionForPlaca };
};

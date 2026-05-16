
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Grid, Plus, Minus } from 'lucide-react';

interface ConfiguracaoMesasProps {
  linhas: number;
  colunas: number;
  onLinhasChange: (linhas: number) => void;
  onColunasChange: (colunas: number) => void;
  onTotalMesasChange: (total: number) => void;
  editMode: boolean;
  mesasExcluidas: Set<number>;
  totalMesasVisiveis: number;
}

const ConfiguracaoMesas: React.FC<ConfiguracaoMesasProps> = ({
  linhas,
  colunas,
  onLinhasChange,
  onColunasChange,
  onTotalMesasChange,
  editMode,
  mesasExcluidas,
  totalMesasVisiveis
}) => {
  if (!editMode) return null;

  const totalMesasCalculado = linhas * colunas;
  const mesasExcluidasCount = mesasExcluidas.size;

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoTotal = parseInt(e.target.value) || 1;
    onTotalMesasChange(novoTotal);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Grid size={20} />
        <h3 className="text-lg font-bold text-gray-800">Configuração das Mesas</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Linhas</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLinhasChange(Math.max(1, linhas - 1))}
              disabled={linhas <= 1}
            >
              <Minus size={16} />
            </Button>
            <Input
              type="number"
              min="1"
              max="50"
              value={linhas}
              onChange={(e) => onLinhasChange(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-20 text-center"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLinhasChange(Math.min(50, linhas + 1))}
              disabled={linhas >= 50}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Colunas</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onColunasChange(Math.max(1, colunas - 1))}
              disabled={colunas <= 1}
            >
              <Minus size={16} />
            </Button>
            <Input
              type="number"
              min="1"
              max="50"
              value={colunas}
              onChange={(e) => onColunasChange(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-20 text-center"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onColunasChange(Math.min(50, colunas + 1))}
              disabled={colunas >= 50}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Total de Mesas Visíveis</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTotalMesasChange(Math.max(1, totalMesasVisiveis - 1))}
              disabled={totalMesasVisiveis <= 1}
            >
              <Minus size={16} />
            </Button>
            <Input
              type="number"
              min="1"
              max="2500"
              value={totalMesasVisiveis}
              onChange={handleTotalChange}
              className="w-24 text-center"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTotalMesasChange(Math.min(2500, totalMesasVisiveis + 1))}
              disabled={totalMesasVisiveis >= 2500}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Layout atual: <span className="font-bold">{linhas} linhas × {colunas} colunas = {totalMesasCalculado} mesas criadas</span>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Mesas visíveis no mapa: <span className="font-bold">{totalMesasVisiveis}</span> 
          {mesasExcluidasCount > 0 && (
            <span> ({mesasExcluidasCount} excluída{mesasExcluidasCount > 1 ? 's' : ''})</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ConfiguracaoMesas;

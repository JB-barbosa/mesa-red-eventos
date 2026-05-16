import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Store, Users, Toilet, FireExtinguisher, BriefcaseMedical, DoorOpen } from 'lucide-react';

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

interface FormularioBarraquinhaProps {
  barraquinha: BarraquinhaData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (barraquinhaData: BarraquinhaData) => void;
}

const coresDisponiveis = [
  { nome: 'Amarelo', valor: '#F59E0B' },
  { nome: 'Azul', valor: '#3B82F6' },
  { nome: 'Verde', valor: '#10B981' },
  { nome: 'Vermelho', valor: '#EF4444' },
  { nome: 'Roxo', valor: '#8B5CF6' },
  { nome: 'Rosa', valor: '#EC4899' },
  { nome: 'Laranja', valor: '#F97316' },
  { nome: 'Ciano', valor: '#06B6D4' },
];

const FormularioBarraquinha: React.FC<FormularioBarraquinhaProps> = ({ 
  barraquinha, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'barraquinha' | 'cadeira_extra' | 'banheiro' | 'extintor' | 'primeiros_socorros' | 'saida_entrada'>('barraquinha');
  const [largura, setLargura] = useState(64);
  const [altura, setAltura] = useState(64);
  const [observacao, setObservacao] = useState('');
  const [cor, setCor] = useState('#F59E0B');

  const tipoOptions = [
    { value: 'barraquinha', label: 'Barraquinha', icon: Store },
    { value: 'cadeira_extra', label: 'Cadeiras Extra', icon: Users },
    { value: 'banheiro', label: 'Banheiro', icon: Toilet },
    { value: 'extintor', label: 'Extintor de Incêndio', icon: FireExtinguisher },
    { value: 'primeiros_socorros', label: 'Primeiros Socorros', icon: BriefcaseMedical },
    { value: 'saida_entrada', label: 'Saída/Entrada', icon: DoorOpen },
  ];

  useEffect(() => {
    if (barraquinha) {
      setNome(barraquinha.nome);
      setTipo(barraquinha.tipo);
      setLargura(barraquinha.largura || 64);
      setAltura(barraquinha.altura || 64);
      setObservacao(barraquinha.observacao || '');
      setCor(barraquinha.cor || getCorPadrao(barraquinha.tipo));
    } else {
      setNome('');
      setTipo('barraquinha');
      setLargura(64);
      setAltura(64);
      setObservacao('');
      setCor('#F59E0B');
    }
  }, [barraquinha]);

  const getCorPadrao = (tipoItem: string) => {
    switch (tipoItem) {
      case 'barraquinha': return '#F59E0B';
      case 'cadeira_extra': return '#3B82F6';
      case 'banheiro': return '#6B7280';
      case 'extintor': return '#EF4444';
      case 'primeiros_socorros': return '#10B981';
      case 'saida_entrada': return '#8B5CF6';
      default: return '#F59E0B';
    }
  };

  const handleSave = () => {
    if (!nome.trim()) return;

    const barraquinhaAtualizada: BarraquinhaData = {
      id: barraquinha?.id || `${tipo}_${Date.now()}`,
      nome: nome.trim(),
      tipo,
      largura,
      altura,
      observacao: observacao.trim(),
      cor,
      x: barraquinha?.x || 100,
      y: barraquinha?.y || 100
    };

    onSave(barraquinhaAtualizada);
    onClose();
  };

  const getLabelForTipo = () => {
    const option = tipoOptions.find(opt => opt.value === tipo);
    switch (tipo) {
      case 'cadeira_extra':
        return 'Número de Cadeiras';
      case 'banheiro':
        return 'Identificação do Banheiro';
      case 'extintor':
        return 'Localização do Extintor';
      case 'primeiros_socorros':
        return 'Kit de Primeiros Socorros';
      case 'saida_entrada':
        return 'Nome da Saída/Entrada';
      default:
        return 'Nome da Barraquinha';
    }
  };

  const getPlaceholder = () => {
    switch (tipo) {
      case 'cadeira_extra':
        return 'Ex: 10';
      case 'banheiro':
        return 'Ex: Banheiro Masculino';
      case 'extintor':
        return 'Ex: Extintor A1';
      case 'primeiros_socorros':
        return 'Ex: Kit Principal';
      case 'saida_entrada':
        return 'Ex: Entrada Principal';
      default:
        return 'Ex: Lanchonete';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-gray-800 flex items-center gap-2 justify-center">
            {tipoOptions.find(opt => opt.value === tipo)?.icon && 
              React.createElement(tipoOptions.find(opt => opt.value === tipo)!.icon, { size: 24 })
            }
            {barraquinha ? 'Editar' : 'Adicionar'} {tipoOptions.find(opt => opt.value === tipo)?.label}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">Tipo</Label>
            <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {tipoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <option.icon size={16} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
              {getLabelForTipo()}
            </Label>
            <Input
              id="nome"
              placeholder={getPlaceholder()}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="largura" className="text-sm font-medium text-gray-700">Largura (px)</Label>
              <Input
                id="largura"
                type="number"
                min="32"
                max="200"
                value={largura}
                onChange={(e) => setLargura(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altura" className="text-sm font-medium text-gray-700">Altura (px)</Label>
              <Input
                id="altura"
                type="number"
                min="32"
                max="200"
                value={altura}
                onChange={(e) => setAltura(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Cor</Label>
            <div className="grid grid-cols-4 gap-2">
              {coresDisponiveis.map((corOption) => (
                <button
                  key={corOption.valor}
                  className={`w-full h-10 rounded-lg border-2 transition-all flex items-center justify-center text-white font-medium text-xs ${
                    cor === corOption.valor ? 'border-gray-800 scale-105' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: corOption.valor }}
                  onClick={() => setCor(corOption.valor)}
                >
                  {corOption.nome}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao" className="text-sm font-medium text-gray-700">Observações</Label>
            <Textarea
              id="observacao"
              placeholder="Adicione observações ou descrições..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full resize-none"
              rows={3}
            />
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
            disabled={!nome.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6"
          >
            {barraquinha ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioBarraquinha;


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface MesaData {
  id: number;
  numeroPessoas?: number;
  nomeComprador?: string;
  nomesPessoas?: string[];
  contato?: string;
  ocupada: boolean;
}

interface FormularioMesaProps {
  mesa: MesaData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mesaData: MesaData) => void;
}

const FormularioMesa: React.FC<FormularioMesaProps> = ({ mesa, isOpen, onClose, onSave }) => {
  const [numeroPessoas, setNumeroPessoas] = useState('');
  const [nomeComprador, setNomeComprador] = useState('');
  const [contato, setContato] = useState('');
  const [nomesPessoas, setNomesPessoas] = useState<string[]>([]);

  useEffect(() => {
    if (mesa) {
      setNumeroPessoas(mesa.numeroPessoas?.toString() || '');
      setNomeComprador(mesa.nomeComprador || '');
      setContato(mesa.contato || '');
      setNomesPessoas(mesa.nomesPessoas || []);
    }
  }, [mesa]);

  // Atualizar lista de nomes quando o número de pessoas mudar
  useEffect(() => {
    const num = parseInt(numeroPessoas) || 0;
    setNomesPessoas(prev => {
      const novo = [...prev];
      if (num > prev.length) {
        for (let i = prev.length; i < num; i++) {
          novo.push('');
        }
      } else if (num < prev.length) {
        return novo.slice(0, num);
      }
      return novo;
    });
  }, [numeroPessoas]);

  const handleNomePessoaChange = (index: number, valor: string) => {
    const novosNomes = [...nomesPessoas];
    novosNomes[index] = valor;
    setNomesPessoas(novosNomes);
  };

  const handleSave = () => {
    if (!mesa || !numeroPessoas || !nomeComprador || !contato) return;

    const mesaAtualizada: MesaData = {
      ...mesa,
      numeroPessoas: parseInt(numeroPessoas),
      nomeComprador,
      nomesPessoas,
      contato,
      ocupada: true
    };

    onSave(mesaAtualizada);
    onClose();
  };

  const handleClear = () => {
    if (!mesa) return;

    const mesaLimpa: MesaData = {
      ...mesa,
      numeroPessoas: undefined,
      nomeComprador: undefined,
      nomesPessoas: undefined,
      contato: undefined,
      ocupada: false
    };

    onSave(mesaLimpa);
    onClose();
  };

  if (!mesa) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            Mesa {mesa.id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pessoas">Número de Pessoas</Label>
            <Input
              id="pessoas"
              type="number"
              placeholder="Ex: 4"
              value={numeroPessoas}
              onChange={(e) => setNumeroPessoas(e.target.value)}
              min="1"
              max="10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Comprador Responsável</Label>
            <Input
              id="nome"
              placeholder="Digite o nome completo"
              value={nomeComprador}
              onChange={(e) => setNomeComprador(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contato">Número de Contato</Label>
            <Input
              id="contato"
              placeholder="(11) 99999-9999"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
            />
          </div>

          {nomesPessoas.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-sm font-semibold text-gray-700">Nomes das Pessoas na Mesa</Label>
              {nomesPessoas.map((nome, index) => (
                <div key={index} className="space-y-1">
                  <Label htmlFor={`pessoa-${index}`} className="text-xs text-gray-500">
                    Pessoa {index + 1} {index === 0 ? '(Responsável)' : ''}
                  </Label>
                  <Input
                    id={`pessoa-${index}`}
                    placeholder={`Nome da pessoa ${index + 1}`}
                    value={nome}
                    onChange={(e) => handleNomePessoaChange(index, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-between">
          {mesa.ocupada && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            >
              Liberar Mesa
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!numeroPessoas || !nomeComprador || !contato}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Confirmar Reserva
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioMesa;

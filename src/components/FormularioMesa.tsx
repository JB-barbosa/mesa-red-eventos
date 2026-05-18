import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  onSave: (mesaData: MesaData) => Promise<boolean>;
}

const FormularioMesa: React.FC<FormularioMesaProps> = ({ mesa, isOpen, onClose, onSave }) => {
  const [numeroPessoas, setNumeroPessoas] = useState('');
  const [nomeComprador, setNomeComprador] = useState('');
  const [contato, setContato] = useState('');
  const [nomesPessoas, setNomesPessoas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

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

  const handleSave = async () => {
    if (!mesa || !numeroPessoas || !nomeComprador || !contato) return;

    setSalvando(true);
    try {
      const mesaAtualizada: MesaData = {
        ...mesa,
        numeroPessoas: parseInt(numeroPessoas),
        nomeComprador,
        nomesPessoas,
        contato,
        ocupada: true
      };

      const success = await onSave(mesaAtualizada);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar mesa:', error);
    } finally {
      setSalvando(false);
    }
  };

  const handleClear = async () => {
    if (!mesa) return;

    setSalvando(true);
    try {
      const mesaLimpa: MesaData = {
        ...mesa,
        numeroPessoas: undefined,
        nomeComprador: undefined,
        nomesPessoas: undefined,
        contato: undefined,
        ocupada: false
      };

      const success = await onSave(mesaLimpa);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao liberar mesa:', error);
    } finally {
      setSalvando(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Impedir fechamento manual clicando fora ou no X se estiver salvando
    if (salvando) return;
    if (!open) onClose();
  };

  if (!mesa) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white" onPointerDownOutside={(e) => salvando && e.preventDefault()} onEscapeKeyDown={(e) => salvando && e.preventDefault()}>
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
              disabled={salvando}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Comprador Responsável</Label>
            <Input
              id="nome"
              placeholder="Digite o nome completo"
              value={nomeComprador}
              onChange={(e) => setNomeComprador(e.target.value)}
              disabled={salvando}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contato">Número de Contato</Label>
            <Input
              id="contato"
              placeholder="(11) 99999-9999"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
              disabled={salvando}
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
                    disabled={salvando}
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
              disabled={salvando}
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50 flex items-center justify-center"
            >
              {salvando ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
              ) : (
                'Liberar Mesa'
              )}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={salvando || !numeroPessoas || !nomeComprador || !contato}
            className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
          >
            {salvando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              'Confirmar Reserva'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioMesa;

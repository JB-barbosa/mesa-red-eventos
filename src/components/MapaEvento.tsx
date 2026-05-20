import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import MesaItem from './MesaItem';
import FormularioMesa from './FormularioMesa';
import BarraquinhaItem from './BarraquinhaItem';
import FormularioBarraquinha from './FormularioBarraquinha';
import ToolbarEdicao from './ToolbarEdicao';
import PalcoEditavel from './PalcoEditavel';
import PlacaIdentificacao from './PlacaIdentificacao';
import FormularioPlaca from './FormularioPlaca';
import ConfiguracaoMesas from './ConfiguracaoMesas';
import RodapeEvento from './RodapeEvento';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEventData } from '@/hooks/useEventData';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Printer, Flag, FileSpreadsheet, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { detectCollision, findNearestValidPosition } from '@/utils/collisionDetection';

interface MesaData {
  id: number;
  numeroPessoas?: number;
  nomeComprador?: string;
  nomesPessoas?: string[];
  contato?: string;
  ocupada: boolean;
}

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

interface PlacaData {
  id: string;
  texto: string;
  x: number;
  y: number;
  cor: string;
}

const coresBandeirinhas = [
  '#1e3a8a', // Azul marinho
  '#fbbf24', // Amarela
  '#ef4444', // Vermelha
  '#10b981', // Verde
  '#8b5cf6', // Roxa
  '#ec4899', // Pink
  '#000000', // Preta
  '#6b7280', // Cinza
  '#92400e', // Marrom
  '#f97316', // Laranja
  '#f472b6', // Rosa
  '#a78bfa', // Lilás
  '#3b82f6'  // Azul claro
];

const nomesCoresBandeirinhas: Record<string, string> = {
  '#1e3a8a': 'Azul Marinho',
  '#fbbf24': 'Amarela',
  '#ef4444': 'Vermelha',
  '#10b981': 'Verde',
  '#8b5cf6': 'Roxa',
  '#ec4899': 'Pink',
  '#000000': 'Preta',
  '#6b7280': 'Cinza',
  '#92400e': 'Marrom',
  '#f97316': 'Laranja',
  '#f472b6': 'Rosa',
  '#a78bfa': 'Lilás',
  '#3b82f6': 'Azul Claro',
};

const MapaEvento: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    loadEventData, 
    saveEventData, 
    loading, 
    setLoading, 
    dataLoaded, 
    saving, 
    resetState,
    remoteUpdatedAt,
    lastSyncTime,
    setLastSyncTime
  } = useEventData();
  const mapaRef = useRef<HTMLDivElement>(null);
  const isInitializingRef = useRef(true);
  const pendingImmediateSaveRef = useRef(false);
  const hasUserEditedRef = useRef(false);
  
  const [linhas, setLinhas] = useState(17);
  const [colunas, setColunas] = useState(11);
  const [mesaSelecionada, setMesaSelecionada] = useState<MesaData | null>(null);
  const [formularioMesaAberto, setFormularioMesaAberto] = useState(false);
  
  const [larguraPalco, setLarguraPalco] = useState(400);
  const [alturaPalco, setAlturaPalco] = useState(120);
  const [distanciaMesas, setDistanciaMesas] = useState(80);
  
  const [barraquinhaSelecionada, setBarraquinhaSelecionada] = useState<BarraquinhaData | null>(null);
  const [formularioBarraquinhaAberto, setFormularioBarraquinhaAberto] = useState(false);
  const [barraquinhas, setBarraquinhas] = useState<BarraquinhaData[]>([]);
  
  const [placaSelecionada, setPlacaSelecionada] = useState<PlacaData | null>(null);
  const [formularioPlacaAberto, setFormularioPlacaAberto] = useState(false);
  const [placas, setPlacas] = useState<PlacaData[]>([]);
  
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState<BarraquinhaData | PlacaData | null>(null);
  const [resizing, setResizing] = useState<{
    item: BarraquinhaData;
    direction: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const [enderecoEvento, setEnderecoEvento] = useState('');
  const [mesasExcluidas, setMesasExcluidas] = useState<Set<number>>(new Set());

  const [mesas, setMesas] = useState<MesaData[]>(() => {
    const mesasIniciais: MesaData[] = [];
    for (let i = 1; i <= linhas * colunas; i++) {
      mesasIniciais.push({
        id: i,
        ocupada: false
      });
    }
    return mesasIniciais;
  });

  const [espacamentoHorizontal, setEspacamentoHorizontal] = useState(12);

  const eventData = useMemo(() => ({
    nome: 'Meu Evento',
    endereco: enderecoEvento,
    linhas,
    colunas,
    larguraPalco,
    alturaPalco,
    distanciaMesas,
    espacamentoHorizontal,
    mesas,
    barraquinhas,
    placas,
    mesasExcluidas
  }), [
    enderecoEvento, linhas, colunas, larguraPalco, alturaPalco, 
    distanciaMesas, espacamentoHorizontal, mesas, barraquinhas, 
    placas, mesasExcluidas
  ]);

  const { scheduleSave, saveImmediately } = useDebouncedSave({
    delay: 1500,
    onSave: async () => {
      const success = await saveEventData(eventData);
      if (success) {
        setHasUnsavedChanges(false);
        hasUserEditedRef.current = false;
      }
      return success;
    },
    enabled: dataLoaded && !!user
  });

  useEffect(() => {
    if (loading || !user || !dataLoaded || isInitializingRef.current) {
      return;
    }

    setHasUnsavedChanges(true);

    if (pendingImmediateSaveRef.current) {
      console.log('🚀 Salvamento imediato solicitado por ação prioritária');
      pendingImmediateSaveRef.current = false;
      saveImmediately().then((success) => {
        if (success) setHasUnsavedChanges(false);
      });
    } else {
      console.log('📝 Detectada mudança nos dados - agendando salvamento automático');
      scheduleSave();
    }
  }, [eventData, loading, user, dataLoaded, scheduleSave, saveImmediately]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && user && dataLoaded) {
        console.log('💾 Salvando projeto antes de sair...');
        saveImmediately();
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas!';
        return 'Você tem alterações não salvas!';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, dataLoaded, saveImmediately, hasUnsavedChanges]);

  React.useEffect(() => {
    const totalMesas = linhas * colunas;
    setMesas(prev => {
      // Se o tamanho já está correto, não criar nova referência
      if (prev.length === totalMesas) {
        // Verificar se todas as mesas existem com os IDs corretos
        let allMatch = true;
        for (let i = 0; i < totalMesas; i++) {
          if (!prev[i] || prev[i].id !== i + 1) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) return prev; // Retorna a mesma referência - sem re-render
      }
      
      const novasMesas: MesaData[] = [];
      for (let i = 1; i <= totalMesas; i++) {
        const mesaExistente = prev.find(m => m.id === i);
        novasMesas.push(mesaExistente || {
          id: i,
          ocupada: false
        });
      }
      
      return novasMesas;
    });
  }, [linhas, colunas]);

  const calcularLinhasColunas = (total: number) => {
    if (total <= 50) {
      const raiz = Math.sqrt(total);
      let linhas = Math.floor(raiz);
      let colunas = Math.ceil(total / linhas);
      
      while (linhas * colunas < total) {
        if (colunas * linhas < total) {
          colunas++;
        }
      }
      
      return { linhas, colunas };
    }
    
    let melhorColunas = Math.min(20, Math.max(10, Math.ceil(Math.sqrt(total))));
    let melhorLinhas = Math.ceil(total / melhorColunas);
    
    if (melhorLinhas > 50) {
      melhorLinhas = 50;
      melhorColunas = Math.ceil(total / melhorLinhas);
    }
    
    while (melhorLinhas * melhorColunas < total) {
      if (melhorColunas < 50) {
        melhorColunas++;
      } else {
        melhorLinhas++;
      }
    }
    
    return { linhas: melhorLinhas, colunas: melhorColunas };
  };

  const handleTotalMesasChange = (novoTotal: number) => {
    if (novoTotal < 1 || novoTotal > 2500) return;
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;

    const gridAtual = linhas * colunas;
    const visivelAtual = gridAtual - mesasExcluidas.size;
    const diferenca = novoTotal - visivelAtual;

    if (diferenca === 0) return;

    const novasMesasExcluidas = new Set(mesasExcluidas);

    if (diferenca > 0) {
      if (novoTotal > gridAtual) {
        const rowsNeeded = Math.ceil((novoTotal - gridAtual) / colunas);
        const novasLinhas = linhas + rowsNeeded;
        const novaGrid = novasLinhas * colunas;
        const excess = novaGrid - novoTotal;

        for (let i = 0; i < excess; i++) {
          novasMesasExcluidas.add(novaGrid - i);
        }
        setLinhas(novasLinhas);
      } else {
        const idsExcluidos = Array.from(novasMesasExcluidas).sort((a, b) => a - b);
        let restaurados = 0;
        for (const id of idsExcluidos) {
          if (restaurados >= diferenca) break;
          novasMesasExcluidas.delete(id);
          restaurados++;
        }
      }
    } else {
      const excluir = Math.abs(diferenca);
      for (let i = gridAtual; i >= 1 && novasMesasExcluidas.size < gridAtual - novoTotal; i--) {
        if (!novasMesasExcluidas.has(i)) {
          const mesa = mesas.find(m => m.id === i);
          if (mesa && !mesa.ocupada) {
            novasMesasExcluidas.add(i);
          }
        }
      }
    }

    setMesasExcluidas(novasMesasExcluidas);

    toast({
      title: "Total de mesas atualizado!",
      description: `Configurado para ${novoTotal} mesas visíveis`,
    });
  };

  const handleLinhasChange = (novasLinhas: number) => {
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;
    setLinhas(novasLinhas);
    toast({
      title: "Linhas atualizadas!",
      description: `Agora temos ${novasLinhas} linhas × ${colunas} colunas = ${novasLinhas * colunas} mesas`,
    });
  };

  const handleColunasChange = (novasColunas: number) => {
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;
    setColunas(novasColunas);
    toast({
      title: "Colunas atualizadas!",
      description: `Agora temos ${linhas} linhas × ${novasColunas} colunas = ${linhas * novasColunas} mesas`,
    });
  };

  const handleDeleteMesa = (mesaId: number) => {
    console.log('Excluindo mesa:', mesaId);
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;
    setMesasExcluidas(prev => {
      const novasExcluidas = new Set(prev);
      novasExcluidas.add(mesaId);
      console.log('Mesas excluídas atualizadas:', novasExcluidas);
      return novasExcluidas;
    });
    
    toast({
      title: "Mesa excluída!",
      description: `Mesa ${mesaId} foi removida`,
    });
  };

  const handleMesaClick = (mesa: MesaData) => {
    if (editMode) return;
    setMesaSelecionada(mesa);
    setFormularioMesaAberto(true);
  };

  const handleSaveMesa = async (mesaAtualizada: MesaData): Promise<boolean> => {
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;

    // 1. Criar novo array de mesas sincronamente
    const novasMesas = mesas.map(mesa => 
      mesa.id === mesaAtualizada.id ? mesaAtualizada : mesa
    );

    // 2. Atualizar estado local
    setMesas(novasMesas);

    // 3. Montar dados completos do evento atualizados para o banco
    const dadosEventoAtualizados = {
      nome: 'Meu Evento',
      endereco: enderecoEvento,
      linhas,
      colunas,
      larguraPalco,
      alturaPalco,
      distanciaMesas,
      espacamentoHorizontal,
      mesas: novasMesas,
      barraquinhas,
      placas,
      mesasExcluidas
    };

    console.log('💾 Salvando alteração de mesa de forma prioritária e síncrona no banco...');
    
    // 4. Gravar diretamente e aguardar
    const success = await saveEventData(dadosEventoAtualizados);

    if (success) {
      toast({
        title: mesaAtualizada.ocupada ? "Mesa Reservada!" : "Mesa Liberada!",
        description: mesaAtualizada.ocupada 
          ? `Mesa ${mesaAtualizada.id} reservada para ${mesaAtualizada.nomeComprador}`
          : `Mesa ${mesaAtualizada.id} está novamente disponível`,
      });
      // Marcar que as alterações foram salvas
      setHasUnsavedChanges(false);
      hasUserEditedRef.current = false;
    } else {
      toast({
        title: "Erro ao salvar reserva",
        description: "Não foi possível gravar no banco. Por favor, tente novamente.",
        variant: "destructive"
      });
    }

    return success;
  };

  const handleAddBarraquinha = () => {
    setBarraquinhaSelecionada(null);
    setFormularioBarraquinhaAberto(true);
  };

  const handleAddCadeiras = () => {
    setBarraquinhaSelecionada({
      id: '',
      nome: '',
      x: 100,
      y: 100,
      tipo: 'cadeira_extra'
    });
    setFormularioBarraquinhaAberto(true);
  };

  const handleAddSaida = () => {
    setBarraquinhaSelecionada({
      id: '',
      nome: '',
      x: 100,
      y: 100,
      tipo: 'saida_entrada'
    });
    setFormularioBarraquinhaAberto(true);
  };

  const handleAddPlaca = () => {
    setPlacaSelecionada(null);
    setFormularioPlacaAberto(true);
  };

  const handleSaveBarraquinha = (barraquinhaData: BarraquinhaData) => {
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;
    if (barraquinhaSelecionada?.id) {
      setBarraquinhas(prev => prev.map(b => 
        b.id === barraquinhaData.id ? barraquinhaData : b
      ));
    } else {
      setBarraquinhas(prev => [...prev, barraquinhaData]);
    }

    const tipoLabel = {
      barraquinha: 'Barraquinha',
      cadeira_extra: 'Cadeiras',
      banheiro: 'Banheiro',
      extintor: 'Extintor',
      primeiros_socorros: 'Primeiros Socorros',
      saida_entrada: 'Saída/Entrada'
    }[barraquinhaData.tipo];

    toast({
      title: `${tipoLabel} ${barraquinhaSelecionada?.id ? 'atualizada' : 'adicionada'}!`,
      description: `${barraquinhaData.nome} foi ${barraquinhaSelecionada?.id ? 'atualizada' : 'adicionada'} com sucesso`,
    });
  };

  const handleEditBarraquinha = (barraquinha: BarraquinhaData) => {
    setBarraquinhaSelecionada(barraquinha);
    setFormularioBarraquinhaAberto(true);
  };

  const handleDeleteBarraquinha = (id: string) => {
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;
    setBarraquinhas(prev => prev.filter(b => b.id !== id));
    toast({
      title: "Item removido!",
      description: "O item foi removido do mapa",
    });
  };

  const handleDuplicateBarraquinha = (barraquinha: BarraquinhaData) => {
    const newBarraquinha: BarraquinhaData = {
      ...barraquinha,
      id: `${barraquinha.id}_copy_${Date.now()}`,
      x: barraquinha.x + 50,
      y: barraquinha.y + 50,
      nome: barraquinha.nome ? `${barraquinha.nome} (Cópia)` : 'Cópia'
    };
    
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;
    setBarraquinhas(prev => [...prev, newBarraquinha]);
    
    toast({
      title: "Item duplicado!",
      description: `${newBarraquinha.nome} foi criado com sucesso`,
    });
  };

  const handleSavePlaca = (placaData: PlacaData) => {
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;
    if (placaSelecionada?.id) {
      setPlacas(prev => prev.map(p => 
        p.id === placaData.id ? placaData : p
      ));
    } else {
      setPlacas(prev => [...prev, placaData]);
    }

    toast({
      title: `Placa ${placaSelecionada?.id ? 'atualizada' : 'adicionada'}!`,
      description: `"${placaData.texto}" foi ${placaSelecionada?.id ? 'atualizada' : 'adicionada'} com sucesso`,
    });
  };

  const handleEditPlaca = (placa: PlacaData) => {
    setPlacaSelecionada(placa);
    setFormularioPlacaAberto(true);
  };

  const handleDeletePlaca = (id: string) => {
    hasUserEditedRef.current = true;
    pendingImmediateSaveRef.current = true;
    setPlacas(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Placa removida!",
      description: "A placa foi removida do mapa",
    });
  };

  const handleDragStart = (e: React.DragEvent, item: BarraquinhaData | PlacaData) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;
    hasUserEditedRef.current = true;

    const rect = e.currentTarget.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    if (draggedItem.hasOwnProperty('tipo')) {
      const posicaoValida = {
        x: Math.round(targetX / 10) * 10,
        y: Math.round(targetY / 10) * 10
      };

      setBarraquinhas(prev => prev.map(b => 
        b.id === draggedItem.id 
          ? { ...b, x: posicaoValida.x, y: posicaoValida.y }
          : b
      ));
    } else {
      const posicaoValida = {
        x: Math.round(targetX / 10) * 10,
        y: Math.round(targetY / 10) * 10
      };

      setPlacas(prev => prev.map(p =>
        p.id === draggedItem.id
          ? { ...p, x: posicaoValida.x, y: posicaoValida.y }
          : p
      ));
    }

    setDraggedItem(null);
  };

  const handleResizeStart = useCallback((e: React.MouseEvent, barraquinha: BarraquinhaData, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizing({
      item: barraquinha,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: barraquinha.largura || 64,
      startHeight: barraquinha.altura || 64
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;

    const deltaX = e.clientX - resizing.startX;
    const deltaY = e.clientY - resizing.startY;

    let newWidth = resizing.startWidth;
    let newHeight = resizing.startHeight;

    switch (resizing.direction) {
      case 'se':
        newWidth = Math.max(32, resizing.startWidth + deltaX);
        newHeight = Math.max(32, resizing.startHeight + deltaY);
        break;
      case 'e':
        newWidth = Math.max(32, resizing.startWidth + deltaX);
        break;
      case 's':
        newHeight = Math.max(32, resizing.startHeight + deltaY);
        break;
    }

    newWidth = Math.min(300, newWidth);
    newHeight = Math.min(300, newHeight);

    setBarraquinhas(prev => prev.map(b =>
      b.id === resizing.item.id
        ? { ...b, largura: newWidth, altura: newHeight }
        : b
    ));
  }, [resizing]);

  const handleMouseUp = useCallback(() => {
    if (resizing) {
      hasUserEditedRef.current = true;
      pendingImmediateSaveRef.current = true;
      toast({
        title: "Item redimensionado!",
        description: `${resizing.item.nome} foi redimensionado`,
      });
    }
    setResizing(null);
  }, [resizing]);

  React.useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  const handleEspacamentoMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startEspacamento = espacamentoHorizontal;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const novoEspacamento = Math.max(4, Math.min(40, startEspacamento + deltaX / 4));
      setEspacamentoHorizontal(novoEspacamento);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      hasUserEditedRef.current = true;
      pendingImmediateSaveRef.current = true;
      toast({
        title: "Espaçamento atualizado!",
        description: `Espaçamento horizontal ajustado para ${Math.round(espacamentoHorizontal)}px`,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDownloadPNG = async () => {
    if (!mapaRef.current) return;

    try {
      const canvas = await html2canvas(mapaRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = 'mapa-evento.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: "Download realizado!",
        description: "Mapa salvo como PNG com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível gerar o PNG",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!mapaRef.current) return;

    try {
      const canvas = await html2canvas(mapaRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('mapa-evento.pdf');

      toast({
        title: "PDF gerado!",
        description: "Mapa salvo como PDF com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro no PDF",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Impressão iniciada!",
      description: "Enviando mapa para impressora",
    });
  };

  // Helper: obter nome da cor da bandeira por índice de coluna
  const getNomeBandeira = (colunaIndex: number): string => {
    const cor = coresBandeirinhas[colunaIndex % coresBandeirinhas.length];
    return nomesCoresBandeirinhas[cor] || `Coluna ${colunaIndex + 1}`;
  };

  // Helper: obter cor hex da bandeira por índice de coluna
  const getCorBandeira = (colunaIndex: number): string => {
    return coresBandeirinhas[colunaIndex % coresBandeirinhas.length];
  };

  // Helper: obter mesas visíveis de uma coluna específica com numeração sequencial
  const getMesasDaColuna = (colunaIndex: number) => {
    const mesasDaColuna: (MesaData & { numeroExibicao?: number })[] = [];
    let numeroSequencial = 1;

    for (let linha = 0; linha < linhas; linha++) {
      const mesaId = linha * colunas + colunaIndex + 1;
      if (mesasExcluidas.has(mesaId)) continue;

      const mesa = mesas.find(m => m.id === mesaId) || { id: mesaId, ocupada: false };
      mesasDaColuna.push({ ...mesa, numeroExibicao: numeroSequencial });
      numeroSequencial++;
    }

    return mesasDaColuna;
  };

  // Helper: converter hex para ARGB (sem #, com prefixo FF)
  const hexToArgb = (hex: string): string => {
    return 'FF' + hex.replace('#', '').toUpperCase();
  };

  // Estilos comuns para Excel
  const getExcelStyles = () => {
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF1F2937' } },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      border: {
        top: { style: 'thin' as const }, left: { style: 'thin' as const },
        bottom: { style: 'thin' as const }, right: { style: 'thin' as const }
      }
    };

    const cellBorder = {
      top: { style: 'thin' as const }, left: { style: 'thin' as const },
      bottom: { style: 'thin' as const }, right: { style: 'thin' as const }
    };

    return { headerStyle, cellBorder };
  };

  // =============================================
  // DOWNLOAD PLANILHA POR FILEIRA (individual)
  // =============================================
  const handleDownloadExcelPorFileira = async (colunaIndex: number) => {
    const nomeBandeira = getNomeBandeira(colunaIndex);
    const corHex = getCorBandeira(colunaIndex);
    const corArgb = hexToArgb(corHex);

    toast({
      title: "Gerando Planilha",
      description: `Aguarde... gerando planilha da fileira ${nomeBandeira}`,
    });

    const mesasDaColuna = getMesasDaColuna(colunaIndex);
    const { headerStyle, cellBorder } = getExcelStyles();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Fileira ${nomeBandeira}`);

    // ---- Título da fileira ----
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `FILEIRA BANDEIRA ${nomeBandeira.toUpperCase()}`;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: corArgb } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 35;

    // ---- Linha vazia ----
    worksheet.addRow([]);

    // ---- Cabeçalho da tabela ----
    worksheet.columns = [
      { key: 'mesa', width: 15 },
      { key: 'titular', width: 35 },
      { key: 'contato', width: 25 },
      { key: 'pessoas', width: 18 },
    ];

    const headerRow = worksheet.addRow({
      mesa: 'MESA',
      titular: 'NOME DO TITULAR',
      contato: 'CONTATO',
      pessoas: 'Nº DE PESSOAS',
    });

    headerRow.eachCell((cell) => {
      cell.fill = headerStyle.fill as any;
      cell.font = headerStyle.font as any;
      cell.alignment = headerStyle.alignment as any;
      cell.border = headerStyle.border as any;
    });
    headerRow.height = 25;

    // ---- Dados das mesas ----
    let totalPessoasFileira = 0;
    let mesasOcupadasFileira = 0;

    mesasDaColuna.forEach(mesa => {
      const row = worksheet.addRow({
        mesa: `Mesa ${mesa.numeroExibicao}`,
        titular: mesa.nomeComprador || '-',
        contato: mesa.contato || '-',
        pessoas: mesa.numeroPessoas || 0,
      });

      totalPessoasFileira += mesa.numeroPessoas || 0;
      if (mesa.ocupada) mesasOcupadasFileira++;

      row.eachCell((cell, colNumber) => {
        cell.border = cellBorder as any;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Colorir linha se a mesa estiver ocupada
        if (mesa.ocupada) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' } // Amarelo bem claro
          };
          cell.font = { bold: true };
        }
      });
    });

    // ---- Separador ----
    const emptyRow = worksheet.addRow([]);
    emptyRow.height = 10;

    // ---- Rodapé com resumo ----
    const resumoRow = worksheet.addRow({
      mesa: 'RESUMO',
      titular: `${mesasOcupadasFileira} Ocupadas / ${mesasDaColuna.length - mesasOcupadasFileira} Disponíveis`,
      contato: '',
      pessoas: totalPessoasFileira,
    });

    resumoRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    resumoRow.height = 25;

    // ---- Gerar e baixar ----
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Fileira_${nomeBandeira.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Planilha Pronta!",
      description: `Planilha da fileira ${nomeBandeira} baixada com sucesso.`,
    });
  };

  // =============================================
  // DOWNLOAD PLANILHA COMPLETA (todas as fileiras)
  // =============================================
  const handleDownloadExcel = async () => {
    toast({
      title: "Gerando Planilha Completa",
      description: "Aguarde enquanto montamos sua planilha com todas as fileiras...",
    });

    const { headerStyle, cellBorder } = getExcelStyles();
    const workbook = new ExcelJS.Workbook();

    // Criar uma aba para cada coluna/fileira que tenha mesas visíveis
    for (let coluna = 0; coluna < colunas; coluna++) {
      const mesasDaColuna = getMesasDaColuna(coluna);
      if (mesasDaColuna.length === 0) continue;

      const nomeBandeira = getNomeBandeira(coluna);
      const corHex = getCorBandeira(coluna);
      const corArgb = hexToArgb(corHex);

      const worksheet = workbook.addWorksheet(`${nomeBandeira}`);

      // Título
      worksheet.mergeCells('A1:D1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `FILEIRA BANDEIRA ${nomeBandeira.toUpperCase()}`;
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: corArgb } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 32;

      worksheet.addRow([]);

      // Colunas
      worksheet.columns = [
        { key: 'mesa', width: 15 },
        { key: 'titular', width: 35 },
        { key: 'contato', width: 25 },
        { key: 'pessoas', width: 18 },
      ];

      const headerRow = worksheet.addRow({
        mesa: 'MESA',
        titular: 'NOME DO TITULAR',
        contato: 'CONTATO',
        pessoas: 'Nº DE PESSOAS',
      });

      headerRow.eachCell((cell) => {
        cell.fill = headerStyle.fill as any;
        cell.font = headerStyle.font as any;
        cell.alignment = headerStyle.alignment as any;
        cell.border = headerStyle.border as any;
      });
      headerRow.height = 25;

      // Dados
      let totalPessoasFileira = 0;
      let mesasOcupadasFileira = 0;

      mesasDaColuna.forEach(mesa => {
        const row = worksheet.addRow({
          mesa: `Mesa ${mesa.numeroExibicao}`,
          titular: mesa.nomeComprador || '-',
          contato: mesa.contato || '-',
          pessoas: mesa.numeroPessoas || 0,
        });

        totalPessoasFileira += mesa.numeroPessoas || 0;
        if (mesa.ocupada) mesasOcupadasFileira++;

        row.eachCell((cell) => {
          cell.border = cellBorder as any;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };

          if (mesa.ocupada) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' }
            };
            cell.font = { bold: true };
          }
        });
      });

      // Resumo
      const emptyRow = worksheet.addRow([]);
      emptyRow.height = 10;

      const resumoRow = worksheet.addRow({
        mesa: 'RESUMO',
        titular: `${mesasOcupadasFileira} Ocupadas / ${mesasDaColuna.length - mesasOcupadasFileira} Disponíveis`,
        contato: '',
        pessoas: totalPessoasFileira,
      });

      resumoRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      resumoRow.height = 25;
    }

    // Gerar e baixar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Relatorio_Completo_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Planilha Completa Pronta!",
      description: "Download do relatório com todas as fileiras iniciado.",
    });
  };

  useEffect(() => {
    const initializeEventData = async () => {
      if (!user) {
        console.log('Usuário não logado - resetando estado');
        resetState();
        setLoading(false);
        isInitializingRef.current = false;
        return;
      }
      
      if (dataLoaded) {
        console.log('Dados já carregados para este usuário');
        setLoading(false);
        return;
      }
      
      isInitializingRef.current = true;
      setLoading(true);
      console.log('Inicializando dados do evento para usuário:', user.id);
      
      try {
        const eventData = await loadEventData();
        
        if (eventData) {
          console.log('Aplicando dados carregados ao estado da aplicação');
          setLinhas(eventData.linhas);
          setColunas(eventData.colunas);
          setLarguraPalco(eventData.larguraPalco);
          setAlturaPalco(eventData.alturaPalco);
          setDistanciaMesas(eventData.distanciaMesas);
          setEspacamentoHorizontal(eventData.espacamentoHorizontal);
          setEnderecoEvento(eventData.endereco);
          setMesas(eventData.mesas);
          setBarraquinhas(eventData.barraquinhas);
          setPlacas(eventData.placas);
          setMesasExcluidas(eventData.mesasExcluidas);
          
          console.log('✅ Dados carregados com sucesso do banco de dados');
        } else {
          console.log('Usando dados padrão');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os dados salvos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        setDataLoaded(true);
        // Garantir que a inicialização fique travada por 500ms para dar tempo do 
        // React processar todos os renders do rebuild das mesas e dados iniciais.
        // Isso impede que qualquer estado intermediário/padrão sobrescreva o banco de dados
        // sem atrasar cliques e edições rápidas do usuário.
        setTimeout(() => {
          isInitializingRef.current = false;
          console.log('🔓 Inicialização completa - salvamento automático liberado');
        }, 500);
      }
    };

    initializeEventData();
  }, [user, dataLoaded, loadEventData, resetState, setLoading, toast]);

  // Handle remote synchronization
  useEffect(() => {
    if (remoteUpdatedAt && lastSyncTime && remoteUpdatedAt > lastSyncTime && !isInitializingRef.current) {
      console.log('🔄 Sincronizando mapa: versão remota é mais recente', remoteUpdatedAt);
      
      toast({
        title: "Sincronizando...",
        description: "Alterações recebidas de outro dispositivo.",
        duration: 3000,
      });

      // Update local time first to prevent loop
      setLastSyncTime(remoteUpdatedAt);
      isInitializingRef.current = true;
      
      const syncData = async () => {
        try {
          const eventData = await loadEventData();
          if (eventData) {
            setLinhas(eventData.linhas);
            setColunas(eventData.colunas);
            setLarguraPalco(eventData.larguraPalco);
            setAlturaPalco(eventData.alturaPalco);
            setDistanciaMesas(eventData.distanciaMesas);
            setEspacamentoHorizontal(eventData.espacamentoHorizontal);
            setEnderecoEvento(eventData.endereco);
            setMesas(eventData.mesas);
            setBarraquinhas(eventData.barraquinhas);
            setPlacas(eventData.placas);
            setMesasExcluidas(eventData.mesasExcluidas);
          }
        } catch (error) {
          console.error("Erro ao sincronizar dados", error);
        } finally {
          setTimeout(() => {
            isInitializingRef.current = false;
            console.log('🔓 Sincronização remota completa - salvamento automático liberado');
          }, 500);
        }
      };
      
      syncData();
    }
  }, [remoteUpdatedAt, lastSyncTime, loadEventData, toast, setLastSyncTime]);

  const mesasVisiveis = mesas.filter(mesa => !mesasExcluidas.has(mesa.id));
  const mesasOcupadas = mesasVisiveis.filter(mesa => mesa.ocupada).length;
  const totalMesasVisiveis = mesasVisiveis.length;
  const totalPessoas = mesasVisiveis.reduce((total, mesa) => total + (mesa.numeroPessoas || 0), 0);
  const totalCadeirasExtra = barraquinhas
    .filter(b => b.tipo === 'cadeira_extra')
    .reduce((total, b) => total + parseInt(b.nome || '0'), 0);

  const renderMesas = () => {
    const colunas_render = [];

    for (let coluna = 0; coluna < colunas; coluna++) {
      const mesasColuna = [];
      let numeroSequencial = 1;
      
      for (let linha = 0; linha < linhas; linha++) {
        const mesaId = linha * colunas + coluna + 1;
        
        if (mesasExcluidas.has(mesaId)) {
          continue;
        }
        
        const mesa = mesas.find(m => m.id === mesaId) || {
          id: mesaId,
          ocupada: false
        };
        
        const mesaComNumeroExibicao = {
          ...mesa,
          numeroExibicao: numeroSequencial
        };
        
        mesasColuna.push(
          <MesaItem
            key={mesa.id}
            mesa={mesaComNumeroExibicao}
            onClick={handleMesaClick}
            onDelete={editMode ? handleDeleteMesa : undefined}
            editMode={editMode}
          />
        );
        
        numeroSequencial++;
      }
      
      if (mesasColuna.length > 0) {
        colunas_render.push(
          <div key={coluna} className="flex flex-col items-center gap-4">
            {mesasColuna}
          </div>
        );
      }
    }

    return (
      <div className="flex justify-center" style={{ gap: `${espacamentoHorizontal}px` }}>
        {colunas_render}
      </div>
    );
  };

  const renderBandeirinhas = () => {
    const bandeirinhas = [];
    
    for (let coluna = 0; coluna < colunas; coluna++) {
      const cor = coresBandeirinhas[coluna % coresBandeirinhas.length];
      
      bandeirinhas.push(
        <div key={`bandeira-${coluna}`} className="flex flex-col items-center gap-2">
          <div 
            className="w-8 h-6 border-2 border-gray-800 flex items-center justify-center"
            style={{ backgroundColor: cor }}
          >
            <Flag size={12} className="text-white drop-shadow-sm" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center mb-4" style={{ gap: `${espacamentoHorizontal}px` }}>
        {bandeirinhas}
      </div>
    );
  };

  const handleSaveConfig = () => {
    saveImmediately();
    toast({
      title: "Configuração salva!",
      description: "O layout e as configurações foram salvas com sucesso. Pode atualizar ou sair com segurança."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados salvos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-full mx-auto">
        <div className="flex justify-end gap-3 mb-4">
          {saving && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow border">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Salvando automaticamente...
            </div>
          )}
          {!saving && dataLoaded && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-white px-3 py-2 rounded-lg shadow border">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Projeto salvo
            </div>
          )}
          <Button onClick={handleDownloadPNG} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            PNG
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Planilha
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Exportar Planilha</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownloadExcel} className="font-semibold">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Todas as Fileiras
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-gray-400">Por Fileira (Bandeira)</DropdownMenuLabel>
              {Array.from({ length: colunas }, (_, i) => {
                const cor = getCorBandeira(i);
                const nome = getNomeBandeira(i);
                const mesasDaCol = getMesasDaColuna(i);
                if (mesasDaCol.length === 0) return null;
                return (
                  <DropdownMenuItem
                    key={`fileira-${i}`}
                    onClick={() => handleDownloadExcelPorFileira(i)}
                  >
                    <div
                      className="w-4 h-4 rounded-sm border border-gray-300 mr-2 flex-shrink-0"
                      style={{ backgroundColor: cor }}
                    />
                    Fileira {nome}
                    <span className="ml-auto text-xs text-gray-400">
                      {mesasDaCol.length} mesas
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>

        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-emerald-600">{totalMesasVisiveis - mesasOcupadas}</div>
            <div className="text-sm text-gray-600 font-medium">Mesas Disponíveis</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-red-600">{mesasOcupadas}</div>
            <div className="text-sm text-gray-600 font-medium">Mesas Ocupadas</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-blue-600">{totalMesasVisiveis}</div>
            <div className="text-sm text-gray-600 font-medium">Total de Mesas</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-purple-600">{totalPessoas + totalCadeirasExtra}</div>
            <div className="text-sm text-gray-600 font-medium">Total de Pessoas</div>
          </div>
        </div>

        <ToolbarEdicao
          editMode={editMode}
          onToggleEditMode={() => setEditMode(!editMode)}
          onAddBarraquinha={handleAddBarraquinha}
          onAddCadeiras={handleAddCadeiras}
          onAddPlaca={handleAddPlaca}
          onAddSaida={handleAddSaida}
          onSaveConfig={handleSaveConfig}
        />

        <ConfiguracaoMesas
          linhas={linhas}
          colunas={colunas}
          onLinhasChange={handleLinhasChange}
          onColunasChange={handleColunasChange}
          onTotalMesasChange={handleTotalMesasChange}
          editMode={editMode}
          mesasExcluidas={mesasExcluidas}
          totalMesasVisiveis={totalMesasVisiveis}
        />

        <div className="flex gap-8 mb-8">
          <div className="flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Legenda</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-400 border-2 border-emerald-600 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Disponível</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 border-2 border-red-600 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Ocupada</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-amber-600 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Barraquinha</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-blue-600 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Cadeiras Extra</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 border-2 border-gray-600 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Banheiro</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-500 border-2 border-red-600 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Extintor</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 border-2 border-green-600 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Primeiros Socorros</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 border-2 border-purple-600 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Saída/Entrada</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 overflow-auto pb-8 rounded-2xl">
            <div className="min-w-max min-h-max flex justify-center p-4">
              <div 
                ref={mapaRef}
                data-print="true"
                className={cn(
                  "relative bg-white p-12 rounded-2xl shadow-xl border border-gray-200",
                  resizing ? "cursor-none select-none" : ""
                )}
                style={{ minHeight: '900px', minWidth: '1400px', width: 'max-content' }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <PalcoEditavel
                largura={larguraPalco}
                altura={alturaPalco}
                distanciaMesas={distanciaMesas}
                onResize={(largura, altura) => {
                  hasUserEditedRef.current = true;
                  pendingImmediateSaveRef.current = true;
                  setLarguraPalco(largura);
                  setAlturaPalco(altura);
                }}
                onDistanceChange={(distancia) => {
                  hasUserEditedRef.current = true;
                  pendingImmediateSaveRef.current = true;
                  setDistanciaMesas(distancia);
                }}
                editMode={editMode}
              />

              {editMode && (
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div
                      className="w-12 h-6 bg-indigo-500 rounded cursor-ew-resize hover:bg-indigo-600 shadow-lg border border-white flex items-center justify-center"
                      onMouseDown={handleEspacamentoMouseDown}
                      title="Ajustar espaçamento horizontal das mesas (4-40px)"
                    >
                      <div className="w-6 h-0.5 bg-white rounded"></div>
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
                      {Math.round(espacamentoHorizontal)}px
                    </div>
                  </div>
                </div>
              )}

              {renderBandeirinhas()}

              <div className="mb-32">
                {renderMesas()}
              </div>
              
              {barraquinhas.map(barraquinha => (
                <BarraquinhaItem
                  key={barraquinha.id}
                  barraquinha={barraquinha}
                  onEdit={handleEditBarraquinha}
                  onDelete={handleDeleteBarraquinha}
                  onDuplicate={handleDuplicateBarraquinha}
                  onDragStart={handleDragStart}
                  onResizeStart={handleResizeStart}
                  editMode={editMode}
                />
              ))}

              {placas.map(placa => (
                <PlacaIdentificacao
                  key={placa.id}
                  placa={placa}
                  onEdit={handleEditPlaca}
                  onDelete={handleDeletePlaca}
                  onDragStart={(e, placa) => handleDragStart(e, placa)}
                  editMode={editMode}
                />
              ))}

              {resizing && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-5 rounded-2xl pointer-events-none">
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    Redimensionando: {resizing.item.nome}
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        <RodapeEvento
          endereco={enderecoEvento}
          onEnderecoChange={(novoEndereco) => {
            hasUserEditedRef.current = true;
            pendingImmediateSaveRef.current = true;
            setEnderecoEvento(novoEndereco);
          }}
        />

        <FormularioMesa
          mesa={mesaSelecionada}
          isOpen={formularioMesaAberto}
          onClose={() => setFormularioMesaAberto(false)}
          onSave={handleSaveMesa}
        />

        <FormularioBarraquinha
          barraquinha={barraquinhaSelecionada}
          isOpen={formularioBarraquinhaAberto}
          onClose={() => setFormularioBarraquinhaAberto(false)}
          onSave={handleSaveBarraquinha}
        />

        <FormularioPlaca
          placa={placaSelecionada}
          isOpen={formularioPlacaAberto}
          onClose={() => setFormularioPlacaAberto(false)}
          onSave={handleSavePlaca}
        />
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          [data-print="true"], [data-print="true"] * {
            visibility: visible;
          }
          [data-print="true"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
};

export default MapaEvento;

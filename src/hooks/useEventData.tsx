
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface MesaData {
  id: number;
  numeroPessoas?: number;
  nomeComprador?: string;
  nomesPessoas?: string[];
  contato?: string;
  ocupada: boolean;
  numeroExibicao?: number;
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

interface EventoData {
  id?: string;
  nome: string;
  endereco: string;
  linhas: number;
  colunas: number;
  larguraPalco: number;
  alturaPalco: number;
  distanciaMesas: number;
  espacamentoHorizontal: number;
  mesas: MesaData[];
  barraquinhas: BarraquinhaData[];
  placas: PlacaData[];
  mesasExcluidas: Set<number>;
}

export const useEventData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [eventoId, setEventoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Polling para checar atualizações de outros dispositivos (Soft-Realtime)
  const { data: remoteUpdatedAt } = useQuery({
    queryKey: ['evento_updated_at', eventoId],
    queryFn: async () => {
      if (!eventoId) return null;
      const { data, error } = await supabase
        .from('eventos')
        .select('updated_at')
        .eq('id', eventoId)
        .maybeSingle();
        
      if (error || !data) return null;
      return data.updated_at;
    },
    refetchInterval: 5000,
    enabled: !!eventoId && !saving,
  });

  // Criar evento padrão
  const createDefaultEvent = useCallback((): EventoData => {
    console.log('🔧 Criando evento padrão');
    const mesas: MesaData[] = [];
    for (let i = 1; i <= 17 * 11; i++) {
      mesas.push({
        id: i,
        ocupada: false
      });
    }

    const defaultBarraquinhas: BarraquinhaData[] = [
      { id: 'bar1', nome: 'Barraquinha 1', x: 150, y: 150, tipo: 'barraquinha', largura: 80, altura: 60 },
      { id: 'bar2', nome: 'Barraquinha 2', x: 150, y: 220, tipo: 'barraquinha', largura: 80, altura: 60 },
      { id: 'bar3', nome: 'Barraquinha 3', x: 150, y: 290, tipo: 'barraquinha', largura: 80, altura: 60 },
      { id: 'bar4', nome: 'Barraquinha 4', x: 150, y: 360, tipo: 'barraquinha', largura: 80, altura: 60 },
      { id: 'bar5', nome: 'Barraquinha 5', x: 150, y: 430, tipo: 'barraquinha', largura: 80, altura: 60 },
      { id: 'bar6', nome: 'Barraquinha 6', x: 150, y: 500, tipo: 'barraquinha', largura: 80, altura: 60 },
      { id: 'caixa1', nome: 'Caixa', x: 80, y: 580, tipo: 'barraquinha', largura: 100, altura: 40 },
      { id: 'emergencia', nome: 'Posto de Emergência', x: 80, y: 640, tipo: 'primeiros_socorros', largura: 120, altura: 40 },
      { id: 'entrada1', nome: 'Entrada', x: 80, y: 720, tipo: 'saida_entrada', largura: 100, altura: 40 },
      { id: 'sem_nome1', nome: '', x: 80, y: 800, tipo: 'barraquinha', largura: 100, altura: 40 },
      { id: 'banheiro1', nome: 'Banheiro', x: 80, y: 860, tipo: 'banheiro', largura: 80, altura: 80 },
      { id: 'sem_nome2', nome: '', x: 80, y: 950, tipo: 'barraquinha', largura: 100, altura: 40 },
      { id: 'cadeia', nome: 'Cadeia', x: 1320, y: 950, tipo: 'barraquinha', largura: 80, altura: 80 },
      { id: 'sem_nome3', nome: '', x: 1320, y: 870, tipo: 'barraquinha', largura: 100, altura: 40 },
      { id: 'banheiro2', nome: 'Banheiro', x: 1320, y: 810, tipo: 'banheiro', largura: 80, altura: 80 },
      { id: 'sem_nome4', nome: '', x: 1320, y: 750, tipo: 'barraquinha', largura: 100, altura: 40 },
      { id: 'sem_nome5', nome: '', x: 1320, y: 690, tipo: 'barraquinha', largura: 100, altura: 40 },
      { id: 'caixas', nome: 'Caixas', x: 1320, y: 610, tipo: 'barraquinha', largura: 100, altura: 40 },
      { id: 'banheiros', nome: 'Banheiros', x: 1320, y: 530, tipo: 'banheiro', largura: 80, altura: 80 },
      { id: 'circuito', nome: 'Circuito', x: 1320, y: 470, tipo: 'barraquinha', largura: 100, altura: 40 },
      { id: 'touro', nome: 'Touro', x: 1320, y: 410, tipo: 'barraquinha', largura: 80, altura: 80 },
    ];

    return {
      nome: 'Meu Evento',
      endereco: '',
      linhas: 17,
      colunas: 11,
      larguraPalco: 400,
      alturaPalco: 120,
      distanciaMesas: 80,
      espacamentoHorizontal: 12,
      mesas,
      barraquinhas: defaultBarraquinhas,
      placas: [],
      mesasExcluidas: new Set()
    };
  }, []);

  // Resetar estado quando usuário mudar
  const resetState = useCallback(() => {
    console.log('🔄 Resetando estado do evento');
    setEventoId(null);
    setDataLoaded(false);
    setSaving(false);
    setLastSyncTime(null);
  }, []);

  // Carregar dados do evento
  const loadEventData = useCallback(async (): Promise<EventoData | null> => {
    if (!user) {
      console.log('❌ Usuário não autenticado');
      return null;
    }

    try {
      console.log('📥 Carregando dados do evento para o usuário:', user.id);
      
      // Buscar evento do usuário (pegando o mais recente caso haja duplicatas)
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (eventoError) {
        console.error('❌ Erro ao carregar evento:', eventoError);
        setDataLoaded(true);
        return createDefaultEvent();
      }

      if (!evento) {
        console.log('ℹ️ Nenhum evento encontrado, criando evento padrão');
        setDataLoaded(true);
        return createDefaultEvent();
      }

      console.log('✅ Evento encontrado:', {
        id: evento.id,
        nome: evento.nome,
        linhas: evento.linhas,
        colunas: evento.colunas,
        endereco: evento.endereco
      });
      setEventoId(evento.id);
      setLastSyncTime(evento.updated_at);

      // Carregar mesas
      console.log('📥 Carregando mesas do evento...');
      const { data: mesas, error: mesasError } = await supabase
        .from('mesas')
        .select('*')
        .eq('evento_id', evento.id);

      if (mesasError) {
        console.error('❌ Erro ao carregar mesas:', mesasError);
      } else {
        console.log('✅ Mesas carregadas:', mesas?.length || 0);
      }

      // Carregar barraquinhas
      console.log('📥 Carregando barraquinhas do evento...');
      const { data: barraquinhas, error: barraquinhasError } = await supabase
        .from('barraquinhas')
        .select('*')
        .eq('evento_id', evento.id);

      if (barraquinhasError) {
        console.error('❌ Erro ao carregar barraquinhas:', barraquinhasError);
      } else {
        console.log('✅ Barraquinhas carregadas:', barraquinhas?.length || 0);
        // Log detalhado das posições das barraquinhas
        barraquinhas?.forEach(b => {
          console.log(`🏪 Barraquinha ${b.nome}: x=${b.x}, y=${b.y}, tipo=${b.tipo}`);
        });
      }

      // Carregar placas
      console.log('📥 Carregando placas do evento...');
      const { data: placas, error: placasError } = await supabase
        .from('placas')
        .select('*')
        .eq('evento_id', evento.id);

      if (placasError) {
        console.error('❌ Erro ao carregar placas:', placasError);
      } else {
        console.log('✅ Placas carregadas:', placas?.length || 0);
        // Log detalhado das posições das placas
        placas?.forEach(p => {
          console.log(`🏷️ Placa "${p.texto}": x=${p.x}, y=${p.y}, cor=${p.cor}`);
        });
      }

      // Converter dados para o formato da aplicação
      const totalMesas = evento.linhas * evento.colunas;
      console.log('🔧 Reconstruindo layout:', {
        linhas: evento.linhas,
        colunas: evento.colunas,
        totalMesas: totalMesas
      });
      
      const mesasApp: MesaData[] = [];
      const mesasExcluidas = new Set<number>();
      
      // Criar todas as mesas baseado nas configurações do evento
      for (let i = 1; i <= totalMesas; i++) {
        const mesaDb = mesas?.find(m => m.numero_mesa === i);
        if (mesaDb?.numero_pessoas === -1) {
           mesasExcluidas.add(i);
           mesasApp.push({ id: i, ocupada: false });
        } else {
           mesasApp.push({
             id: i,
             numeroPessoas: mesaDb?.numero_pessoas || undefined,
             nomeComprador: mesaDb?.nome_comprador || undefined,
             nomesPessoas: (mesaDb?.nomes_pessoas as string[]) || undefined,
             contato: mesaDb?.contato || undefined,
             ocupada: mesaDb?.ocupada || false
           });
        }
      }

      // Converter barraquinhas preservando posições exatas
      const barraquinhasApp: BarraquinhaData[] = barraquinhas?.map(b => {
        const posX = parseFloat(String(b.x));
        const posY = parseFloat(String(b.y));
        console.log(`🔧 Convertendo barraquinha ${b.nome}: x=${b.x} -> ${posX}, y=${b.y} -> ${posY}`);
        
        return {
          id: b.item_id,
          nome: b.nome,
          x: posX,
          y: posY,
          tipo: b.tipo as any,
          largura: b.largura ? parseFloat(String(b.largura)) : undefined,
          altura: b.altura ? parseFloat(String(b.altura)) : undefined,
          observacao: b.observacao || undefined,
          cor: b.cor || undefined
        };
      }) || [];

      // Converter placas preservando posições exatas
      const placasApp: PlacaData[] = placas?.map(p => {
        const posX = parseFloat(String(p.x));
        const posY = parseFloat(String(p.y));
        console.log(`🔧 Convertendo placa "${p.texto}": x=${p.x} -> ${posX}, y=${p.y} -> ${posY}`);
        
        return {
          id: p.placa_id,
          texto: p.texto,
          x: posX,
          y: posY,
          cor: p.cor
        };
      }) || [];

      console.log('✅ Dados carregados com sucesso:', {
        mesas: mesasApp.length,
        mesasOcupadas: mesasApp.filter(m => m.ocupada).length,
        barraquinhas: barraquinhasApp.length,
        placas: placasApp.length
      });

      setDataLoaded(true);

      return {
        id: evento.id,
        nome: evento.nome,
        endereco: evento.endereco || '',
        linhas: evento.linhas,
        colunas: evento.colunas,
        larguraPalco: parseFloat(String(evento.largura_palco)),
        alturaPalco: parseFloat(String(evento.altura_palco)),
        distanciaMesas: parseFloat(String(evento.distancia_mesas)),
        espacamentoHorizontal: parseFloat(String(evento.espacamento_horizontal)),
        mesas: mesasApp,
        barraquinhas: barraquinhasApp,
        placas: placasApp,
        mesasExcluidas

      };

    } catch (error) {
      console.error('❌ Erro geral ao carregar dados:', error);
      setDataLoaded(true);
      return createDefaultEvent();
    }
  }, [user, createDefaultEvent]);

  // Salvar dados do evento com validação precisa de posições
  const saveEventData = useCallback(async (data: EventoData, retryCount = 0): Promise<boolean> => {
    if (!user) {
      console.log('❌ Usuário não autenticado - não salvando');
      return false;
    }

    setSaving(true);
    const saveId = Date.now() + retryCount;
    console.log(`💾 [${saveId}] Iniciando salvamento completo (tentativa ${retryCount + 1})`);

    try {
      let currentEventoId = eventoId;

      // 1. Salvar/atualizar evento principal
      if (!currentEventoId) {
        console.log(`➕ [${saveId}] Criando novo evento`);
        const { data: novoEvento, error: createError } = await supabase
          .from('eventos')
          .insert({
            user_id: user.id,
            nome: data.nome,
            endereco: data.endereco,
            linhas: data.linhas,
            colunas: data.colunas,
            largura_palco: data.larguraPalco,
            altura_palco: data.alturaPalco,
            distancia_mesas: data.distanciaMesas,
            espacamento_horizontal: data.espacamentoHorizontal
          })
          .select()
          .single();

        if (createError) {
          console.error(`❌ [${saveId}] Erro ao criar evento:`, createError);
          throw createError;
        }

        currentEventoId = novoEvento.id;
        setEventoId(currentEventoId);
        console.log(`✅ [${saveId}] Novo evento criado com ID:`, currentEventoId);
      } else {
        console.log(`📝 [${saveId}] Atualizando evento existente:`, currentEventoId);
        const { error: updateError, data: updatedEvento } = await supabase
          .from('eventos')
          .update({
            nome: data.nome,
            endereco: data.endereco,
            linhas: data.linhas,
            colunas: data.colunas,
            largura_palco: data.larguraPalco,
            altura_palco: data.alturaPalco,
            distancia_mesas: data.distanciaMesas,
            espacamento_horizontal: data.espacamentoHorizontal,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentEventoId)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ [${saveId}] Erro ao atualizar evento:`, updateError);
          throw updateError;
        }
        
        if (updatedEvento) {
          setLastSyncTime(updatedEvento.updated_at);
        }
        console.log(`✅ [${saveId}] Evento atualizado com sucesso`);
      }

      // 2. Limpar dados existentes
      console.log(`🧹 [${saveId}] Limpando dados existentes...`);
      
      await Promise.all([
        supabase.from('mesas').delete().eq('evento_id', currentEventoId),
        supabase.from('barraquinhas').delete().eq('evento_id', currentEventoId),
        supabase.from('placas').delete().eq('evento_id', currentEventoId)
      ]);

      // 3. Inserir novos dados com posições precisas
      const totalMesasLayout = data.linhas * data.colunas;
      
      // Salvar mesas apenas com dados significativos
      const mesasParaSalvar = data.mesas
        .filter(mesa => mesa.id <= totalMesasLayout && !data.mesasExcluidas.has(mesa.id))
        .filter(mesa => 
          mesa.ocupada || 
          mesa.numeroPessoas || 
          mesa.nomeComprador || 
          mesa.nomesPessoas ||
          mesa.contato
        )
        .map(mesa => ({
          evento_id: currentEventoId,
          numero_mesa: mesa.id,
          numero_pessoas: mesa.numeroPessoas || null,
          nome_comprador: mesa.nomeComprador || null,
          nomes_pessoas: mesa.nomesPessoas || null,
          contato: mesa.contato || null,
          ocupada: mesa.ocupada
        }));

      const mesasExcluidasParaSalvar = Array.from(data.mesasExcluidas)
        .filter(id => id <= totalMesasLayout)
        .map(id => ({
          evento_id: currentEventoId,
          numero_mesa: id,
          numero_pessoas: -1,
          nome_comprador: null,
          nomes_pessoas: null,
          contato: null,
          ocupada: false
        }));

      const todasMesasParaSalvar = [...mesasParaSalvar, ...mesasExcluidasParaSalvar];

      if (todasMesasParaSalvar.length > 0) {
        console.log(`📊 [${saveId}] Inserindo ${todasMesasParaSalvar.length} mesas`);
        const { error: mesasError } = await supabase
          .from('mesas')
          .insert(todasMesasParaSalvar);

        if (mesasError) {
          console.error(`❌ [${saveId}] Erro ao inserir mesas:`, mesasError);
          throw mesasError;
        }
        console.log(`✅ [${saveId}] Mesas inseridas com sucesso`);
      }

      // Salvar barraquinhas com posições exatas e validação
      if (data.barraquinhas.length > 0) {
        console.log(`🏪 [${saveId}] Inserindo ${data.barraquinhas.length} barraquinhas`);
        const barraquinhasParaSalvar = data.barraquinhas.map(b => {
          const posX = parseFloat(String(b.x));
          const posY = parseFloat(String(b.y));
          
          console.log(`🔧 [${saveId}] Salvando barraquinha ${b.nome}: x=${posX}, y=${posY}, tipo=${b.tipo}`);
          
          return {
            evento_id: currentEventoId,
            item_id: b.id,
            nome: b.nome,
            tipo: b.tipo,
            x: posX,
            y: posY,
            largura: b.largura ? parseFloat(String(b.largura)) : null,
            altura: b.altura ? parseFloat(String(b.altura)) : null,
            cor: b.cor || null,
            observacao: b.observacao || null
          };
        });

        const { error: barraquinhasError } = await supabase
          .from('barraquinhas')
          .insert(barraquinhasParaSalvar);

        if (barraquinhasError) {
          console.error(`❌ [${saveId}] Erro ao inserir barraquinhas:`, barraquinhasError);
          throw barraquinhasError;
        }
        console.log(`✅ [${saveId}] Barraquinhas inseridas com sucesso`);
      }

      // Salvar placas com posições exatas e validação
      if (data.placas.length > 0) {
        console.log(`🏷️ [${saveId}] Inserindo ${data.placas.length} placas`);
        const placasParaSalvar = data.placas.map(p => {
          const posX = parseFloat(String(p.x));
          const posY = parseFloat(String(p.y));
          
          console.log(`🔧 [${saveId}] Salvando placa "${p.texto}": x=${posX}, y=${posY}, cor=${p.cor}`);
          
          return {
            evento_id: currentEventoId,
            placa_id: p.id,
            texto: p.texto,
            cor: p.cor,
            x: posX,
            y: posY
          };
        });

        const { error: placasError } = await supabase
          .from('placas')
          .insert(placasParaSalvar);

        if (placasError) {
          console.error(`❌ [${saveId}] Erro ao inserir placas:`, placasError);
          throw placasError;
        }
        console.log(`✅ [${saveId}] Placas inseridas com sucesso`);
      }

      console.log(`🎉 [${saveId}] Salvamento completo realizado com sucesso!`);
      return true;

    } catch (error: any) {
      console.error(`❌ [${saveId}] Erro ao salvar dados:`, error);
      
      if (retryCount < 2) {
        console.log(`🔄 [${saveId}] Tentando novamente em ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return saveEventData(data, retryCount + 1);
      }

      if (retryCount === 0) {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações. Tentando novamente...",
          variant: "destructive"
        });
      }
      
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, eventoId, toast]);

  // Reset quando usuário mudar
  useEffect(() => {
    if (!user) {
      resetState();
    }
  }, [user, resetState]);

  return {
    loadEventData,
    saveEventData,
    loading,
    setLoading,
    dataLoaded,
    setDataLoaded,
    saving,
    resetState,
    remoteUpdatedAt,
    lastSyncTime,
    setLastSyncTime
  };
};

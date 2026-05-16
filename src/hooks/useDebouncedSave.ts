
import { useCallback, useRef, useEffect } from 'react';

interface UseDebouncedSaveOptions {
  delay: number;
  onSave: () => Promise<boolean>;
  enabled: boolean;
}

export const useDebouncedSave = ({ delay, onSave, enabled }: UseDebouncedSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const lastSaveTimeRef = useRef(0);
  
  const onSaveRef = useRef(onSave);
  const enabledRef = useRef(enabled);
  
  useEffect(() => {
    onSaveRef.current = onSave;
    enabledRef.current = enabled;
  }, [onSave, enabled]);

  const debouncedSave = useCallback(async () => {
    if (!enabledRef.current || saveInProgressRef.current) {
      pendingSaveRef.current = true;
      console.log('⏳ Salvamento bloqueado - enabled:', enabledRef.current, 'inProgress:', saveInProgressRef.current);
      return;
    }

    // Evitar salvamentos muito frequentes
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 1000) {
      console.log('⏰ Salvamento muito recente, reagendando...');
      pendingSaveRef.current = true;
      setTimeout(() => {
        if (enabledRef.current && !saveInProgressRef.current && pendingSaveRef.current) {
          debouncedSave();
        }
      }, 1000);
      return;
    }

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    saveInProgressRef.current = true;
    pendingSaveRef.current = false;
    lastSaveTimeRef.current = now;

    console.log('💾 Executando salvamento debounced...');

    try {
      const success = await onSaveRef.current();
      console.log('✅ Salvamento concluído com sucesso:', success);
      
      // Se houve sucesso e há um salvamento pendente, agendar o próximo
      if (pendingSaveRef.current && success) {
        console.log('📝 Salvamento pendente detectado, agendando próximo...');
        setTimeout(() => {
          if (enabledRef.current && !saveInProgressRef.current && pendingSaveRef.current) {
            debouncedSave();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erro no salvamento debounced:', error);
      
      // Se há um salvamento pendente após erro, tentar novamente
      if (pendingSaveRef.current) {
        console.log('🔄 Reagendando salvamento após erro...');
        setTimeout(() => {
          if (enabledRef.current && !saveInProgressRef.current) {
            debouncedSave();
          }
        }, 3000);
      }
    } finally {
      saveInProgressRef.current = false;
    }
  }, [onSave, enabled]);

  const scheduleSave = useCallback(() => {
    if (!enabledRef.current) {
      console.log('🚫 Salvamento desabilitado');
      return;
    }

    console.log('📅 Agendando salvamento com delay de', delay, 'ms');

    // Se um salvamento está em progresso, marcar como pendente
    if (saveInProgressRef.current) {
      pendingSaveRef.current = true;
      console.log('⏳ Salvamento em progresso, marcando como pendente');
      return;
    }

    // Limpar timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Agendar novo salvamento
    timeoutRef.current = setTimeout(debouncedSave, delay);
  }, [debouncedSave, delay, enabled]);

  const saveImmediately = useCallback(async () => {
    console.log('🚀 Salvamento imediato solicitado');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    return debouncedSave();
  }, [debouncedSave]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    scheduleSave,
    saveImmediately,
    isSaving: saveInProgressRef.current
  };
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, MapPin, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useEventData } from '@/hooks/useEventData';

const EventHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { saving } = useEventData();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBackToDashboard = async () => {
    console.log('🔙 Voltando ao dashboard...');
    setIsNavigating(true);
    
    // Aguardar um pouco para permitir que qualquer salvamento pendente seja concluído
    await new Promise(resolve => setTimeout(resolve, 500));
    
    navigate('/');
    setIsNavigating(false);
  };

  const handleSignOut = async () => {
    console.log('👋 Fazendo logout...');
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={isNavigating}
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowLeft className="h-4 w-4" />
              )}
              Voltar ao Menu
            </Button>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">EventMap</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {saving && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Salvando...</span>
              </div>
            )}
            
            {user && (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default EventHeader;

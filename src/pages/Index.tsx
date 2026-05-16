
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { MapPin, Settings, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Seus Eventos</h1>
            <p className="text-gray-600">Gerencie e visualize seus mapas de eventos</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Meu Evento
              </h3>
              <p className="text-gray-600 text-center mb-4 text-sm">
                Edite o layout do seu evento
              </p>
              <Button 
                onClick={() => navigate('/event')}
                className="w-full"
              >
                Abrir Mapa
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow opacity-50">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-500 text-center mb-2">
                Relatórios
              </h3>
              <p className="text-gray-400 text-center mb-4 text-sm">
                Em breve
              </p>
              <Button 
                disabled
                variant="outline"
                className="w-full"
              >
                Em breve
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow opacity-50">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4 mx-auto">
                <Settings className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-500 text-center mb-2">
                Configurações
              </h3>
              <p className="text-gray-400 text-center mb-4 text-sm">
                Em breve
              </p>
              <Button 
                disabled
                variant="outline"
                className="w-full"
              >
                Em breve
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;


import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import EventHeader from '@/components/EventHeader';
import MapaEvento from '@/components/MapaEvento';

const Event = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <EventHeader />
        <main>
          <MapaEvento />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Event;

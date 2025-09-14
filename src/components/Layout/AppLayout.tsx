import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Canvas from '../Canvas/Canvas';
import PropertyPanel from './PropertyPanel';
import { useMindMapStore } from '../../store/mindMapStore';

const AppLayout: React.FC = () => {
  const { sidebarOpen, propertyPanelOpen } = useMindMapStore();

  return (
    <div className="flex h-screen">
      {/* Sidebar - responsive width */}
      {sidebarOpen && (
        <div className="w-80 lg:w-80 md:w-64 sm:w-56 sidebar-panel">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
        </div>
      </div>

      {/* Property Panel - responsive width */}
      {propertyPanelOpen && (
        <div className="w-80 lg:w-80 md:w-64 sm:w-56 property-panel">
          <PropertyPanel />
        </div>
      )}
    </div>
  );
};

export default AppLayout;
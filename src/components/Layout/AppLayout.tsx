import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Canvas from '../Canvas/Canvas';
import PropertyPanel from './PropertyPanel';
import { useMindMapStore } from '../../store/mindMapStore';

const AppLayout: React.FC = () => {
  const { sidebarOpen, propertyPanelOpen } = useMindMapStore();

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 sidebar-panel">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <Canvas />
        </div>
      </div>

      {/* Property Panel */}
      {propertyPanelOpen && (
        <div className="w-80 property-panel">
          <PropertyPanel />
        </div>
      )}
    </div>
  );
};

export default AppLayout;
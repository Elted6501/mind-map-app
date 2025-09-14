import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Canvas from '../Canvas/Canvas';
import PropertyPanel from './PropertyPanel';
import { useMindMapStore } from '../../store/mindMapStore';

const AppLayout: React.FC = () => {
  const { sidebarOpen, propertyPanelOpen } = useMindMapStore();

  return (
    <div className="flex h-screen relative bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => useMindMapStore.getState().actions.toggleSidebar()}
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[80vw] bg-white z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {sidebarOpen && (
        <div className="hidden lg:block w-80 xl:w-80 lg:w-64">
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

      {/* Mobile Property Panel Overlay */}
      {propertyPanelOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => useMindMapStore.getState().actions.togglePropertyPanel()}
          />
          {/* Property Panel */}
          <div className="fixed inset-y-0 right-0 w-80 max-w-[80vw] bg-white z-50">
            <PropertyPanel />
          </div>
        </div>
      )}

      {/* Desktop Property Panel */}
      {propertyPanelOpen && (
        <div className="hidden lg:block w-80 xl:w-80 lg:w-64">
          <PropertyPanel />
        </div>
      )}
    </div>
  );
};

export default AppLayout;
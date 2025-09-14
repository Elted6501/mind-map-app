import React from 'react';
import { 
  Menu, 
  Save, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Plus,
  LogOut,
  User,
  ArrowLeft
} from 'lucide-react';
import { useMindMapStore } from '../../store/mindMapStore';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { 
    currentMindMap, 
    sidebarOpen, 
    propertyPanelOpen, 
    actions,
    canvasState 
  } = useMindMapStore();

  const { user, logout } = useAuth();

  const handleBackToWelcome = () => {
    useMindMapStore.setState({ currentMindMap: null });
  };

  const handleSave = () => {
    if (currentMindMap) {
      actions.saveMindMap();
    }
  };

  const handleUndo = () => {
    actions.undo();
  };

  const handleRedo = () => {
    actions.redo();
  };

  const handleZoomIn = () => {
    actions.zoomIn();
  };

  const handleZoomOut = () => {
    actions.zoomOut();
  };

  const handleResetZoom = () => {
    actions.resetZoom();
  };

  const handleToggleSidebar = () => {
    actions.toggleSidebar();
  };

  const handleTogglePropertyPanel = () => {
    actions.togglePropertyPanel();
  };

  const zoomPercentage = Math.round(canvasState.zoom * 100);

  return (
    <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={handleBackToWelcome}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Back to Welcome"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="h-6 w-px bg-gray-300 hidden sm:block" />

        <button
          onClick={handleToggleSidebar}
          className={`p-2 rounded-md transition-colors ${
            sidebarOpen 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-300 hidden sm:block" />

        <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-none">
          {currentMindMap?.title || 'Mind Map'}
        </h1>
      </div>

      {/* Center Section - Tools (Hidden on mobile, shown on larger screens) */}
      <div className="hidden lg:flex items-center space-x-2">
        <button
          onClick={handleSave}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <button
          onClick={handleUndo}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
          disabled={!actions.canUndo()}
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          onClick={handleRedo}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
          disabled={!actions.canRedo()}
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-300" />

        <button
          onClick={handleZoomOut}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-sm text-gray-600 min-w-[60px] text-center">
          {zoomPercentage}%
        </span>

        <button
          onClick={handleZoomIn}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetZoom}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Center Section - Essential tools only */}
      <div className="flex lg:hidden items-center space-x-1">
        <button
          onClick={handleSave}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Save"
        >
          <Save className="w-4 h-4" />
        </button>

        <span className="text-xs text-gray-600 min-w-[50px] text-center">
          {zoomPercentage}%
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={handleTogglePropertyPanel}
          className={`p-2 rounded-md transition-colors ${
            propertyPanelOpen 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Toggle Property Panel"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-300 hidden sm:block" />

        <div className="hidden sm:flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600 max-w-[100px] truncate">{user?.name}</span>
        </div>

        <button
          onClick={logout}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
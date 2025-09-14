import React, { useEffect } from 'react';
import { 
  Menu, 
  LogOut,
  User,
  ArrowLeft,
  Save,
  Undo,
  Redo
} from 'lucide-react';
import { useMindMapStore } from '../../store/mindMapStore';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { 
    currentMindMap, 
    sidebarOpen, 
    propertyPanelOpen, 
    actions
  } = useMindMapStore();

  const { user, logout } = useAuth();

  // Get undo/redo state
  const canUndo = actions.canUndo();
  const canRedo = actions.canRedo();

  const handleBackToWelcome = () => {
    useMindMapStore.setState({ currentMindMap: null });
  };

  const handleSave = () => {
    if (currentMindMap) {
      actions.saveMindMap();
    }
  };

  const handleToggleSidebar = () => {
    actions.toggleSidebar();
  };

  const handleTogglePropertyPanel = () => {
    actions.togglePropertyPanel();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          actions.undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          actions.redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-2 sm:px-4 py-2 flex items-center justify-between rounded-xl mx-2 mt-2 min-h-[60px]">
      {/* Left Section */}
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 min-w-0 flex-shrink-0">
        <button
          onClick={handleBackToWelcome}
          className="flex items-center space-x-1 px-2 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors min-w-0 flex-shrink-0"
          title="Back to Welcome"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline text-sm">Back</span>
        </button>

        <div className="h-6 w-px bg-gray-300 hidden sm:block flex-shrink-0" />

        <button
          onClick={handleToggleSidebar}
          className={`p-2 rounded-md transition-colors flex-shrink-0 ${
            sidebarOpen 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-300 hidden sm:block flex-shrink-0" />

        <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate min-w-0 max-w-[60px] sm:max-w-[120px] md:max-w-[200px] lg:max-w-none">
          {currentMindMap?.title || 'Mind Mapping App'}
        </h1>
      </div>

      {/* Center Section - Undo/Redo and Save buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={actions.undo}
          disabled={!canUndo}
          className={`p-2 rounded-md transition-colors flex-shrink-0 ${
            canUndo 
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        
        <button
          onClick={actions.redo}
          disabled={!canRedo}
          className={`p-2 rounded-md transition-colors flex-shrink-0 ${
            canRedo 
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-300 flex-shrink-0" />

        <button
          onClick={handleSave}
          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex-shrink-0"
          title="Save Mind Map (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
        <button
          onClick={handleTogglePropertyPanel}
          className={`p-2 rounded-md transition-colors flex-shrink-0 touch-manipulation text-xs font-medium ${
            propertyPanelOpen 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Toggle Property Panel"
        >
          P
        </button>

        <div className="h-6 w-px bg-gray-300 hidden sm:block flex-shrink-0" />

        <div className="hidden sm:flex items-center space-x-2 min-w-0">
          <User className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate max-w-[60px] sm:max-w-[80px] md:max-w-[120px]">{user?.name}</span>
        </div>

        <button
          onClick={logout}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0 touch-manipulation"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
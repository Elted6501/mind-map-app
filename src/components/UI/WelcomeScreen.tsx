import React, { useState } from 'react';
import { Plus, FileText, Lightbulb, Users, Zap } from 'lucide-react';
import { useMindMapStore } from '../../store/mindMapStore';

const WelcomeScreen: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newMapTitle, setNewMapTitle] = useState('');
  const { actions, mindMaps, loading } = useMindMapStore();

  // Early return if loading or mindMaps is not ready
  if (loading || !mindMaps) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleCreateMindMap = async () => {
    if (newMapTitle.trim()) {
      try {
        await actions.createMindMap(newMapTitle.trim());
        setNewMapTitle('');
        setIsCreating(false);
      } catch (error) {
        console.error('Failed to create mind map:', error);
        // Keep the form open so user can try again
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateMindMap();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewMapTitle('');
    }
  };

  const recentMindMaps = Array.isArray(mindMaps) ? mindMaps.slice(-3).reverse() : [];

  return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="max-w-6xl w-full">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-2 sm:px-4">
            Welcome to Mind Mapping App
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-3 sm:px-4 leading-relaxed">
            Organize your thoughts, plan projects, and visualize ideas with our intuitive Mind Mapping App.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2 mb-6 sm:mb-8 md:mb-12 px-2 sm:px-0">
          {/* Create New Mind Mapping Card */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3 sm:mb-4">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 mr-2 sm:mr-3" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Create New Mind Mapping</h3>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
              Start fresh with a blank canvas and bring your ideas to life.
            </p>
            {isCreating ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newMapTitle}
                  onChange={(e) => setNewMapTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter Mind Mapping title..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <div className="flex flex-col xs:flex-row gap-2">
                  <button
                    onClick={handleCreateMindMap}
                    disabled={!newMapTitle.trim()}
                    className="flex-1 xs:flex-none xs:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-md sm:rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewMapTitle('');
                    }}
                    className="flex-1 xs:flex-none xs:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-md sm:rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base bg-blue-600 text-white rounded-md sm:rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-sm hover:shadow-md"
              >
                Create New Mind Mapping
              </button>
            )}
          </div>

          {/* Recent Mind Mapping Cards */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3 sm:mb-4">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 mr-2 sm:mr-3" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Recent Mind Mapping</h3>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
              Continue working on your recent projects.
            </p>
            {recentMindMaps.length > 0 ? (
              <div className="space-y-1 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                {recentMindMaps.map((mindMap) => (
                  <button
                    key={mindMap.id}
                    onClick={() => actions.loadMindMap(mindMap.id)}
                    className="w-full text-left px-3 py-2 sm:py-2.5 rounded-md sm:rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="font-medium text-gray-900 text-xs sm:text-sm md:text-base truncate">{mindMap.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(mindMap.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs sm:text-sm">No recent Mind Mapping</p>
                <p className="text-gray-400 text-xs mt-1">Create your first Mind Mapping to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0">
          <div className="text-center p-3 sm:p-4 bg-white/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-100 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Quick Start</h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Create nodes with a click, connect ideas with drag & drop
            </p>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-white/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-100 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Collaborate</h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Share and work together on Mind Mapping in real-time
            </p>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-white/50 rounded-lg sm:rounded-xl backdrop-blur-sm xs:col-span-2 lg:col-span-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-md sm:rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Export & Share</h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Save as images, PDFs, or share with others
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
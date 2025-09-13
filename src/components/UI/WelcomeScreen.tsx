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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Mind Map
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Organize your thoughts, plan projects, and visualize ideas with our intuitive mind mapping tool.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <Plus className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Create New Mind Map</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Start fresh with a blank canvas and bring your ideas to life.
            </p>
            {isCreating ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newMapTitle}
                  onChange={(e) => setNewMapTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter mind map title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateMindMap}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewMapTitle('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create New Mind Map
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Mind Maps</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Continue working on your recent projects.
            </p>
            {recentMindMaps.length > 0 ? (
              <div className="space-y-2">
                {recentMindMaps.map((mindMap) => (
                  <button
                    key={mindMap.id}
                    onClick={() => actions.loadMindMap(mindMap.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{mindMap.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(mindMap.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent mind maps</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Quick Start</h4>
            <p className="text-sm text-gray-600">
              Create nodes with a click, connect ideas with drag & drop
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Collaborate</h4>
            <p className="text-sm text-gray-600">
              Share and work together on mind maps in real-time
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Export & Share</h4>
            <p className="text-sm text-gray-600">
              Save as images, PDFs, or share with others
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
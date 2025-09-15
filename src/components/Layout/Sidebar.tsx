import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, Check } from 'lucide-react';
import { useMindMapStore } from '../../store/mindMapStore';

const Sidebar: React.FC = () => {
  const { currentMindMap, actions } = useMindMapStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditTitle = () => {
    setEditTitle(currentMindMap?.title || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (editTitle.trim() && currentMindMap) {
      try {
        actions.updateMindMap({ title: editTitle.trim() });
        await actions.saveMindMap();
        setIsEditingTitle(false);
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setEditTitle('');
  };

  const handleEditDescription = () => {
    setEditDescription(currentMindMap?.description || '');
    setIsEditingDescription(true);
  };

  const handleSaveDescription = async () => {
    if (currentMindMap) {
      try {
        actions.updateMindMap({ description: editDescription.trim() });
        await actions.saveMindMap();
        setIsEditingDescription(false);
      } catch (error) {
        console.error('Failed to update description:', error);
      }
    }
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
    setEditDescription('');
  };

  const handleDeleteMindMap = async () => {
    if (currentMindMap) {
      try {
        await actions.deleteMindMap(currentMindMap.id);
        setShowDeleteConfirm(false);
        // Navigation to welcome page will happen automatically when currentMindMap becomes null
      } catch (error) {
        console.error('Failed to delete mind map:', error);
      }
    }
  };

  const confirmDelete = () => {
    handleDeleteMindMap();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, saveFunction: () => void, cancelFunction: () => void) => {
    if (e.key === 'Enter') {
      saveFunction();
    } else if (e.key === 'Escape') {
      cancelFunction();
    }
  };

  return (
    <div className="h-full bg-white/90 backdrop-blur-sm border-r border-gray-200 p-4 rounded-xl shadow-md">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Mind Map</h2>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete Mind Map"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Title Section */}
        <div className="mb-3">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, handleSaveTitle, handleCancelEditTitle)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter title..."
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEditTitle}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between group">
              <p className="text-sm text-gray-600 flex-1">{currentMindMap?.title || 'Untitled'}</p>
              <button
                onClick={handleEditTitle}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Edit Title"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Description Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSaveDescription();
                  } else if (e.key === 'Escape') {
                    handleCancelEditDescription();
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Enter description..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveDescription}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEditDescription}
                  className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-600 flex-1">
                  {currentMindMap?.description || 'No description'}
                </p>
                <button
                  onClick={handleEditDescription}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Edit Description"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Statistics</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Nodes: {currentMindMap?.nodes?.length || 0}</div>
            <div>Connections: {currentMindMap?.connections?.length || 0}</div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Created</h3>
          <p className="text-sm text-gray-600">
            {currentMindMap?.createdAt ? new Date(currentMindMap.createdAt).toLocaleDateString() : 'Unknown'}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Last Updated</h3>
          <p className="text-sm text-gray-600">
            {currentMindMap?.updatedAt ? new Date(currentMindMap.updatedAt).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Mind Map</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{currentMindMap?.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
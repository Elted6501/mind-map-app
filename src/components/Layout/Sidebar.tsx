import React from 'react';
import { useMindMapStore } from '../../store/mindMapStore';

const Sidebar: React.FC = () => {
  const { currentMindMap } = useMindMapStore();

  return (
    <div className="h-full bg-white/90 backdrop-blur-sm border-r border-gray-200 p-4 rounded-xl shadow-md">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Mind Map</h2>
        <p className="text-sm text-gray-600">{currentMindMap?.title || 'Untitled'}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-600">
            {currentMindMap?.description || 'No description'}
          </p>
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
    </div>
  );
};

export default Sidebar;
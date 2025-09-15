import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Tag, Folder, X, Eye, Plus } from 'lucide-react';
import { templateService, MindMapTemplate } from '@/services/templateService';
import { apiClient } from '@/services/apiClient';

interface TemplateBrowserProps {
  onTemplateSelect: (mindMapId: string) => void;
  onClose: () => void;
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ onTemplateSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewTemplate, setPreviewTemplate] = useState<MindMapTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const templates = templateService.getTemplates();
  const categories = ['All', ...templateService.getCategories()];

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = templateService.searchTemplates(searchQuery);
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery]);

  const handleCreateFromTemplate = async (template: MindMapTemplate) => {
    setIsCreating(true);
    try {
      const mindMapData = templateService.createMindMapFromTemplate(template);
      const response = await apiClient.post<{ success: boolean; data: { _id: string } }>('/mindmaps', mindMapData);
      onTemplateSelect(response.data._id);
    } catch (error) {
      console.error('Failed to create mind map from template:', error);
      alert('Failed to create mind map from template. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getTemplatePreview = (template: MindMapTemplate) => {
    // Generate a simple visual preview based on the template structure
    const nodeCount = template.nodes.length;
    const connectionCount = template.connections.length;
    
    return (
      <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-px bg-gray-400"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-2 h-px bg-gray-400"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <div className="text-xs text-gray-500">
            {nodeCount} nodes • {connectionCount} connections
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 100000 }}>
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mind Map Templates
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose from our collection of pre-built templates to get started quickly
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Filters and Search */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <Folder className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Templates Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Templates Found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery ? 
                        `No templates match "${searchQuery}". Try a different search term.` :
                        'No templates available in this category.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-gray-300 transition-all group"
                      >
                        {/* Template Preview */}
                        <div className="mb-4">
                          {getTemplatePreview(template)}
                        </div>

                        {/* Template Info */}
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {template.title}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {template.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {template.description}
                          </p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{template.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleCreateFromTemplate(template)}
                            disabled={isCreating}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isCreating ? (
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            Use Template
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Template Preview Modal */}
      {previewTemplate && createPortal(
        <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 100001 }}>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-75"
              onClick={() => setPreviewTemplate(null)}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {previewTemplate.title} - Preview
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">{previewTemplate.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {previewTemplate.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="text-gray-600 mb-4">Template Structure</div>
                  <div className="space-y-2">
                    <div>📊 {previewTemplate.nodes.length} nodes</div>
                    <div>🔗 {previewTemplate.connections.length} connections</div>
                    <div>📂 Category: {previewTemplate.category}</div>
                  </div>
                  <button
                    onClick={() => {
                      setPreviewTemplate(null);
                      handleCreateFromTemplate(previewTemplate);
                    }}
                    disabled={isCreating}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isCreating ? 'Creating...' : 'Use This Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TemplateBrowser;
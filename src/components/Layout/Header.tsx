import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Menu, 
  LogOut,
  User,
  ArrowLeft,
  Save,
  Download,
  ChevronDown,
  MoreVertical
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
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [mainDropdownOpen, setMainDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const mainButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
      if (mainDropdownRef.current && !mainDropdownRef.current.contains(event.target as Node)) {
        setMainDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBackToWelcome = () => {
    useMindMapStore.setState({ currentMindMap: null });
  };

  const handleSave = () => {
    if (currentMindMap) {
      actions.saveMindMap();
    }
  };

  const handleExport = async (format: string) => {
    if (!currentMindMap) return;
    
    try {
      setExportDropdownOpen(false);
      
      if (format === 'json') {
        // Export as JSON file (client-side)
        const dataStr = JSON.stringify(currentMindMap, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `${currentMindMap.title || 'mindmap'}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else if (format === 'png') {
        // PNG export using html2canvas (client-side)
        handlePNGExport();
      } else if (format === 'pdf') {
        // PDF export using jsPDF (client-side)
        handlePDFExport();
      } else {
        // For SVG and other formats, use backend API
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/mindmaps/${currentMindMap.id}/export/${format}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Export failed: ${response.statusText}`);
        }
        
        // Download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.download = `${currentMindMap.title || 'mindmap'}.${format}`;
        linkElement.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePNGExport = async () => {
    let hiddenElements: HTMLElement[] = [];
    let originalCanvasState: any = null;
    
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      
      // Find the canvas element
      const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;
      if (!canvasElement) {
        throw new Error('Canvas not found');
      }

      // Hide UI elements during export
      const elementsToHide = [
        '[data-export-hide="true"]', // Generic hide marker
        '.absolute.top-2', // Canvas info overlay
        '.absolute.bottom-4', // Help text
        '.absolute.bottom-2', // Mobile help
        '[data-minimap="true"]', // Minimap
        '[data-toolbar="true"]' // Toolbar
      ];
      
      elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style.display !== 'none') {
            hiddenElements.push(htmlEl);
            htmlEl.style.display = 'none';
          }
        });
      });

      // Calculate bounding box of all nodes
      if (!currentMindMap || currentMindMap.nodes.length === 0) {
        throw new Error('No nodes to export');
      }

      const nodes = currentMindMap.nodes;
      const minX = Math.min(...nodes.map(n => n.x));
      const minY = Math.min(...nodes.map(n => n.y));
      const maxX = Math.max(...nodes.map(n => n.x + n.width));
      const maxY = Math.max(...nodes.map(n => n.y + n.height));
      
      // Add padding around the content
      const padding = 50;
      const contentWidth = maxX - minX + padding * 2;
      const contentHeight = maxY - minY + padding * 2;

      // Get current canvas state
      const canvasState = useMindMapStore.getState().canvasState;
      originalCanvasState = {
        panX: canvasState.panX,
        panY: canvasState.panY,
        zoom: canvasState.zoom
      };

      // Set canvas to show all content at optimal zoom
      const viewportWidth = canvasElement.offsetWidth;
      const viewportHeight = canvasElement.offsetHeight;
      const scaleX = viewportWidth / contentWidth;
      const scaleY = viewportHeight / contentHeight;
      const optimalZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

      // Center the content
      const newPanX = (viewportWidth - contentWidth * optimalZoom) / 2 - (minX - padding) * optimalZoom;
      const newPanY = (viewportHeight - contentHeight * optimalZoom) / 2 - (minY - padding) * optimalZoom;

      // Update canvas state temporarily
      actions.updateCanvas({
        panX: newPanX,
        panY: newPanY,
        zoom: optimalZoom
      });

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create screenshot
      const canvas = await html2canvas(canvasElement, {
        useCORS: true,
        allowTaint: true,
        width: viewportWidth,
        height: viewportHeight
      });

      // Download the image
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const linkElement = document.createElement('a');
          linkElement.href = url;
          linkElement.download = `${currentMindMap?.title || 'mindmap'}.png`;
          linkElement.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('PNG export error:', error);
      alert('PNG export failed. Please try SVG export instead.');
    } finally {
      // Always restore original canvas state and show hidden elements
      if (originalCanvasState) {
        actions.updateCanvas(originalCanvasState);
      }
      
      // Show hidden elements again
      hiddenElements.forEach(el => {
        el.style.display = '';
      });
    }
  };

  const handlePDFExport = async () => {
    let hiddenElements: HTMLElement[] = [];
    let originalCanvasState: any = null;
    
    try {
      // Dynamic imports to avoid SSR issues
      const [jsPDF, html2canvas] = await Promise.all([
        import('jspdf').then(module => module.jsPDF),
        import('html2canvas').then(module => module.default)
      ]);
      
      // Find the canvas element
      const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;
      if (!canvasElement) {
        throw new Error('Canvas not found');
      }

      // Hide UI elements during export
      const elementsToHide = [
        '[data-export-hide="true"]',
        '.absolute.top-2',
        '.absolute.bottom-4', 
        '.absolute.bottom-2',
        '[data-minimap="true"]',
        '[data-toolbar="true"]'
      ];
      
      elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style.display !== 'none') {
            hiddenElements.push(htmlEl);
            htmlEl.style.display = 'none';
          }
        });
      });

      // Calculate bounding box of all nodes
      if (!currentMindMap || currentMindMap.nodes.length === 0) {
        throw new Error('No nodes to export');
      }

      const nodes = currentMindMap.nodes;
      const minX = Math.min(...nodes.map(n => n.x));
      const minY = Math.min(...nodes.map(n => n.y));
      const maxX = Math.max(...nodes.map(n => n.x + n.width));
      const maxY = Math.max(...nodes.map(n => n.y + n.height));
      
      // Add padding
      const padding = 50;
      const contentWidth = maxX - minX + padding * 2;
      const contentHeight = maxY - minY + padding * 2;

      // Get current canvas state
      const canvasState = useMindMapStore.getState().canvasState;
      originalCanvasState = {
        panX: canvasState.panX,
        panY: canvasState.panY,
        zoom: canvasState.zoom
      };

      // Set optimal zoom to fit content
      const viewportWidth = canvasElement.offsetWidth;
      const viewportHeight = canvasElement.offsetHeight;
      const scaleX = viewportWidth / contentWidth;
      const scaleY = viewportHeight / contentHeight;
      const optimalZoom = Math.min(scaleX, scaleY, 1);

      // Center the content
      const newPanX = (viewportWidth - contentWidth * optimalZoom) / 2 - (minX - padding) * optimalZoom;
      const newPanY = (viewportHeight - contentHeight * optimalZoom) / 2 - (minY - padding) * optimalZoom;

      // Update canvas state temporarily
      actions.updateCanvas({
        panX: newPanX,
        panY: newPanY,
        zoom: optimalZoom
      });

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create screenshot
      const canvas = await html2canvas(canvasElement, {
        useCORS: true,
        allowTaint: true,
        width: viewportWidth,
        height: viewportHeight
      });
      
      // Calculate PDF dimensions based on content aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Use A4 size as base, adjust orientation based on content
      const isLandscape = imgWidth > imgHeight;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaling to fit content in PDF
      const scaleWidth = pdfWidth / imgWidth;
      const scaleHeight = pdfHeight / imgHeight;
      const scale = Math.min(scaleWidth, scaleHeight);
      
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      // Center the image in PDF
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;
      
      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png');
      
      // Add the image to PDF
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Download the PDF
      pdf.save(`${currentMindMap?.title || 'mindmap'}.pdf`);
      
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF export failed. Please try PNG export instead.');
    } finally {
      // Always restore original canvas state and show hidden elements
      if (originalCanvasState) {
        actions.updateCanvas(originalCanvasState);
      }
      
      // Show hidden elements again
      hiddenElements.forEach(el => {
        el.style.display = '';
      });
    }
  };

  const handleToggleSidebar = () => {
    actions.toggleSidebar();
  };

  const handleToggleMainDropdown = () => {
    if (!mainDropdownOpen && mainButtonRef.current) {
      const rect = mainButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setMainDropdownOpen(!mainDropdownOpen);
  };

  const handleTogglePropertyPanel = () => {
    actions.togglePropertyPanel();
  };

  return (
    <header className="relative bg-white backdrop-blur-sm border border-gray-200/60 rounded-xl shadow-lg px-3 sm:px-6 py-4 flex items-center justify-between h-16 mx-3 sm:mx-6 my-3 z-30 overflow-hidden">
      {/* Left Section */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-shrink-0">
        <button
          onClick={handleBackToWelcome}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Welcome"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:inline text-sm font-medium">Back</span>
        </button>

        <div className="h-6 w-px bg-gray-300 hidden md:block flex-shrink-0" />

        <button
          onClick={handleToggleSidebar}
          className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
            sidebarOpen 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-300 hidden md:block flex-shrink-0" />

        <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate min-w-0 max-w-[100px] sm:max-w-[200px] md:max-w-none">
          {currentMindMap?.title || 'Mind Map'}
        </h1>
      </div>

      {/* Center Section - Main Actions Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={handleTogglePropertyPanel}
          className={`px-2 sm:px-3 py-2 rounded-lg transition-colors flex-shrink-0 text-xs sm:text-sm font-medium ${
            propertyPanelOpen 
              ? 'bg-blue-100 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title="Toggle Property Panel"
        >
          <span className="hidden sm:inline">Properties</span>
          <span className="sm:hidden">Props</span>
        </button>

        {/* Main Actions Dropdown */}
        <div className="relative z-50" ref={mainDropdownRef}>
          <button
            ref={mainButtonRef}
            onClick={handleToggleMainDropdown}
            className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm text-sm"
            title="Actions Menu"
          >
            <MoreVertical className="w-4 h-4" />
            <span className="hidden sm:inline">Actions</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {mainDropdownOpen && createPortal(
            <div 
              ref={mainDropdownRef}
              className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-56"
              style={{ 
                zIndex: 99999,
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Save Option */}
              <button
                onClick={() => {
                  handleSave();
                  setMainDropdownOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <Save className="w-4 h-4 text-green-600" />
                <div>
                  <div className="font-medium">Save Mind Map</div>
                  <div className="text-xs text-gray-500">Ctrl+S</div>
                </div>
              </button>

              <div className="border-t border-gray-200 my-1"></div>

              {/* Export Options */}
              <div className="px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Export Options</div>
              </div>
              
              <button
                onClick={() => {
                  handleExport('png');
                  setMainDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Export as PNG Image
              </button>
              
              <button
                onClick={() => {
                  handleExport('svg');
                  setMainDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <Download className="w-4 h-4 text-purple-600" />
                Export as SVG Vector
              </button>
              
              <button
                onClick={() => {
                  handleExport('pdf');
                  setMainDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <Download className="w-4 h-4 text-red-600" />
                Export as PDF Document
              </button>
              
              <button
                onClick={() => {
                  handleExport('json');
                  setMainDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <Download className="w-4 h-4 text-gray-600" />
                Export as JSON Data
              </button>

              <div className="border-t border-gray-200 my-1"></div>

              {/* User Info and Logout */}
              {user && (
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 font-medium truncate">{user.name}</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => {
                  logout();
                  setMainDropdownOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                <div>
                  <div className="font-medium">Sign Out</div>
                  <div className="text-xs text-red-400">Log out of your account</div>
                </div>
              </button>
            </div>,
            document.body
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
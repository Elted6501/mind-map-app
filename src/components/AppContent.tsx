import React, { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import WelcomeScreen from '@/components/UI/WelcomeScreen';
import AuthPage from '@/components/Auth/AuthPage';
import AppLayout from './Layout/AppLayout';
import ErrorBoundary from './UI/ErrorBoundary';
import { useMindMapStore } from '@/store/mindMapStore';
import { safeLoadMindMapsFromStorage } from '../utils/mindMapUtils';
import '../utils/clearLocalStorage'; // Clear legacy localStorage on app load

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { currentMindMap, loading, error, actions } = useMindMapStore();

  // Function to get mind map ID from URL
  const getMindMapIdFromURL = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }, []);

  const loadMindMaps = useCallback(async () => {
    // Double check authentication before making API calls
    if (!isAuthenticated || !user) {
      return;
    }
    
    try {
      // Load from backend
      await actions.loadAllMindMaps();
      
      // Check if there's a specific mind map ID in the URL to load
      const mindMapIdFromURL = getMindMapIdFromURL();
      if (mindMapIdFromURL) {
        try {
          await actions.loadMindMap(mindMapIdFromURL);
        } catch (error) {
          console.error('Failed to load mind map from URL:', error);
          // Remove the invalid ID from URL
          window.history.replaceState({}, '', '/');
        }
      }
      
      // Also load from localStorage and merge
      const savedMindMaps = localStorage.getItem('mind_maps');
      if (savedMindMaps) {
        try {
          const localMindMaps = safeLoadMindMapsFromStorage();
          const currentBackendMaps = useMindMapStore.getState().mindMaps;
          
          // Merge unique mind maps (avoid duplicates by ID)
          const backendIds = new Set(currentBackendMaps.map((m: { id: string }) => m.id));
          const uniqueLocalMaps = localMindMaps.filter((m: { id: string }) => !backendIds.has(m.id));
          
          if (uniqueLocalMaps.length > 0) {
            useMindMapStore.setState({ 
              mindMaps: [...currentBackendMaps, ...uniqueLocalMaps] 
            });
          }
        } catch (err) {
          console.error('Failed to load saved mind maps:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load mind maps:', err);
    }
  }, [actions, isAuthenticated, user, getMindMapIdFromURL]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Clear any existing current mind map and load user's mind maps from backend
      useMindMapStore.setState({ currentMindMap: null });
      loadMindMaps();
    } else if (!isAuthenticated && !isLoading) {
      // Clear current mind map and only load from localStorage if not authenticated
      useMindMapStore.setState({ currentMindMap: null });
      const localMindMaps = safeLoadMindMapsFromStorage();
      if (localMindMaps.length > 0) {
        useMindMapStore.setState({ mindMaps: localMindMaps });
      }
    }
  }, [isAuthenticated, user, isLoading, loadMindMaps]);

  // Save mind maps to localStorage whenever they change (fallback for offline use)
  useEffect(() => {
    const unsubscribe = useMindMapStore.subscribe(
      (state) => state.mindMaps,
      (mindMaps) => {
        if (mindMaps && mindMaps.length > 0) {
          localStorage.setItem('mind_maps', JSON.stringify(mindMaps));
        }
      }
    );
    
    return unsubscribe;
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => actions.setError(null)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="mind-map-container h-full">
        {currentMindMap ? (
          <AppLayout />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AppContent;
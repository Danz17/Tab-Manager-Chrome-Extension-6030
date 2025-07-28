import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useNavigate } from 'react-router-dom';

const { 
  FiTabs, 
  FiSearch, 
  FiZap, 
  FiSave, 
  FiPlus, 
  FiSettings, 
  FiCommand, 
  FiClock,
  FiInfo,
  FiHeart
} = FiIcons;

export default function NewTab() {
  const [currentTabs, setCurrentTabs] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExtension, setIsExtension] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const version = "1.0.2";
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're in the extension context
    const extensionContext = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    setIsExtension(extensionContext);
    
    loadData();
    setupKeyboardShortcuts();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        // We're in the extension context, use Chrome APIs
        // Get current tabs
        const tabs = await chrome.tabs.query({ currentWindow: true });
        setCurrentTabs(tabs.map(tab => ({
          id: tab.id,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          active: tab.active,
          pinned: tab.pinned
        })));

        // Load saved collections from storage
        const result = await chrome.storage.local.get(['collections']);
        setCollections(result.collections || []);
      } else {
        // We're in the web app context, use demo data
        loadDemoData();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load tabs. Please try refreshing the page.');
      // Fall back to demo data if Chrome APIs fail
      loadDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoData = () => {
    setCurrentTabs([
      {
        id: 1,
        title: 'TabBoard - Smart Tab Management',
        url: 'https://tabboard.app',
        favIconUrl: '/icons/icon16.png',
        active: true
      },
      {
        id: 2,
        title: 'GitHub: Where the world builds software',
        url: 'https://github.com',
        favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
        active: false
      },
      {
        id: 3,
        title: 'React – A JavaScript library for building user interfaces',
        url: 'https://reactjs.org',
        favIconUrl: 'https://reactjs.org/favicon.ico',
        active: false
      }
    ]);

    setCollections([
      {
        id: 'dev-tools',
        name: 'Development Tools',
        tabs: [
          {
            title: 'GitHub: Where the world builds software',
            url: 'https://github.com',
            favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg'
          },
          {
            title: 'Stack Overflow - Where Developers Learn & Share',
            url: 'https://stackoverflow.com',
            favIconUrl: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico'
          }
        ],
        createdAt: Date.now() - 86400000,
        type: 'session'
      },
      {
        id: 'learning',
        name: 'Learning Resources',
        tabs: [
          {
            title: 'MDN Web Docs',
            url: 'https://developer.mozilla.org',
            favIconUrl: 'https://developer.mozilla.org/favicon.ico'
          },
          {
            title: 'React – A JavaScript library for building user interfaces',
            url: 'https://reactjs.org',
            favIconUrl: 'https://reactjs.org/favicon.ico'
          }
        ],
        createdAt: Date.now() - 172800000,
        type: 'manual'
      }
    ]);
  };

  const setupKeyboardShortcuts = () => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandBar(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveAllTabs();
      }
      if (e.key === 'Escape') {
        setShowCommandBar(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  };

  const saveAllTabs = async () => {
    try {
      const collection = {
        id: Date.now().toString(),
        name: `Session ${new Date().toLocaleString()}`,
        tabs: currentTabs,
        createdAt: Date.now(),
        type: 'session'
      };

      if (isExtension && typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['collections']);
        const updatedCollections = [...(result.collections || []), collection];
        await chrome.storage.local.set({ collections: updatedCollections });
        setCollections(updatedCollections);
      } else {
        // Web app version - just update state
        setCollections(prev => [...prev, collection]);
      }
      
      showNotification('All tabs saved successfully!');
    } catch (error) {
      console.error('Failed to save tabs:', error);
      showNotification('Failed to save tabs', 'error');
    }
  };

  const createCollection = () => {
    const name = prompt('Collection name:');
    if (name) {
      const collection = {
        id: Date.now().toString(),
        name: name,
        tabs: [],
        createdAt: Date.now(),
        type: 'manual'
      };
      
      if (isExtension && typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['collections']).then(result => {
          const updatedCollections = [...(result.collections || []), collection];
          chrome.storage.local.set({ collections: updatedCollections });
          setCollections(updatedCollections);
        });
      } else {
        // Web app version - just update state
        setCollections(prev => [...prev, collection]);
      }
    }
  };

  const runAIClustering = async () => {
    showNotification('AI clustering started...');
    // Simulate AI clustering
    setTimeout(() => {
      const clusters = groupTabsByDomain(currentTabs);
      const newCollections = [];
      
      clusters.forEach(cluster => {
        const collection = {
          id: Date.now().toString() + Math.random(),
          name: cluster.name,
          tabs: cluster.tabs,
          createdAt: Date.now(),
          type: 'ai-cluster'
        };
        
        newCollections.push(collection);
        
        if (isExtension && typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get(['collections']).then(result => {
            const updatedCollections = [...(result.collections || []), collection];
            chrome.storage.local.set({ collections: updatedCollections });
          });
        }
      });
      
      // Update state for both web and extension
      setCollections(prev => [...prev, ...newCollections]);
      showNotification('AI clustering completed!');
    }, 1000);
  };

  const groupTabsByDomain = (tabs) => {
    const groups = {};
    tabs.forEach(tab => {
      try {
        const domain = new URL(tab.url).hostname;
        if (!groups[domain]) {
          groups[domain] = [];
        }
        groups[domain].push(tab);
      } catch (error) {
        // Handle invalid URLs
        if (!groups['other']) {
          groups['other'] = [];
        }
        groups['other'].push(tab);
      }
    });

    return Object.entries(groups)
      .filter(([_, tabs]) => tabs.length >= 2)
      .map(([domain, tabs]) => ({
        name: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Tabs`,
        tabs: tabs
      }));
  };

  const closeTab = async (tabId) => {
    try {
      if (isExtension && typeof chrome !== 'undefined' && chrome.tabs) {
        await chrome.tabs.remove(tabId);
      }
      setCurrentTabs(prev => prev.filter(tab => tab.id !== tabId));
      showNotification('Tab closed');
    } catch (error) {
      console.error('Failed to close tab:', error);
      setError('Failed to close tab. Please try again.');
    }
  };

  const restoreTab = async (tab) => {
    try {
      if (isExtension && typeof chrome !== 'undefined' && chrome.tabs) {
        await chrome.tabs.create({ url: tab.url });
      } else {
        // In web app, just show notification
        console.log('Would open tab:', tab.url);
      }
      showNotification('Tab restored');
    } catch (error) {
      console.error('Failed to restore tab:', error);
      setError('Failed to restore tab. Please try again.');
    }
  };

  const showNotification = (message, type = 'success') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 1000;
      color: white;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const formatUrl = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const clearError = () => {
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading your tabs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white">
      {/* Header */}
      <motion.header 
        className="flex justify-between items-center p-8 bg-white/10 backdrop-blur-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <SafeIcon icon={FiTabs} className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">TabBoard</h1>
            <div className="flex items-center text-white/80 text-sm">
              <span>Smart Tab Management</span>
              <span className="mx-2">•</span>
              <span className="text-xs">v{version}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{currentTabs.length}</div>
            <div className="text-xs text-white/70">Open Tabs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{collections.length}</div>
            <div className="text-xs text-white/70">Collections</div>
          </div>
        </div>
      </motion.header>

      {/* Error Alert */}
      {error && (
        <div className="mx-8 mt-4 bg-red-500/80 text-white px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <SafeIcon icon={FiInfo} className="mr-2" />
            <span>{error}</span>
          </div>
          <button 
            onClick={clearError}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <motion.section 
        className="p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={saveAllTabs}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            <SafeIcon icon={FiSave} />
            Save All Tabs
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Ctrl+S</span>
          </button>
          
          <button
            onClick={createCollection}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            <SafeIcon icon={FiPlus} />
            New Collection
          </button>
          
          <button
            onClick={runAIClustering}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            <SafeIcon icon={FiZap} />
            AI Cluster
          </button>
          
          <button
            onClick={() => setShowCommandBar(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            <SafeIcon icon={FiCommand} />
            Search
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Ctrl+K</span>
          </button>

          {!isExtension && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
            >
              <SafeIcon icon={FiSettings} />
              Dashboard
            </button>
          )}
        </div>
      </motion.section>

      {/* Collections Grid */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Current Tabs Collection */}
          <motion.div 
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <SafeIcon icon={FiTabs} />
                Current Tabs
              </h3>
              <span className="text-sm text-white/70">{currentTabs.length} tabs</span>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentTabs.length > 0 ? (
                currentTabs.map(tab => (
                  <div key={tab.id} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors group">
                    <img 
                      src={tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>'} 
                      className="w-5 h-5 rounded"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>';
                      }}
                      alt={tab.title}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{tab.title}</div>
                      <div className="text-xs text-white/60 truncate">{formatUrl(tab.url)}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/60">
                  No tabs open in this window
                </div>
              )}
            </div>
          </motion.div>

          {/* Saved Collections */}
          {collections.length > 0 ? (
            collections.map((collection, index) => (
              <motion.div 
                key={collection.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <SafeIcon icon={collection.type === 'ai-cluster' ? FiZap : FiSave} />
                    {collection.name}
                  </h3>
                  <span className="text-sm text-white/70">{collection.tabs.length} tabs</span>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {collection.tabs.map((tab, tabIndex) => (
                    <div 
                      key={tabIndex} 
                      className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer group"
                      onClick={() => restoreTab(tab)}
                    >
                      <img 
                        src={tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>'} 
                        className="w-5 h-5 rounded"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>';
                        }}
                        alt={tab.title}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{tab.title}</div>
                        <div className="text-xs text-white/60 truncate">{formatUrl(tab.url)}</div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 text-xs text-white/60">
                        Click to restore
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-xs text-white/50 flex items-center gap-1">
                    <SafeIcon icon={FiClock} className="text-xs" />
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SafeIcon icon={FiSave} className="text-4xl mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
              <p className="text-white/70 text-center mb-6">
                Save your tabs to create your first collection
              </p>
              <button
                onClick={saveAllTabs}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Save Current Tabs
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-white/20 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-sm text-white/60">TabBoard v{version}</span>
          </div>
          <div className="flex items-center text-sm text-white/60">
            <SafeIcon icon={FiHeart} className="text-pink-400 mr-2" />
            <span>Built with ❤️ and frustration by Alaa Qweider</span>
          </div>
        </div>
      </footer>

      {/* Command Bar Modal */}
      {showCommandBar && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCommandBar(false)}
        >
          <motion.div 
            className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-2xl mx-4"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <SafeIcon icon={FiSearch} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search tabs, collections, history..."
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 outline-none text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <kbd className="bg-gray-200 px-2 py-1 rounded text-xs text-gray-600">ESC</kbd>
            </div>
            
            <div className="text-sm text-gray-600">
              Press <kbd className="bg-gray-200 px-1 rounded">Enter</kbd> to search or <kbd className="bg-gray-200 px-1 rounded">Esc</kbd> to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
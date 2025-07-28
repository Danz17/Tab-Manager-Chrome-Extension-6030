import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const { 
  FiTabs, 
  FiSearch, 
  FiZap, 
  FiSave, 
  FiPlus, 
  FiSettings, 
  FiCommand, 
  FiClock, 
  FiUser, 
  FiLogOut, 
  FiPieChart, 
  FiList,
  FiHome,
  FiHeart
} = FiIcons;

export default function Dashboard() {
  const [collections, setCollections] = useState([]);
  const [stats, setStats] = useState({
    totalTabs: 0,
    totalCollections: 0,
    avgTabsPerCollection: 0
  });
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('collections');
  const [error, setError] = useState(null);
  const version = "1.0.2";
  
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        loadUserData(data.user.id);
      } else {
        loadDemoData();
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setError('Failed to load user data. Please try again later.');
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      // Load real user data from Supabase
      const { data: collectionsData, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (collectionsData && collectionsData.length > 0) {
        setCollections(collectionsData);
        
        // Calculate stats
        const totalTabs = collectionsData.reduce((sum, collection) => 
          sum + (collection.tabs ? collection.tabs.length : 0), 0);
        
        setStats({
          totalTabs,
          totalCollections: collectionsData.length,
          avgTabsPerCollection: collectionsData.length ? (totalTabs / collectionsData.length).toFixed(1) : 0
        });
      } else {
        // Fall back to demo data if user has no collections
        loadDemoData();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load collections. Please try again later.');
      loadDemoData();
    }
  };

  const loadDemoData = () => {
    // Demo data
    const demoCollections = [
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
      },
      {
        id: 'ai-news',
        name: 'AI News',
        tabs: [
          {
            title: 'OpenAI',
            url: 'https://openai.com',
            favIconUrl: 'https://openai.com/favicon.ico'
          },
          {
            title: 'Google AI',
            url: 'https://ai.google',
            favIconUrl: 'https://www.google.com/favicon.ico'
          },
          {
            title: 'Hugging Face – The AI community building the future',
            url: 'https://huggingface.co',
            favIconUrl: 'https://huggingface.co/favicon.ico'
          }
        ],
        createdAt: Date.now() - 259200000,
        type: 'ai-cluster'
      }
    ];
    
    setCollections(demoCollections);
    
    // Calculate stats from demo data
    const totalTabs = demoCollections.reduce((sum, collection) => 
      sum + collection.tabs.length, 0);
    
    setStats({
      totalTabs,
      totalCollections: demoCollections.length,
      avgTabsPerCollection: (totalTabs / demoCollections.length).toFixed(1)
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (loginForm.email === 'alaa@nulled.ai' && loginForm.password === 'password') {
        // Demo login
        setUser({
          id: 'demo-user',
          email: 'alaa@nulled.ai',
          user_metadata: { name: 'Demo User' }
        });
        setShowLoginModal(false);
        loadDemoData();
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });
      
      if (error) throw error;
      
      setUser(data.user);
      loadUserData(data.user.id);
      setShowLoginModal(false);
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: loginForm.email,
        password: loginForm.password
      });
      
      if (error) throw error;
      
      alert('Check your email for the confirmation link!');
      setIsSignUp(false);
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      loadDemoData();
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatUrl = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const clearError = () => {
    setError(null);
  };

  const renderCollectionsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {collections.length > 0 ? (
        collections.map((collection, index) => (
          <motion.div 
            key={collection.id}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <SafeIcon icon={collection.type === 'ai-cluster' ? FiZap : FiSave} />
                {collection.name}
              </h3>
              <span className="text-sm text-white/70">{collection.tabs.length} tabs</span>
            </div>
            
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {collection.tabs.map((tab, tabIndex) => (
                <div 
                  key={tabIndex} 
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer group"
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
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-xs text-white/50 flex items-center gap-1">
                <SafeIcon icon={FiClock} className="text-xs" />
                {formatDate(collection.createdAt)}
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="col-span-full flex items-center justify-center h-64 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="text-center">
            <SafeIcon icon={FiTabs} className="text-4xl mb-4 opacity-50 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">No Collections Yet</h3>
            <p className="text-white/70 mb-4">Save some tabs to get started</p>
            <button 
              onClick={() => navigate('/newtab')} 
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all"
            >
              Go to New Tab
            </button>
          </div>
        </div>
      )}

      {/* Add New Collection Card */}
      <motion.div 
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 * collections.length }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <SafeIcon icon={FiPlus} className="text-2xl text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">New Collection</h3>
        <p className="text-white/60 text-center text-sm">
          Create a new collection to organize your tabs
        </p>
      </motion.div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-4xl font-bold mb-2">{stats.totalTabs}</div>
          <div className="text-white/70">Total Saved Tabs</div>
        </motion.div>
        
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-4xl font-bold mb-2">{stats.totalCollections}</div>
          <div className="text-white/70">Collections</div>
        </motion.div>
        
        <motion.div 
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-4xl font-bold mb-2">{stats.avgTabsPerCollection}</div>
          <div className="text-white/70">Avg. Tabs per Collection</div>
        </motion.div>
      </div>
      
      <motion.div 
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold mb-4">Tab Activity</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-white/50 text-center">
            Activity charts will appear here when you use the Chrome extension
          </p>
        </div>
      </motion.div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-8">
      <motion.div 
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
        
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <SafeIcon icon={FiUser} className="text-xl" />
              </div>
              <div>
                <div className="font-medium">{user.email}</div>
                <div className="text-sm text-white/60">Logged in</div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg px-4 py-2 rounded-lg font-medium transition-all"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <SafeIcon icon={FiLogOut} />
              )}
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/80">
              Log in to sync your collections across devices and access advanced features.
            </p>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 bg-white text-indigo-600 hover:bg-white/90 px-4 py-2 rounded-lg font-medium transition-all"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <SafeIcon icon={FiUser} />
              )}
              Sign In
            </button>
          </div>
        )}
      </motion.div>
      
      <motion.div 
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold mb-4">Extension</h3>
        <p className="text-white/80 mb-4">
          Install the TabBoard Chrome extension for the full experience.
        </p>
        <a 
          href="/extension/tabboard-extension.zip"
          download
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg px-4 py-2 rounded-lg font-medium transition-all"
        >
          <SafeIcon icon={FiDownload} />
          Download Extension
        </a>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white/10 backdrop-blur-lg">
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <SafeIcon icon={FiTabs} className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">TabBoard</h1>
            <div className="text-xs text-white/60">Version {version}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/newtab')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg px-4 py-2 rounded-lg transition-all"
          >
            <SafeIcon icon={FiTabs} />
            <span className="hidden sm:inline">New Tab</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <SafeIcon icon={FiUser} />
              <span className="hidden sm:inline text-sm">{user.email.split('@')[0]}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg px-4 py-2 rounded-lg transition-all"
            >
              <SafeIcon icon={FiUser} />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="mx-6 mt-4 bg-red-500/80 text-white px-4 py-3 rounded-lg flex items-center justify-between">
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

      {/* Sidebar and Content */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-64 bg-white/5 backdrop-blur-lg md:min-h-[calc(100vh-80px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                >
                  <SafeIcon icon={FiHome} />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('collections')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left ${
                    activeTab === 'collections' ? 'bg-white/10' : ''
                  }`}
                >
                  <SafeIcon icon={FiList} />
                  <span>Collections</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left ${
                    activeTab === 'analytics' ? 'bg-white/10' : ''
                  }`}
                >
                  <SafeIcon icon={FiPieChart} />
                  <span>Analytics</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left ${
                    activeTab === 'settings' ? 'bg-white/10' : ''
                  }`}
                >
                  <SafeIcon icon={FiSettings} />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">
            {activeTab === 'collections' && 'My Collections'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'settings' && 'Settings'}
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {activeTab === 'collections' && renderCollectionsTab()}
              {activeTab === 'analytics' && renderAnalyticsTab()}
              {activeTab === 'settings' && renderSettingsTab()}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-white/20 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
          <div className="mb-4 md:mb-0 flex items-center">
            <SafeIcon icon={FiTabs} className="mr-2" />
            <span className="mr-2">TabBoard</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded">v{version}</span>
          </div>
          <div className="flex items-center">
            <SafeIcon icon={FiHeart} className="text-pink-400 mr-2" />
            <span>Built with ❤️ and frustration by Alaa Qweider</span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 text-gray-800">
            <h3 className="text-2xl font-bold mb-6">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h3>
            
            {error && (
              <div className="mb-4 bg-red-100 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  placeholder={!isSignUp ? "Try demo: alaa@nulled.ai" : ""}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  placeholder={!isSignUp ? "Try demo: password" : ""}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-indigo-600 hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
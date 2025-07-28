import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';

const { 
  FiTabs, 
  FiSearch, 
  FiZap, 
  FiShield, 
  FiEdit3, 
  FiSave, 
  FiDownload, 
  FiArrowRight, 
  FiGithub,
  FiInfo,
  FiHeart
} = FiIcons;

export default function Home() {
  const navigate = useNavigate();
  const [showExtensionPrompt, setShowExtensionPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const version = "1.0.2";

  useEffect(() => {
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const features = [
    {
      icon: FiTabs,
      title: 'AI-Powered Clustering',
      description: 'Automatically organize your tabs by topic and domain using smart AI algorithms.',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: FiSearch,
      title: 'Fuzzy Search',
      description: 'Find any tab instantly with intelligent search across current tabs, collections, and history.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: FiZap,
      title: 'Smart Automation',
      description: 'Set up rules to automatically archive idle tabs, group similar content, and more.',
      gradient: 'from-pink-500 to-red-600'
    },
    {
      icon: FiShield,
      title: 'End-to-End Encryption',
      description: 'Your data is encrypted locally and never leaves your device unprotected.',
      gradient: 'from-green-500 to-blue-600'
    },
    {
      icon: FiEdit3,
      title: 'Rich Notes & Tasks',
      description: 'Add notes, reminders, and to-do items to your tabs and collections.',
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      icon: FiSave,
      title: 'Session Management',
      description: 'Save and restore complete browsing sessions with scroll positions intact.',
      gradient: 'from-indigo-500 to-purple-600'
    }
  ];

  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Open Command Bar' },
    { keys: ['Ctrl', 'S'], description: 'Save All Tabs' },
    { keys: ['Esc'], description: 'Close Modals' },
    { keys: ['Enter'], description: 'Execute Command' }
  ];

  const handleGetStarted = () => {
    // Check if we're in the extension context
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    
    if (isExtension) {
      navigate('/newtab');
    } else {
      setShowExtensionPrompt(true);
      // Also navigate to the demo tab board
      navigate('/dashboard');
    }
  };

  const handleSkipWelcome = () => {
    // Check if we're in the extension context
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    
    if (isExtension) {
      navigate('/newtab');
    } else {
      navigate('/dashboard');
    }
  };

  const downloadExtension = () => {
    // Simulate download start
    const downloadLink = document.createElement('a');
    downloadLink.href = '/extension/tabboard-extension.zip';
    downloadLink.download = 'tabboard-extension.zip';
    downloadLink.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading TabBoard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
        <div className="text-center text-white max-w-md p-8 bg-white/10 backdrop-blur-md rounded-xl">
          <SafeIcon icon={FiInfo} className="text-5xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
      {/* Header */}
      <motion.header 
        className="text-center py-20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <SafeIcon icon={FiTabs} className="text-3xl text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            TabBoard
          </h1>
        </div>
        <p className="text-xl text-white/90 font-light max-w-2xl mx-auto">
          Smart Tab Management for Power Users
        </p>
        <div className="mt-4 text-sm bg-white/10 rounded-full px-4 py-1 inline-flex items-center">
          <span>Version {version}</span>
          <span className="mx-2">•</span>
          <span>Coming soon to Chrome Web Store</span>
        </div>
      </motion.header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Powerful Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                <SafeIcon icon={feature.icon} className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-white/80 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Extension Download */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6">Download Chrome Extension</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            TabBoard is currently in beta. Download the extension manually while we await approval from the Chrome Web Store.
          </p>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <motion.button
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-300 min-w-[200px] flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadExtension}
              >
                <SafeIcon icon={FiDownload} className="text-xl" />
                Download Extension
              </motion.button>
              
              <a 
                href="https://github.com/alaa-qweider/tabboard"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 min-w-[200px] flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiGithub} className="text-xl" />
                GitHub Repository
              </a>
            </div>
            
            <div className="bg-white/20 rounded-xl p-6 max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Installation Instructions</h3>
              <ol className="text-left space-y-3 text-white/90">
                <li className="flex items-start gap-2">
                  <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Download the extension ZIP file using the button above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>Unzip the file to a location on your computer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>Open Chrome and navigate to <code className="bg-white/20 px-1 rounded">chrome://extensions</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <span>Enable "Developer mode" using the toggle in the top right</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                  <span>Click "Load unpacked" and select the unzipped extension folder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">6</span>
                  <span>TabBoard should now be installed and ready to use!</span>
                </li>
              </ol>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Getting Started */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Getting Started
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              step: 1,
              title: 'Install the Extension',
              description: 'Download and install the TabBoard Chrome extension to get started.'
            },
            {
              step: 2,
              title: 'Open a New Tab',
              description: 'Click the "+" button or press Ctrl+T to open TabBoard as your new tab page.'
            },
            {
              step: 3,
              title: 'Save Your Tabs',
              description: 'Use Ctrl+S to save all current tabs or click individual save buttons.'
            },
            {
              step: 4,
              title: 'Try AI Clustering',
              description: 'Let AI organize your tabs automatically by clicking the "AI Cluster" button.'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + 0.1 * index, duration: 0.6 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-white/80">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <motion.h2 
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          Keyboard Shortcuts
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcuts.map((shortcut, index) => (
            <motion.div
              key={index}
              className="flex justify-between items-center bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + 0.1 * index, duration: 0.4 }}
            >
              <div className="flex gap-2">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd key={keyIndex} className="bg-white/20 px-3 py-2 rounded-lg text-sm font-semibold">
                    {key}
                  </kbd>
                ))}
              </div>
              <span className="text-white/90 font-medium">{shortcut.description}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section 
        className="text-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <motion.button
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-300 min-w-[200px] flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
          >
            Get Started
            <SafeIcon icon={FiArrowRight} className="ml-2" />
          </motion.button>
          <motion.button
            className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-white/10 transition-all duration-300 min-w-[200px]"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkipWelcome}
          >
            Skip Welcome
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <SafeIcon icon={FiTabs} className="text-2xl mr-2" />
            <span className="font-bold text-xl">TabBoard</span>
            <span className="ml-4 text-sm bg-white/10 px-2 py-0.5 rounded">v{version}</span>
          </div>
          
          <div className="flex items-center gap-4 mb-6 md:mb-0">
            <a href="#" className="text-white/70 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">Help</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a>
          </div>
          
          <div className="flex items-center gap-2">
            <SafeIcon icon={FiHeart} className="text-pink-400" />
            <span>Built with ❤️ and frustration by Alaa Qweider</span>
          </div>
        </div>
      </footer>

      {/* Extension Prompt Modal */}
      {showExtensionPrompt && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 text-gray-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className="text-2xl font-bold mb-4">Install Chrome Extension</h3>
            <p className="mb-6">
              For the full TabBoard experience, please install our Chrome extension. The web version has limited functionality.
            </p>
            <div className="flex justify-between">
              <button
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                onClick={downloadExtension}
              >
                Download Extension
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                onClick={() => setShowExtensionPrompt(false)}
              >
                Continue to Web App
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
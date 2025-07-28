import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTabs, FiSearch, FiZap, FiShield, FiEdit3, FiSave } = FiIcons;

export default function Home() {
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

  return (
    <div className="min-h-screen text-white">
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
            { step: 1, title: 'Open a New Tab', description: 'Click the "+" button or press Ctrl+T to open TabBoard as your new tab page.' },
            { step: 2, title: 'Save Your Tabs', description: 'Use Ctrl+S to save all current tabs or click individual save buttons.' },
            { step: 3, title: 'Use Command Bar', description: 'Press Ctrl+K to open the command bar for lightning-fast tab navigation.' },
            { step: 4, title: 'Try AI Clustering', description: 'Let AI organize your tabs automatically by clicking the "AI Cluster" button.' }
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
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-300 min-w-[200px]"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
          <motion.button
            className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-white/10 transition-all duration-300 min-w-[200px]"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip Welcome
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
document.addEventListener('DOMContentLoaded', () => {
  class WelcomeController {
    constructor() {
      this.init();
    }

    init() {
      this.bindEvents();
      this.loadSettings();
    }

    bindEvents() {
      const getStartedBtn = document.getElementById('getStarted');
      const skipWelcomeBtn = document.getElementById('skipWelcome');
      
      if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
          this.openTabBoard();
        });
      }
      
      if (skipWelcomeBtn) {
        skipWelcomeBtn.addEventListener('click', () => {
          this.skipWelcome();
        });
      }
    }

    async loadSettings() {
      try {
        // Check if we're in the extension context
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.local.get(['settings']);
          if (result.settings && !result.settings.showWelcome) {
            // Redirect to new tab if welcome shouldn't be shown
            this.openTabBoard();
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    async openTabBoard() {
      try {
        // Check if we're in the extension context
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.tabs) {
          // Update settings to not show welcome again
          await this.updateWelcomeSettings(false);
          
          // Open new tab with TabBoard
          chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
          
          // Close current tab
          chrome.tabs.getCurrent((tab) => {
            if (tab) {
              chrome.tabs.remove(tab.id);
            }
          });
        } else {
          // Web version - redirect
          window.location.href = 'index.html#/newtab';
        }
      } catch (error) {
        console.error('Failed to open TabBoard:', error);
        // Fallback for web version or if there's an error
        window.location.href = 'index.html#/newtab';
      }
    }

    async skipWelcome() {
      try {
        // Check if we're in the extension context
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.tabs) {
          await this.updateWelcomeSettings(false);
          
          chrome.tabs.getCurrent((tab) => {
            if (tab) {
              chrome.tabs.remove(tab.id);
            }
          });
        } else {
          // Web version - redirect
          window.location.href = 'index.html#/newtab';
        }
      } catch (error) {
        console.error('Failed to skip welcome:', error);
        // Fallback for web version or if there's an error
        window.location.href = 'index.html#/newtab';
      }
    }

    async updateWelcomeSettings(showWelcome) {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.local.get(['settings']);
          const settings = result.settings || {};
          settings.showWelcome = showWelcome;
          await chrome.storage.local.set({ settings });
        }
      } catch (error) {
        console.error('Failed to update welcome settings:', error);
      }
    }
  }

  // Initialize welcome controller
  new WelcomeController();
});
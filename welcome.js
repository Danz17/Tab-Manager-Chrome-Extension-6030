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
      document.getElementById('getStarted').addEventListener('click', () => {
        this.openTabBoard();
      });
      
      document.getElementById('skipWelcome').addEventListener('click', () => {
        this.skipWelcome();
      });
    }

    async loadSettings() {
      try {
        const result = await chrome.storage.local.get(['settings']);
        if (result.settings && !result.settings.showWelcome) {
          // Redirect to new tab if welcome shouldn't be shown
          this.openTabBoard();
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    async openTabBoard() {
      try {
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
      } catch (error) {
        console.error('Failed to open TabBoard:', error);
      }
    }

    async skipWelcome() {
      try {
        await this.updateWelcomeSettings(false);
        chrome.tabs.getCurrent((tab) => {
          if (tab) {
            chrome.tabs.remove(tab.id);
          }
        });
      } catch (error) {
        console.error('Failed to skip welcome:', error);
      }
    }

    async updateWelcomeSettings(showWelcome) {
      try {
        const result = await chrome.storage.local.get(['settings']);
        const settings = result.settings || {};
        settings.showWelcome = showWelcome;
        await chrome.storage.local.set({ settings });
      } catch (error) {
        console.error('Failed to update welcome settings:', error);
      }
    }
  }

  // Initialize welcome controller
  new WelcomeController();
});
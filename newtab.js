import TabBoard from './src/TabBoard.js';
import { StorageManager } from './src/utils/storage.js';
import { TabManager } from './src/utils/tabManager.js';

class NewTabApp {
  constructor() {
    this.storage = new StorageManager();
    this.tabManager = new TabManager();
    this.tabBoard = null;
    this.init();
  }

  async init() {
    await this.storage.init();
    await this.tabManager.init();
    
    this.tabBoard = new TabBoard({
      storage: this.storage,
      tabManager: this.tabManager
    });
    
    document.getElementById('app').appendChild(this.tabBoard.render());
    
    // Initialize keyboard shortcuts
    this.initKeyboardShortcuts();
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for command bar
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.tabBoard.openCommandBar();
      }
      
      // Ctrl/Cmd + S for save all tabs
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.tabBoard.saveAllTabs();
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        this.tabBoard.closeModals();
      }
    });
  }
}

// Initialize the app
new NewTabApp();
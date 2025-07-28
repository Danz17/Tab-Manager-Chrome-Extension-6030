// Background service worker for TabBoard extension
class TabBoardBackground {
  constructor() {
    this.init();
  }

  init() {
    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        this.trackTabActivity(tab);
      }
    });

    // Listen for tab activation
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.updateTabLastAccessed(activeInfo.tabId);
    });

    // Listen for extension install/update
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.handleFirstInstall();
      } else if (details.reason === 'update') {
        this.handleUpdate(details.previousVersion);
      }
    });

    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async trackTabActivity(tab) {
    // Store tab activity data
    const activityData = {
      tabId: tab.id,
      url: tab.url,
      title: tab.title,
      timestamp: Date.now(),
      favIconUrl: tab.favIconUrl
    };

    // Store in local storage
    await chrome.storage.local.set({
      [`tab_activity_${tab.id}`]: activityData
    });
  }

  async updateTabLastAccessed(tabId) {
    const key = `tab_activity_${tabId}`;
    const result = await chrome.storage.local.get([key]);
    if (result[key]) {
      result[key].lastAccessed = Date.now();
      await chrome.storage.local.set({ [key]: result[key] });
    }
  }

  async handleFirstInstall() {
    // Set up default settings
    const defaultSettings = {
      autoArchiveIdle: true,
      idleThresholdHours: 24,
      enableAIClustering: true,
      theme: 'light',
      showWelcome: true
    };

    await chrome.storage.local.set({ settings: defaultSettings });
    
    // Open new tab to show TabBoard
    chrome.tabs.create({ url: 'chrome://newtab/' });
  }

  async handleUpdate(previousVersion) {
    console.log(`Updated from version ${previousVersion}`);
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_CURRENT_TABS':
          const tabs = await chrome.tabs.query({ currentWindow: true });
          sendResponse({ success: true, data: tabs });
          break;
        case 'SAVE_COLLECTION':
          await this.saveCollection(message.collection);
          sendResponse({ success: true });
          break;
        case 'GET_COLLECTIONS':
          const collections = await this.getCollections();
          sendResponse({ success: true, data: collections });
          break;
        case 'CLOSE_TAB':
          await chrome.tabs.remove(message.tabId);
          sendResponse({ success: true });
          break;
        case 'CREATE_TAB':
          await chrome.tabs.create({ url: message.url });
          sendResponse({ success: true });
          break;
        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async saveCollection(collection) {
    const result = await chrome.storage.local.get(['collections']);
    const collections = result.collections || [];
    
    const index = collections.findIndex(c => c.id === collection.id);
    if (index >= 0) {
      collections[index] = collection;
    } else {
      collections.push(collection);
    }
    
    await chrome.storage.local.set({ collections });
  }

  async getCollections() {
    const result = await chrome.storage.local.get(['collections']);
    return result.collections || [];
  }
}

// Initialize the background service
new TabBoardBackground();
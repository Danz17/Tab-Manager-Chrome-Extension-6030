// Background service worker for Chrome extension
class BackgroundService {
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

    // Listen for window focus changes
    chrome.windows.onFocusChanged.addListener((windowId) => {
      if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        this.updateActiveWindowTabs(windowId);
      }
    });

    // Set up alarm for periodic cleanup
    chrome.alarms.create('periodicCleanup', { periodInMinutes: 60 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'periodicCleanup') {
        this.performPeriodicCleanup();
      }
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

  async updateActiveWindowTabs(windowId) {
    const tabs = await chrome.tabs.query({ windowId: windowId });
    const updatePromises = tabs.map(tab => this.updateTabLastAccessed(tab.id));
    await Promise.all(updatePromises);
  }

  async performPeriodicCleanup() {
    // Clean up old tab activity data
    const result = await chrome.storage.local.get(null);
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    const keysToRemove = [];
    
    for (const [key, value] of Object.entries(result)) {
      if (key.startsWith('tab_activity_') && value.timestamp < cutoffTime) {
        keysToRemove.push(key);
      }
    }
    
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
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
    
    // Open welcome page
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }

  async handleUpdate(previousVersion) {
    // Handle version-specific updates
    console.log(`Updated from version ${previousVersion}`);
    
    // Migrate data if needed
    // await this.migrateData(previousVersion);
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_TAB_ACTIVITY':
          const activity = await this.getTabActivity(message.tabId);
          sendResponse({ success: true, data: activity });
          break;

        case 'SAVE_TAB_SESSION':
          await this.saveTabSession(message.tabId, message.sessionData);
          sendResponse({ success: true });
          break;

        case 'GET_ALL_TABS':
          const allTabs = await this.getAllTabs();
          sendResponse({ success: true, data: allTabs });
          break;

        case 'CLOSE_TABS':
          await this.closeTabs(message.tabIds);
          sendResponse({ success: true });
          break;

        case 'GROUP_TABS':
          const groupId = await this.groupTabs(message.tabIds, message.groupName);
          sendResponse({ success: true, groupId: groupId });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async getTabActivity(tabId) {
    const result = await chrome.storage.local.get([`tab_activity_${tabId}`]);
    return result[`tab_activity_${tabId}`] || null;
  }

  async saveTabSession(tabId, sessionData) {
    await chrome.storage.local.set({
      [`tab_session_${tabId}`]: {
        ...sessionData,
        timestamp: Date.now()
      }
    });
  }

  async getAllTabs() {
    const windows = await chrome.windows.getAll({ populate: true });
    const allTabs = [];
    
    windows.forEach(window => {
      window.tabs.forEach(tab => {
        allTabs.push({
          id: tab.id,
          windowId: tab.windowId,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          active: tab.active,
          pinned: tab.pinned,
          index: tab.index
        });
      });
    });
    
    return allTabs;
  }

  async closeTabs(tabIds) {
    await chrome.tabs.remove(tabIds);
  }

  async groupTabs(tabIds, groupName) {
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, { title: groupName });
    return groupId;
  }
}

// Initialize the background service
new BackgroundService();
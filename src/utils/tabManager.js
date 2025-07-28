/**
 * TabManager class for managing Chrome tabs
 */
export class TabManager {
  constructor() {
    this.sessionData = new Map();
  }

  async init() {
    // Set up tab listeners
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        this.saveTabSession(tab);
      }
    });
    
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.sessionData.delete(tabId);
    });
  }

  async getCurrentTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    return tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl,
      active: tab.active,
      pinned: tab.pinned,
      lastAccessed: Date.now()
    }));
  }

  async createTab(url, options = {}) {
    return await chrome.tabs.create({
      url: url,
      active: options.active !== false,
      ...options
    });
  }

  async closeTab(tabId) {
    await chrome.tabs.remove(tabId);
  }

  async switchToTab(tabId) {
    await chrome.tabs.update(tabId, { active: true });
  }

  async getHistory(maxResults = 100) {
    return new Promise((resolve) => {
      chrome.history.search({
        text: '',
        maxResults: maxResults,
        startTime: Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
      }, (results) => {
        resolve(results.map(item => ({
          title: item.title,
          url: item.url,
          lastVisitTime: item.lastVisitTime,
          visitCount: item.visitCount
        })));
      });
    });
  }

  saveTabSession(tab) {
    // Save scroll position and form data
    try {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            formData: Array.from(document.forms).map(form => {
              const formData = new FormData(form);
              return Object.fromEntries(formData);
            })
          };
        }
      }).then(result => {
        if (result && result[0]) {
          this.sessionData.set(tab.id, {
            ...result[0].result,
            timestamp: Date.now()
          });
        }
      }).catch(err => {
        console.error("Failed to execute script:", err);
      });
    } catch (error) {
      console.error("Error in saveTabSession:", error);
    }
  }

  async restoreTabSession(tab) {
    const sessionData = this.sessionData.get(tab.id);
    if (sessionData) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (data) => {
            window.scrollTo(data.scrollX, data.scrollY);
          },
          args: [sessionData]
        });
      } catch (error) {
        console.error("Error restoring session:", error);
      }
    }
  }

  async getTabScreenshot(tabId) {
    try {
      return await chrome.tabs.captureVisibleTab(null, {
        format: 'png',
        quality: 50
      });
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      return null;
    }
  }

  async groupTabs(tabIds, groupName) {
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, { title: groupName });
    return groupId;
  }

  async moveTabsToNewWindow(tabIds) {
    const newWindow = await chrome.windows.create({
      tabId: tabIds[0],
      type: 'normal'
    });
    
    if (tabIds.length > 1) {
      await chrome.tabs.move(tabIds.slice(1), {
        windowId: newWindow.id,
        index: -1
      });
    }
    
    return newWindow;
  }

  async duplicateTab(tabId) {
    return await chrome.tabs.duplicate(tabId);
  }

  async muteTab(tabId, muted = true) {
    await chrome.tabs.update(tabId, { muted });
  }

  async pinTab(tabId, pinned = true) {
    await chrome.tabs.update(tabId, { pinned });
  }
}
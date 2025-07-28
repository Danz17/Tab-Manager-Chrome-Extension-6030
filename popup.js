class PopupController {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadStats();
    await this.loadRecentCollections();
    this.bindEvents();
  }

  async loadStats() {
    try {
      // Get current tabs count
      const tabs = await chrome.tabs.query({ currentWindow: true });
      document.getElementById('currentTabsCount').textContent = tabs.length;

      // Get collections count
      const result = await chrome.storage.local.get(null);
      const collectionsCount = Object.keys(result).filter(key => 
        key.startsWith('collection_')
      ).length;
      document.getElementById('collectionsCount').textContent = collectionsCount;
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async loadRecentCollections() {
    try {
      const result = await chrome.storage.local.get(null);
      const collections = [];
      
      for (const [key, value] of Object.entries(result)) {
        if (key.startsWith('collection_')) {
          collections.push(value);
        }
      }
      
      // Sort by creation date and take top 5
      const recentCollections = collections
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);
      
      this.renderRecentCollections(recentCollections);
    } catch (error) {
      console.error('Failed to load recent collections:', error);
    }
  }

  renderRecentCollections(collections) {
    const container = document.getElementById('recentCollectionsList');
    container.innerHTML = '';
    
    if (collections.length === 0) {
      container.innerHTML = '<p class="no-collections">No collections yet</p>';
      return;
    }
    
    collections.forEach(collection => {
      const item = document.createElement('div');
      item.className = 'collection-item';
      
      item.innerHTML = `
        <div class="collection-info">
          <div class="collection-name">${this.escapeHtml(collection.name)}</div>
          <div class="collection-meta">${collection.tabs.length} tabs</div>
        </div>
        <button class="restore-btn" data-collection-id="${collection.id}">
          Restore
        </button>
      `;
      
      container.appendChild(item);
    });
    
    // Bind restore buttons
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('restore-btn')) {
        const collectionId = e.target.dataset.collectionId;
        this.restoreCollection(collectionId);
      }
    });
  }

  bindEvents() {
    document.getElementById('openNewTab').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
      window.close();
    });

    document.getElementById('saveAllTabs').addEventListener('click', async () => {
      await this.saveAllTabs();
      window.close();
    });

    document.getElementById('runAIClustering').addEventListener('click', async () => {
      await this.runAIClustering();
      window.close();
    });

    document.getElementById('openSettings').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
      window.close();
    });
  }

  async saveAllTabs() {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const collection = {
        id: Date.now().toString(),
        name: `Quick Save ${new Date().toLocaleString()}`,
        tabs: tabs.map(tab => ({
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl
        })),
        createdAt: Date.now(),
        type: 'quick-save'
      };

      await chrome.storage.local.set({
        [`collection_${collection.id}`]: collection
      });

      // Show success feedback
      this.showNotification('All tabs saved successfully!');
    } catch (error) {
      console.error('Failed to save tabs:', error);
      this.showNotification('Failed to save tabs', 'error');
    }
  }

  async runAIClustering() {
    try {
      // This would integrate with the AI clustering logic
      const tabs = await chrome.tabs.query({ currentWindow: true });
      
      // For now, just show a notification
      this.showNotification('AI clustering started! Check the TabBoard for results.');
    } catch (error) {
      console.error('Failed to run AI clustering:', error);
      this.showNotification('Failed to run AI clustering', 'error');
    }
  }

  async restoreCollection(collectionId) {
    try {
      const result = await chrome.storage.local.get([`collection_${collectionId}`]);
      const collection = result[`collection_${collectionId}`];
      
      if (!collection) {
        throw new Error('Collection not found');
      }

      // Open all tabs in the collection
      for (const tab of collection.tabs) {
        await chrome.tabs.create({
          url: tab.url,
          active: false
        });
      }

      this.showNotification(`Restored ${collection.tabs.length} tabs from ${collection.name}`);
      window.close();
    } catch (error) {
      console.error('Failed to restore collection:', error);
      this.showNotification('Failed to restore collection', 'error');
    }
  }

  showNotification(message, type = 'success') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the popup
new PopupController();
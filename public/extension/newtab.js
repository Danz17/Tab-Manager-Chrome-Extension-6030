class TabBoard {
  constructor() {
    this.currentTabs = [];
    this.collections = [];
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.bindEvents();
      this.render();
    } catch (error) {
      console.error('Failed to initialize TabBoard:', error);
      this.showError('Failed to load TabBoard. Please refresh the page.');
    }
  }

  async loadData() {
    try {
      // Get current tabs
      const response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_TABS' });
      if (response.success) {
        this.currentTabs = response.data.map(tab => ({
          id: tab.id,
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
          active: tab.active
        }));
      }

      // Get saved collections
      const collectionsResponse = await chrome.runtime.sendMessage({ type: 'GET_COLLECTIONS' });
      if (collectionsResponse.success) {
        this.collections = collectionsResponse.data;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Fallback to demo data
      this.loadDemoData();
    }
  }

  loadDemoData() {
    this.currentTabs = [
      {
        id: 1,
        title: 'TabBoard - Smart Tab Management',
        url: 'chrome://newtab/',
        favIconUrl: 'icons/icon16.png',
        active: true
      }
    ];
    this.collections = [];
  }

  bindEvents() {
    document.getElementById('save-all-tabs').addEventListener('click', () => this.saveAllTabs());
    document.getElementById('create-collection').addEventListener('click', () => this.createCollection());
    document.getElementById('ai-cluster').addEventListener('click', () => this.runAIClustering());
    document.getElementById('search-tabs').addEventListener('click', () => this.searchTabs());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveAllTabs();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.searchTabs();
      }
    });
  }

  render() {
    // Hide loading, show main content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    // Update stats
    document.getElementById('current-tabs-count').textContent = this.currentTabs.length;
    document.getElementById('collections-count').textContent = this.collections.length;

    // Render collections
    this.renderCollections();
  }

  renderCollections() {
    const container = document.getElementById('collections-container');
    container.innerHTML = '';

    // Current tabs collection
    const currentTabsCollection = this.createCollectionElement(
      'Current Tabs',
      this.currentTabs,
      'current'
    );
    container.appendChild(currentTabsCollection);

    // Saved collections
    this.collections.forEach(collection => {
      const collectionElement = this.createCollectionElement(
        collection.name,
        collection.tabs,
        'saved',
        collection
      );
      container.appendChild(collectionElement);
    });

    // Add empty state if no collections
    if (this.collections.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'collection';
      emptyState.innerHTML = `
        <h3>📁 No Collections Yet</h3>
        <p style="opacity: 0.8; margin-top: 10px;">Save some tabs to create your first collection!</p>
        <button class="action-btn" style="margin-top: 15px;" onclick="tabBoard.saveAllTabs()">
          💾 Save Current Tabs
        </button>
      `;
      container.appendChild(emptyState);
    }
  }

  createCollectionElement(name, tabs, type, collection = null) {
    const element = document.createElement('div');
    element.className = 'collection';

    const header = document.createElement('h3');
    header.innerHTML = `${type === 'current' ? '🌐' : '📁'} ${name} (${tabs.length} tabs)`;

    const tabsList = document.createElement('div');
    tabsList.className = 'tabs-list';

    tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = 'tab-item';
      tabElement.innerHTML = `
        <img class="tab-favicon" src="${tab.favIconUrl || 'icons/icon16.png'}" alt="">
        <div class="tab-info">
          <div class="tab-title">${tab.title}</div>
          <div class="tab-url">${this.formatUrl(tab.url)}</div>
        </div>
        <div class="tab-actions">
          ${type === 'current' ? 
            `<button class="tab-btn" onclick="tabBoard.closeTab(${tab.id})">✕</button>` :
            `<button class="tab-btn" onclick="tabBoard.restoreTab('${tab.url}')">🔄</button>`
          }
        </div>
      `;

      // Click to switch/restore tab
      tabElement.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab-btn')) {
          if (type === 'current') {
            chrome.tabs.update(tab.id, { active: true });
          } else {
            this.restoreTab(tab.url);
          }
        }
      });

      tabsList.appendChild(tabElement);
    });

    element.appendChild(header);
    element.appendChild(tabsList);

    return element;
  }

  formatUrl(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  async saveAllTabs() {
    try {
      const collection = {
        id: Date.now().toString(),
        name: `Session ${new Date().toLocaleString()}`,
        tabs: this.currentTabs,
        createdAt: Date.now(),
        type: 'session'
      };

      const response = await chrome.runtime.sendMessage({
        type: 'SAVE_COLLECTION',
        collection: collection
      });

      if (response.success) {
        this.collections.push(collection);
        this.render();
        this.showNotification('All tabs saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save tabs:', error);
      this.showNotification('Failed to save tabs', 'error');
    }
  }

  createCollection() {
    const name = prompt('Collection name:');
    if (name) {
      const collection = {
        id: Date.now().toString(),
        name: name,
        tabs: [],
        createdAt: Date.now(),
        type: 'manual'
      };

      this.saveCollection(collection);
    }
  }

  async saveCollection(collection) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SAVE_COLLECTION',
        collection: collection
      });

      if (response.success) {
        this.collections.push(collection);
        this.render();
        this.showNotification(`Collection "${collection.name}" created!`);
      }
    } catch (error) {
      console.error('Failed to save collection:', error);
      this.showNotification('Failed to create collection', 'error');
    }
  }

  runAIClustering() {
    this.showNotification('AI clustering started...');
    
    // Simple clustering by domain
    setTimeout(() => {
      const clusters = this.groupTabsByDomain(this.currentTabs);
      
      clusters.forEach(cluster => {
        const collection = {
          id: Date.now().toString() + Math.random(),
          name: cluster.name,
          tabs: cluster.tabs,
          createdAt: Date.now(),
          type: 'ai-cluster'
        };
        
        this.saveCollection(collection);
      });
      
      this.showNotification('AI clustering completed!');
    }, 1000);
  }

  groupTabsByDomain(tabs) {
    const groups = {};
    
    tabs.forEach(tab => {
      try {
        const domain = new URL(tab.url).hostname;
        if (!groups[domain]) {
          groups[domain] = [];
        }
        groups[domain].push(tab);
      } catch {
        if (!groups['other']) {
          groups['other'] = [];
        }
        groups['other'].push(tab);
      }
    });

    return Object.entries(groups)
      .filter(([_, tabs]) => tabs.length >= 2)
      .map(([domain, tabs]) => ({
        name: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Tabs`,
        tabs: tabs
      }));
  }

  searchTabs() {
    const query = prompt('Search tabs:');
    if (query) {
      // Simple search implementation
      const allTabs = [...this.currentTabs, ...this.collections.flatMap(c => c.tabs)];
      const results = allTabs.filter(tab => 
        tab.title.toLowerCase().includes(query.toLowerCase()) ||
        tab.url.toLowerCase().includes(query.toLowerCase())
      );
      
      if (results.length > 0) {
        this.showNotification(`Found ${results.length} matching tabs`);
      } else {
        this.showNotification('No matching tabs found');
      }
    }
  }

  async closeTab(tabId) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CLOSE_TAB',
        tabId: tabId
      });

      if (response.success) {
        this.currentTabs = this.currentTabs.filter(tab => tab.id !== tabId);
        this.render();
        this.showNotification('Tab closed');
      }
    } catch (error) {
      console.error('Failed to close tab:', error);
      this.showNotification('Failed to close tab', 'error');
    }
  }

  async restoreTab(url) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CREATE_TAB',
        url: url
      });

      if (response.success) {
        this.showNotification('Tab restored');
      }
    } catch (error) {
      console.error('Failed to restore tab:', error);
      this.showNotification('Failed to restore tab', 'error');
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 1000;
      color: white;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showError(message) {
    document.getElementById('loading').innerHTML = `
      <div style="color: #ef4444; text-align: center;">
        <p>${message}</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Retry
        </button>
      </div>
    `;
  }
}

// Initialize TabBoard
const tabBoard = new TabBoard();
document.addEventListener('DOMContentLoaded', () => {
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
        // For demo purposes, use static data
        document.getElementById('currentTabsCount').textContent = '5';
        document.getElementById('collectionsCount').textContent = '3';
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    }

    async loadRecentCollections() {
      try {
        // Demo collections
        const recentCollections = [
          { id: 'dev-tools', name: 'Development Tools', tabs: [{ title: 'GitHub' }, { title: 'Stack Overflow' }] },
          { id: 'learning', name: 'Learning Resources', tabs: [{ title: 'MDN Web Docs' }, { title: 'React Docs' }] }
        ];
        
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
        this.showNotification('All tabs saved successfully!');
      } catch (error) {
        console.error('Failed to save tabs:', error);
        this.showNotification('Failed to save tabs', 'error');
      }
    }

    async runAIClustering() {
      try {
        this.showNotification('AI clustering started! Check the TabBoard for results.');
      } catch (error) {
        console.error('Failed to run AI clustering:', error);
        this.showNotification('Failed to run AI clustering', 'error');
      }
    }

    async restoreCollection(collectionId) {
      try {
        this.showNotification(`Restored collection: ${collectionId}`);
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
});
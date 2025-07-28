document.addEventListener('DOMContentLoaded', () => {
  class TabBoard {
    constructor() {
      this.state = {
        collections: [],
        currentTabs: [],
        searchQuery: '',
        selectedCollection: null,
        showCommandBar: false
      };
      this.container = null;
      this.init();
    }

    async init() {
      this.loadData();
      this.initKeyboardShortcuts();
    }

    async loadData() {
      // Mock data for demonstration
      this.state.currentTabs = [
        { 
          id: 1, 
          title: 'TabBoard - Smart Tab Management',
          url: 'https://tabboard.app',
          favIconUrl: 'icons/icon16.png',
          active: true
        },
        { 
          id: 2, 
          title: 'GitHub: Where the world builds software',
          url: 'https://github.com',
          favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg',
          active: false
        },
        { 
          id: 3, 
          title: 'React – A JavaScript library for building user interfaces',
          url: 'https://reactjs.org',
          favIconUrl: 'https://reactjs.org/favicon.ico',
          active: false
        }
      ];

      this.state.collections = [
        {
          id: 'dev-tools',
          name: 'Development Tools',
          tabs: [
            { 
              title: 'GitHub: Where the world builds software',
              url: 'https://github.com',
              favIconUrl: 'https://github.githubassets.com/favicons/favicon.svg'
            },
            { 
              title: 'Stack Overflow - Where Developers Learn & Share',
              url: 'https://stackoverflow.com',
              favIconUrl: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico'
            }
          ],
          createdAt: Date.now() - 86400000
        },
        {
          id: 'learning',
          name: 'Learning Resources',
          tabs: [
            { 
              title: 'MDN Web Docs',
              url: 'https://developer.mozilla.org',
              favIconUrl: 'https://developer.mozilla.org/favicon.ico'
            },
            { 
              title: 'React – A JavaScript library for building user interfaces',
              url: 'https://reactjs.org',
              favIconUrl: 'https://reactjs.org/favicon.ico'
            }
          ],
          createdAt: Date.now() - 172800000
        }
      ];

      this.render();
    }

    render() {
      const app = document.getElementById('app');
      app.innerHTML = ''; // Clear previous content
      
      // Create header
      const header = this.createHeader();
      app.appendChild(header);
      
      // Create quick actions
      const quickActions = this.createQuickActions();
      app.appendChild(quickActions);
      
      // Create collections
      const collectionsContainer = document.createElement('div');
      collectionsContainer.className = 'collections-container';
      
      // Current tabs collection
      const currentTabsCollection = this.createTabCollection('Current Tabs', this.state.currentTabs, 'current');
      collectionsContainer.appendChild(currentTabsCollection);
      
      // Saved collections
      this.state.collections.forEach(collection => {
        const collectionElement = this.createTabCollection(collection.name, collection.tabs, 'saved', collection);
        collectionsContainer.appendChild(collectionElement);
      });
      
      app.appendChild(collectionsContainer);
      
      // Create command bar if visible
      if (this.state.showCommandBar) {
        const commandBar = this.createCommandBar();
        app.appendChild(commandBar);
      }
    }

    createHeader() {
      const header = document.createElement('header');
      header.className = 'tab-board-header';
      
      const title = document.createElement('h1');
      title.textContent = 'TabBoard';
      title.className = 'board-title';
      
      const stats = document.createElement('div');
      stats.className = 'tab-stats';
      stats.innerHTML = `
        <span class="stat">
          <span class="stat-number">${this.state.currentTabs.length}</span>
          <span class="stat-label">Open Tabs</span>
        </span>
        <span class="stat">
          <span class="stat-number">${this.state.collections.length}</span>
          <span class="stat-label">Collections</span>
        </span>
      `;
      
      header.appendChild(title);
      header.appendChild(stats);
      return header;
    }

    createQuickActions() {
      const container = document.createElement('div');
      container.className = 'quick-actions';
      
      const actions = [
        { text: '💾 Save All Tabs', action: () => this.saveAllTabs(), shortcut: 'Ctrl+S' },
        { text: '📁 New Collection', action: () => this.createCollection() },
        { text: '🤖 AI Cluster', action: () => this.runAIClustering() },
        { text: '🔍 Search', action: () => this.openCommandBar(), shortcut: 'Ctrl+K' },
        { text: '⚙️ Automation', action: () => this.openAutomation() },
        { text: '📊 Analytics', action: () => this.openAnalytics() }
      ];
      
      actions.forEach(actionConfig => {
        const button = document.createElement('button');
        button.className = 'quick-action-btn';
        
        const text = document.createElement('span');
        text.textContent = actionConfig.text;
        button.appendChild(text);
        
        if (actionConfig.shortcut) {
          const shortcut = document.createElement('span');
          shortcut.className = 'shortcut';
          shortcut.textContent = actionConfig.shortcut;
          button.appendChild(shortcut);
        }
        
        button.addEventListener('click', actionConfig.action.bind(this));
        container.appendChild(button);
      });
      
      return container;
    }

    createTabCollection(title, tabs, type, collection = null) {
      const container = document.createElement('div');
      container.className = `tab-collection ${type}`;
      
      // Header
      const header = document.createElement('div');
      header.className = 'collection-header';
      
      const titleElement = document.createElement('h3');
      titleElement.textContent = title;
      titleElement.className = 'collection-title';
      
      const meta = document.createElement('div');
      meta.className = 'collection-meta';
      meta.textContent = `${tabs.length} tabs`;
      
      const actions = document.createElement('div');
      actions.className = 'collection-actions';
      
      if (type === 'saved' && collection) {
        const restoreAllBtn = document.createElement('button');
        restoreAllBtn.textContent = 'Restore All';
        restoreAllBtn.className = 'collection-btn';
        restoreAllBtn.addEventListener('click', () => this.restoreAllTabs(collection));
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'collection-btn';
        editBtn.addEventListener('click', () => this.editCollection(collection));
        
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export';
        exportBtn.className = 'collection-btn';
        exportBtn.addEventListener('click', () => this.exportCollection(collection));
        
        actions.appendChild(restoreAllBtn);
        actions.appendChild(editBtn);
        actions.appendChild(exportBtn);
      }
      
      header.appendChild(titleElement);
      header.appendChild(meta);
      header.appendChild(actions);
      container.appendChild(header);
      
      // Tabs grid
      const tabsGrid = document.createElement('div');
      tabsGrid.className = 'tabs-grid';
      
      tabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab-item';
        
        const favicon = document.createElement('img');
        favicon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>';
        favicon.className = 'tab-favicon';
        favicon.onerror = () => {
          favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>';
        };
        
        const content = document.createElement('div');
        content.className = 'tab-content';
        
        const tabTitle = document.createElement('div');
        tabTitle.className = 'tab-title';
        tabTitle.textContent = tab.title || 'Untitled';
        tabTitle.title = tab.title;
        
        const url = document.createElement('div');
        url.className = 'tab-url';
        url.textContent = this.formatUrl(tab.url);
        url.title = tab.url;
        
        content.appendChild(tabTitle);
        content.appendChild(url);
        
        if (tab.note) {
          const note = document.createElement('div');
          note.className = 'tab-note';
          note.textContent = tab.note;
          content.appendChild(note);
        }
        
        const tabActions = document.createElement('div');
        tabActions.className = 'tab-actions';
        
        if (type === 'current') {
          const saveBtn = this.createTabButton('💾', 'Save', () => this.saveTab(tab));
          const closeBtn = this.createTabButton('✕', 'Close', () => this.closeTab(tab));
          const noteBtn = this.createTabButton('📝', 'Note', () => this.addNote(tab));
          tabActions.appendChild(saveBtn);
          tabActions.appendChild(noteBtn);
          tabActions.appendChild(closeBtn);
        } else if (type === 'saved') {
          const restoreBtn = this.createTabButton('🔄', 'Restore', () => this.restoreTab(tab));
          const deleteBtn = this.createTabButton('🗑️', 'Delete', () => this.deleteTab(tab, collection));
          tabActions.appendChild(restoreBtn);
          tabActions.appendChild(deleteBtn);
        }
        
        tabElement.appendChild(favicon);
        tabElement.appendChild(content);
        tabElement.appendChild(tabActions);
        
        // Click to open/switch to tab
        tabElement.addEventListener('click', (e) => {
          if (!e.target.closest('.tab-actions')) {
            if (type === 'current') {
              console.log('Switch to tab:', tab.id);
            } else {
              this.restoreTab(tab);
            }
          }
        });
        
        tabsGrid.appendChild(tabElement);
      });
      
      container.appendChild(tabsGrid);
      return container;
    }

    createTabButton(icon, title, onClick) {
      const button = document.createElement('button');
      button.innerHTML = icon;
      button.title = title;
      button.className = 'tab-btn';
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
      });
      return button;
    }

    createCommandBar() {
      const container = document.createElement('div');
      container.className = 'command-bar visible';
      
      const overlay = document.createElement('div');
      overlay.className = 'command-overlay';
      overlay.addEventListener('click', () => this.closeCommandBar());
      
      const bar = document.createElement('div');
      bar.className = 'command-bar-content';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Search tabs, collections, history... (fuzzy search enabled)';
      input.className = 'command-input';
      input.addEventListener('input', (e) => this.handleSearch(e.target.value));
      input.addEventListener('keydown', (e) => this.handleKeydown(e));
      
      const results = document.createElement('div');
      results.className = 'command-results';
      
      bar.appendChild(input);
      bar.appendChild(results);
      
      container.appendChild(overlay);
      container.appendChild(bar);
      
      setTimeout(() => input.focus(), 100);
      return container;
    }

    formatUrl(url) {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname;
      } catch {
        return url;
      }
    }

    // Action handlers
    saveAllTabs() {
      const collectionName = `Session ${new Date().toLocaleString()}`;
      alert(`Saved all tabs to collection: ${collectionName}`);
      this.loadData(); // Refresh data
    }

    createCollection() {
      const name = prompt('Collection name:');
      if (name) {
        alert(`Created new collection: ${name}`);
        this.loadData(); // Refresh data
      }
    }

    runAIClustering() {
      alert('Running AI clustering...');
      setTimeout(() => {
        alert('AI clustering complete! New collections created.');
        this.loadData(); // Refresh data
      }, 1000);
    }

    openCommandBar() {
      this.state.showCommandBar = true;
      this.render();
    }

    closeCommandBar() {
      this.state.showCommandBar = false;
      this.render();
    }

    openAutomation() {
      alert('Opening automation settings...');
    }

    openAnalytics() {
      alert('Opening analytics dashboard...');
    }

    saveTab(tab) {
      alert(`Saved tab: ${tab.title}`);
    }

    closeTab(tab) {
      alert(`Closed tab: ${tab.title}`);
      this.state.currentTabs = this.state.currentTabs.filter(t => t.id !== tab.id);
      this.render();
    }

    addNote(tab) {
      const note = prompt('Add note for this tab:', tab.note || '');
      if (note !== null) {
        alert(`Note added to tab: ${tab.title}`);
      }
    }

    restoreTab(tab) {
      alert(`Restored tab: ${tab.title}`);
    }

    deleteTab(tab, collection) {
      if (confirm(`Delete tab "${tab.title}" from collection "${collection.name}"?`)) {
        alert(`Deleted tab from collection: ${tab.title}`);
        collection.tabs = collection.tabs.filter(t => t.url !== tab.url);
        this.render();
      }
    }

    restoreAllTabs(collection) {
      alert(`Restoring all tabs from collection: ${collection.name}`);
    }

    editCollection(collection) {
      alert(`Editing collection: ${collection.name}`);
    }

    exportCollection(collection) {
      alert(`Exporting collection: ${collection.name}`);
    }

    handleSearch(query) {
      console.log('Searching for:', query);
      // Implementation would go here
    }

    handleKeydown(e) {
      if (e.key === 'Escape') {
        this.closeCommandBar();
      } else if (e.key === 'Enter') {
        console.log('Execute command');
      }
    }

    initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for command bar
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.openCommandBar();
        }
        
        // Ctrl/Cmd + S for save all tabs
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          this.saveAllTabs();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
          this.closeCommandBar();
        }
      });
    }
  }

  // Initialize the app
  new TabBoard();
});
import { CommandBar } from './components/CommandBar.js';
import { TabCollection } from './components/TabCollection.js';
import { QuickActions } from './components/QuickActions.js';
import { AIClusterer } from './utils/aiClusterer.js';
import { AutomationEngine } from './utils/automation.js';

export default class TabBoard {
  constructor({ storage, tabManager }) {
    this.storage = storage;
    this.tabManager = tabManager;
    this.aiClusterer = new AIClusterer();
    this.automation = new AutomationEngine(storage, tabManager);
    
    this.state = {
      collections: [],
      currentTabs: [],
      searchQuery: '',
      selectedCollection: null,
      showCommandBar: false
    };
    
    this.container = null;
    this.loadData();
  }

  async loadData() {
    const [collections, currentTabs] = await Promise.all([
      this.storage.getCollections(),
      this.tabManager.getCurrentTabs()
    ]);
    
    this.state.collections = collections;
    this.state.currentTabs = currentTabs;
    
    if (this.container) {
      this.render();
    }
  }

  render() {
    if (this.container) {
      this.container.innerHTML = '';
    } else {
      this.container = document.createElement('div');
      this.container.className = 'tab-board';
    }

    const header = this.renderHeader();
    const quickActions = new QuickActions({
      onSaveAll: () => this.saveAllTabs(),
      onCreateCollection: () => this.createCollection(),
      onRunAIClustering: () => this.runAIClustering()
    });
    
    const commandBar = new CommandBar({
      storage: this.storage,
      tabManager: this.tabManager,
      visible: this.state.showCommandBar,
      onClose: () => this.closeCommandBar()
    });

    const collectionsContainer = this.renderCollections();
    
    this.container.appendChild(header);
    this.container.appendChild(quickActions.render());
    this.container.appendChild(commandBar.render());
    this.container.appendChild(collectionsContainer);

    return this.container;
  }

  renderHeader() {
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

  renderCollections() {
    const container = document.createElement('div');
    container.className = 'collections-container';
    
    // Current tabs collection
    const currentTabsCollection = new TabCollection({
      title: 'Current Tabs',
      tabs: this.state.currentTabs,
      type: 'current',
      onSaveTab: (tab) => this.saveTab(tab),
      onCloseTab: (tab) => this.closeTab(tab),
      onAddNote: (tab, note) => this.addTabNote(tab, note)
    });
    
    container.appendChild(currentTabsCollection.render());
    
    // Saved collections
    this.state.collections.forEach(collection => {
      const collectionComponent = new TabCollection({
        title: collection.name,
        tabs: collection.tabs,
        type: 'saved',
        collection: collection,
        onRestoreTab: (tab) => this.restoreTab(tab),
        onDeleteTab: (tab) => this.deleteTab(tab, collection),
        onEditCollection: (collection) => this.editCollection(collection)
      });
      
      container.appendChild(collectionComponent.render());
    });
    
    return container;
  }

  async saveAllTabs() {
    const tabs = await this.tabManager.getCurrentTabs();
    const collection = {
      id: Date.now().toString(),
      name: `Session ${new Date().toLocaleString()}`,
      tabs: tabs,
      createdAt: Date.now(),
      type: 'session'
    };
    
    await this.storage.saveCollection(collection);
    this.state.collections.push(collection);
    this.render();
  }

  async saveTab(tab) {
    // Add to quick saves collection or create new one
    let quickSaves = this.state.collections.find(c => c.name === 'Quick Saves');
    
    if (!quickSaves) {
      quickSaves = {
        id: 'quick-saves',
        name: 'Quick Saves',
        tabs: [],
        createdAt: Date.now(),
        type: 'quick'
      };
      this.state.collections.push(quickSaves);
    }
    
    quickSaves.tabs.push({
      ...tab,
      savedAt: Date.now()
    });
    
    await this.storage.saveCollection(quickSaves);
    this.render();
  }

  async closeTab(tab) {
    await this.tabManager.closeTab(tab.id);
    this.state.currentTabs = this.state.currentTabs.filter(t => t.id !== tab.id);
    this.render();
  }

  async restoreTab(tab) {
    await this.tabManager.createTab(tab.url);
  }

  async runAIClustering() {
    const clusters = await this.aiClusterer.clusterTabs(this.state.currentTabs);
    
    for (const cluster of clusters) {
      const collection = {
        id: Date.now().toString() + Math.random(),
        name: cluster.topic,
        tabs: cluster.tabs,
        createdAt: Date.now(),
        type: 'ai-cluster',
        confidence: cluster.confidence
      };
      
      await this.storage.saveCollection(collection);
      this.state.collections.push(collection);
    }
    
    this.render();
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
      
      this.storage.saveCollection(collection);
      this.state.collections.push(collection);
      this.render();
    }
  }

  openCommandBar() {
    this.state.showCommandBar = true;
    this.render();
  }

  closeCommandBar() {
    this.state.showCommandBar = false;
    this.render();
  }

  closeModals() {
    this.state.showCommandBar = false;
    this.render();
  }

  async addTabNote(tab, note) {
    tab.note = note;
    // Update in storage if it's a saved tab
    const collection = this.state.collections.find(c => 
      c.tabs.some(t => t.id === tab.id)
    );
    
    if (collection) {
      await this.storage.saveCollection(collection);
    }
  }
}
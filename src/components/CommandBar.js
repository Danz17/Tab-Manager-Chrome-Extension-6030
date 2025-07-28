export class CommandBar {
  constructor({ storage, tabManager, visible = false, onClose }) {
    this.storage = storage;
    this.tabManager = tabManager;
    this.visible = visible;
    this.onClose = onClose;
    this.container = null;
    this.searchResults = [];
  }

  render() {
    if (this.container) {
      this.container.remove();
    }

    this.container = document.createElement('div');
    this.container.className = `command-bar ${this.visible ? 'visible' : 'hidden'}`;
    
    const overlay = document.createElement('div');
    overlay.className = 'command-overlay';
    overlay.addEventListener('click', this.onClose);
    
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
    
    this.container.appendChild(overlay);
    this.container.appendChild(bar);
    
    if (this.visible) {
      setTimeout(() => input.focus(), 100);
    }
    
    return this.container;
  }

  async handleSearch(query) {
    if (!query.trim()) {
      this.searchResults = [];
      this.renderResults();
      return;
    }

    const [currentTabs, collections, history] = await Promise.all([
      this.tabManager.getCurrentTabs(),
      this.storage.getCollections(),
      this.tabManager.getHistory(100)
    ]);

    const results = [];

    // Search current tabs
    currentTabs.forEach(tab => {
      const score = this.fuzzyScore(query, tab.title + ' ' + tab.url);
      if (score > 0.3) {
        results.push({
          type: 'current-tab',
          item: tab,
          score: score,
          title: tab.title,
          subtitle: tab.url,
          action: () => this.tabManager.switchToTab(tab.id)
        });
      }
    });

    // Search collections
    collections.forEach(collection => {
      const score = this.fuzzyScore(query, collection.name);
      if (score > 0.3) {
        results.push({
          type: 'collection',
          item: collection,
          score: score,
          title: collection.name,
          subtitle: `${collection.tabs.length} tabs`,
          action: () => this.openCollection(collection)
        });
      }
      
      // Search within collection tabs
      collection.tabs.forEach(tab => {
        const tabScore = this.fuzzyScore(query, tab.title + ' ' + tab.url);
        if (tabScore > 0.3) {
          results.push({
            type: 'saved-tab',
            item: tab,
            score: tabScore,
            title: tab.title,
            subtitle: `From ${collection.name}`,
            action: () => this.tabManager.createTab(tab.url)
          });
        }
      });
    });

    // Search history
    history.forEach(item => {
      const score = this.fuzzyScore(query, item.title + ' ' + item.url);
      if (score > 0.3) {
        results.push({
          type: 'history',
          item: item,
          score: score,
          title: item.title,
          subtitle: item.url,
          action: () => this.tabManager.createTab(item.url)
        });
      }
    });

    this.searchResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    this.renderResults();
  }

  fuzzyScore(query, text) {
    query = query.toLowerCase();
    text = text.toLowerCase();
    
    let score = 0;
    let queryIndex = 0;
    
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        score += 1;
        queryIndex++;
      }
    }
    
    return queryIndex === query.length ? score / text.length : 0;
  }

  renderResults() {
    const resultsContainer = this.container.querySelector('.command-results');
    resultsContainer.innerHTML = '';
    
    this.searchResults.forEach((result, index) => {
      const item = document.createElement('div');
      item.className = `command-result-item ${index === 0 ? 'selected' : ''}`;
      
      const icon = this.getTypeIcon(result.type);
      
      item.innerHTML = `
        <div class="result-icon">${icon}</div>
        <div class="result-content">
          <div class="result-title">${this.escapeHtml(result.title)}</div>
          <div class="result-subtitle">${this.escapeHtml(result.subtitle)}</div>
        </div>
        <div class="result-type">${result.type.replace('-', ' ')}</div>
      `;
      
      item.addEventListener('click', () => {
        result.action();
        this.onClose();
      });
      
      resultsContainer.appendChild(item);
    });
  }

  getTypeIcon(type) {
    const icons = {
      'current-tab': '🌐',
      'collection': '📁',
      'saved-tab': '💾',
      'history': '🕒'
    };
    return icons[type] || '📄';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.onClose();
    } else if (e.key === 'Enter' && this.searchResults.length > 0) {
      this.searchResults[0].action();
      this.onClose();
    }
  }

  openCollection(collection) {
    // Implementation for opening/viewing a collection
    console.log('Opening collection:', collection.name);
  }
}
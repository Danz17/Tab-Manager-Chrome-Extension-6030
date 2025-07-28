export class TabCollection {
  constructor({ title, tabs, type, collection, onSaveTab, onCloseTab, onRestoreTab, onDeleteTab, onAddNote, onEditCollection }) {
    this.title = title;
    this.tabs = tabs;
    this.type = type;
    this.collection = collection;
    this.onSaveTab = onSaveTab;
    this.onCloseTab = onCloseTab;
    this.onRestoreTab = onRestoreTab;
    this.onDeleteTab = onDeleteTab;
    this.onAddNote = onAddNote;
    this.onEditCollection = onEditCollection;
  }

  render() {
    const container = document.createElement('div');
    container.className = `tab-collection ${this.type}`;
    
    const header = this.renderHeader();
    const tabsList = this.renderTabs();
    
    container.appendChild(header);
    container.appendChild(tabsList);
    
    return container;
  }

  renderHeader() {
    const header = document.createElement('div');
    header.className = 'collection-header';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = this.title;
    titleElement.className = 'collection-title';
    
    const meta = document.createElement('div');
    meta.className = 'collection-meta';
    meta.textContent = `${this.tabs.length} tabs`;
    
    const actions = document.createElement('div');
    actions.className = 'collection-actions';
    
    if (this.type === 'saved' && this.collection) {
      const restoreAllBtn = this.createButton('Restore All', () => this.restoreAllTabs());
      const editBtn = this.createButton('Edit', () => this.onEditCollection?.(this.collection));
      const exportBtn = this.createButton('Export', () => this.exportCollection());
      
      actions.appendChild(restoreAllBtn);
      actions.appendChild(editBtn);
      actions.appendChild(exportBtn);
    }
    
    header.appendChild(titleElement);
    header.appendChild(meta);
    header.appendChild(actions);
    
    return header;
  }

  renderTabs() {
    const container = document.createElement('div');
    container.className = 'tabs-grid';
    
    this.tabs.forEach(tab => {
      const tabElement = this.renderTab(tab);
      container.appendChild(tabElement);
    });
    
    return container;
  }

  renderTab(tab) {
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
    
    const title = document.createElement('div');
    title.className = 'tab-title';
    title.textContent = tab.title || 'Untitled';
    title.title = tab.title;
    
    const url = document.createElement('div');
    url.className = 'tab-url';
    url.textContent = this.formatUrl(tab.url);
    url.title = tab.url;
    
    const actions = document.createElement('div');
    actions.className = 'tab-actions';
    
    if (this.type === 'current') {
      const saveBtn = this.createTabButton('💾', 'Save', () => this.onSaveTab?.(tab));
      const closeBtn = this.createTabButton('✕', 'Close', () => this.onCloseTab?.(tab));
      const noteBtn = this.createTabButton('📝', 'Note', () => this.addNote(tab));
      
      actions.appendChild(saveBtn);
      actions.appendChild(noteBtn);
      actions.appendChild(closeBtn);
    } else if (this.type === 'saved') {
      const restoreBtn = this.createTabButton('🔄', 'Restore', () => this.onRestoreTab?.(tab));
      const deleteBtn = this.createTabButton('🗑️', 'Delete', () => this.onDeleteTab?.(tab));
      
      actions.appendChild(restoreBtn);
      actions.appendChild(deleteBtn);
    }
    
    content.appendChild(title);
    content.appendChild(url);
    
    if (tab.note) {
      const note = document.createElement('div');
      note.className = 'tab-note';
      note.textContent = tab.note;
      content.appendChild(note);
    }
    
    tabElement.appendChild(favicon);
    tabElement.appendChild(content);
    tabElement.appendChild(actions);
    
    // Click to open/switch to tab
    tabElement.addEventListener('click', (e) => {
      if (!e.target.closest('.tab-actions')) {
        if (this.type === 'current') {
          chrome.tabs.update(tab.id, { active: true });
        } else {
          this.onRestoreTab?.(tab);
        }
      }
    });
    
    return tabElement;
  }

  createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'collection-btn';
    button.addEventListener('click', onClick);
    return button;
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

  formatUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  addNote(tab) {
    const note = prompt('Add note for this tab:', tab.note || '');
    if (note !== null) {
      this.onAddNote?.(tab, note);
    }
  }

  restoreAllTabs() {
    this.tabs.forEach(tab => {
      this.onRestoreTab?.(tab);
    });
  }

  exportCollection() {
    const data = {
      name: this.collection.name,
      tabs: this.tabs,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.collection.name}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}
export class QuickActions {
  constructor({ onSaveAll, onCreateCollection, onRunAIClustering }) {
    this.onSaveAll = onSaveAll;
    this.onCreateCollection = onCreateCollection;
    this.onRunAIClustering = onRunAIClustering;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'quick-actions';
    
    const actions = [
      { text: '💾 Save All Tabs', action: this.onSaveAll, shortcut: 'Ctrl+S' },
      { text: '📁 New Collection', action: this.onCreateCollection },
      { text: '🤖 AI Cluster', action: this.onRunAIClustering },
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
      
      button.addEventListener('click', actionConfig.action);
      container.appendChild(button);
    });
    
    return container;
  }

  openCommandBar() {
    // This would be handled by the parent component
    document.dispatchEvent(new CustomEvent('openCommandBar'));
  }

  openAutomation() {
    // Open automation settings modal
    console.log('Opening automation settings');
  }

  openAnalytics() {
    // Open analytics dashboard
    console.log('Opening analytics');
  }
}
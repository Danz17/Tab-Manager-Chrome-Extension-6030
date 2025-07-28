import { StorageManager } from './src/utils/storage.js';
import { AutomationEngine } from './src/utils/automation.js';

class SettingsController {
  constructor() {
    this.storage = new StorageManager();
    this.automation = null;
    this.currentSection = 'general';
    this.init();
  }

  async init() {
    await this.storage.init();
    this.automation = new AutomationEngine(this.storage, null);
    
    this.bindEvents();
    await this.loadSettings();
    this.loadAutomationRules();
  }

  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchSection(e.target.dataset.section);
      });
    });

    // Back button
    document.getElementById('backToBoard').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
      window.close();
    });

    // General settings
    document.getElementById('theme').addEventListener('change', (e) => {
      this.updateSetting('theme', e.target.value);
    });

    document.getElementById('showWelcome').addEventListener('change', (e) => {
      this.updateSetting('showWelcome', e.target.checked);
    });

    document.getElementById('enableNotifications').addEventListener('change', (e) => {
      this.updateSetting('enableNotifications', e.target.checked);
    });

    document.getElementById('collectionNameFormat').addEventListener('input', (e) => {
      this.updateSetting('collectionNameFormat', e.target.value);
    });

    // Automation settings
    document.getElementById('autoArchiveIdle').addEventListener('change', (e) => {
      this.updateSetting('autoArchiveIdle', e.target.checked);
    });

    document.getElementById('idleThresholdHours').addEventListener('input', (e) => {
      this.updateSetting('idleThresholdHours', parseInt(e.target.value));
    });

    document.getElementById('autoCloseDuplicates').addEventListener('change', (e) => {
      this.updateSetting('autoCloseDuplicates', e.target.checked);
    });

    document.getElementById('autoGroupSimilar').addEventListener('change', (e) => {
      this.updateSetting('autoGroupSimilar', e.target.checked);
    });

    // AI settings
    document.getElementById('enableAIClustering').addEventListener('change', (e) => {
      this.updateSetting('enableAIClustering', e.target.checked);
    });

    document.getElementById('clusteringSensitivity').addEventListener('change', (e) => {
      this.updateSetting('clusteringSensitivity', e.target.value);
    });

    document.getElementById('minClusterSize').addEventListener('input', (e) => {
      this.updateSetting('minClusterSize', parseInt(e.target.value));
    });

    document.getElementById('autoRunClustering').addEventListener('change', (e) => {
      this.updateSetting('autoRunClustering', e.target.checked);
    });

    // Privacy settings
    document.getElementById('excludeSensitiveData').addEventListener('change', (e) => {
      this.updateSetting('excludeSensitiveData', e.target.checked);
    });

    document.getElementById('dataRetentionDays').addEventListener('input', (e) => {
      this.updateSetting('dataRetentionDays', parseInt(e.target.value));
    });

    document.getElementById('clearAllData').addEventListener('click', () => {
      this.clearAllData();
    });

    // Import/Export
    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('importData').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
      this.importData(e.target.files[0]);
    });

    document.getElementById('resetSettings').addEventListener('click', () => {
      this.resetSettings();
    });

    // Add rule button
    document.getElementById('addRule').addEventListener('click', () => {
      this.showAddRuleModal();
    });
  }

  switchSection(sectionId) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.settings-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    this.currentSection = sectionId;
  }

  async loadSettings() {
    const settings = await this.storage.getSettings();
    
    // General settings
    document.getElementById('theme').value = settings.theme || 'light';
    document.getElementById('showWelcome').checked = settings.showWelcome !== false;
    document.getElementById('enableNotifications').checked = settings.enableNotifications !== false;
    document.getElementById('collectionNameFormat').value = settings.collectionNameFormat || 'Session {date}';

    // Automation settings
    document.getElementById('autoArchiveIdle').checked = settings.autoArchiveIdle !== false;
    document.getElementById('idleThresholdHours').value = settings.idleThresholdHours || 24;
    document.getElementById('autoCloseDuplicates').checked = settings.autoCloseDuplicates === true;
    document.getElementById('autoGroupSimilar').checked = settings.autoGroupSimilar === true;

    // AI settings
    document.getElementById('enableAIClustering').checked = settings.enableAIClustering !== false;
    document.getElementById('clusteringSensitivity').value = settings.clusteringSensitivity || 'medium';
    document.getElementById('minClusterSize').value = settings.minClusterSize || 3;
    document.getElementById('autoRunClustering').checked = settings.autoRunClustering === true;

    // Privacy settings
    document.getElementById('excludeSensitiveData').checked = settings.excludeSensitiveData !== false;
    document.getElementById('dataRetentionDays').value = settings.dataRetentionDays || 90;
  }

  async updateSetting(key, value) {
    const settings = await this.storage.getSettings();
    settings[key] = value;
    await this.storage.saveSettings(settings);
  }

  async loadAutomationRules() {
    const rules = await this.storage.getAutomationRules();
    this.renderAutomationRules(rules);
  }

  renderAutomationRules(rules) {
    const container = document.getElementById('rulesList');
    container.innerHTML = '';

    if (rules.length === 0) {
      container.innerHTML = '<p class="no-rules">No custom rules defined</p>';
      return;
    }

    rules.forEach(rule => {
      const ruleElement = document.createElement('div');
      ruleElement.className = 'rule-item';
      
      ruleElement.innerHTML = `
        <div class="rule-info">
          <div class="rule-name">${this.escapeHtml(rule.name)}</div>
          <div class="rule-description">${this.getRuleDescription(rule)}</div>
        </div>
        <div class="rule-actions">
          <label class="rule-toggle">
            <input type="checkbox" ${rule.enabled ? 'checked' : ''} data-rule-id="${rule.id}">
            <span class="toggle-slider"></span>
          </label>
          <button class="edit-rule-btn" data-rule-id="${rule.id}">Edit</button>
          <button class="delete-rule-btn" data-rule-id="${rule.id}">Delete</button>
        </div>
      `;

      container.appendChild(ruleElement);
    });

    // Bind rule events
    container.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        this.toggleRule(e.target.dataset.ruleId, e.target.checked);
      }
    });

    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-rule-btn')) {
        this.editRule(e.target.dataset.ruleId);
      } else if (e.target.classList.contains('delete-rule-btn')) {
        this.deleteRule(e.target.dataset.ruleId);
      }
    });
  }

  getRuleDescription(rule) {
    const conditions = rule.conditions.map(c => {
      switch (c.type) {
        case 'idle_time':
          return `idle for ${c.value} hours`;
        case 'domain':
          return `domain ${c.operator || 'equals'} "${c.value}"`;
        case 'title_contains':
          return `title contains "${c.value}"`;
        case 'is_duplicate':
          return 'is duplicate';
        default:
          return c.type;
      }
    }).join(' AND ');

    const action = rule.action.type === 'archive' ? 'archive' :
                  rule.action.type === 'close' ? 'close' :
                  rule.action.type === 'group' ? `group as "${rule.action.groupName}"` :
                  rule.action.type;

    return `If ${conditions}, then ${action}`;
  }

  async toggleRule(ruleId, enabled) {
    await this.automation.updateRule(ruleId, { enabled });
    this.showNotification(`Rule ${enabled ? 'enabled' : 'disabled'}`);
  }

  async deleteRule(ruleId) {
    if (confirm('Are you sure you want to delete this rule?')) {
      await this.automation.deleteRule(ruleId);
      await this.loadAutomationRules();
      this.showNotification('Rule deleted');
    }
  }

  async clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      if (confirm('This will delete ALL collections, settings, and rules. Are you absolutely sure?')) {
        await chrome.storage.local.clear();
        this.showNotification('All data cleared');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  }

  async exportData() {
    try {
      const data = await this.storage.exportData();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tabboard-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showNotification('Data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      this.showNotification('Export failed', 'error');
    }
  }

  async importData(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      await this.storage.importData(data);
      this.showNotification('Data imported successfully');
      
      // Reload settings
      await this.loadSettings();
      await this.loadAutomationRules();
    } catch (error) {
      console.error('Import failed:', error);
      this.showNotification('Import failed: Invalid file format', 'error');
    }
  }

  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSettings = {
        autoArchiveIdle: true,
        idleThresholdHours: 24,
        enableAIClustering: true,
        theme: 'light',
        showWelcome: true,
        enableNotifications: true,
        collectionNameFormat: 'Session {date}',
        clusteringSensitivity: 'medium',
        minClusterSize: 3,
        excludeSensitiveData: true,
        dataRetentionDays: 90
      };

      await this.storage.saveSettings(defaultSettings);
      await this.loadSettings();
      this.showNotification('Settings reset to defaults');
    }
  }

  showAddRuleModal() {
    // This would open a modal to create custom automation rules
    alert('Custom rule creation interface would be implemented here');
  }

  editRule(ruleId) {
    // This would open a modal to edit the rule
    alert(`Edit rule ${ruleId} interface would be implemented here`);
  }

  showNotification(message, type = 'success') {
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

// Initialize settings
new SettingsController();
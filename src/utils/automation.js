export class AutomationEngine {
  constructor(storage, tabManager) {
    this.storage = storage;
    this.tabManager = tabManager;
    this.rules = [];
    this.isRunning = false;
    this.init();
  }

  async init() {
    this.rules = await this.storage.getAutomationRules();
    this.startEngine();
  }

  startEngine() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Run automation checks every minute
    setInterval(() => {
      this.processRules();
    }, 60000);
    
    // Initial run
    this.processRules();
  }

  async processRules() {
    const currentTabs = await this.tabManager.getCurrentTabs();
    
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      
      try {
        await this.executeRule(rule, currentTabs);
      } catch (error) {
        console.error('Error executing automation rule:', rule.name, error);
      }
    }
  }

  async executeRule(rule, currentTabs) {
    const matchingTabs = this.findMatchingTabs(rule.conditions, currentTabs);
    
    if (matchingTabs.length === 0) return;
    
    switch (rule.action.type) {
      case 'archive':
        await this.archiveTabs(matchingTabs, rule.action.collectionName);
        break;
      case 'close':
        await this.closeTabs(matchingTabs);
        break;
      case 'group':
        await this.groupTabs(matchingTabs, rule.action.groupName);
        break;
      case 'bookmark':
        await this.bookmarkTabs(matchingTabs, rule.action.folderName);
        break;
      case 'mute':
        await this.muteTabs(matchingTabs);
        break;
      case 'pin':
        await this.pinTabs(matchingTabs);
        break;
    }
  }

  findMatchingTabs(conditions, tabs) {
    return tabs.filter(tab => {
      return conditions.every(condition => {
        switch (condition.type) {
          case 'idle_time':
            return this.checkIdleTime(tab, condition.value);
          case 'domain':
            return this.checkDomain(tab, condition.value, condition.operator);
          case 'title_contains':
            return tab.title.toLowerCase().includes(condition.value.toLowerCase());
          case 'url_contains':
            return tab.url.toLowerCase().includes(condition.value.toLowerCase());
          case 'is_duplicate':
            return this.checkDuplicate(tab, tabs);
          case 'memory_usage':
            return this.checkMemoryUsage(tab, condition.value);
          default:
            return false;
        }
      });
    });
  }

  checkIdleTime(tab, thresholdHours) {
    const idleTime = Date.now() - (tab.lastAccessed || Date.now());
    return idleTime > (thresholdHours * 60 * 60 * 1000);
  }

  checkDomain(tab, domain, operator = 'equals') {
    const tabDomain = new URL(tab.url).hostname;
    
    switch (operator) {
      case 'equals':
        return tabDomain === domain;
      case 'contains':
        return tabDomain.includes(domain);
      case 'starts_with':
        return tabDomain.startsWith(domain);
      case 'ends_with':
        return tabDomain.endsWith(domain);
      default:
        return false;
    }
  }

  checkDuplicate(tab, allTabs) {
    return allTabs.filter(t => t.url === tab.url).length > 1;
  }

  checkMemoryUsage(tab, thresholdMB) {
    // This would require additional Chrome APIs
    // For now, return false
    return false;
  }

  async archiveTabs(tabs, collectionName) {
    const collection = {
      id: `auto_${Date.now()}`,
      name: collectionName || `Auto Archive ${new Date().toLocaleString()}`,
      tabs: tabs,
      createdAt: Date.now(),
      type: 'auto-archive'
    };
    
    await this.storage.saveCollection(collection);
    
    // Close the tabs after archiving
    for (const tab of tabs) {
      await this.tabManager.closeTab(tab.id);
    }
  }

  async closeTabs(tabs) {
    for (const tab of tabs) {
      await this.tabManager.closeTab(tab.id);
    }
  }

  async groupTabs(tabs, groupName) {
    const tabIds = tabs.map(tab => tab.id);
    await this.tabManager.groupTabs(tabIds, groupName);
  }

  async bookmarkTabs(tabs, folderName) {
    // Create bookmark folder if it doesn't exist
    const folder = await chrome.bookmarks.create({
      title: folderName || 'Auto Bookmarks'
    });
    
    for (const tab of tabs) {
      await chrome.bookmarks.create({
        parentId: folder.id,
        title: tab.title,
        url: tab.url
      });
    }
  }

  async muteTabs(tabs) {
    for (const tab of tabs) {
      await this.tabManager.muteTab(tab.id, true);
    }
  }

  async pinTabs(tabs) {
    for (const tab of tabs) {
      await this.tabManager.pinTab(tab.id, true);
    }
  }

  // Predefined rule templates
  getDefaultRules() {
    return [
      {
        id: 'idle_archive',
        name: 'Auto-archive idle tabs',
        enabled: true,
        conditions: [
          { type: 'idle_time', value: 24 } // 24 hours
        ],
        action: {
          type: 'archive',
          collectionName: 'Auto Archive'
        }
      },
      {
        id: 'duplicate_close',
        name: 'Close duplicate tabs',
        enabled: false,
        conditions: [
          { type: 'is_duplicate' }
        ],
        action: {
          type: 'close'
        }
      },
      {
        id: 'social_group',
        name: 'Group social media tabs',
        enabled: false,
        conditions: [
          { type: 'domain', value: 'twitter.com', operator: 'contains' },
          { type: 'domain', value: 'facebook.com', operator: 'contains' },
          { type: 'domain', value: 'instagram.com', operator: 'contains' }
        ],
        action: {
          type: 'group',
          groupName: 'Social Media'
        }
      }
    ];
  }

  async addRule(rule) {
    rule.id = rule.id || `rule_${Date.now()}`;
    this.rules.push(rule);
    await this.storage.saveAutomationRules(this.rules);
  }

  async updateRule(ruleId, updates) {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index >= 0) {
      this.rules[index] = { ...this.rules[index], ...updates };
      await this.storage.saveAutomationRules(this.rules);
    }
  }

  async deleteRule(ruleId) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
    await this.storage.saveAutomationRules(this.rules);
  }
}
export class StorageManager {
  constructor() {
    this.encryptionKey = null;
  }

  async init() {
    // Initialize encryption key
    const stored = await chrome.storage.local.get(['encryptionKey']);
    if (stored.encryptionKey) {
      this.encryptionKey = stored.encryptionKey;
    } else {
      this.encryptionKey = await this.generateEncryptionKey();
      await chrome.storage.local.set({ encryptionKey: this.encryptionKey });
    }
  }

  async generateEncryptionKey() {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const exported = await crypto.subtle.exportKey('jwk', key);
    return exported;
  }

  async encrypt(data) {
    const key = await crypto.subtle.importKey(
      'jwk',
      this.encryptionKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );
    
    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
  }

  async decrypt(encryptedData) {
    const key = await crypto.subtle.importKey(
      'jwk',
      this.encryptionKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
      key,
      new Uint8Array(encryptedData.data)
    );
    
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  }

  async saveCollection(collection) {
    const encrypted = await this.encrypt(collection);
    const collections = await this.getCollections();
    const index = collections.findIndex(c => c.id === collection.id);
    
    if (index >= 0) {
      collections[index] = collection;
    } else {
      collections.push(collection);
    }
    
    await chrome.storage.local.set({
      [`collection_${collection.id}`]: encrypted
    });
  }

  async getCollections() {
    const result = await chrome.storage.local.get(null);
    const collections = [];
    
    for (const [key, value] of Object.entries(result)) {
      if (key.startsWith('collection_')) {
        try {
          const decrypted = await this.decrypt(value);
          collections.push(decrypted);
        } catch (error) {
          console.error('Failed to decrypt collection:', error);
        }
      }
    }
    
    return collections.sort((a, b) => b.createdAt - a.createdAt);
  }

  async deleteCollection(collectionId) {
    await chrome.storage.local.remove(`collection_${collectionId}`);
  }

  async saveSettings(settings) {
    const encrypted = await this.encrypt(settings);
    await chrome.storage.local.set({ settings: encrypted });
  }

  async getSettings() {
    const result = await chrome.storage.local.get(['settings']);
    if (result.settings) {
      return await this.decrypt(result.settings);
    }
    return {
      autoArchiveIdle: true,
      idleThresholdHours: 24,
      enableAIClustering: true,
      theme: 'light'
    };
  }

  async saveAutomationRules(rules) {
    const encrypted = await this.encrypt(rules);
    await chrome.storage.local.set({ automationRules: encrypted });
  }

  async getAutomationRules() {
    const result = await chrome.storage.local.get(['automationRules']);
    if (result.automationRules) {
      return await this.decrypt(result.automationRules);
    }
    return [];
  }

  async exportData() {
    const [collections, settings, rules] = await Promise.all([
      this.getCollections(),
      this.getSettings(),
      this.getAutomationRules()
    ]);
    
    return {
      collections,
      settings,
      automationRules: rules,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  async importData(data) {
    // Validate data structure
    if (!data.collections || !Array.isArray(data.collections)) {
      throw new Error('Invalid data format');
    }
    
    // Import collections
    for (const collection of data.collections) {
      await this.saveCollection(collection);
    }
    
    // Import settings
    if (data.settings) {
      await this.saveSettings(data.settings);
    }
    
    // Import automation rules
    if (data.automationRules) {
      await this.saveAutomationRules(data.automationRules);
    }
  }
}
// Content script for tracking page interactions and scroll position
class TabTracker {
  constructor() {
    this.scrollPosition = { x: 0, y: 0 };
    this.lastActivity = Date.now();
    this.isActive = true;
    this.init();
  }

  init() {
    // Track scroll position
    window.addEventListener('scroll', () => {
      this.scrollPosition = {
        x: window.scrollX,
        y: window.scrollY
      };
      this.updateActivity();
    }, { passive: true });

    // Track user activity
    ['click', 'keydown', 'mousemove', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.updateActivity(), { passive: true });
    });

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
      if (this.isActive) {
        this.updateActivity();
      }
    });

    // Track form interactions
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        this.captureFormData();
      }
    });

    // Send initial data
    this.sendTabData();

    // Periodic updates
    setInterval(() => {
      this.sendTabData();
    }, 30000); // Every 30 seconds
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  captureFormData() {
    const forms = Array.from(document.forms);
    const formData = forms.map(form => {
      const data = {};
      const formDataObj = new FormData(form);
      
      for (const [key, value] of formDataObj.entries()) {
        // Only capture non-sensitive data
        if (!this.isSensitiveField(key)) {
          data[key] = value;
        }
      }
      
      return {
        action: form.action,
        method: form.method,
        data: data
      };
    });

    return formData;
  }

  isSensitiveField(fieldName) {
    const sensitivePatterns = [
      /password/i,
      /credit/i,
      /card/i,
      /ssn/i,
      /social/i,
      /security/i,
      /pin/i,
      /cvv/i,
      /cvc/i
    ];

    return sensitivePatterns.some(pattern => pattern.test(fieldName));
  }

  sendTabData() {
    const data = {
      type: 'SAVE_TAB_SESSION',
      tabId: this.getTabId(),
      sessionData: {
        scrollPosition: this.scrollPosition,
        lastActivity: this.lastActivity,
        isActive: this.isActive,
        url: window.location.href,
        title: document.title,
        formData: this.captureFormData(),
        timestamp: Date.now()
      }
    };

    try {
      chrome.runtime.sendMessage(data).catch(error => {
        console.error('Failed to send tab data:', error);
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  getTabId() {
    // This will be set by the background script when injecting
    return window.tabId || null;
  }
}

// Initialize the tracker
new TabTracker();

// Listen for messages from the extension
try {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_PAGE_DATA') {
      sendResponse({
        scrollPosition: window.scrollX + ',' + window.scrollY,
        title: document.title,
        url: window.location.href
      });
    } else if (message.type === 'RESTORE_SCROLL') {
      window.scrollTo(message.x, message.y);
      sendResponse({ success: true });
    }
  });
} catch (error) {
  console.error('Error setting up message listener:', error);
}
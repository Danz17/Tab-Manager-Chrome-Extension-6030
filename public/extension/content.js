// Content script for TabBoard
(function() {
  'use strict';

  // Track page activity
  let lastActivity = Date.now();
  let scrollPosition = { x: 0, y: 0 };

  // Track scroll position
  window.addEventListener('scroll', () => {
    scrollPosition = { x: window.scrollX, y: window.scrollY };
    lastActivity = Date.now();
  }, { passive: true });

  // Track user activity
  ['click', 'keydown', 'mousemove', 'touchstart'].forEach(event => {
    document.addEventListener(event, () => {
      lastActivity = Date.now();
    }, { passive: true });
  });

  // Send tab data to background script
  function sendTabData() {
    try {
      chrome.runtime.sendMessage({
        type: 'TAB_ACTIVITY',
        data: {
          url: window.location.href,
          title: document.title,
          lastActivity: lastActivity,
          scrollPosition: scrollPosition,
          timestamp: Date.now()
        }
      }).catch(error => {
        console.error('Failed to send tab data:', error);
      });
    } catch (error) {
      console.error('Error sending tab data:', error);
    }
  }

  // Send data periodically
  setInterval(sendTabData, 30000); // Every 30 seconds

  // Send data on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sendTabData);
  } else {
    sendTabData();
  }
})();
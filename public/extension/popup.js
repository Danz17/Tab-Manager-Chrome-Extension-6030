document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load stats
    const tabsResponse = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_TABS' });
    const collectionsResponse = await chrome.runtime.sendMessage({ type: 'GET_COLLECTIONS' });

    if (tabsResponse.success) {
      document.getElementById('tabs-count').textContent = tabsResponse.data.length;
    }

    if (collectionsResponse.success) {
      document.getElementById('collections-count').textContent = collectionsResponse.data.length;
    }

    // Bind events
    document.getElementById('open-newtab').addEventListener('click', () => {
      chrome.tabs.create({ url: 'chrome://newtab/' });
      window.close();
    });

    document.getElementById('save-all').addEventListener('click', async () => {
      const tabsResponse = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_TABS' });
      
      if (tabsResponse.success) {
        const collection = {
          id: Date.now().toString(),
          name: `Session ${new Date().toLocaleString()}`,
          tabs: tabsResponse.data,
          createdAt: Date.now(),
          type: 'session'
        };

        await chrome.runtime.sendMessage({
          type: 'SAVE_COLLECTION',
          collection: collection
        });

        // Show success message
        showNotification('All tabs saved!');
      }
    });

    document.getElementById('ai-cluster').addEventListener('click', () => {
      showNotification('AI clustering started!');
      window.close();
    });

  } catch (error) {
    console.error('Failed to load popup:', error);
  }
});

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 8px 12px;
    background: #10b981;
    color: white;
    border-radius: 4px;
    font-size: 0.8rem;
    z-index: 1000;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}
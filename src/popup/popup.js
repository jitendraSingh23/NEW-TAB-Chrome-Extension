// Check if current page is in favorites when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const currentTab = tabs[0];

  chrome.storage.local.get(["favorites"], function (result) {
    const favorites = result.favorites || [];
    const isInFavorites = favorites.some((f) => f.url === currentTab.url);
    const actionButton = document.getElementById("addToFavorites");

    if (isInFavorites) {
      actionButton.textContent = "Remove from Favorites";
      actionButton.style.background = "#ff4444";
    }
  });
});

// Handle button click for both add and remove
document
  .getElementById("addToFavorites")
  .addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];

      chrome.storage.local.get(["favorites"], function (result) {
        const favorites = result.favorites || [];
        const isInFavorites = favorites.some((f) => f.url === currentTab.url);

        if (!isInFavorites) {
          // Add to favorites
          favorites.push({
            title: currentTab.title,
            url: currentTab.url,
            icon: currentTab.favIconUrl || "icons/icon128.png",
          });

          chrome.storage.local.set({ favorites }, function () {
            showStatus("Added to favorites!", "#24A2C5");
            setTimeout(() => window.close(), 1000);
          });
        } else {
          // Remove from favorites
          const updatedFavorites = favorites.filter(
            (f) => f.url !== currentTab.url
          );
          chrome.storage.local.set(
            { favorites: updatedFavorites },
            function () {
              showStatus("Removed from favorites!", "#ff4444");
              setTimeout(() => window.close(), 1000);
            }
          );
        }
      });
    });
  });

// Helper function to show status messages
function showStatus(message, color) {
  const status = document.createElement("div");
  status.textContent = message;
  status.style.cssText = `
    color: ${color};
    margin-top: 10px;
    text-align: center;
    padding: 5px;
  `;
  document.body.appendChild(status);
}

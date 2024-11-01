const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { searchTelegram } = require('../src/services/telegram');
const { searchRutracker } = require('../src/services/rutracker');

const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for plugin management
ipcMain.handle('save-plugin', async (event, plugin) => {
  const plugins = store.get('plugins') || [];
  plugins.push(plugin);
  store.set('plugins', plugins);
  return plugins;
});

ipcMain.handle('get-plugins', async () => {
  return store.get('plugins') || [];
});

ipcMain.handle('delete-plugin', async (event, pluginId) => {
  const plugins = store.get('plugins') || [];
  const updatedPlugins = plugins.filter(p => p.id !== pluginId);
  store.set('plugins', updatedPlugins);
  return updatedPlugins;
});

// Search handlers
ipcMain.handle('search-external', async (event, query) => {
  try {
    const [telegramResults, rutrackerResults] = await Promise.all([
      searchTelegram(query),
      searchRutracker(query)
    ]);

    return {
      telegram: telegramResults,
      rutracker: rutrackerResults
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      telegram: [],
      rutracker: []
    };
  }
});
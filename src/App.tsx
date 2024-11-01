import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import SearchResults from './components/SearchResults';

interface Plugin {
  id: string;
  name: string;
  category: string;
  description: string;
  downloadUrl: string;
}

const categories = [
  'Effects',
  'Synthesizers',
  'Technical Processing',
  'Samples',
  'Other',
];

function App() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [externalSearchTerm, setExternalSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({
    telegram: [],
    rutracker: []
  });
  const [newPlugin, setNewPlugin] = useState<Omit<Plugin, 'id'>>({
    name: '',
    category: '',
    description: '',
    downloadUrl: '',
  });

  useEffect(() => {
    window.electron.invoke('get-plugins').then((loadedPlugins: Plugin[]) => {
      setPlugins(loadedPlugins);
    });
  }, []);

  const handleAddPlugin = async (pluginData?: { name: string; downloadUrl: string }) => {
    const plugin = {
      ...(pluginData || newPlugin),
      id: Date.now().toString(),
      category: pluginData ? 'Other' : newPlugin.category,
      description: pluginData ? '' : newPlugin.description,
    };
    
    const updatedPlugins = await window.electron.invoke('save-plugin', plugin);
    setPlugins(updatedPlugins);
    setOpenDialog(false);
    setNewPlugin({ name: '', category: '', description: '', downloadUrl: '' });
  };

  const handleDeletePlugin = async (id: string) => {
    const updatedPlugins = await window.electron.invoke('delete-plugin', id);
    setPlugins(updatedPlugins);
  };

  const handleDownload = (url: string) => {
    window.electron.invoke('download-plugin', url);
  };

  const searchExternalSources = async () => {
    setIsSearching(true);
    try {
      const results = await window.electron.invoke('search-external', externalSearchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plugin.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          VST Plugin Manager
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Search Plugins"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Plugin
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Search External Sources
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Search RuTracker & Telegram"
              value={externalSearchTerm}
              onChange={(e) => setExternalSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchExternalSources()}
            />
            <Button
              variant="contained"
              onClick={searchExternalSources}
              startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              disabled={isSearching}
            >
              Search
            </Button>
          </Box>

          {(searchResults.telegram.length > 0 || searchResults.rutracker.length > 0) && (
            <SearchResults
              telegramResults={searchResults.telegram}
              rutrackerResults={searchResults.rutracker}
              onAddPlugin={handleAddPlugin}
            />
          )}
        </Box>

        <Grid container spacing={3}>
          {filteredPlugins.map((plugin) => (
            <Grid item xs={12} sm={6} md={4} key={plugin.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{plugin.name}</Typography>
                  <Typography color="textSecondary">{plugin.category}</Typography>
                  <Typography variant="body2">{plugin.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(plugin.downloadUrl)}
                  >
                    Download
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleDeletePlugin(plugin.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add New Plugin</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Plugin Name"
              value={newPlugin.name}
              onChange={(e) => setNewPlugin({ ...newPlugin, name: e.target.value })}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newPlugin.category}
                label="Category"
                onChange={(e) => setNewPlugin({ ...newPlugin, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newPlugin.description}
              onChange={(e) => setNewPlugin({ ...newPlugin, description: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Download URL"
              value={newPlugin.downloadUrl}
              onChange={(e) => setNewPlugin({ ...newPlugin, downloadUrl: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={() => handleAddPlugin()} variant="contained">
              Add Plugin
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default App;
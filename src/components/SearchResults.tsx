import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface SearchResult {
  title: string;
  url: string;
  size?: string;
  seeders?: number;
}

interface SearchResultsProps {
  telegramResults: SearchResult[];
  rutrackerResults: SearchResult[];
  onAddPlugin: (plugin: { name: string; downloadUrl: string }) => void;
}

export default function SearchResults({ 
  telegramResults, 
  rutrackerResults, 
  onAddPlugin 
}: SearchResultsProps) {
  return (
    <Paper sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>Search Results</Typography>
      
      {telegramResults.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ px: 2 }}>Telegram Results</Typography>
          <List>
            {telegramResults.map((result, index) => (
              <ListItem key={`telegram-${index}`}>
                <ListItemText 
                  primary={result.title}
                  secondary={result.url}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => onAddPlugin({
                      name: result.title,
                      downloadUrl: result.url
                    })}
                  >
                    <AddIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}

      {rutrackerResults.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ px: 2 }}>RuTracker Results</Typography>
          <List>
            {rutrackerResults.map((result, index) => (
              <ListItem key={`rutracker-${index}`}>
                <ListItemText 
                  primary={result.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Size: {result.size} | Seeders: {result.seeders}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2">
                        {result.url}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => onAddPlugin({
                      name: result.title,
                      downloadUrl: result.url
                    })}
                  >
                    <AddIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {telegramResults.length === 0 && rutrackerResults.length === 0 && (
        <Typography sx={{ p: 2 }} color="text.secondary">
          No results found
        </Typography>
      )}
    </Paper>
  );
}
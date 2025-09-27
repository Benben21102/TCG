import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

type MainMenuProps = {
  onFreeHuman: () => void;
  onFreeAI: () => void;
  onCampaign: () => void;
  onArt: () => void;
};

export function MainMenu({ onFreeHuman, onFreeAI, onCampaign, onArt }: MainMenuProps) {
  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, p: 3 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
          🍹 Beach & Library TCG
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Button variant="contained" color="primary" size="large" onClick={onFreeHuman}>
            Free Play — Human vs Human
          </Button>
          <Button variant="contained" color="secondary" size="large" onClick={onFreeAI}>
            Free Play — Human vs AI
          </Button>
          <Button variant="outlined" color="primary" size="large" onClick={onCampaign}>
            Campaign
          </Button>
          <Button variant="outlined" color="secondary" size="large" onClick={onArt}>
            Manage Card Art
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Campaign drafts start with Level ≤2 only. Pick higher-level rewards to unlock them for all
          future campaign drafts.
        </Typography>
      </Paper>
    </Box>
  );
}

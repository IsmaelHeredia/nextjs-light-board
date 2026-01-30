import React from 'react';
import { Dialog, DialogContent, DialogActions, Typography, Button } from "@mui/material";
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, description, onConfirm, onClose, loading
}) => (
  <Dialog open={open} onClose={onClose} sx={{ zIndex: 9999 }}>
    <DialogContent sx={{ textAlign: 'center', p: 4, maxWidth: 400 }}>
      <WarningAmberRoundedIcon sx={{ fontSize: 60, color: '#ed6c02', mb: 2 }} />
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 3, gap: 1 }}>
      <Button onClick={onClose} fullWidth variant="outlined" disabled={loading}>
        Cancelar
      </Button>
      <Button
        onClick={onConfirm}
        variant="outlined"
        color="error"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Borrando...' : 'Confirmar'}
      </Button>
    </DialogActions>
  </Dialog>
);
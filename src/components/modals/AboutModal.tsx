import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface AboutModalProps {
  open: boolean;
  handleClose: () => void;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 420 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  outline: 'none',
};

const AboutModal: React.FC<AboutModalProps> = ({ open, handleClose }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
    >
      <Fade in={open}>
        <Box sx={style}>
          <Box
            sx={{
              position: 'relative',
              px: 3,
              py: 2,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
            >
              Acerca del programa
            </Typography>

            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              px: 3,
              py: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="body1" sx={{ mb: 1 }}>
              Nombre del programa: <strong>Light Board</strong>
            </Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
              Versión: 1.0
            </Typography>

            <Typography variant="body1">
              Autor: Ismael Heredia
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AboutModal;
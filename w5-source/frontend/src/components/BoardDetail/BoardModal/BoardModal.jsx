import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import IconButton from '@mui/material/IconButton'
import BoardTab from '../BoardModal/Tab/Tab'
import CloseIcon from '@mui/icons-material/Close'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: '90%',
    sm: 500,
    md: 1000
  },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 6
}

export default function BoardModal({ boardModal }) {
  const { open, handleClose } = boardModal

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...style, position: 'absolute' }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 28,
              right: 28
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography id="modal-modal-title" variant="h6" component="h2">
            Board Details
          </Typography>

          <Box id="modal-modal-description" sx={{ mt: 2 }}>
            <BoardTab />
          </Box>
        </Box>
      </Modal>
    </div>
  )
}

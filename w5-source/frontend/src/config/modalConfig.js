import Backdrop from '@mui/material/Backdrop'

const modalConfig = {
  'aria-labelledby': 'modal-modal-title',
  closeAfterTransition: true,
  slots: { backdrop: Backdrop },
  slotProps: {
    backdrop: {
      timeout: 500
    }
  }
}
export default modalConfig

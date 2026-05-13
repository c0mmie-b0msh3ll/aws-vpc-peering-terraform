import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'

export default function ConfirmDeleteModal({
  open,
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this item?',
  onClose,
  onConfirm,
  loading = false
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
    >
      <DialogTitle
        sx={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'white'
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{
            fontSize: '15px',
            color: 'white'
          }}
        >
          {description}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant='contained'
          sx={{
            minWidth: 100,
            height: 38,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: '#6b7280',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#4b5563',
              boxShadow: 'none'
            }
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={onConfirm}
          variant='contained'
          disabled={loading}
          sx={{
            minWidth: 100,
            height: 38,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: '#ef4444',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#dc2626',
              boxShadow: 'none'
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
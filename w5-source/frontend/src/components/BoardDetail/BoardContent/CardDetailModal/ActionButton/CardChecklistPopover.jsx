import { useState } from 'react'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'
import { cardDetailActionButtonSx } from '~/config/cardDetailButtonConfig'

function CardChecklistPopover({ handleCreate }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    if (isSubmitting) return
    setAnchorEl(null)
    setTitle('')
  }

  const onCreate = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    try {
      setIsSubmitting(true)
      await handleCreate?.(trimmedTitle)
      setTitle('')
      setAnchorEl(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CheckBoxOutlinedIcon fontSize="small" />}
        sx={cardDetailActionButtonSx}
        onClick={handleOpen}
      >
        Checklist
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 340,
            p: 2,
            borderRadius: 3
          }
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
          Add checklist
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <TextField
            placeholder="Enter checklist title..."
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCreate()
            }}
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="text"
              color="inherit"
              onClick={handleClose}
              disabled={isSubmitting}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={onCreate}
              disabled={!title.trim() || isSubmitting}
              sx={{ textTransform: 'none' }}
            >
              Add
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  )
}

export default CardChecklistPopover

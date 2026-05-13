import { useState } from 'react'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import { useNavigate } from 'react-router-dom'

function AIGenerateBoardModal({
  isOpen,
  handleClose,
  handleGenerate,
  isSubmitting
}) {
  const [prompt, setPrompt] = useState('')
  const navigate = useNavigate()

  const onClose = () => {
    if (isSubmitting) return
    setPrompt('')
    handleClose()
  }

  const onGenerate = async () => {
    const trimmed = prompt.trim()
    if (!trimmed || isSubmitting) return

    try {
      const board = await handleGenerate(trimmed)
      if (board?._id) {
        setPrompt('')
        handleClose()
        navigate(`/boards/${board._id}`)
      }
    } catch (err) {
      console.error('AI board generation error:', err)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 3,
          outline: 'none'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeOutlinedIcon sx={{ color: '#7c3aed' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              AI Generate Board
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2 }}>
          Describe your project and AI will create a complete board with columns
          and cards.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="E.g. A mobile app launch for a food delivery startup with marketing, development, and testing phases..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        {isSubmitting && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <CircularProgress size={20} sx={{ color: '#7c3aed' }} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              AI is generating your board... this may take a few seconds.
            </Typography>
          </Stack>
        )}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            variant="text"
            color="inherit"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onGenerate}
            disabled={!prompt.trim() || isSubmitting}
            sx={{
              textTransform: 'none',
              bgcolor: '#7c3aed',
              '&:hover': { bgcolor: '#6d28d9' }
            }}
          >
            {isSubmitting ? 'Generating...' : 'Generate Board'}
          </Button>
        </Stack>
      </Box>
    </Modal>
  )
}

export default AIGenerateBoardModal

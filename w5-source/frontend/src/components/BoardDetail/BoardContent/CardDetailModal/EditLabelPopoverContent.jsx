import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Popover,
  TextField,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import CheckIcon from '@mui/icons-material/Check'
import { BOARD_LABEL_COLORS } from '~/constant/labelBackgroundColor'
import { useSelector } from 'react-redux'

const EDITABLE_COLORS = Object.keys(BOARD_LABEL_COLORS).filter(
  (key) => key !== 'none'
)

function EditLabelPopover({
  action,
  anchorEl,
  open,
  onClose,
  label,
  onSave,
  onDelete,
  onBack
}) {
  const [title, setTitle] = useState('')
  const [color, setColor] = useState('green')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const board = useSelector((state) => state.activeBoard.board)

  useEffect(() => {
    if (!open) return

    setTitle(label?.title || label?.name || '')
    setColor(label?.color || 'green')
  }, [label, open])

  const previewText = useMemo(() => {
    return title.trim() || 'Label preview'
  }, [title])

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      await onSave?.({
        _id: label?._id,
        boardId: board?._id,
        title: title.trim(),
        color
      })
    } finally {
      setIsSubmitting(false)
      onBack()
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete?.(label)
    } finally {
      setIsDeleting(false)
      onBack()
    }
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            mt: 1,
            width: 362,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' ? '#282e33' : '#ffffff',
            color: theme.palette.mode === 'dark' ? '#f1f2f4' : '#172b4d',
            border: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(9,30,66,0.08)'
            }`,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 12px 32px rgba(0,0,0,0.42)'
                : '0 8px 24px rgba(9,30,66,0.14)'
          })
        }
      }}
    >
      <Box>
        <Box
          sx={(theme) => ({
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderBottom: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(9,30,66,0.08)'
            }`
          })}
        >
          <IconButton
            size="small"
            onClick={onBack}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>

          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            Edit label
          </Typography>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={(theme) => ({
            px: 3,
            py: 3,
            bgcolor: theme.palette.mode === 'dark' ? '#101418' : '#f7f8f9'
          })}
        >
          <Box
            sx={(theme) => ({
              height: 28,
              borderRadius: 1,
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              fontSize: 14,
              fontWeight: 700,
              bgcolor: BOARD_LABEL_COLORS[color]?.[theme.palette.mode],
              color:
                color === 'yellow' || color === 'none' ? '#172b4d' : '#ffffff'
            })}
          >
            {previewText}
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography
            sx={(theme) => ({
              fontSize: 12,
              fontWeight: 700,
              mb: 0.75,
              color: theme.palette.mode === 'dark' ? '#b6c2cf' : '#44546f'
            })}
          >
            Title
          </Typography>

          <TextField
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />

          <Typography
            sx={(theme) => ({
              fontSize: 12,
              fontWeight: 700,
              mb: 1,
              color: theme.palette.mode === 'dark' ? '#b6c2cf' : '#44546f'
            })}
          >
            Select a color
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 1,
              mb: 2
            }}
          >
            {EDITABLE_COLORS.map((item) => (
              <Box
                key={item}
                onClick={() => setColor(item)}
                sx={(theme) => ({
                  height: 32,
                  borderRadius: 1,
                  cursor: 'pointer',
                  position: 'relative',
                  bgcolor: BOARD_LABEL_COLORS[item][theme.palette.mode],
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                  '&:hover': {
                    opacity: 0.9
                  }
                })}
              >
                {color === item && (
                  <CheckIcon
                    sx={{
                      fontSize: 18,
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color:
                        item === 'yellow' || item === 'lime'
                          ? '#172b4d'
                          : '#ffffff'
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}
          >
            <Button
              disabled={isSubmitting}
              variant="contained"
              onClick={handleSave}
              sx={{
                minWidth: 64,
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 1.5,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              Save
            </Button>
            {action === 'update' && (
              <Button
                disabled={isDeleting}
                variant="contained"
                color="error"
                onClick={handleDelete}
                sx={{
                  minWidth: 74,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none'
                  }
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Popover>
  )
}

export default EditLabelPopover

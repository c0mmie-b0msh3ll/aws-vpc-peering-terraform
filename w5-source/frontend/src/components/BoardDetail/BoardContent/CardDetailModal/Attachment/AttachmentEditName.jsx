import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'

function AttachmentEditName({
  anchorEl,
  open,
  onClose,
  attachment,
  handleUpdateAttachment
}) {
  const [fileName, setFileName] = useState(attachment?.fileName || '')

  useEffect(() => {
    if (attachment) setFileName(attachment.fileName)
  }, [attachment])

  const handleUpdate = async () => {
    if (!fileName.trim()) return

    await handleUpdateAttachment({
      attachmentId: attachment._id,
      fileName: fileName.trim()
    })

    onClose?.()
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
            width: 320,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' ? '#1f1f23' : '#ffffff',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#172b4d',
            border: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(9,30,66,0.08)'
            }`,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 12px 32px rgba(0,0,0,0.35)'
                : '0 8px 24px rgba(9,30,66,0.14)'
          })
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            mb: 2
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Edit attachment
          </Typography>

          <IconButton
            size="small"
            onClick={onClose}
            sx={(theme) => ({
              position: 'absolute',
              right: -4,
              top: -4,
              color: theme.palette.mode === 'dark' ? '#b6c2cf' : '#44546f',
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(9,30,66,0.06)'
              }
            })}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography
          sx={(theme) => ({
            fontSize: 13,
            fontWeight: 600,
            color: theme.palette.mode === 'dark' ? '#b6c2cf' : '#44546f',
            mb: 0.75
          })}
        >
          File name
        </Typography>

        <TextField
          fullWidth
          size="small"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              '& .MuiOutlinedInput-input': {
                py: 1.2,
                fontSize: 14
              },
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? '#2c2f36' : '#ffffff',
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#ffffff' : '#172b4d',
              '& fieldset': {
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.16)'
                    : 'rgba(9,30,66,0.14)'
              },
              '&:hover fieldset': {
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#85b8ff' : '#0c66e4'
              },
              '&.Mui-focused fieldset': {
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#85b8ff' : '#0c66e4',
                borderWidth: '1px'
              }
            }
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleUpdate}
          disabled={!fileName.trim()}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            py: 1,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none'
            }
          }}
        >
          Update
        </Button>
      </Box>
    </Popover>
  )
}

export default AttachmentEditName

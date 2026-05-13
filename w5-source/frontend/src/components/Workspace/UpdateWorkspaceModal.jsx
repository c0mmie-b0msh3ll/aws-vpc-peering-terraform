import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import AbcIcon from '@mui/icons-material/Abc'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { useUpdateWorkspaceForm } from '~/hooks/updateWorkspaceForm.hook'
import { InputAdornment } from '@mui/material'

function UpdateWorkspaceModal({ data, loading, isOpen, onClose, onSubmit }) {
  const { register, errors, handleSubmit } = useUpdateWorkspaceForm({
    isOpen,
    data
  })

  return (
    <Dialog
      open={isOpen}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ pb: 1.5, position: 'relative' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EditOutlinedIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Update workspace
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update title and description for your workspace.
            </Typography>
          </Box>
        </Stack>

        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 16,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'text.primary'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AbcIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              label="Title"
              fullWidth
              autoFocus
              disabled={loading}
              error={!!errors.title}
              helperText={errors.title?.message}
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Title must be at most 100 characters'
                },
                validate: (value) =>
                  value.trim() !== '' || 'Title cannot be empty'
              })}
            />

            <TextField
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionOutlinedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
              label="Description"
              fullWidth
              multiline
              minRows={4}
              disabled={loading}
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Description must be at most 500 characters'
                }
              })}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            onClick={loading ? undefined : onClose}
            disabled={loading}
            color="inherit"
          >
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default UpdateWorkspaceModal

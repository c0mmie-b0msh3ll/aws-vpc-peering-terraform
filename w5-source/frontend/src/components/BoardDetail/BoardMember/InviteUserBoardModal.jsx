import { Controller, useForm } from 'react-hook-form'

import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

import CloseIcon from '@mui/icons-material/Close'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import { useEffect } from 'react'

function InviteUserBoardModal({
  isOpen,
  users = [],
  searchKeyword = '',
  loading = false,
  onClose,
  onSubmit,
  onSearchChange
}) {
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      users: [],
      message: ''
    }
  })

  const submitting = loading || isSubmitting

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose?.()
  }

  const submitForm = async (data) => {
    const payload = {
      userIds: data.users.map((item) => item.userId || item.user?._id),
      emails: data.users.map((item) => item.user?.email),
      message: data.message.trim()
    }

    await onSubmit?.(payload)
      reset()
      onClose?.()
    }
//   useEffect(()=> {
//     console.log(users);
    
//   })

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden'
        }
      }}
    >
      <Box component="form" onSubmit={handleSubmit(submitForm)}>
        <DialogTitle
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: 2
              }}
            >
              <PersonAddAlt1Icon />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Invite users to board
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search and select users to invite
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={handleClose} disabled={submitting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              You can only invite users from the search results below.
            </Alert>

            <Controller
              name="users"
              control={control}
              rules={{
                validate: (value) => {
                  if (!value || value.length === 0) {
                    return 'Please select at least one user'
                  }
                  return true
                }
              }}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={users}
                  value={field.value}
                  inputValue={searchKeyword}
                  loading={loading}
                  disabled={submitting}
                  filterSelectedOptions
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  getOptionLabel={(option) => option?.user?.email || ''}
                  onInputChange={(_, newInputValue, reason) => {
                    if (reason === 'input') onSearchChange?.(newInputValue)
                    if (reason === 'clear') onSearchChange?.('')
                  }}
                  onChange={(_, newValue) => {
                    field.onChange(newValue)
                  }}
                 renderTags={(value, getTagProps) =>
  value.map((user, index) => {
    const { key, ...tagProps } = getTagProps({ index })

    return (
      <Chip
        key={key}
        label={user.user?.email}
        {...tagProps}
        color="primary"
        sx={{ borderRadius: 2, fontWeight: 500 }}
      />
    )
  })
}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option?.userId}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={option.user?.avatar}
                          alt={option.user?.displayName || option.user?.email}
                          sx={{ width: 32, height: 32 }}
                        >
                          {option.user?.displayName?.[0] || option.user?.email?.[0]}
                        </Avatar>

                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {option.user?.displayName ||
                              option.user?.name ||
                              'Unknown user'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.user?.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Invite users"
                      placeholder="Search by name or email"
                      error={!!errors.users}
                      helperText={
                        errors.users?.message ||
                        'Search user, then click to add'
                      }
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <MailOutlineIcon
                              sx={{
                                color: 'text.secondary',
                                mr: 1,
                                fontSize: 20
                              }}
                            />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {loading ? (
                              <CircularProgress color="inherit" size={18} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
              )}
            />

            <TextField
              label="Invitation message"
              placeholder="Write a short message for the invited users..."
              multiline
              minRows={3}
              disabled={submitting}
              error={!!errors.message}
              helperText={errors.message?.message}
              {...register('message', {
                maxLength: {
                  value: 300,
                  message: 'Message must be at most 300 characters'
                }
              })}
              InputProps={{
                startAdornment: (
                  <MessageOutlinedIcon
                    sx={{
                      color: 'text.secondary',
                      mr: 1,
                      mt: 1,
                      alignSelf: 'flex-start'
                    }}
                  />
                )
              }}
            />

            <Controller
              name="users"
              control={control}
              render={({ field }) =>
                !!field.value.length && (
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 2.5,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(144, 202, 249, 0.08)'
                          : 'rgba(25, 118, 210, 0.06)',
                      border: '1px dashed',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {field.value.length} recipient
                      {field.value.length > 1 ? 's' : ''} selected
                    </Typography>
                  </Box>
                )
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button
            onClick={handleClose}
            disabled={submitting}
            color="inherit"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={18} color="inherit" /> : null
            }
            sx={{
              minWidth: 150,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2
            }}
          >
            {submitting ? 'Sending...' : 'Send invitations'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default InviteUserBoardModal

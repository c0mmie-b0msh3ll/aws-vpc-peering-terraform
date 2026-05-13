import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import {
  Avatar,
  Box,
  Button,
  Divider,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import MailIcon from '@mui/icons-material/Mail'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import EditRoundedIcon from '@mui/icons-material/EditRounded'

import { FIELD_REQUIRED_MESSAGE, singleFileValidator } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { selectCurrentUser, updateUserAPI } from '~/redux/user/userSlice'

function AccountTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      displayName: currentUser?.displayName || ''
    }
  })

  useEffect(() => {
    reset({
      displayName: currentUser?.displayName || ''
    })
  }, [currentUser, reset])

  const displayNameValue = watch('displayName')
  const isDisplayNameChanged =
    (displayNameValue || '').trim() !== (currentUser?.displayName || '').trim()

  const submitChangeGeneralInformation = (data) => {
    const { displayName } = data
    const trimmedDisplayName = displayName?.trim()

    if (!trimmedDisplayName || trimmedDisplayName === currentUser?.displayName) return

    toast
      .promise(dispatch(updateUserAPI({ displayName: trimmedDisplayName })), {
        pending: 'Updating ...'
      })
      .then((res) => {
        if (!res.error) {
          toast.success('User updated successfully!')
        }
      })
  }

  const uploadAvatar = (e) => {
    const file = e.target?.files[0]
    const error = singleFileValidator(file)

    if (error) {
      toast.error(error)
      return
    }

    const reqData = new FormData()
    reqData.append('avatar', file)

    toast
      .promise(dispatch(updateUserAPI(reqData)), {
        pending: 'Updating ...'
      })
      .then((res) => {
        if (!res.error) toast.success('Avatar updated successfully!')
        e.target.value = ''
      })
  }

  return (
    <Box
  sx={{
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2,
    py: 0,
    background: 'transparent'
  }}
>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 1080,
          borderRadius: 5,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 20px 60px rgba(0,0,0,0.10)'
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '340px 1fr' }
          }}
        >
          {/* Left profile panel */}
          <Box
            sx={{
              p: 4,
              color: 'white',
              background: 'linear-gradient(160deg, #1e3a8a 0%, #2563eb 45%, #38bdf8 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 1.5,
                  opacity: 0.9
                }}
              >
                Account Settings
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mt: 1,
                  mb: 1
                }}
              >
                Hồ sơ của bạn
              </Typography>

              <Typography
                sx={{
                  opacity: 0.9,
                  maxWidth: 260
                }}
              >
                Cập nhật ảnh đại diện và thông tin hiển thị để hồ sơ nhìn chuyên nghiệp hơn.
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <Avatar
                alt={currentUser?.displayName || 'User Avatar'}
                src={currentUser?.avatar}
                sx={{
                  width: 112,
                  height: 112,
                  mb: 2,
                  border: '4px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.25)'
                }}
              />

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {currentUser?.displayName}
              </Typography>

              <Typography sx={{ opacity: 0.85, mb: 2 }}>
                @{currentUser?.username}
              </Typography>

              <Tooltip title="Upload a new image to update your avatar immediately.">
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    px: 2.5,
                    py: 1,
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 700,
                    backgroundColor: 'white',
                    color: '#1d4ed8',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Upload avatar
                  <VisuallyHiddenInput type="file" onChange={uploadAvatar} />
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Right form panel */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 4 }
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EditRoundedIcon color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Chỉnh sửa thông tin
                </Typography>
              </Box>

              <Typography color="text.secondary">
                Bạn có thể thay đổi tên hiển thị, còn email và username sẽ ở chế độ chỉ đọc.
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit(submitChangeGeneralInformation)}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5
                }}
              >
                <TextField
                  disabled
                  fullWidth
                  label="Your Email"
                  defaultValue={currentUser?.email}
                  variant="filled"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiFilledInput-root': {
                      borderRadius: 3
                    }
                  }}
                />

                <TextField
                  disabled
                  fullWidth
                  label="Your Username"
                  defaultValue={currentUser?.username}
                  variant="filled"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBoxIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiFilledInput-root': {
                      borderRadius: 3
                    }
                  }}
                />

                <Box>
                  <TextField
                    fullWidth
                    label="Your Display Name"
                    type="text"
                    variant="outlined"
                    {...register('displayName', {
                      required: FIELD_REQUIRED_MESSAGE
                    })}
                    error={!!errors.displayName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AssignmentIndIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.2s ease'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.10)'
                      }
                    }}
                  />
                  <FieldErrorAlert errors={errors} fieldName="displayName" />
                </Box>

                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}
                >
                  <Button
                    className="interceptor-loading"
                    type="submit"
                    variant="contained"
                    disabled={!isDisplayNameChanged || isSubmitting}
                    sx={{
                      minWidth: 180,
                      py: 1.2,
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    Save changes
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default AccountTab
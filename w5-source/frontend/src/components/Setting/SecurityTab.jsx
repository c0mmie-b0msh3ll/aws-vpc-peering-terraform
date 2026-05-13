import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

import PasswordIcon from '@mui/icons-material/Password'
import LockResetIcon from '@mui/icons-material/LockReset'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'

import {
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useForm } from 'react-hook-form'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'react-toastify'
import { updateUserAPI, logoutUserApi } from '~/redux/user/userSlice'
import { useDispatch } from 'react-redux'

function SecurityTab() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm()

  const dispatch = useDispatch()
  const confirmChangePassword = useConfirm()

  const submitChangePassword = (data) => {
    confirmChangePassword({
      title: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LogoutIcon sx={{ color: 'warning.dark' }} />
          Change Password
        </Box>
      ),
      description:
        'You have to login again after successfully changing your password. Continue?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    })
      .then(() => {
        const { current_password, new_password } = data

        toast
          .promise(dispatch(updateUserAPI({ current_password, new_password })), {
            pending: 'Updating ...'
          })
          .then((res) => {
            if (!res.error) {
              toast.success('Password changed successfully!')
              dispatch(logoutUserApi(false))
            }
          })
      })
      .catch(() => {})
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
          boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
          backgroundColor: 'background.paper'
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '340px 1fr' }
          }}
        >
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
                SECURITY
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mt: 1,
                  mb: 1
                }}
              >
                Đổi mật khẩu
              </Typography>

              <Typography
                sx={{
                  opacity: 0.92,
                  maxWidth: 260
                }}
              >
                Cập nhật mật khẩu để tăng bảo mật cho tài khoản của bạn. Sau khi đổi thành công, bạn sẽ cần đăng nhập lại.
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 4,
                p: 2.5,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                <ShieldRoundedIcon />
                <Typography sx={{ fontWeight: 700 }}>
                  Security tips
                </Typography>
              </Box>

              <Typography sx={{ fontSize: '0.95rem', opacity: 0.95, mb: 1 }}>
                • Mật khẩu nên có chữ hoa, chữ thường, số và ký tự đặc biệt
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', opacity: 0.95, mb: 1 }}>
                • Không dùng lại mật khẩu cũ hoặc mật khẩu quá dễ đoán
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', opacity: 0.95 }}>
                • Sau khi đổi mật khẩu, hệ thống sẽ đăng xuất để bảo vệ tài khoản
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: { xs: 2.5, sm: 4 }
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SecurityRoundedIcon />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Security Settings
                </Typography>
              </Box>

              <Typography color="text.secondary">
                Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật thông tin bảo mật.
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit(submitChangePassword)}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5
                }}
              >
                <Box>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PasswordIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    {...register('current_password', {
                      required: FIELD_REQUIRED_MESSAGE,
                      pattern: {
                        value: PASSWORD_RULE,
                        message: PASSWORD_RULE_MESSAGE
                      }
                    })}
                    error={!!errors.current_password}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.2s ease'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 4px rgba(249, 115, 22, 0.10)'
                      }
                    }}
                  />
                  <FieldErrorAlert errors={errors} fieldName="current_password" />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    {...register('new_password', {
                      required: FIELD_REQUIRED_MESSAGE,
                      pattern: {
                        value: PASSWORD_RULE,
                        message: PASSWORD_RULE_MESSAGE
                      }
                    })}
                    error={!!errors.new_password}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.2s ease'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 4px rgba(249, 115, 22, 0.10)'
                      }
                    }}
                  />
                  <FieldErrorAlert errors={errors} fieldName="new_password" />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockResetIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    {...register('new_password_confirmation', {
                      required: FIELD_REQUIRED_MESSAGE,
                      validate: (value) => {
                        if (value === watch('new_password')) return true
                        return 'Password confirmation does not match.'
                      }
                    })}
                    error={!!errors.new_password_confirmation}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        transition: 'all 0.2s ease'
                      },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 4px rgba(249, 115, 22, 0.10)'
                      }
                    }}
                  />
                  <FieldErrorAlert
                    errors={errors}
                    fieldName="new_password_confirmation"
                  />
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
                    disabled={isSubmitting}
                    sx={{
                      minWidth: 190,
                      py: 1.2,
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                    }}
                  >
                    Change Password
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

export default SecurityTab
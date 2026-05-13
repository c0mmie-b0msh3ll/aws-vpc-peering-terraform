import React, { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import WallpaperOutlinedIcon from '@mui/icons-material/WallpaperOutlined'
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'

const inputSx = {
  '& .MuiInputLabel-root': {
    color: '#6b7280'
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#ea6b3d'
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    color: '#111827',
    '& fieldset': {
      borderColor: '#d1d5db'
    },
    '&:hover fieldset': {
      borderColor: '#9ca3af'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ea6b3d'
    }
  },
  '& .MuiInputBase-input': {
    color: '#111827'
  }
}

const defaultValues = {
  email: '',
  password: '',
  rememberMe: false
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues,
    mode: 'onBlur'
  })

  const onSubmit = async (data) => {
    try {
      setSubmitError('')

      console.log('Login Payload:', data)

      // giả lập login thành công
      navigate('/user')
    } catch (error) {
      setSubmitError('Invalid email or password')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
        background: 'linear-gradient(135deg, #fff7f3 0%, #f8fafc 100%)'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 5 }
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 480,
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            p: { xs: 3, sm: 4 },
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)'
          }}
        >

          <Box sx={{ mb: 3, justifyItems: 'center' }}>
           <Typography
                sx={{
                    fontSize: { xs: '32px', md: '25px !important' },
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1.2
                }}
                >
                Sign In
            </Typography>
            <Typography sx={{ mt: 0.75, color: '#6b7280', fontSize: '14px' }}>
              Enter your account credentials to access the system
            </Typography>
          </Box>

          {submitError ? (
            <Alert severity='error' sx={{ mb: 2, borderRadius: '10px' }}>
              {submitError}
            </Alert>
          ) : null}

          <Paper
            component='form'
            onSubmit={handleSubmit(onSubmit)}
            elevation={0}
            sx={{ backgroundColor: 'transparent' }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}
              >
                Email
              </Typography>

              <TextField
                fullWidth
                label='Enter Email...'
                type='text'
                variant='outlined'
                error={!!errors.email}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format'
                  }
                })}
                sx={inputSx}
              />
              <FieldErrorAlert errors={errors} fieldName='email' />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography
                sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}
              >
                Password
              </Typography>

              <TextField
                fullWidth
                label='Enter Password...'
                type={showPassword ? 'text' : 'password'}
                variant='outlined'
                error={!!errors.password}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge='end'
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FieldErrorAlert errors={errors} fieldName='password' />
            </Box>

            <Button
              type='submit'
              fullWidth
              variant='contained'
              disabled={isSubmitting}
              sx={{
                height: 46,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: '#ea6b3d',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#dc5f31',
                  boxShadow: 'none'
                }
              }}
            >
              Sign In
            </Button>
          </Paper>
        </Paper>
      </Box>
    </Box>
  )
}
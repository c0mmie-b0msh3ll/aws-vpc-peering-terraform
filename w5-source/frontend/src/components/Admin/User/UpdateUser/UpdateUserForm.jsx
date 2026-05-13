import React, { useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { styled } from '@mui/material/styles'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { updateAdminUserApi } from '~/apis/adminUser.api'
import { useParams } from 'react-router-dom'

const roleOptions = [
  { label: 'Client', value: 'client' },
  { label: 'Admin', value: 'admin' }
]

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

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

const selectSx = {
  backgroundColor: '#ffffff',
  color: '#111827',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d1d5db'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#9ca3af'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#ea6b3d'
  },
  '& .MuiSvgIcon-root': {
    color: '#6b7280'
  }
}

export default function UpdateUserForm({ initialData }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: initialData?.email || '',
      password: initialData?.password || '',
      avatar: initialData?.avatar || '',
      username: initialData?.username || '',
      displayName: initialData?.displayName || '',
      role: initialData?.role || 'client',
      isActive: initialData?.isActive ?? true,
      isBlocked: initialData?.isBlocked ?? false
    },
    mode: 'onBlur'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { _id } = useParams()
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      const payload = {
        ...data,
        avatar: data.avatar.trim() ? data.avatar.trim() : null
      }
      await updateAdminUserApi({ userId: _id, userData: payload })
    } catch (error) {
      setIsSubmitting(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      elevation={0}
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        p: { xs: 2, md: 3 },
        backgroundColor: '#ffffff'
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3
        }}
      >
        <Box>
          <Typography
            sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}
          >
            Email
          </Typography>
          <TextField
            fullWidth
            label="Enter Email..."
            type="text"
            variant="outlined"
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
          <FieldErrorAlert errors={errors} fieldName="email" />
        </Box>

        <Box>
          <Typography
            sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}
          >
            Username
          </Typography>
          <TextField
            fullWidth
            label="Enter Username..."
            type="text"
            variant="outlined"
            error={!!errors.username}
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              }
            })}
            sx={inputSx}
          />
          <FieldErrorAlert errors={errors} fieldName="username" />
        </Box>

        <Box>
          <Typography
            sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}
          >
            Password
          </Typography>
          <TextField
            fullWidth
            label="Enter Password..."
            type="password"
            variant="outlined"
            error={!!errors.password}
            {...register('password', {
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            sx={inputSx}
          />
          <FieldErrorAlert errors={errors} fieldName="password" />
        </Box>

        <Box>
          <Typography
            sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}
          >
            Display Name
          </Typography>
          <TextField
            fullWidth
            label="Enter Display Name..."
            type="text"
            variant="outlined"
            error={!!errors.displayName}
            {...register('displayName', {
              required: 'Display name is required'
            })}
            sx={inputSx}
          />
          <FieldErrorAlert errors={errors} fieldName="displayName" />
        </Box>
      </Box>

      <Box
        sx={{
          mt: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 3
        }}
      >
        <Box>
          <Typography
            sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}
          >
            Role
          </Typography>

          <Controller
            name="role"
            control={control}
            rules={{ required: 'Role is required' }}
            render={({ field }) => (
              <>
                <FormControl fullWidth error={!!errors.role}>
                  <Select {...field} sx={selectSx}>
                    {roleOptions.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FieldErrorAlert errors={errors} fieldName="role" />
              </>
            )}
          />
        </Box>

        <Box>
          <Typography
            sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}
          >
            Active
          </Typography>

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select
                  value={field.value ? 'active' : 'inactive'}
                  onChange={(event) =>
                    field.onChange(event.target.value === 'active')
                  }
                  sx={selectSx}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Box>

        <Box>
          <Typography
            sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}
          >
            Block
          </Typography>

          <Controller
            name="isBlocked"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select {...field} sx={selectSx}>
                  <MenuItem value={false}>No Block</MenuItem>
                  <MenuItem value={true}>Block</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Box>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            minWidth: 120,
            height: 40,
            px: 2,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: '#ea6b3d',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#dc5f31',
              boxShadow: 'none'
            }
          }}
          disabled={isSubmitting}
        >
          Update User
        </Button>

        <Button
          type="button"
          variant="contained"
          onClick={() =>
            reset({
              email: initialData?.email || '',
              password: initialData?.password || '',
              avatar: initialData?.avatar || '',
              username: initialData?.username || '',
              displayName: initialData?.displayName || '',
              role: initialData?.role || 'CLIENT',
              isActive: initialData?.isActive ?? false
            })
          }
          sx={{
            minWidth: 100,
            height: 40,
            px: 2,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: '#5b5b5b',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#4b4b4b',
              boxShadow: 'none'
            }
          }}
        >
          Reset
        </Button>
      </Stack>
    </Paper>
  )
}

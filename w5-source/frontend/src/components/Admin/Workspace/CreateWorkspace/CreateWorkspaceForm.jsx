import React from 'react'
import {
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
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'

const ownerOptions = [
  { id: 'USR001', displayName: 'Nguyen Truong Phuc' },
  { id: 'USR002', displayName: 'System Admin' },
  { id: 'USR003', displayName: 'Content Editor' },
  { id: 'USR004', displayName: 'Workspace Manager' }
]

const defaultValues = {
  title: '',
  description: '',
  ownerId: '',
  status: 'active'
}

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

export default function CreateWorkspaceForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur'
  })

  const onSubmit = (data) => {
    console.log('Create Workspace Payload:', data)
  }

  return (
    <Paper
      component='form'
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
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Title
          </Typography>

          <TextField
            fullWidth
            label='Enter Title...'
            type='text'
            variant='outlined'
            error={!!errors.title}
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters'
              },
              maxLength: {
                value: 50,
                message: 'Title must not exceed 50 characters'
              }
            })}
            sx={inputSx}
          />
          <FieldErrorAlert errors={errors} fieldName='title' />
        </Box>

        <Box>
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Owner
          </Typography>

          <Controller
            name='ownerId'
            control={control}
            rules={{ required: 'Owner is required' }}
            render={({ field }) => (
              <>
                <FormControl fullWidth error={!!errors.ownerId}>
                  <Select {...field} displayEmpty sx={selectSx}>
                    <MenuItem value=''>Select Owner</MenuItem>
                    {ownerOptions.map((owner) => (
                      <MenuItem key={owner.id} value={owner.id}>
                        {owner.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FieldErrorAlert errors={errors} fieldName='ownerId' />
              </>
            )}
          />
        </Box>

        <Box>
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Status
          </Typography>

          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select {...field} sx={selectSx}>
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='inactive'>Inactive</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
          Description
        </Typography>

        <TextField
          fullWidth
          label='Enter Description...'
          multiline
          minRows={5}
          variant='outlined'
          error={!!errors.description}
          {...register('description', {
            maxLength: {
              value: 255,
              message: 'Description must not exceed 255 characters'
            }
          })}
          sx={inputSx}
        />
        <FieldErrorAlert errors={errors} fieldName='description' />
      </Box>

      <Stack direction='row' spacing={1.5} sx={{ mt: 3 }}>
        <Button
          type='submit'
          variant='contained'
          sx={{
            minWidth: 150,
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
        >
          Add Workspace
        </Button>

        <Button
          type='button'
          variant='contained'
          onClick={() => reset(defaultValues)}
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
          Clear
        </Button>
      </Stack>
    </Paper>
  )
}
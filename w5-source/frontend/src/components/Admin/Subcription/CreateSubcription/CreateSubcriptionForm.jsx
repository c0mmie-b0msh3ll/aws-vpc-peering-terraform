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

const workspaceOptions = [
  { id: 'WKS001', title: 'Main Workspace' },
  { id: 'WKS002', title: 'Marketing Workspace' },
  { id: 'WKS003', title: 'Design Workspace' }
]

const planOptions = [
  { id: 'PLAN001', title: 'Basic Plan' },
  { id: 'PLAN002', title: 'Standard Plan' },
  { id: 'PLAN003', title: 'Premium Plan' }
]

const defaultValues = {
  workspaceId: '',
  planId: '',
  planFeatureSnapshot: '',
  status: 'active',
  startAt: '',
  endAt: '',
  cancelAt: ''
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

export default function CreateSubscriptionForm() {
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
    console.log('Create Subscription Payload:', data)
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
            Workspace
          </Typography>

          <Controller
            name='workspaceId'
            control={control}
            rules={{ required: 'Workspace is required' }}
            render={({ field }) => (
              <>
                <FormControl fullWidth error={!!errors.workspaceId}>
                  <Select {...field} displayEmpty sx={selectSx}>
                    <MenuItem value=''>Select Workspace</MenuItem>
                    {workspaceOptions.map((workspace) => (
                      <MenuItem key={workspace.id} value={workspace.id}>
                        {workspace.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FieldErrorAlert errors={errors} fieldName='workspaceId' />
              </>
            )}
          />
        </Box>

        <Box>
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Plan
          </Typography>

          <Controller
            name='planId'
            control={control}
            rules={{ required: 'Plan is required' }}
            render={({ field }) => (
              <>
                <FormControl fullWidth error={!!errors.planId}>
                  <Select {...field} displayEmpty sx={selectSx}>
                    <MenuItem value=''>Select Plan</MenuItem>
                    {planOptions.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FieldErrorAlert errors={errors} fieldName='planId' />
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

        <Box>
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Start At
          </Typography>

          <TextField
            fullWidth
            type='date'
            error={!!errors.startAt}
            {...register('startAt', {
              required: 'Start date is required'
            })}
            sx={inputSx}
            InputLabelProps={{ shrink: true }}
          />
          <FieldErrorAlert errors={errors} fieldName='startAt' />
        </Box>

        <Box>
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            End At
          </Typography>

          <TextField
            fullWidth
            type='date'
            error={!!errors.endAt}
            {...register('endAt')}
            sx={inputSx}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box>
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Cancel At
          </Typography>

          <TextField
            fullWidth
            type='date'
            error={!!errors.cancelAt}
            {...register('cancelAt')}
            sx={inputSx}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
          Plan Feature Snapshot
        </Typography>

        <TextField
          fullWidth
          label='Enter Plan Feature Snapshot...'
          multiline
          minRows={4}
          variant='outlined'
          error={!!errors.planFeatureSnapshot}
          {...register('planFeatureSnapshot', {
            required: 'Plan feature snapshot is required'
          })}
          sx={inputSx}
        />
        <FieldErrorAlert errors={errors} fieldName='planFeatureSnapshot' />
      </Box>

      <Stack direction='row' spacing={1.5} sx={{ mt: 3 }}>
        <Button
          type='submit'
          variant='contained'
          sx={{
            minWidth: 160,
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
          Add Subscription
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
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

const workspaceOptions = [
  { id: 'WKS001', title: 'Main Workspace' },
  { id: 'WKS002', title: 'Marketing Workspace' },
  { id: 'WKS003', title: 'Design Workspace' }
]

const ownerOptions = [
  { id: 'USR001', displayName: 'Nguyen Truong Phuc' },
  { id: 'USR002', displayName: 'System Admin' },
  { id: 'USR003', displayName: 'Content Editor' }
]

const backgroundOptions = [
  {
    id: 'BG001',
    title: 'Ocean Blue',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
  },
  {
    id: 'BG002',
    title: 'Mountain View',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
  },
  {
    id: 'BG003',
    title: 'Dark Pattern',
    image: 'https://images.unsplash.com/photo-1511300636408-a63a89df3482'
  }
]

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

export default function UpdateBoardForm({ initialData }) {
  const [fileName, setFileName] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      workspaceId: initialData?.workspaceId || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      ownerId: initialData?.ownerId || '',
      visibility: initialData?.visibility || 'workspace',
      backgroundId: initialData?.backgroundId || '',
      type: initialData?.type || 'normal',
      cover: initialData?.cover || '',
      status: initialData?.status || 'active'
    },
    mode: 'onBlur'
  })

  const coverValue = watch('cover')
  const backgroundId = watch('backgroundId')
  const selectedBackground = backgroundOptions.find((item) => item.id === backgroundId)

  const onSubmit = (data) => {
    console.log('Update Board Payload:', data)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setValue('cover', previewUrl, { shouldValidate: true })
    setFileName(file.name)
  }

  const handleReset = () => {
    reset({
      workspaceId: initialData?.workspaceId || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      ownerId: initialData?.ownerId || '',
      visibility: initialData?.visibility || 'workspace',
      backgroundId: initialData?.backgroundId || '',
      type: initialData?.type || 'normal',
      cover: initialData?.cover || '',
      status: initialData?.status || 'active'
    })
    setFileName('')
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
            Title
          </Typography>

          <TextField
            fullWidth
            label='Enter Title...'
            type='text'
            variant='outlined'
            error={!!errors.title}
            {...register('title', {
              required: 'Title is required'
            })}
            sx={inputSx}
          />
          <FieldErrorAlert errors={errors} fieldName='title' />
        </Box>

        <Box>
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Visibility
          </Typography>

          <Controller
            name='visibility'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select {...field} sx={selectSx}>
                  <MenuItem value='workspace'>Workspace</MenuItem>
                  <MenuItem value='public'>Public</MenuItem>
                  <MenuItem value='private'>Private</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Box>

        <Box>
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Type
          </Typography>

          <Controller
            name='type'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select {...field} sx={selectSx}>
                  <MenuItem value='template'>Template</MenuItem>
                  <MenuItem value='normal'>Normal</MenuItem>
                </Select>
              </FormControl>
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

        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
          <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Background
          </Typography>

          <Controller
            name='backgroundId'
            control={control}
            rules={{ required: 'Background is required' }}
            render={({ field }) => (
              <>
                <FormControl fullWidth error={!!errors.backgroundId}>
                  <Select {...field} displayEmpty sx={selectSx}>
                    <MenuItem value=''>Select Background</MenuItem>
                    {backgroundOptions.map((background) => (
                      <MenuItem key={background.id} value={background.id}>
                        <Stack direction='row' spacing={1.5} alignItems='center'>
                          <Box
                            component='img'
                            src={background.image}
                            alt={background.title}
                            sx={{
                              width: 52,
                              height: 32,
                              borderRadius: '6px',
                              objectFit: 'cover'
                            }}
                          />
                          <Typography sx={{ fontSize: '14px' }}>{background.title}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FieldErrorAlert errors={errors} fieldName='backgroundId' />
              </>
            )}
          />

          {selectedBackground ? (
            <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mt: 1.5 }}>
              <Box
                component='img'
                src={selectedBackground.image}
                alt={selectedBackground.title}
                sx={{
                  width: 88,
                  height: 52,
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Typography sx={{ color: '#374151', fontSize: '14px' }}>
                {selectedBackground.title}
              </Typography>
            </Stack>
          ) : null}
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
          {...register('description')}
          sx={inputSx}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 600, color: '#111827' }}>
          Cover
        </Typography>

        <Stack direction='row' spacing={2} alignItems='center'>
          <Avatar
            variant='rounded'
            src={coverValue || ''}
            alt='Cover preview'
            sx={{
              width: 96,
              height: 56,
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              bgcolor: '#f3f4f6'
            }}
          />

          <Stack direction='column' spacing={1}>
            <Button
              component='label'
              variant='contained'
              startIcon={<CloudUploadIcon />}
              sx={{
                height: 40,
                px: 2,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#42a5f5',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1e88e5',
                  boxShadow: 'none'
                }
              }}
            >
              Upload Cover
              <VisuallyHiddenInput type='file' accept='image/*' onChange={handleFileChange} />
            </Button>

            {fileName ? (
              <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>
                {fileName}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Box>

      <Stack direction='row' spacing={1.5} sx={{ mt: 3 }}>
        <Button
          type='submit'
          variant='contained'
          sx={{
            minWidth: 140,
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
          Update Board
        </Button>

        <Button
          type='button'
          variant='contained'
          onClick={handleReset}
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
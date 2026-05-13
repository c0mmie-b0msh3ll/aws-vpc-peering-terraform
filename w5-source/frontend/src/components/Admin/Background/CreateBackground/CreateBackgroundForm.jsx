import { useState } from 'react'
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
import { styled } from '@mui/material/styles'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { createAdminBackgroundAPI } from '~/apis/adminBackground.api'

const defaultValues = {
  entity: 'board',
  title: '',
  image: '',
  status: true
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

const previewSx = {
  width: 96,
  height: 56,
  borderRadius: '8px',
  objectFit: 'cover',
  border: '1px solid #e5e7eb',
  backgroundColor: '#f3f4f6',
  display: 'block'
}

export default function CreateBackgroundForm() {
  const [fileName, setFileName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur'
  })

  const imageValue = watch('image')

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('entity', data.entity)
      formData.append('title', data.title)
      formData.append('status', data.status ? 'active' : 'inactive')

      if (selectedFile) {
        formData.append('file', selectedFile)
      }
      await createAdminBackgroundAPI({ backgroundData: formData })

      reset(defaultValues)
      setSelectedFile(null)
      setFileName('')
    } catch (error) {
      console.log(error);
    }
  }



  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setFileName(file.name)

    const previewUrl = URL.createObjectURL(file)
    setValue('image', previewUrl, { shouldValidate: true })
  }

  const handleClear = () => {
    reset(defaultValues)
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
            Entity
          </Typography>

          <Controller
            name='entity'
            control={control}
            rules={{
              required: 'Entity is required'
            }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.entity}>
                <Select
                  displayEmpty
                  value={field.value}
                  onChange={field.onChange}
                  sx={selectSx}
                >
                  <MenuItem value='board'>Board</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          <FieldErrorAlert errors={errors} fieldName='entity' />
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
            Status
          </Typography>

          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <Select
                  value={field.value ? 'active' : 'inactive'}
                  onChange={(event) => field.onChange(event.target.value === 'active')}
                  sx={selectSx}
                >
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
          Image
        </Typography>

        <Stack direction='row' spacing={2} alignItems='center'>
          <Box
            component='img'
            src={imageValue || 'https://via.placeholder.com/96x56?text=Image'}
            alt='Background preview'
            sx={previewSx}
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
              Upload Image
              <input hidden type="file" accept="image/*" onChange={handleFileChange} />
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
          Add Background
        </Button>

        <Button
          type='button'
          variant='contained'
          onClick={handleClear}
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
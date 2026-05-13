import { useEffect, useState } from 'react'
import Modal from '@mui/material/Modal'
import { useForm, Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Fade from '@mui/material/Fade'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'
import AbcIcon from '@mui/icons-material/Abc'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import PublicIcon from '@mui/icons-material/Public'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined'
import { FIELD_REQUIRED_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { backgroundBoardList } from '~/constant/backgroundBoard'
import PopoverBoardColor from './PopoverBoardColor'
import CheckIcon from '@mui/icons-material/Check'
import { fetchBackgroundAPI } from '~/apis/board.api'

const type = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  WORKSPACE: 'workspace'
}

const descriptionType = {
  PUBLIC:
    'Anyone on the internet can see this board. Only board members can edit.',
  PRIVATE:
    'Board members and Trello Workspace admins can see and edit this board.',
  WORKSPACE: 'All members of the Trello Workspace can see and edit this board.'
}

const alertConfig = {
  [type.PUBLIC]: {
    severity: 'warning',
    text: descriptionType.PUBLIC
  },
  [type.PRIVATE]: {
    severity: 'info',
    text: descriptionType.PRIVATE
  },
  [type.WORKSPACE]: {
    severity: 'success',
    text: descriptionType.WORKSPACE
  }
}

const visibilityOptions = [
  {
    value: type.PUBLIC,
    label: 'Public',
    icon: <PublicIcon fontSize="small" />,
    color: 'warning.main'
  },
  {
    value: type.PRIVATE,
    label: 'Private',
    icon: <LockOutlinedIcon fontSize="small" />,
    color: 'info.main'
  },
  {
    value: type.WORKSPACE,
    label: 'Workspace',
    icon: <Groups2OutlinedIcon fontSize="small" />,
    color: 'success.main'
  }
]

function CreateBoardModal({ ui, handler }) {
  const [background, setBackground] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedBackground, setSelectedBackground] = useState(null)

  const { handleClose, handleCreateBoard, isSubmitting } = handler
  const { isOpen } = ui

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      visibility: type.PRIVATE,
      cover: {
        type: 'image',
        value: ''
      }
    }
  })

  useEffect(() => {
    if (!isOpen) return

    const onGetData = async () => {
      try {
        const backgrounds = await fetchBackgroundAPI()

        setBackground(backgrounds)

        const firstBackground = backgrounds?.[0] || null

        reset({
          title: '',
          description: '',
          visibility: type.PRIVATE,
          cover: {
            type: 'image',
            value: firstBackground?.image || ''
          }
        })

        setSelectedBackground(firstBackground)
      } catch (error) {
        console.log(error)
        setBackground([])
        setSelectedBackground(null)

        reset({
          title: '',
          description: '',
          visibility: type.PRIVATE,
          cover: {
            type: 'image',
            value: ''
          }
        })
      }
    }

    onGetData()
  }, [isOpen, reset])

  const modalConfig = {
    'aria-labelledby': 'create-board-modal-title',
    closeAfterTransition: true,
    slots: { backdrop: Backdrop },
    slotProps: {
      backdrop: {
        timeout: 400
      }
    }
  }

  const handleOpenBackgroundPopover = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseBackgroundPopover = () => {
    setAnchorEl(null)
  }

  const openBackgroundPopover = Boolean(anchorEl)

  const handleSelectBackground = (item, coverType) => {
    setSelectedBackground(item)

    if (coverType === 'image') {
      setValue(
        'cover',
        {
          type: 'image',
          value: item.image
        },
        { shouldDirty: true, shouldValidate: true }
      )
    } else {
      setValue(
        'cover',
        {
          type: 'color',
          value: item.key
        },
        { shouldDirty: true, shouldValidate: true }
      )
    }

    handleCloseBackgroundPopover()
  }

  const onSubmit = (data) => {
    handleCreateBoard(data)
  }

  return (
    <Modal open={isOpen} onClose={handleClose} {...modalConfig}>
      <Fade in={isOpen}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '92%', sm: 640 },
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 4,
            bgcolor: 'background.paper',
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            outline: 'none'
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography
                id="create-board-modal-title"
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                Create board
              </Typography>
            </Box>

            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                width: '100%',
                height: 150,
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                mb: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box
                component="img"
                src={
                  selectedBackground?.image ||
                  'https://images.unsplash.com/photo-1742156345582-b857d994c84e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'
                }
                alt={selectedBackground?.title || 'board-background'}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.55) 100%)'
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  component="img"
                  src="https://trello.com/assets/14cda5dc635d1f13bc48.svg"
                  sx={{
                    width: 220,
                    filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.18))'
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Typography mb={2} sx={{ fontWeight: 600 }}>
                Background
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1.3,
                  flexWrap: 'nowrap'
                }}
              >
                {background.slice(0, 6).map((item) => {
                  const isSelected = selectedBackground?._id === item._id

                  return (
                    <Box
                      key={item._id}
                      sx={{
                        position: 'relative',
                        width: 90,
                        height: 50,
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelectBackground(item, 'image')}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 2,
                          display: 'block',
                          border: '2px solid',
                          borderColor: isSelected
                            ? 'primary.main'
                            : 'transparent'
                        }}
                      />

                      {isSelected && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 2
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 16 }} />
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </Box>
            </Box>

            <Box mt={1}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'nowrap',
                  justifyContent: 'space-between'
                }}
              >
                {backgroundBoardList.slice(0, 5).map((item) => {
                  const isSelected =
                    selectedBackground?.key === item.key ||
                    selectedBackground?.image === item.src

                  return (
                    <Box
                      key={item.key}
                      sx={{
                        position: 'relative',
                        width: 90,
                        height: 50,
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelectBackground(item, 'color')}
                    >
                      <Box
                        component="img"
                        src={item.src}
                        alt={item.key}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 2,
                          display: 'block',
                          border: '2px solid',
                          borderColor: isSelected
                            ? 'primary.main'
                            : 'transparent'
                        }}
                      />

                      {isSelected && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 2
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 16 }} />
                        </Box>
                      )}
                    </Box>
                  )
                })}

                <Box
                  onClick={handleOpenBackgroundPopover}
                  sx={{
                    width: 90,
                    height: 50,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    bgcolor: 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                >
                  <MoreHorizIcon />
                </Box>
              </Box>

              <PopoverBoardColor
                handleCloseBackgroundPopover={handleCloseBackgroundPopover}
                handleSelectBackground={handleSelectBackground}
                anchorEl={anchorEl}
                selectedBackground={selectedBackground}
                openBackgroundPopover={openBackgroundPopover}
                imagesBackground={background}
              />
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                mt={4}
              >
                <Box>
                  <TextField
                    fullWidth
                    label="Title"
                    placeholder="Enter board title..."
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AbcIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    {...register('title', {
                      required: FIELD_REQUIRED_MESSAGE,
                      minLength: {
                        value: 1,
                        message: 'Min Length is 1 characters'
                      },
                      maxLength: {
                        value: 200,
                        message: 'Max Length is 200 characters'
                      }
                    })}
                    error={!!errors.title}
                  />
                  <FieldErrorAlert errors={errors} fieldName="title" />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Description"
                    placeholder="Write a short description for this board..."
                    rows={3}
                    multiline
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{ alignSelf: 'flex-start', mt: 1.2 }}
                        >
                          <DescriptionOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    {...register('description', {
                      maxLength: {
                        value: 4000,
                        message: 'Max Length is 4000 characters'
                      }
                    })}
                    error={!!errors.description}
                  />
                  <FieldErrorAlert errors={errors} fieldName="description" />
                </Box>

                <Controller
                  name="visibility"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1.25,
                          fontWeight: 700,
                          color: 'text.primary'
                        }}
                      >
                        Visibility
                      </Typography>

                      <RadioGroup
                        row
                        {...field}
                        value={field.value}
                        onChange={(_, value) => field.onChange(value)}
                        sx={{
                          gap: 1.5,
                          flexWrap: 'wrap'
                        }}
                      >
                        {visibilityOptions.map((item) => {
                          const selected = field.value === item.value

                          return (
                            <FormControlLabel
                              key={item.value}
                              value={item.value}
                              control={<Radio size="small" />}
                              label={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: selected
                                        ? 'action.selected'
                                        : 'action.hover',
                                      color: selected
                                        ? item.color
                                        : 'text.secondary'
                                    }}
                                  >
                                    {item.icon}
                                  </Box>
                                  <Typography sx={{ fontWeight: 600 }}>
                                    {item.label}
                                  </Typography>
                                </Box>
                              }
                              sx={{
                                m: 0,
                                height: 50,
                                minWidth: 170,
                                flex: '1 1 170px',
                                px: 1.5,
                                py: 1.2,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: selected ? item.color : 'divider',
                                bgcolor: selected
                                  ? 'action.selected'
                                  : 'background.paper',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'action.hover'
                                }
                              }}
                            />
                          )
                        })}
                      </RadioGroup>

                      {field.value && (
                        <Alert
                          severity={alertConfig[field.value].severity}
                          sx={{
                            mt: 2,
                            borderRadius: 2.5
                          }}
                        >
                          {alertConfig[field.value].text}
                        </Alert>
                      )}
                    </Box>
                  )}
                />

                <Divider />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1.5,
                    pt: 1
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleClose}
                    sx={{
                      minWidth: 110,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      minWidth: 130,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      boxShadow: 'none'
                    }}
                  >
                    Create board
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default CreateBoardModal

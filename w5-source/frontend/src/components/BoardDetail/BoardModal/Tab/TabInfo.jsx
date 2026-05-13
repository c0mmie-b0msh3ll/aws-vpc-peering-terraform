import { Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { FIELD_REQUIRED_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import AbcIcon from '@mui/icons-material/Abc'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import Button from '@mui/material/Button'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import { useBoardInfo } from '~/hooks/boardInfo.hook'
import { Alert } from '@mui/material'
import Typography from '@mui/material/Typography'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { backgroundBoardList } from '~/constant/backgroundBoard'
import PopoverBoardColor from '~/components/Board/PopoverBoardColor'
import { useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'

function TabInfo() {
  const {
    register,
    handleSubmit,
    onSubmit,
    type,
    errors,
    control,
    alert,
    descriptionType,
    setValue,
    setSelectedBackground,
    selectedBackground,
    board,
    backgrounds
  } = useBoardInfo()

  const visibilityAlertConfig = {
    [type.PUBLIC]: {
      severity: 'warning',
      message: descriptionType.PUBLIC
    },
    [type.PRIVATE]: {
      severity: 'info',
      message: descriptionType.PRIVATE
    },
    [type.WORKSPACE]: {
      severity: 'success',
      message: descriptionType.WORKSPACE
    }
  }

  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpenBackgroundPopover = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseBackgroundPopover = () => {
    setAnchorEl(null)
  }

  const openBackgroundPopover = Boolean(anchorEl)

  const handleSelectBackground = (item, coverType) => {
    const nextSelectedBackground = { ...item, type: coverType }

    setSelectedBackground(nextSelectedBackground)
    setValue('cover', {
      type: coverType,
      value: coverType === 'image' ? item.image : item._id
    })
    handleCloseBackgroundPopover()
  }

  const currentCoverType = selectedBackground?.type || board?.cover?.type
  const currentCoverValue = selectedBackground?.type
    ? selectedBackground.type === 'image'
      ? selectedBackground.image
      : selectedBackground._id
    : board?.cover?.value

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxHeight: '75vh',
          overflowY: 'auto',
          pr: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: (theme) => `${theme.palette.grey[600]} transparent`,
          '&::-webkit-scrollbar': {
            width: 8
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.22)',
            borderRadius: 999
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(255,255,255,0.32)'
          }
        }}
      >
        {alert.open && <Alert severity={alert.severity}>{alert.message}</Alert>}

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            type="text"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AbcIcon fontSize="small" />
                </InputAdornment>
              )
            }}
            {...register('title', {
              required: FIELD_REQUIRED_MESSAGE
            })}
            error={!!errors.title}
          />
          <FieldErrorAlert errors={errors} fieldName="title" />
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Description"
            rows={2}
            type="text"
            variant="outlined"
            multiline
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionOutlinedIcon fontSize="small" />
                </InputAdornment>
              )
            }}
            {...register('description')}
          />
          <FieldErrorAlert errors={errors} fieldName="description" />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ mb: 0.5, fontWeight: 600 }}>Background</Typography>

          <Box
            sx={{
              width: '100%',
              height: 190,
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              mb: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box
              component="img"
              src={
                selectedBackground?.image ||
                board?.cover?.value ||
                'https://images.unsplash.com/photo-1742156345582-b857d994c84e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'
              }
              alt={selectedBackground?.key || 'board-background'}
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
                  width: 260,
                  filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.18))'
                }}
              />
            </Box>
          </Box>

          <Box mt={3} mb={3}>
            <Typography mb={0.5}>Images</Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: 1
              }}
            >
              {backgrounds.slice(0, 6).map((item) => {
                const isSelected =
                  currentCoverType === 'image' &&
                  currentCoverValue === item.image

                return (
                  <Box
                    key={item.key}
                    sx={{
                      position: 'relative',
                      width: 135,
                      height: 80,
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSelectBackground(item, 'image')}
                  >
                    <Box
                      component="img"
                      src={item.image}
                      alt={item._id}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 2,
                        display: 'block',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'transparent'
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

          <Box mt={3}>
            <Typography mb={0.5}>Colors</Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: 1.5
              }}
            >
              {backgroundBoardList.slice(0, 5).map((item) => {
                const isSelected =
                  currentCoverType === 'color' && currentCoverValue === item.key

                return (
                  <Box
                    key={item.key}
                    sx={{
                      position: 'relative',
                      width: 135,
                      height: 80,
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
                        borderColor: isSelected ? 'primary.main' : 'transparent'
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
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: 'action.hover',
                  border: '2px solid transparent',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <MoreHorizIcon />
              </Box>
            </Box>
          </Box>

          <PopoverBoardColor
            handleCloseBackgroundPopover={handleCloseBackgroundPopover}
            handleSelectBackground={handleSelectBackground}
            anchorEl={anchorEl}
            selectedBackground={selectedBackground}
            openBackgroundPopover={openBackgroundPopover}
            imagesBackground={backgrounds}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ mb: 0.5, fontWeight: 600 }}>Visibility</Typography>
          <Controller
            name="visibility"
            control={control}
            render={({ field }) => (
              <Box>
                <RadioGroup
                  row
                  {...field}
                  onChange={(event, value) => field.onChange(value)}
                  value={field.value}
                  sx={{
                    gap: 2,
                    flexWrap: 'wrap'
                  }}
                >
                  <FormControlLabel
                    value={type.PUBLIC}
                    control={<Radio size="small" />}
                    label="Public"
                    sx={{
                      m: 0,
                      p: 0,
                      borderColor:
                        field.value === type.PUBLIC
                          ? 'warning.main'
                          : 'divider',
                      minWidth: 140
                    }}
                  />

                  <FormControlLabel
                    value={type.PRIVATE}
                    control={<Radio size="small" />}
                    label="Private"
                    sx={{
                      m: 0,
                      p: 0,
                      borderColor:
                        field.value === type.PRIVATE ? 'info.main' : 'divider',
                      minWidth: 140
                    }}
                  />

                  <FormControlLabel
                    value={type.WORKSPACE}
                    control={<Radio size="small" />}
                    label="Workspace"
                    sx={{
                      m: 0,
                      p: 0,
                      borderColor:
                        field.value === type.WORKSPACE
                          ? 'success.main'
                          : 'divider',
                      minWidth: 140
                    }}
                  />
                </RadioGroup>

                {field.value && (
                  <Alert
                    severity={visibilityAlertConfig[field.value]?.severity}
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    {visibilityAlertConfig[field.value]?.message}
                  </Alert>
                )}
              </Box>
            )}
          />
        </Box>

        <Box sx={{ alignSelf: 'flex-end', mt: 3 }}>
          <Button
            className="interceptor-loading"
            type="submit"
            variant="contained"
            color="primary"
          >
            Save Change
          </Button>
        </Box>
      </Box>
    </form>
  )
}

export default TabInfo

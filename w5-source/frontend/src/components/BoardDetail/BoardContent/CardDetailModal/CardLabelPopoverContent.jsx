import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { BOARD_LABEL_COLORS } from '~/constant/labelBackgroundColor'

function CardLabelPopoverContent({
  anchorEl,
  isOpen,
  labelIds = [],
  handler,
  showCheckBox
}) {
  const labels = useSelector((state) => state.activeBoard?.labels || [])
  const [searchValue, setSearchValue] = useState('')

  const { handleClose, handleUpdateCardLabel, handleOpenForm } = handler

  const selectedLabelIds = useMemo(() => {
    return new Set((labelIds || []).map((id) => String(id)))
  }, [labelIds])

  const filteredLabels = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()
    if (!keyword) return labels

    return labels.filter((label) => {
      const title = (label?.title || label?.name || '').toLowerCase()
      const color = (label?.color || '').toLowerCase()
      return title.includes(keyword) || color.includes(keyword)
    })
  }, [labels, searchValue])

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            mt: 1,
            width: 362,
            maxWidth: 'calc(100vw - 24px)',
            borderRadius: 3,
            overflow: 'hidden',
            color: theme.palette.mode === 'dark' ? '#f1f2f4' : '#172b4d',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 28px rgba(0,0,0,0.45)'
                : '0 12px 28px rgba(9,30,66,0.18)'
          })
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Labels</Typography>

          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search labels..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18 }} />
              </InputAdornment>
            )
          }}
        />

        <Typography
          sx={(theme) => ({
            fontSize: 13,
            fontWeight: 700,
            mb: 1.25,
            color: theme.palette.mode === 'dark' ? '#b6c2cf' : '#44546f'
          })}
        >
          Labels
        </Typography>

        <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
          {filteredLabels.map((label) => {
            const isChecked = selectedLabelIds.has(String(label._id))
            const colorConfig =
              BOARD_LABEL_COLORS[label.color] || BOARD_LABEL_COLORS.none
            const labelTitle = label?.title || ''

            return (
              <Box
                key={label._id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1
                }}
              >
                {showCheckBox && (
                  <Checkbox
                    checked={isChecked}
                    onChange={() => handleUpdateCardLabel(label)}
                    sx={{
                      p: 0.5,
                      ml: -0.5
                    }}
                  />
                )}

                <Box
                  onClick={() => handleUpdateCardLabel(label)}
                  sx={(theme) => ({
                    flex: 1,
                    height: 40,
                    width: '70%',
                    px: 2,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    bgcolor: colorConfig[theme.palette.mode],
                    color: label.color === 'yellow' ? '#172b4d' : '#ffffff',
                    fontSize: 14,
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      opacity: 0.92
                    }
                  })}
                >
                  {labelTitle}
                </Box>

                <IconButton
                  size="small"
                  onClick={() => handleOpenForm(label, 'update')}
                  sx={(theme) => ({
                    color:
                      theme.palette.mode === 'dark' ? '#b6c2cf' : '#44546f',
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(9,30,66,0.06)'
                    }
                  })}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            )
          })}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Button
          onClick={() => handleOpenForm(null, 'create')}
          fullWidth
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 1.5,
            mb: 1,
            boxShadow: 'none'
          }}
        >
          Create a new label
        </Button>
      </Box>
    </Popover>
  )
}

export default CardLabelPopoverContent

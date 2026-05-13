import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

function CardDatesPopoverContent({
  open,
  anchorEl,
  onClose,
  startedAt = null,
  dueAt = null,
  handleUpdate
}) {
  const [startDate, setStartDate] = useState(
    startedAt ? dayjs(startedAt) : null
  )
  const [dueDate, setDueDate] = useState(dueAt ? dayjs(dueAt) : null)

  useEffect(() => {
    setStartDate(startedAt ? dayjs(startedAt) : null)
  }, [startedAt])

  useEffect(() => {
    setDueDate(dueAt ? dayjs(dueAt) : null)
  }, [dueAt])

  const handleSave = async () => {
    await handleUpdate?.({
      startedAt: startDate ? startDate.toISOString() : null,
      dueAt: dueDate ? dueDate.toISOString() : null
    })
    onClose?.()
  }

  const handleRemoveDates = async () => {
    setStartDate(null)
    setDueDate(null)

    await handleUpdate?.({
      startedAt: null,
      dueAt: null
    })

    onClose?.()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 340,
            p: 2,
            borderRadius: 3
          }
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
          Dates
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <DatePicker
            label="Start date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true
              }
            }}
          />

          <DatePicker
            label="Due date"
            value={dueDate}
            onChange={(newValue) => setDueDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true
              }
            }}
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="text"
              color="inherit"
              onClick={handleRemoveDates}
              sx={{ textTransform: 'none' }}
            >
              Remove dates
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ textTransform: 'none' }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </LocalizationProvider>
  )
}

export default CardDatesPopoverContent

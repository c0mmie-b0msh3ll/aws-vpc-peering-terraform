import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

function ChecklistDueDatePopover({
  open,
  anchorEl,
  onClose,
  onDone,
  value,
  onChange,
  onClear
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 320,
            p: 2,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 28px rgba(0,0,0,0.45)'
                : '0 12px 28px rgba(9,30,66,0.18)'
          }
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
          Due date
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <DatePicker
            label="Due date"
            value={value}
            onChange={onChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small'
              }
            }}
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="text"
              color="inherit"
              onClick={onClear}
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>

            <Button
              variant="contained"
              onClick={onDone || onClose}
              sx={{ textTransform: 'none' }}
            >
              Done
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </LocalizationProvider>
  )
}

export default ChecklistDueDatePopover

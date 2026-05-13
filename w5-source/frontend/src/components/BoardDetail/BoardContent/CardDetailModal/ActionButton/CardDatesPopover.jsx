import { useState } from 'react'
import Button from '@mui/material/Button'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { cardDetailActionButtonSx } from '~/config/cardDetailButtonConfig'
import CardDatesPopoverContent from '~/components/Card/CardDatesPopoverContent'

function CardDatesPopover({ startedAt = null, dueAt = null, handleUpdate }) {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AccessTimeOutlinedIcon fontSize="small" />}
        sx={cardDetailActionButtonSx}
        onClick={handleOpen}
      >
        Dates
      </Button>

      <CardDatesPopoverContent
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        startedAt={startedAt}
        dueAt={dueAt}
        handleUpdate={handleUpdate}
      />
    </>
  )
}

export default CardDatesPopover

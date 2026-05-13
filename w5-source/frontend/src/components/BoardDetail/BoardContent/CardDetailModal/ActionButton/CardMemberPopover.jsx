import { useState } from 'react'
import Button from '@mui/material/Button'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import { cardDetailActionButtonSx } from '~/config/cardDetailButtonConfig'
import CardMemberPopoverContent from '../CardMemberPopoverContent'

function CardMemberPopover({ memberIds, handler }) {
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
        startIcon={<PersonAddAltOutlinedIcon fontSize="small" />}
        sx={cardDetailActionButtonSx}
        onClick={handleOpen}
      >
        Members
      </Button>

      <CardMemberPopoverContent
        anchorEl={anchorEl}
        isOpen={Boolean(anchorEl)}
        memberIds={memberIds}
        handler={{ ...handler, handleClose: handleClose }}
      />
    </>
  )
}

export default CardMemberPopover

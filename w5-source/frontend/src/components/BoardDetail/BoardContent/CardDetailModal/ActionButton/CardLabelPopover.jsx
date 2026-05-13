import { useState } from 'react'
import Button from '@mui/material/Button'
import { cardDetailActionButtonSx } from '~/config/cardDetailButtonConfig'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import CardLabelPopoverContent from '../CardLabelPopoverContent'
import EditLabelPopoverContent from '../EditLabelPopoverContent'
import { useLabel } from '~/hooks/label.hook'

function CardLabelPopover({ labelIds, handleUpdateCardLabel }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [action, setAction] = useState(null)

  const handleOpenList = (event) => {
    setAnchorEl(event.currentTarget)
    setIsOpenList(true)
  }

  const handleCloseList = () => {
    setAnchorEl(null)
    setIsOpenList(false)
  }

  const handleOpenForm = (label, action) => {
    setSelectedLabel(action === 'update' ? label : null)
    setIsOpenList(false)
    setIsOpenForm(true)
    setAction(action)
  }

  const handleCloseForm = () => {
    setAnchorEl(null)
    setSelectedLabel(null)
    setIsOpenList(false)
    setIsOpenForm(false)
    setAction(null)
  }

  const handleBack = () => {
    setIsOpenForm(false)
    setIsOpenList(true)
    setSelectedLabel(false)
  }

  const [selectedLabel, setSelectedLabel] = useState(null)
  const [isOpenForm, setIsOpenForm] = useState(false)
  const [isOpenList, setIsOpenList] = useState(false)

  const { handleCreateLabel, handleUpdateLabel, handleDeleteLabel } = useLabel()

  return (
    <>
      <Button
        onClick={handleOpenList}
        variant="outlined"
        startIcon={<LocalOfferOutlinedIcon fontSize="small" />}
        sx={cardDetailActionButtonSx}
      >
        Labels
      </Button>

      <CardLabelPopoverContent
        anchorEl={anchorEl}
        isOpen={isOpenList && Boolean(anchorEl)}
        labelIds={labelIds || []}
        handler={{
          handleOpenForm,
          handleClose: handleCloseList,
          handleUpdateCardLabel
        }}
        showCheckBox={true}
      />

      <EditLabelPopoverContent
        action={action}
        anchorEl={anchorEl}
        open={isOpenForm && Boolean(anchorEl)}
        onClose={handleCloseForm}
        onBack={handleBack}
        label={selectedLabel}
        onSave={action === 'update' ? handleUpdateLabel : handleCreateLabel}
        onDelete={handleDeleteLabel}
      />
    </>
  )
}

export default CardLabelPopover

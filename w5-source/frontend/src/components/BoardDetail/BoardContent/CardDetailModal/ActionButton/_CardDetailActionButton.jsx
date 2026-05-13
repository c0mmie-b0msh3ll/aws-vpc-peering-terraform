import AttachmentOutlinedIcon from '@mui/icons-material/AttachmentOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardDatesPopover from './CardDatesPopover'
import CardChecklistPopover from './CardChecklistPopover'
import CardMemberPopover from './CardMemberPopover'
import CardLabelPopover from './CardLabelPopover'
import CardAIAssistPopover from './CardAIAssistPopover'
import { useEffect, useRef } from 'react'

const cardDetailActionButtonSx = {
  textTransform: 'none',
  minWidth: 'fit-content',
  px: 1.5,
  py: 0.75,
  borderRadius: 1.5,
  color: 'text.secondary',
  borderColor: (theme) =>
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(9,30,66,0.14)',
  bgcolor: 'transparent',
  '&:hover': {
    borderColor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.2)'
        : 'rgba(9,30,66,0.25)',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(9,30,66,0.04)'
  }
}

function CardDetailActionButton({ data, handler, activeCard }) {
  const { dates, memberIds, labelIds } = data
  const {
    handleUpdateCardDates,
    handleCreateChecklist,
    handleAssignMemberToCard,
    handleRemoveMemberFromCard,
    handleUploadFiles,
    handleUpdateCardLabel,
    handleGenerateAIAssist,
    handleApplyAIAssist
  } = handler

  const activeCardRef = useRef(activeCard)
  useEffect(() => {
    activeCardRef.current = activeCard
  }, [activeCard])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap'
      }}
    >
      <CardLabelPopover
        labelIds={labelIds}
        handleUpdateCardLabel={handleUpdateCardLabel}
      />

      <CardDatesPopover
        startedAt={dates?.startedAt}
        dueAt={dates?.dueAt}
        handleUpdate={handleUpdateCardDates}
      />

      <CardChecklistPopover handleCreate={handleCreateChecklist} />

      <CardMemberPopover
        memberIds={memberIds}
        handler={{ handleAssignMemberToCard, handleRemoveMemberFromCard }}
      />

      <Button
        variant="outlined"
        startIcon={<AttachmentOutlinedIcon fontSize="small" />}
        sx={cardDetailActionButtonSx}
        component="label"
      >
        Attachment
        <input hidden type="file" multiple onChange={handleUploadFiles} />
      </Button>

      <CardAIAssistPopover
        handleGenerate={(userPrompt) =>
          handleGenerateAIAssist(activeCardRef.current, userPrompt)
        }
        handleApply={(payload) =>
          handleApplyAIAssist(payload, activeCardRef.current)
        }
      />
    </Box>
  )
}
export default CardDetailActionButton

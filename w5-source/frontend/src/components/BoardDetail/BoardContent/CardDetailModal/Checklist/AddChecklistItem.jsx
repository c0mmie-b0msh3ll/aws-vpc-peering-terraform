import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import ChecklistDueDatePopover from './ChecklistDueDatePopover'
import TaskMemberPopoverContent from '../TaskMemberPopoverContent'
import { useSelector } from 'react-redux'

function AddChecklistItem({ parentId, handleCreate }) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dueDate, setDueDate] = useState(null)
  const [memberId, setMemberId] = useState(null)
  const [dueAnchorEl, setDueAnchorEl] = useState(null)
  const [memberAnchorEl, setMemberAnchorEl] = useState(null)

  const inputRef = useRef(null)

  const handleOpen = () => setIsAdding(true)

  const handleCancel = () => {
    if (isSubmitting) return
    setTitle('')
    setDueDate(null)
    setIsAdding(false)
    setDueAnchorEl(null)
  }

  const handleOpenDuePopover = (event) => setDueAnchorEl(event.currentTarget)

  const handleCloseDuePopover = () => setDueAnchorEl(null)

  const handleOpenMemberPopover = (event) =>
    setMemberAnchorEl(event.currentTarget)

  const handleCloseMemberPopover = () => setMemberAnchorEl(null)

  const onCreate = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle || isSubmitting) return

    try {
      setIsSubmitting(true)
      await handleCreate?.({
        content: trimmedTitle,
        parentTaskId: parentId,
        dueAt: dueDate ? dueDate.toISOString() : null,
        memberId: memberId || null
      })
      setTitle('')
      setDueAnchorEl(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const boardMember = useSelector((state) => state.activeBoard.members)

  const displayName = boardMember.find((m) => m._id === memberId)?.user
    .displayName

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: 2 }}>
        <Collapse in={!isAdding} mountOnEnter unmountOnExit timeout={180}>
          <Button
            variant="outlined"
            onClick={handleOpen}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              minWidth: 110,
              px: 2
            }}
          >
            Add an item
          </Button>
        </Collapse>

        <Collapse
          in={isAdding}
          mountOnEnter
          unmountOnExit
          timeout={180}
          onEntered={() => inputRef.current?.focus()}
        >
          <Box sx={{ mt: 1 }}>
            <TextField
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onCreate()
                }
              }}
              fullWidth
              multiline
              minRows={2}
              maxRows={5}
              placeholder="Add an item"
              inputRef={inputRef}
              value={title}
              disabled={isSubmitting}
              onChange={(e) => setTitle(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <Box
              sx={{
                mt: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={onCreate}
                  disabled={!title.trim() || isSubmitting}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2.5
                  }}
                >
                  Add
                </Button>

                <Button
                  variant="text"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  sx={{
                    textTransform: 'none',
                    color: 'text.primary'
                  }}
                >
                  Cancel
                </Button>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="text"
                  startIcon={<PersonAddAltOutlinedIcon />}
                  onClick={handleOpenMemberPopover}
                  sx={(theme) => ({
                    textTransform: 'none',
                    color: 'text.secondary',
                    borderRadius: 2,
                    px: 1.25,
                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(9,30,66,0.08)'
                    }
                  })}
                >
                  {memberId ? displayName : 'Assign'}
                </Button>

                <Button
                  variant="text"
                  startIcon={<AccessTimeOutlinedIcon />}
                  onClick={handleOpenDuePopover}
                  sx={(theme) => ({
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 1.25,
                    color: dueDate ? 'info.main' : 'text.secondary',
                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(9,30,66,0.08)'
                    }
                  })}
                >
                  {dueDate ? dayjs(dueDate).format('MMM D') : 'Due date'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Collapse>

        <TaskMemberPopoverContent
          open={Boolean(memberAnchorEl)}
          anchorEl={memberAnchorEl}
          value={memberId}
          onClose={handleCloseMemberPopover}
          onChange={(newValue) => setMemberId(newValue)}
          onClear={() => setMemberId(null)}
        />

        <ChecklistDueDatePopover
          open={Boolean(dueAnchorEl)}
          anchorEl={dueAnchorEl}
          onClose={handleCloseDuePopover}
          value={dueDate}
          onChange={(newValue) => setDueDate(newValue)}
          onClear={() => setDueDate(null)}
        />
      </Box>
    </LocalizationProvider>
  )
}

export default AddChecklistItem

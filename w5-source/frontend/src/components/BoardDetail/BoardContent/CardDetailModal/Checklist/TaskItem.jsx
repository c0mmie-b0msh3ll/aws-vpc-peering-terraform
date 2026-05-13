import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import ChecklistDueDatePopover from './ChecklistDueDatePopover'
import { useSelector } from 'react-redux'
import { Avatar, Tooltip } from '@mui/material'
import TaskMemberPopoverContent from '../TaskMemberPopoverContent'

function TaskItem({ task, handler }) {
  const {
    handleUpdateTaskContent,
    handleUpdateTaskIsCompleted,
    handleUpdateTaskDueAt,
    handleDeleteTask,
    handleUpdateTaskMember
  } = handler

  const [dueAnchorEl, setDueAnchorEl] = useState(null)
  const [memberAnchorEl, setMemberAnchorEl] = useState(null)
  const [selectedDueDate, setSelectedDueDate] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)

  const handleOpenDuePopover = (event, item) => {
    setDueAnchorEl(event.currentTarget)
    setSelectedDueDate(item?.dueAt ? dayjs(item.dueAt) : null)
  }

  const handleCloseDuePopover = () => {
    setDueAnchorEl(null)
    setSelectedDueDate(null)
  }

  const handleOpenMemberPopover = (event) => {
    setMemberAnchorEl(event.currentTarget)
    setSelectedMember(task?.memberId)
  }

  const handleCloseMemberPopover = () => {
    setMemberAnchorEl(null)
    setSelectedMember(null)
  }

  const handleSaveDuePopover = async () => {
    if (!task) return

    await handleUpdateTaskDueAt?.({
      _id: task._id,
      dueAt: selectedDueDate ? selectedDueDate.toISOString() : null
    })

    handleCloseDuePopover()
  }

  const handleUpdateMember = async (newValue) => {
    setSelectedMember(newValue)
    await handleUpdateTaskMember({ _id: task._id, memberId: newValue })
  }

  const getDueStatus = (item) => {
    if (item.isCompleted) return 'success'
    if (!item.dueAt) return null

    const now = dayjs()
    const due = dayjs(item.dueAt)

    if (due.isBefore(now, 'day')) return 'error'
    if (due.isSame(now, 'day')) return 'warning'

    return 'info'
  }

  const boardMember = useSelector((state) => state.activeBoard.members)

  const member = boardMember.find((m) => m._id === task.memberId)

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Paper
          key={task._id}
          elevation={0}
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0.75,
            borderRadius: 2,
            border: '1px solid',
            borderColor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.1)
                : theme.palette.grey[200],
            bgcolor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.03)
                : theme.palette.grey[50],
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.06)
                  : theme.palette.grey[100]
            }
          })}
        >
          <Checkbox
            onClick={() =>
              handleUpdateTaskIsCompleted({
                _id: task._id,
                isCompleted: !task.isCompleted
              })
            }
            checked={task.isCompleted}
            size="small"
          />

          <ToggleFocusInput
            value={task.content}
            inputFontSize={15}
            color={task.completed ? 'text.secondary' : 'text.primary'}
            fontWeight={400}
            onChangedValue={(newValue) =>
              handleUpdateTaskContent({
                _id: task._id,
                content: newValue
              })
            }
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flexShrink: 0
            }}
          >
            {/* Due Date */}
            <Button
              variant="text"
              onClick={(e) => handleOpenDuePopover(e, task)}
              sx={(theme) => {
                const hasDueDate = Boolean(task.dueAt)
                const dueStatus = hasDueDate ? getDueStatus(task) : null
                const isDark = theme.palette.mode === 'dark'

                return {
                  height: 30,
                  minWidth: 30,
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: hasDueDate ? 1 : 0.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  color: hasDueDate
                    ? `${dueStatus}.main`
                    : isDark
                      ? '#c7d1db'
                      : '#44546f',
                  border: hasDueDate ? '1px solid' : 'none',
                  borderColor: hasDueDate ? `${dueStatus}.main` : 'transparent',
                  bgcolor: hasDueDate ? `${dueStatus}.lighter` : 'transparent',
                  '&:hover': {
                    bgcolor: hasDueDate
                      ? `${dueStatus}.lighter`
                      : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(9,30,66,0.08)'
                  }
                }
              }}
            >
              <AccessTimeOutlinedIcon fontSize="small" />
              {task.dueAt && (
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'inherit'
                  }}
                >
                  {dayjs(task.dueAt).format('MMMM D')}
                </Typography>
              )}
            </Button>

            {/* Assign Member */}
            <Box
              sx={(theme) => ({
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: 1.5,
                color: theme.palette.mode === 'dark' ? '#c7d1db' : '#44546f',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(9,30,66,0.08)',
                  color: 'info.main'
                }
              })}
              onClick={handleOpenMemberPopover}
            >
              {task?.memberId ? (
                <Tooltip title={member?.user?.displayName}>
                  <Avatar
                    sx={{ width: 26, height: 26 }}
                    src={member?.user?.avatar}
                  />
                </Tooltip>
              ) : (
                <PersonAddAlt1OutlinedIcon fontSize="small" />
              )}
            </Box>

            {/* Delete */}
            <Box
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteTask(task)
              }}
              sx={(theme) => ({
                width: 30,
                height: 30, // ← đồng nhất 30
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: 1.5,
                color:
                  theme.palette.mode === 'dark' ? 'error.light' : 'error.main',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'rgba(211,47,47,0.08)',
                  color: 'error.main'
                }
              })}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </Box>
          </Box>
        </Paper>
      </Box>

      <TaskMemberPopoverContent
        open={Boolean(memberAnchorEl)}
        anchorEl={memberAnchorEl}
        value={selectedMember}
        onClose={handleCloseMemberPopover}
        onChange={(newValue) => handleUpdateMember(newValue)}
        onClear={() => setSelectedMember(null)}
      />

      <ChecklistDueDatePopover
        open={Boolean(dueAnchorEl)}
        anchorEl={dueAnchorEl}
        onClose={handleCloseDuePopover}
        onDone={handleSaveDuePopover}
        value={selectedDueDate}
        onChange={(newValue) => setSelectedDueDate(newValue)}
        onClear={() => setSelectedDueDate(null)}
      />
    </>
  )
}

export default TaskItem

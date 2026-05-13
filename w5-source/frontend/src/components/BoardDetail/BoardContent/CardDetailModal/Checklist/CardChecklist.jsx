import Typography from '@mui/material/Typography'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import AddChecklistItem from './AddChecklistItem'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import TaskItem from './TaskItem'

function CardChecklist({ data, handler }) {
  const { checklists } = data
  const { handleCreateTask, handleUpdateTaskContent, handleDeleteTask } =
    handler

  return (
    <Box>
      {checklists?.length > 0 &&
        checklists.map((checklist) => {
          const items = checklist?.childTasks || []
          const completedCount = items.filter((item) => item.isCompleted).length
          const progress = items.length
            ? Math.round((completedCount / items.length) * 100)
            : 0

          return (
            <Box sx={{ mt: 3 }} key={checklist._id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flex: 1,
                    minWidth: 0
                  }}
                >
                  <CheckBoxOutlinedIcon sx={{ flexShrink: 0 }} />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ToggleFocusInput
                      value={checklist.content}
                      inputFontSize={20}
                      onChangedValue={(newValue) =>
                        handleUpdateTaskContent({
                          _id: checklist._id,
                          content: newValue
                        })
                      }
                    />
                  </Box>
                </Box>

                <Button
                  onClick={() => handleDeleteTask(checklist)}
                  color="error"
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    minWidth: 90,
                    flexShrink: 0
                  }}
                >
                  Delete
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.75
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    Progress
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'text.secondary'
                    }}
                  >
                    {progress}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={(theme) => ({
                    height: 8,
                    borderRadius: 999,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.12)'
                        : theme.palette.grey[300],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999
                    }
                  })}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {checklist.childTasks?.map((item) => (
                  <TaskItem key={item._id} task={item} handler={handler} />
                ))}
              </Box>

              <AddChecklistItem
                parentId={checklist._id}
                handleCreate={handleCreateTask}
              />
            </Box>
          )
        })}
    </Box>
  )
}

export default CardChecklist

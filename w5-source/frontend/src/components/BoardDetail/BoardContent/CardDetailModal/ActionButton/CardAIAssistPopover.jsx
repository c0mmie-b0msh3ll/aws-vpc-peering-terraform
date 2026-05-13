import { useState } from 'react'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import { cardDetailActionButtonSx } from '~/config/cardDetailButtonConfig'

function CardAIAssistPopover({ handleGenerate, handleApply }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [selectedSubtasks, setSelectedSubtasks] = useState([])
  const [useDescription, setUseDescription] = useState(true)
  const [userPrompt, setUserPrompt] = useState('')
  const [showPromptInput, setShowPromptInput] = useState(false)

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    if (isGenerating || isApplying) return
    setAnchorEl(null)
    setSuggestions(null)
    setSelectedSubtasks([])
    setUseDescription(true)
    setUserPrompt('')
    setShowPromptInput(false)
  }

  const onGenerate = async () => {
    try {
      setIsGenerating(true)
      const result = await handleGenerate(userPrompt.trim())
      console.log('AI result:', result)
      if (!result || !result.subtasks) return
      setSuggestions(result)
      setSelectedSubtasks(result.subtasks.map((_, i) => i))
      setUseDescription(true)
    } catch (err) {
      console.error('AI Generate error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const onApply = async () => {
    if (!suggestions) return
    try {
      setIsApplying(true)
      const payload = {}
      if (useDescription) payload.description = suggestions.description
      if (selectedSubtasks.length > 0) {
        payload.subtasks = selectedSubtasks.map((i) => suggestions.subtasks[i])
      }
      await handleApply(payload)
      handleClose()
    } finally {
      setIsApplying(false)
    }
  }

  const toggleSubtask = (index) => {
    setSelectedSubtasks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const open = Boolean(anchorEl)
  const hasSelection = useDescription || selectedSubtasks.length > 0

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AutoAwesomeOutlinedIcon fontSize="small" />}
        sx={{
          ...cardDetailActionButtonSx,
          borderColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(167, 139, 250, 0.3)'
              : 'rgba(124, 58, 237, 0.25)',
          color: (theme) =>
            theme.palette.mode === 'dark' ? '#a78bfa' : '#7c3aed',
          '&:hover': {
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(167, 139, 250, 0.5)'
                : 'rgba(124, 58, 237, 0.4)',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(167, 139, 250, 0.08)'
                : 'rgba(124, 58, 237, 0.06)'
          }
        }}
        onClick={handleOpen}
      >
        AI Assist
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: { mt: 1, width: 420, p: 2, borderRadius: 3, maxHeight: '70vh' }
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
          AI Smart Assist
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {!suggestions && !isGenerating && (
          <Stack spacing={2} sx={{ py: 1 }}>
            <Stack alignItems="center" spacing={1}>
              <AutoAwesomeOutlinedIcon
                sx={{ fontSize: 40, color: '#7c3aed', opacity: 0.7 }}
              />
              <Typography
                sx={{
                  fontSize: 14,
                  color: 'text.secondary',
                  textAlign: 'center'
                }}
              >
                Generate a description and subtasks from the card title using
                AI.
              </Typography>
            </Stack>

            {!showPromptInput ? (
              <Button
                variant="text"
                size="small"
                onClick={() => setShowPromptInput(true)}
                sx={{
                  textTransform: 'none',
                  fontSize: 13,
                  color: '#7c3aed',
                  alignSelf: 'center'
                }}
              >
                + Add extra context
              </Button>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="E.g. Focus on backend tasks, use Vietnamese, include testing steps..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
              />
            )}

            <Button
              variant="contained"
              onClick={onGenerate}
              sx={{
                textTransform: 'none',
                bgcolor: '#7c3aed',
                '&:hover': { bgcolor: '#6d28d9' },
                alignSelf: 'center'
              }}
            >
              Generate Suggestions
            </Button>
          </Stack>
        )}

        {isGenerating && (
          <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#7c3aed' }} />
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              AI is thinking...
            </Typography>
          </Stack>
        )}

        {suggestions && !isGenerating && (
          <Stack spacing={2}>
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 0.5 }}
              >
                <Checkbox
                  size="small"
                  checked={useDescription}
                  onChange={() => setUseDescription(!useDescription)}
                  sx={{
                    p: 0,
                    color: '#7c3aed',
                    '&.Mui-checked': { color: '#7c3aed' }
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'text.secondary'
                  }}
                >
                  Description
                </Typography>
              </Stack>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                  fontSize: 13,
                  color: 'text.primary',
                  opacity: useDescription ? 1 : 0.4
                }}
              >
                {suggestions.description}
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.5
                }}
              >
                Subtasks ({selectedSubtasks.length}/
                {suggestions.subtasks.length})
              </Typography>
              <Stack spacing={0.5}>
                {suggestions.subtasks.map((task, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.03)'
                      }
                    }}
                    onClick={() => toggleSubtask(index)}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedSubtasks.includes(index)}
                      sx={{
                        p: 0,
                        color: '#7c3aed',
                        '&.Mui-checked': { color: '#7c3aed' }
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: 'text.primary',
                        opacity: selectedSubtasks.includes(index) ? 1 : 0.4
                      }}
                    >
                      {task}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Divider />

            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Button
                variant="text"
                onClick={onGenerate}
                disabled={isApplying}
                sx={{ textTransform: 'none', fontSize: 13, color: '#7c3aed' }}
              >
                Regenerate
              </Button>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={handleClose}
                  disabled={isApplying}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={onApply}
                  disabled={!hasSelection || isApplying}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#7c3aed',
                    '&:hover': { bgcolor: '#6d28d9' }
                  }}
                >
                  {isApplying ? 'Applying...' : 'Apply'}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Popover>
    </>
  )
}

export default CardAIAssistPopover

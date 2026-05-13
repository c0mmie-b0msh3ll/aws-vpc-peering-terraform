import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Fab, Drawer, Typography, TextField, IconButton,
  CircularProgress, Paper, Chip, Stack, Tooltip
} from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import RefreshIcon from '@mui/icons-material/Refresh'
import ReactMarkdown from 'react-markdown'
import {
  askDocsBot,
  appendUserMessage,
  resetChat,
  selectAiState
} from '~/redux/ai/aiSlice'

export default function DocsChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const dispatch = useDispatch()
  const { chatHistory, sessionId, chatLoading, chatError } = useSelector(selectAiState)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [chatHistory, chatLoading])

  const send = () => {
    const q = input.trim()
    if (!q || chatLoading) return
    dispatch(appendUserMessage(q))
    dispatch(askDocsBot({ question: q, sessionId }))
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {!open && (
        <Tooltip title="Hỏi TaskIO Assistant" placement="left">
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}
            onClick={() => setOpen(true)}
            aria-label="Open AI chat"
          >
            <ChatIcon />
          </Fab>
        </Tooltip>
      )}

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 400, maxWidth: '100vw' } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              TaskIO Assistant
            </Typography>
            <Tooltip title="Xóa hội thoại">
              <IconButton size="small" onClick={() => dispatch(resetChat())}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            ref={scrollRef}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            {chatHistory.length === 0 && !chatLoading && (
              <Typography variant="body2" color="text.secondary">
                Chào! Hỏi mình bất cứ gì về cách dùng TaskIO, điều khoản, hoặc FAQ.
              </Typography>
            )}

            {chatHistory.map((m, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: m.role === 'user' ? 'primary.light' : 'grey.100',
                  color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  borderRadius: 2
                }}
              >
                <Box
                  sx={{
                    '& p': { m: 0, fontSize: 14, lineHeight: 1.5 },
                    '& ul, & ol': { pl: 2.5, my: 0.5 },
                    '& li': { fontSize: 14 },
                    '& strong': { fontWeight: 600 },
                    '& code': {
                      bgcolor: 'rgba(0,0,0,0.06)',
                      px: 0.5,
                      borderRadius: 0.5,
                      fontSize: 13
                    }
                  }}
                >
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </Box>

                {m.citations?.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}
                  >
                    {m.citations.map((c, i) => (
                      <Chip
                        key={i}
                        size="small"
                        variant="outlined"
                        label={c.source ? c.source.split('/').pop() : 'source'}
                        sx={{ fontSize: 10, height: 20 }}
                      />
                    ))}
                  </Stack>
                )}
              </Paper>
            ))}

            {chatLoading && (
              <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1, alignItems: 'center', color: 'text.secondary' }}>
                <CircularProgress size={16} />
                <Typography variant="caption">Đang trả lời...</Typography>
              </Box>
            )}

            {chatError && (
              <Typography variant="caption" color="error">
                {chatError}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Hỏi về TaskIO..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={chatLoading}
              autoFocus
            />
            <IconButton
              color="primary"
              onClick={send}
              disabled={!input.trim() || chatLoading}
              aria-label="Send"
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

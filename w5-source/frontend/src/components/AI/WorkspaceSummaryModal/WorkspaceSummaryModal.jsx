import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Skeleton, IconButton, Stack
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import RefreshIcon from '@mui/icons-material/Refresh'
import ReactMarkdown from 'react-markdown'
import {
  summarizeWorkspace,
  closeSummary,
  selectAiState
} from '~/redux/ai/aiSlice'

export default function WorkspaceSummaryModal({ workspaceId }) {
  const dispatch = useDispatch()
  const {
    summaryOpen,
    summaryData,
    summaryLoading,
    summaryError
  } = useSelector(selectAiState)

  useEffect(() => {
    if (summaryOpen && !summaryData && !summaryLoading && workspaceId) {
      dispatch(summarizeWorkspace(workspaceId))
    }
  }, [summaryOpen, summaryData, summaryLoading, workspaceId, dispatch])

  const handleClose = () => dispatch(closeSummary())
  const handleRegenerate = () => {
    if (workspaceId) dispatch(summarizeWorkspace(workspaceId))
  }

  return (
    <Dialog open={summaryOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          Tóm tắt AI Workspace
        </Typography>
        <IconButton size="small" onClick={handleClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 400 }}>
        {summaryLoading && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Đang phân tích workspace... (có thể mất 10-20 giây)
              </Typography>
            </Box>
            <Stack spacing={1.5}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={32} sx={{ mt: 2 }} />
              <Skeleton variant="text" height={20} />
              <Skeleton variant="text" height={20} />
            </Stack>
          </Box>
        )}

        {summaryError && !summaryLoading && (
          <Box>
            <Typography color="error" variant="body2">
              Lỗi: {summaryError}
            </Typography>
            <Typography color="text.secondary" variant="caption" sx={{ mt: 1, display: 'block' }}>
              Thử nhấn "Tạo lại" để thử lần nữa.
            </Typography>
          </Box>
        )}

        {summaryData && !summaryLoading && (
          <Box
            sx={{
              '& h1': { fontSize: '1.5rem', mt: 0, mb: 1.5 },
              '& h2': { fontSize: '1.15rem', mt: 2, mb: 1 },
              '& h3': { fontSize: '1rem', mt: 1.5, mb: 0.75 },
              '& p': { my: 1, lineHeight: 1.65 },
              '& ul, & ol': { pl: 3, my: 1 },
              '& li': { my: 0.25 },
              '& strong': { fontWeight: 600 }
            }}
          >
            <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 3, display: 'block', borderTop: 1, borderColor: 'divider', pt: 1.5 }}
            >
              Generated at {new Date(summaryData.generatedAt).toLocaleString('vi-VN')}
              {' · '}{summaryData.cardCount} cards
              {' · '}{summaryData.boardCount} boards
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRegenerate}
          disabled={summaryLoading || !workspaceId}
        >
          Tạo lại
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  )
}

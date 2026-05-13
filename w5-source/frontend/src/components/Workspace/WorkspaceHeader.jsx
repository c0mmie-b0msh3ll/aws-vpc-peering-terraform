import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Avatar,
  Button,
  CircularProgress
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { openSummary } from '~/redux/ai/aiSlice'
import WorkspaceSummaryModal from '~/components/AI/WorkspaceSummaryModal'
import {
  createWorkspaceExportAPI,
  downloadWorkspaceExportAPI
} from '~/apis/workspace.api'

function WorkspaceHeader({ workspace, handleOpenUpdateModal }) {
  const title = workspace?.title || 'Untitled Workspace'
  const description = workspace?.description || 'No description'
  const dispatch = useDispatch()
  const workspaceId = workspace?._id
  const [isExporting, setIsExporting] = useState(false)

  const handleExportWorkspace = async () => {
    if (!workspaceId || isExporting) return

    setIsExporting(true)

    try {
      const exportFile = await createWorkspaceExportAPI({ workspaceId })
      const zipBlob = await downloadWorkspaceExportAPI({
        downloadPath: exportFile.downloadPath
      })
      const objectUrl = URL.createObjectURL(zipBlob)
      const downloadLink = document.createElement('a')

      downloadLink.href = objectUrl
      downloadLink.download =
        exportFile.fileName || `workspace-${workspaceId}.zip`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      URL.revokeObjectURL(objectUrl)

      toast.success('Workspace export downloaded.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#1e3a5f' : '#dbeafe',
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#93c5fd' : '#1d4ed8',
                  flexShrink: 0
                }}
              >
                {workspace?.title?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {title}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={handleOpenUpdateModal}
                    sx={{
                      color: 'text.secondary',
                      p: 0.5,
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 0.75, maxWidth: 720 }}
                >
                  {description}
                </Typography>
              </Box>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
            >
              <Button
                variant="outlined"
                startIcon={
                  isExporting ? (
                    <CircularProgress size={18} />
                  ) : (
                    <DownloadOutlinedIcon />
                  )
                }
                onClick={handleExportWorkspace}
                disabled={!workspaceId || isExporting}
              >
                Export workspace
              </Button>

              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => dispatch(openSummary())}
                disabled={!workspaceId}
              >
                AI summary
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
      <WorkspaceSummaryModal workspaceId={workspaceId} />
    </>
  )
}

export default WorkspaceHeader

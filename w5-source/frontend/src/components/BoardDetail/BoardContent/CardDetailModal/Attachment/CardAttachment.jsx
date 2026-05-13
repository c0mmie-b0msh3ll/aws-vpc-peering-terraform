import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import AttachmentEditName from './AttachmentEditName'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Added just now'
  if (diff < 3600) return `Added ${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `Added ${Math.floor(diff / 3600)} hours ago`
  return `Added ${Math.floor(diff / 86400)} days ago`
}

const renderFilePreview = (attachment) => {
  if (attachment.fileType?.startsWith('image/')) {
    return (
      <Box
        component="img"
        src={attachment.url}
        alt={attachment.fileName}
        sx={{
          width: 60,
          height: 48,
          borderRadius: 1.5,
          objectFit: 'cover',
          flexShrink: 0
        }}
      />
    )
  }

  const ext = attachment.fileName.split('.').pop()

  return (
    <Box
      sx={(theme) => ({
        width: 60,
        height: 48,
        borderRadius: 1.5,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 14,
        textTransform: 'uppercase',
        bgcolor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(9,30,66,0.08)',
        color: theme.palette.text.secondary
      })}
    >
      {ext}
    </Box>
  )
}

function CardAttachment({ data, handler }) {
  const { attachments } = data
  const {
    handleUploadFiles,
    handleDeleteAttachment,
    handleUpdateAttachment,
    handleDownloadAttachment
  } = handler
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedAttachment, setSelectedAttachment] = useState(null)
  const [isOpenMenu, setIsOpenMenu] = useState(false)
  const [isOpenForm, setIsOpenForm] = useState(false)

  if (attachments?.length === 0) return

  const openMenu = Boolean(anchorEl) && isOpenMenu
  const openForm = Boolean(anchorEl) && isOpenForm

  const handleOpenMenu = (event, attachment) => {
    setAnchorEl(event.currentTarget)
    setIsOpenMenu(true)
    setIsOpenForm(false)
    setSelectedAttachment(attachment)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setIsOpenMenu(false)
    setSelectedAttachment(null)
  }

  const handleOpenForm = () => {
    setIsOpenMenu(false)
    setIsOpenForm(true)
  }

  const handleCloseForm = () => {
    setAnchorEl(null)
    setIsOpenForm(false)
    setSelectedAttachment(null)
  }

  const handleDownload = async () => {
    if (!selectedAttachment) return
    try {
      await handleDownloadAttachment({ _id: selectedAttachment._id })
    } finally {
      handleCloseMenu()
    }
  }

  const handleDelete = () => {
    if (!selectedAttachment) return
    handleDeleteAttachment(selectedAttachment)
    handleCloseMenu()
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AttachFileOutlinedIcon />
          <Typography variant="span" sx={{ fontWeight: 600, fontSize: 20 }}>
            Attachments
          </Typography>
        </Box>

        <Button
          component="label"
          variant="contained"
          size="small"
          sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}
        >
          Add
          <input hidden type="file" multiple onChange={handleUploadFiles} />
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {attachments?.map((attachment) => (
          <Box
            key={attachment._id}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1,
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(9,30,66,0.04)'
              }
            })}
          >
            {renderFilePreview(attachment)}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {attachment.fileName}
              </Typography>

              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formatDate(attachment.createdAt)} ·{' '}
                  {formatFileSize(attachment.fileSize)}
                </Typography>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={() => window.open(attachment.url, '_blank')}
            >
              <OpenInNewOutlinedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={(event) => handleOpenMenu(event, attachment)}
            >
              <MoreHorizOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>

      <AttachmentEditName
        open={openForm}
        anchorEl={anchorEl}
        onClose={handleCloseForm}
        attachment={selectedAttachment}
        handleUpdateAttachment={handleUpdateAttachment}
      />

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: (theme) => ({
              mt: 1,
              minWidth: 180,
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(9,30,66,0.08)'
              }`,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 12px 32px rgba(0,0,0,0.45)'
                  : '0 8px 24px rgba(9,30,66,0.16)',
              bgcolor: theme.palette.mode === 'dark' ? '#1f1f23' : '#ffffff'
            })
          }
        }}
        MenuListProps={{
          sx: {
            p: 0.75
          }
        }}
      >
        <MenuItem
          onClick={handleOpenForm}
          sx={(theme) => ({
            gap: 1.25,
            px: 1.25,
            py: 1,
            borderRadius: 2,
            fontSize: 14,
            fontWeight: 500,
            color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#172b4d',
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(9,30,66,0.06)'
            }
          })}
        >
          <EditOutlinedIcon fontSize="small" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={handleDownload}
          sx={(theme) => ({
            gap: 1.25,
            px: 1.25,
            py: 1,
            borderRadius: 2,
            fontSize: 14,
            fontWeight: 500,
            color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#172b4d',
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(9,30,66,0.06)'
            }
          })}
        >
          <DownloadOutlinedIcon fontSize="small" />
          Download
        </MenuItem>

        <MenuItem
          onClick={handleDelete}
          sx={(theme) => ({
            gap: 1.25,
            px: 1.25,
            py: 1,
            mt: 0.25,
            borderRadius: 2,
            fontSize: 14,
            fontWeight: 500,
            color: theme.palette.error.main,
            '&:hover': {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(244,67,54,0.12)'
                  : 'rgba(244,67,54,0.08)'
            }
          })}
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default CardAttachment

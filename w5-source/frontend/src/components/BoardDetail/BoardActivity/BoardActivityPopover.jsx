import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Popover,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { fetchBoardActivity } from '~/apis/board.api'

dayjs.extend(relativeTime)

function BoardActivityPopover({ open, anchorEl, onClose }) {
  const members = useSelector((state) => state.activeBoard?.members || [])
  const { boardId } = useParams()

  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(false)

  const memberMap = useMemo(() => {
    return new Map(members.map((item) => [item._id?.toString(), item]))
  }, [members])

  const fetchActivityData = async () => {
    try {
      setLoading(true)
      const data = await fetchBoardActivity({ boardId })
      setActivity(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && boardId) fetchActivityData()
  }, [open, boardId])

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            mt: 1,
            width: 362,
            borderRadius: 3,
            overflow: 'hidden',
            color: theme.palette.mode === 'dark' ? '#f1f2f4' : '#172b4d',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 12px 28px rgba(0,0,0,0.45)'
                : '0 12px 28px rgba(9,30,66,0.18)'
          })
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            Activity
          </Typography>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#9fadbc' : '#44546f'
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            maxHeight: 700,
            overflowY: 'auto',
            pr: 0.5
          }}
        >
          {loading ? (
            <Box
              sx={{
                py: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : activity.length === 0 ? (
            <Typography
              sx={{
                py: 2,
                textAlign: 'center',
                fontSize: 14,
                color: 'text.secondary'
              }}
            >
              No activity yet.
            </Typography>
          ) : (
            activity.map((item) => {
              const member = memberMap.get(item.authorId?.toString())
              const authorName =
                member?.user?.displayName ||
                member?.displayName ||
                'Unknown user'
              const authorAvatar = member?.user?.avatar || member?.avatar || ''

              return (
                <Box
                  key={item._id}
                  sx={{
                    display: 'flex',
                    gap: 1.25,
                    py: 1.25,
                    borderBottom: (theme) =>
                      `1px solid ${
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(9,30,66,0.08)'
                      }`
                  }}
                >
                  <Avatar
                    src={authorAvatar}
                    alt={authorName}
                    sx={{ width: 32, height: 32 }}
                  >
                    {authorName?.charAt(0)?.toUpperCase()}
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        lineHeight: 1.4,
                        wordBreak: 'break-word'
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 700, mr: 0.5 }}>
                        {authorName}
                      </Box>
                      {item.content}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 12,
                        color: 'text.secondary'
                      }}
                    >
                      {dayjs(item.createdAt).fromNow()}
                    </Typography>
                  </Box>
                </Box>
              )
            })
          )}
        </Box>
      </Box>
    </Popover>
  )
}

export default BoardActivityPopover

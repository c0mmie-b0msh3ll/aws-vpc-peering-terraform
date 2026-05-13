import moment from 'moment'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import { useMemo, useState } from 'react'
import { Button } from '@mui/material'
import { useSelector } from 'react-redux'

function CardActivitySection({ data, handler }) {
  const { comments = [], logs = [] } = data
  const { handleAddComment, handleDeleteComment } = handler
  const [comment, setComment] = useState('')

  const boardMembers = useSelector((state) => state.activeBoard?.members)

  const memberMap = useMemo(() => {
    return new Map(boardMembers.map((item) => [item._id?.toString(), item]))
  }, [boardMembers])

  const onSave = async () => {
    const value = comment.trim()
    if (!value) return
    await handleAddComment(value)
    setComment('')
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* input */}
      <Box>
        <TextField
          fullWidth
          placeholder="Write a comment..."
          variant="outlined"
          multiline
          maxRows={6}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSave()
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              alignItems: 'flex-start',
              borderRadius: 2
            },
            '& .MuiOutlinedInput-input': {
              fontSize: 14,
              lineHeight: 1.5
            }
          }}
        />

        {comment.trim() && (
          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={onSave}
              disabled={!comment.trim()}
            >
              Save
            </Button>
          </Box>
        )}
      </Box>

      {!!comments.length && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>
            Comments
          </Typography>

          {comments.map((comment) => (
            <Box
              key={comment._id}
              sx={{
                display: 'flex',
                gap: 1.5,
                mt: 2,
                alignItems: 'flex-start'
              }}
            >
              <Tooltip title={comment?.user?.displayName || ''}>
                <Avatar
                  alt={comment?.user?.displayName || ''}
                  src={comment?.user?.avatar || ''}
                  sx={{ width: 36, height: 36 }}
                />
              </Tooltip>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                    mb: 0.5
                  }}
                >
                  <Typography
                    component="span"
                    sx={{ fontWeight: 700, fontSize: 16 }}
                  >
                    {comment?.user?.displayName}
                  </Typography>

                  <Typography
                    component="span"
                    sx={{ fontSize: 14, color: 'text.secondary' }}
                  >
                    {moment(comment?.createdAt).fromNow()}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? '#22303C' : '#F4F5F7',
                    px: 1.5,
                    py: 1.25,
                    mt: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  <Typography
                    component="span"
                    sx={{ fontSize: 16, lineHeight: 1.5 }}
                  >
                    {comment?.content}
                  </Typography>
                </Box>

                <Typography
                  onClick={() => handleDeleteComment(comment)}
                  component="span"
                  sx={{
                    display: 'inline-block',
                    fontSize: 14,
                    lineHeight: 1.5,
                    mt: 1,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    color: 'error.main',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  Delete
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {!!logs.length && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>
            Activity
          </Typography>

          {logs.map((log) => {
            const member = memberMap.get(log.authorId?.toString())
            const displayName =
              member?.user?.displayName || member?.displayName || 'Unknown user'
            const avatar = member?.user?.avatar || member?.avatar || ''

            return (
              <Box
                key={log._id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  mt: 2,
                  alignItems: 'flex-start'
                }}
              >
                <Tooltip title={displayName}>
                  <Avatar
                    alt={displayName}
                    src={avatar}
                    sx={{ width: 32, height: 32 }}
                  >
                    {displayName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Tooltip>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      lineHeight: 1.5,
                      wordBreak: 'break-word'
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: 700, mr: 0.5 }}>
                      {displayName}
                    </Box>
                    {log.content}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: 'text.secondary'
                    }}
                  >
                    {moment(log.createdAt).fromNow()}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export default CardActivitySection

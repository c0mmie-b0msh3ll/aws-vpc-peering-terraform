import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import CardMemberPopoverContent from './CardMemberPopoverContent'

function CardMemberGroup({ memberIds = [], handler }) {
  const boardMembers = useSelector((state) => state.activeBoard?.members)

  const [anchorEl, setAnchorEl] = useState(null)

  const isOpenPopover = Boolean(anchorEl)
  const popoverId = isOpenPopover ? 'card-member-popover' : undefined

  const selectedMembers = useMemo(() => {
    return memberIds
      .map((id) => boardMembers.find((member) => member._id === id))
      .filter(Boolean)
  }, [memberIds, boardMembers])

  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClosePopover = () => setAnchorEl(null)

  if (memberIds.length === 0) return

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
    >
      {/* Selected members */}
      {selectedMembers.map((member) => (
        <Tooltip
          key={member._id}
          title={
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {member?.user?.displayName}
              </Typography>
              <Typography sx={{ fontSize: 12, opacity: 0.8 }}>
                {member?.user?.email}
              </Typography>
            </Box>
          }
        >
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              '&:hover .member-remove-btn': {
                opacity: 1,
                transform: 'scale(1)'
              }
            }}
          >
            <Avatar
              alt={member?.user?.displayName}
              src={member?.user?.avatar}
              sx={{
                width: 34,
                height: 34,
                cursor: 'pointer',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 2px 8px rgba(0,0,0,0.4)'
                    : '0 2px 8px rgba(9,30,66,0.12)'
              }}
            >
              {member?.user?.displayName?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Box>
        </Tooltip>
      ))}

      {/* Add member button */}
      <Tooltip title="Add or remove members">
        <Box
          aria-describedby={popoverId}
          onClick={handleOpenPopover}
          sx={{
            width: 34,
            height: 34,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: '1px dashed',
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.18)'
                : 'rgba(9,30,66,0.14)',
            color: (theme) =>
              theme.palette.mode === 'dark' ? '#90caf9' : '#0c66e4',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(144,202,249,0.08)'
                : '#e9f2ff',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(144,202,249,0.18)'
                  : '#dbeafe'
            }
          }}
        >
          <AddIcon fontSize="small" />
        </Box>
      </Tooltip>

      <CardMemberPopoverContent
        anchorEl={anchorEl}
        isOpen={isOpenPopover}
        memberIds={memberIds}
        handler={{ ...handler, handleClose: handleClosePopover }}
      />
    </Box>
  )
}

export default CardMemberGroup

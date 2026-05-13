import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined'

function TaskMemberPopoverContent({
  anchorEl,
  open,
  value,
  onClose,
  onChange,
  onClear
}) {
  const boardMembers = useSelector((state) => state.activeBoard?.members || [])
  const [searchValue, setSearchValue] = useState('')

  const selectedMember = useMemo(() => {
    const selectedId = value
    if (!selectedId) return null
    return boardMembers.find((member) => member._id === selectedId) || null
  }, [value, boardMembers])

  const filteredMembers = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()

    if (!keyword) return boardMembers

    return boardMembers.filter((member) => {
      const displayName = member?.user?.displayName?.toLowerCase() || ''
      const email = member?.user?.email?.toLowerCase() || ''

      return displayName.includes(keyword) || email.includes(keyword)
    })
  }, [searchValue, boardMembers])

  const handleSelectMember = async (member) => {
    if (value === member._id) {
      onChange(null)
      return
    }
    onChange(member._id)
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            width: 340,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 28px rgba(0,0,0,0.45)'
                : '0 12px 28px rgba(9,30,66,0.18)'
          }
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1 }}>
          Member
        </Typography>

        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Search by name or email..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonSearchOutlinedIcon sx={{ fontSize: 20 }} />
              </InputAdornment>
            )
          }}
        />

        {!!selectedMember && (
          <>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                opacity: 0.7,
                mb: 1
              }}
            >
              Selected
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                pl: 0.5,
                pr: 1,
                py: 0.5,
                borderRadius: 999,
                width: 'fit-content',
                cursor: 'pointer',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(144,202,249,0.12)'
                    : '#e9f2ff',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(144,202,249,0.2)'
                      : '#dbeafe'
                }
              }}
            >
              <Avatar
                src={selectedMember?.user?.avatar}
                alt={selectedMember?.user?.displayName}
                sx={{ width: 24, height: 24 }}
              >
                {selectedMember?.user?.displayName?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Typography sx={{ fontSize: 13, maxWidth: 120 }} noWrap>
                {selectedMember?.user?.displayName}
              </Typography>

              <CloseIcon
                sx={{ fontSize: 14, opacity: 0.7 }}
                onClick={() => onChange(null)}
              />
            </Box>

            <Divider sx={{ my: 1.5 }} />
          </>
        )}

        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            opacity: 0.7,
            mb: 1
          }}
        >
          All board members
        </Typography>

        <List
          sx={{
            maxHeight: 280,
            overflowY: 'auto',
            py: 0
          }}
        >
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const isSelected = value === member._id

              return (
                <ListItemButton
                  key={member._id}
                  onClick={() => handleSelectMember(member)}
                  sx={{
                    px: 1,
                    py: 0.75,
                    borderRadius: 2,
                    mb: 0.5,
                    transition: 'all 0.18s ease',
                    bgcolor: isSelected
                      ? (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(39,174,96,0.12)'
                            : 'rgba(39,174,96,0.08)'
                      : 'transparent',
                    '&:hover': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.06)'
                          : '#f4f5f7'
                    }
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 42 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                      }}
                      badgeContent={
                        isSelected ? (
                          <CheckCircleIcon
                            sx={{
                              fontSize: 16,
                              color: '#27ae60',
                              bgcolor: 'white',
                              borderRadius: '50%'
                            }}
                          />
                        ) : null
                      }
                    >
                      <Avatar
                        src={member?.user?.avatar}
                        alt={member?.user?.displayName}
                        sx={{ width: 32, height: 32 }}
                      >
                        {member?.user?.displayName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>

                  <ListItemText
                    primary={member?.user?.displayName}
                    secondary={member?.user?.email}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isSelected ? 600 : 500,
                      noWrap: true
                    }}
                    secondaryTypographyProps={{
                      fontSize: 12,
                      noWrap: true
                    }}
                  />
                </ListItemButton>
              )
            })
          ) : (
            <Box
              sx={{
                py: 3,
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              <Typography sx={{ fontSize: 13 }}>No members found.</Typography>
            </Box>
          )}
        </List>
      </Box>
    </Popover>
  )
}

export default TaskMemberPopoverContent

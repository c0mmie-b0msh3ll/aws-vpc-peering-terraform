import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import Box from '@mui/material/Box'
import { useState } from 'react'
import { getInitials } from '~/helpers/getInitials'
import { groupPermission } from '~/helpers/groupPermission'

function BoardRoleCard({ role, data, handler }) {
  const { permissions } = data

  const {
    handleOpenConfirmDialog,
    handleChangeRoleName,
    handleChangeRolePermissions
  } = handler

  const [open, setOpen] = useState(false)
  const roleSet = new Set(role.permissionCodes)
  const grouped = groupPermission({ permissions, prefix: 'board.' })
  const grantedCount = role.permissionCodes.length

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(role.name)

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 0 0 1px rgba(255,255,255,0.12)'
              : '0 0 0 1px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* Header */}
      <Box
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.75,
          cursor: 'pointer',
          userSelect: 'none',
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              fontSize: 13,
              fontWeight: 600,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? '#1e3a5f' : '#e3f0fb',
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0'
            }}
          >
            {getInitials(role.name)}
          </Avatar>
          <Box>
            {isEditing ? (
              <TextField
                onClick={(e) => e.stopPropagation()}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  handleChangeRoleName({
                    roleId: role._id,
                    value: e.target.value
                  })
                }}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                autoFocus
                variant="standard"
                size="small"
                slotProps={{
                  input: {
                    style: { fontWeight: 600, fontSize: '1rem' }
                  }
                }}
                sx={{
                  '& .MuiInput-underline:before': {
                    borderBottom: '1px dashed #aaa'
                  }
                }}
              />
            ) : (
              <Typography
                variant="body1"
                fontWeight={600}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline dotted' }
                }}
              >
                {name}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenConfirmDialog({ roleId: role._id })
            }}
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 32,
              minWidth: 'auto',
              px: 1.25,
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1.5,
              whiteSpace: 'nowrap'
            }}
          >
            Delete
          </Button>

          <Chip
            icon={<ShieldOutlinedIcon sx={{ fontSize: 16 }} />}
            label={`${grantedCount}/${permissions.length}`}
            size="small"
            sx={{
              height: 32,
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 1.5,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(144,202,249,0.12)'
                  : 'rgba(25,118,210,0.08)',
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#90caf9' : '#1565c0',
              border: 'none',
              '& .MuiChip-label': {
                px: 1
              },
              '& .MuiChip-icon': {
                ml: 1,
                mr: -0.5
              }
            }}
          />

          <IconButton
            size="small"
            sx={{
              p: 0.75,
              borderRadius: '50%',
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)'
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Collapse body */}
      <Collapse in={open} unmountOnExit>
        <Divider />
        <Box
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: 'background.default',
            maxHeight: 320, // chiều cao tối đa
            overflowY: 'auto', // bật thanh trượt dọc
            overflowX: 'hidden',
            scrollbarWidth: 'thin', // Firefox
            '&::-webkit-scrollbar': {
              width: 8
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 8
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: 'rgba(0,0,0,0.35)'
            }
          }}
        >
          <Stack spacing={2}>
            {Object.entries(grouped).map(([label, perms]) => (
              <Box key={label}>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    mb: 0.75
                  }}
                >
                  {label}
                </Typography>
                <List disablePadding dense>
                  {perms.map((p) => {
                    const has = roleSet.has(p.permissionCode)
                    return (
                      <ListItem
                        key={p.permissionCode}
                        disableGutters
                        disablePadding
                        sx={{
                          px: 1.25,
                          py: 0.75,
                          mb: 0.5,
                          borderRadius: 2,
                          bgcolor: has
                            ? (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(56,142,60,0.12)'
                                  : 'rgba(56,142,60,0.06)'
                            : 'action.hover',
                          border: '0.5px solid',
                          borderColor: has
                            ? (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(56,142,60,0.3)'
                                  : 'rgba(56,142,60,0.2)'
                            : 'divider',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1
                        }}
                      >
                        <Tooltip
                          title={has ? 'Granted' : 'Not granted'}
                          placement="left"
                          arrow
                        >
                          <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                            {has ? (
                              <CheckCircleOutlineIcon
                                sx={{ fontSize: 16, color: 'success.main' }}
                                onClick={() => {
                                  handleChangeRolePermissions({
                                    roleId: role._id,
                                    permissionCode: p.permissionCode,
                                    action: 'remove'
                                  })
                                }}
                              />
                            ) : (
                              <RemoveCircleOutlineIcon
                                sx={{
                                  fontSize: 16,
                                  color: 'text.disabled'
                                }}
                                onClick={() => {
                                  handleChangeRolePermissions({
                                    roleId: role._id,
                                    permissionCode: p.permissionCode,
                                    action: 'add'
                                  })
                                }}
                              />
                            )}
                          </Box>
                        </Tooltip>
                        <Box>
                          <Typography
                            color={has ? 'text.secondary' : 'text.disabled'}
                          >
                            {p.description}
                          </Typography>
                        </Box>
                      </ListItem>
                    )
                  })}
                </List>
              </Box>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  )
}
export default BoardRoleCard

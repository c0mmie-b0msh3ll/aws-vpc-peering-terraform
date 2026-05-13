import Popper from '@mui/material/Popper'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined'
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { useSelector } from 'react-redux'

function MoreOptionPopper({
  status,
  memberIds = [],
  anchorEl,
  open,
  onClose,
  handleArchiveCard,
  handleRestoreCard,
  handleJoinCard,
  handleLeaveCard,
  handleDeleteCard
}) {
  const boardMember = useSelector((state) => state.activeBoard?.members || [])
  const user = useSelector((state) => state.user?.currentUser)

  const userInBoard = boardMember.find((m) => m.userId === user?._id)
  const isJoinedCard = !!userInBoard?._id && memberIds.includes(userInBoard._id)

  const menuItemSx = {
    py: 1,
    px: 1.5,
    borderRadius: 1.5,
    mx: 0.5,
    my: 0.25,
    transition: 'all 0.2s ease',
    '& .MuiListItemIcon-root': {
      minWidth: 34,
      color: 'text.secondary'
    },
    '& .MuiListItemText-primary': {
      fontSize: '0.95rem',
      fontWeight: 500
    }
  }

  const dangerMenuItemSx = {
    ...menuItemSx,
    color: 'error.main',
    '& .MuiListItemIcon-root': {
      minWidth: 34,
      color: 'error.main'
    },
    '&:hover': {
      bgcolor: 'error.lighter'
    }
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
      sx={{ zIndex: 1300 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={10}
          sx={{
            minWidth: 220,
            borderRadius: 3,
            p: 0.5,
            overflow: 'hidden',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) => theme.shadows[8],
            bgcolor: 'background.paper'
          }}
        >
          <MenuList dense disablePadding>
            {!isJoinedCard && (
              <MenuItem onClick={handleJoinCard} sx={menuItemSx}>
                <ListItemIcon>
                  <PersonAddAlt1OutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Join card</ListItemText>
              </MenuItem>
            )}

            {isJoinedCard && (
              <MenuItem onClick={handleLeaveCard} sx={dangerMenuItemSx}>
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Leave card</ListItemText>
              </MenuItem>
            )}

            <Divider sx={{ my: 0.75 }} />

            {status === 'active' && (
              <MenuItem onClick={handleArchiveCard} sx={menuItemSx}>
                <ListItemIcon>
                  <ArchiveOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Archive</ListItemText>
              </MenuItem>
            )}

            {status === 'archived' && (
              <>
                <MenuItem onClick={handleRestoreCard} sx={menuItemSx}>
                  <ListItemIcon>
                    <RestoreOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Restore</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleDeleteCard} sx={dangerMenuItemSx}>
                  <ListItemIcon>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              </>
            )}
          </MenuList>
        </Paper>
      </ClickAwayListener>
    </Popper>
  )
}

export default MoreOptionPopper

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useConfirm } from 'material-ui-confirm'

import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import PersonAdd from '@mui/icons-material/PersonAdd'
import Settings from '@mui/icons-material/Settings'
import Logout from '@mui/icons-material/Logout'
import AccountCircle from '@mui/icons-material/AccountCircle'
import AddBoxOutlined from '@mui/icons-material/AddBoxOutlined'

import { selectCurrentUser, logoutUserApi } from '~/redux/user/userSlice'
import CreateWorkspaceModal from '~/components/Workspace/CreateWorkspaceModal'
import { createWorkspaceAPI } from '~/redux/workspace/workspacesSlice'

const menuItemSx = {
  borderRadius: 2,
  mx: 1,
  my: 0.25,
  px: 1.25,
  minHeight: 44,
  transition: 'all 0.2s ease',
  '& .MuiListItemIcon-root': {
    minWidth: 34,
    color: 'text.secondary'
  },
  '&:hover': {
    bgcolor: 'action.hover'
  }
}

function Profiles() {
  const dispatch = useDispatch()
  const confirmLogout = useConfirm()
  const currentUser = useSelector(selectCurrentUser)

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleClose()

    confirmLogout({
      title: 'Log out of your account?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    })
      .then(() => {
        dispatch(logoutUserApi())
      })
      .catch(() => {})
  }

  const handleOpenCreateModal = () => {
    handleClose()
    setIsOpen(true)
  }

  const handleCloseCreateModal = () => {
    if (isSubmitting) return
    setIsOpen(false)
  }

  const handleCreateWorkspace = async (data) => {
    setIsSubmitting(true)
    try {
      await dispatch(createWorkspaceAPI({ payload: data }))
      handleCloseCreateModal()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            p: 0,
            border: '2px solid',
            borderColor: 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.light'
            }
          }}
          aria-controls={open ? 'basic-menu-profiles' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            sx={{ width: 38, height: 38 }}
            alt={currentUser?.username}
            src={currentUser?.avatar}
          />
        </IconButton>
      </Tooltip>

      <Menu
        id="basic-menu-profiles"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            minWidth: 270,
            borderRadius: 3,
            overflow: 'visible',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 14px 35px rgba(0,0,0,0.14)',
            p: 1,
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 18,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              borderTop: '1px solid',
              borderLeft: '1px solid',
              borderColor: 'divider',
              zIndex: 0
            }
          }
        }}
        MenuListProps={{
          'aria-labelledby': 'basic-button-profiles'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1.25,
            mb: 0.5
          }}
        >
          <Avatar
            sx={{ width: 42, height: 42 }}
            alt={currentUser?.username}
            src={currentUser?.avatar}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={600} noWrap>
              {currentUser?.displayName || currentUser?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              @{currentUser?.username || 'username'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          component={Link}
          to="/settings/account"
          onClick={handleClose}
          sx={{
            ...menuItemSx,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" className="profile-icon" />
          </ListItemIcon>
          Profile
        </MenuItem>

        <MenuItem
          onClick={handleOpenCreateModal}
          sx={{
            ...menuItemSx,
          }}
        >
          <ListItemIcon>
            <AddBoxOutlined
              fontSize="small"
              className="create-workspace-icon"
            />
          </ListItemIcon>
          Create workspace
        </MenuItem>

        <MenuItem sx={menuItemSx}>
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          Add another account
        </MenuItem>

        <MenuItem sx={menuItemSx}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            ...menuItemSx,
            '&:hover': {
              bgcolor: 'warning.lighter',
              color: 'warning.dark',
              '& .logout-icon': {
                color: 'warning.dark'
              }
            }
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" className="logout-icon" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      <CreateWorkspaceModal
        isOpen={isOpen}
        loading={isSubmitting}
        onClose={() => {
          if (!isSubmitting) setIsOpen(false)
        }}
        onSubmit={handleCreateWorkspace}
      />
    </Box>
  )
}

export default Profiles

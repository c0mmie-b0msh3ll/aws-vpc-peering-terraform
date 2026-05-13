import React, { useRef, useState } from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Badge,
  Avatar,
  Typography,
  Tooltip,
  Popover,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { useNavigate } from 'react-router-dom'

export default function Header({
  drawerWidth,
  collapsed,
  onToggleMobileSidebar,
  onToggleCollapseSidebar
}) {
  const [anchorEl, setAnchorEl] = useState(null)
  const closeTimeoutRef = useRef(null)

  const handleOpenPopover = (event) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setAnchorEl(event.currentTarget)
  }

  const handleClosePopover = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setAnchorEl(null)
    }, 120)
  }

  const handleCloseImmediately = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  const navigate = useNavigate();

  return (
    <AppBar
      position='fixed'
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        color: '#0f172a',
        borderBottom: '1px solid #e5e7eb',
        width: {
          xs: '100%',
          md: `calc(100% - ${drawerWidth}px)`
        },
        ml: {
          xs: 0,
          md: `${drawerWidth}px`
        },
        transition: 'all 0.25s ease'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '72px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color='inherit'
            edge='start'
            onClick={onToggleMobileSidebar}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Tooltip title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}>
            <IconButton
              color='inherit'
              onClick={onToggleCollapseSidebar}
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            >
              {collapsed ? (
                <KeyboardDoubleArrowRightRoundedIcon />
              ) : (
                <KeyboardDoubleArrowLeftRoundedIcon />
              )}
            </IconButton>
          </Tooltip>

        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton color='inherit'>
            <Badge badgeContent={2} color='error'>
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>

          <Box onMouseEnter={handleOpenPopover} onMouseLeave={handleClosePopover}>
            <Avatar
              alt='User Avatar'
              src='https://i.pravatar.cc/100?img=12'
              sx={{
                width: 40,
                height: 40,
                cursor: 'pointer',
                border: '2px solid #f1f5f9',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.12)'
                }
              }}
            />

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleCloseImmediately}
              disableRestoreFocus
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              slotProps={{
                paper: {
                  onMouseEnter: () => {
                    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
                  },
                  onMouseLeave: handleClosePopover,
                  sx: {
                    mt: 1.2,
                    minWidth: 250,
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.10)',
                    overflow: 'hidden'
                  }
                }
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.6,
                  bgcolor: '#ffffff'
                }}
              >
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 700,
                    color: '#0f172a'
                  }}
                >
                  Settings
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ p: 1, bgcolor: '#ffffff' }}>
                <MenuItem
                  onClick={() => console.log('Account Setting')}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 1.2,
                    mb: 0.5,
                    bgcolor: '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#fff7ed',
                      '& .MuiListItemIcon-root': {
                        color: '#f97316'
                      },
                      '& .menu-primary': {
                        color: '#ea580c'
                      },
                      '& .menu-secondary': {
                        color: '#fb923c'
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: '#475569',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <SettingsOutlinedIcon fontSize='small' />
                  </ListItemIcon>

                  <ListItemText
                    primary='Account Setting'
                    secondary='Profile, password, preferences'
                    primaryTypographyProps={{
                      className: 'menu-primary',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                      transition: 'all 0.2s ease'
                    }}
                    secondaryTypographyProps={{
                      className: 'menu-secondary',
                      fontSize: 12,
                      color: '#64748b',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </MenuItem>

                <MenuItem
                  onClick={() => navigate('/admin/auth/login')}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 1.2,
                    bgcolor: '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#fff7ed',
                      '& .MuiListItemIcon-root': {
                        color: '#f97316'
                      },
                      '& .menu-primary': {
                        color: '#ea580c'
                      },
                      '& .menu-secondary': {
                        color: '#fb923c'
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: '#475569',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <LogoutRoundedIcon fontSize='small' />
                  </ListItemIcon>

                  <ListItemText
                    primary='Log Out'
                    secondary='Sign out from this session'
                    primaryTypographyProps={{
                      className: 'menu-primary',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                      transition: 'all 0.2s ease'
                    }}
                    secondaryTypographyProps={{
                      className: 'menu-secondary',
                      fontSize: 12,
                      color: '#64748b',
                      transition: 'all 0.2s ease'
                    }}
                    
                  />
                </MenuItem>
              </Box>
            </Popover>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
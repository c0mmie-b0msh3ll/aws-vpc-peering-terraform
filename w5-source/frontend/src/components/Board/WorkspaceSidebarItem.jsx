import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import Collapse from '@mui/material/Collapse'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import randomColor from 'randomcolor'

function WorkspaceSidebarItem({ workspace }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const routes = useMemo(
    () => ({
      boards: `/h/workspaces/${workspace._id}/boards`,
      members: `/h/workspaces/${workspace._id}/members`,
      settings: `/h/workspaces/${workspace._id}/settings`,
      billing: `/h/workspaces/${workspace._id}/billing`
    }),
    [workspace._id]
  )

  const sidebarItems = useMemo(
    () => [
      {
        key: 'boards',
        label: 'Boards',
        to: routes.boards,
        icon: <DashboardOutlinedIcon fontSize="small" />
      },
      {
        key: 'members',
        label: 'Members',
        to: routes.members,
        icon: <GroupOutlinedIcon fontSize="small" />
      },
      {
        key: 'settings',
        label: 'Settings',
        to: routes.settings,
        icon: <SettingsOutlinedIcon fontSize="small" />
      },
      {
        key: 'billing',
        label: 'Billing',
        to: routes.billing,
        icon: <ReceiptLongOutlinedIcon fontSize="small" />
      }
    ],
    [routes]
  )

  const isWorkspaceActive = sidebarItems.some((item) =>
    location.pathname.startsWith(item.to)
  )

  const isActive = (path) => location.pathname.startsWith(path)

  useEffect(() => {
    if (isWorkspaceActive) {
      setOpen(true)
    }
  }, [isWorkspaceActive])

  const toggleSection = () => {
    setOpen((prev) => !prev)
  }

  const getSubItemSx = (active) => ({
    pl: 4,
    borderRadius: 2,
    mx: 1,
    mb: 0.5,
    bgcolor: active ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
    color: active ? 'primary.main' : 'text.primary',
    '&:hover': {
      bgcolor: active ? 'rgba(25, 118, 210, 0.12)' : 'action.hover'
    }
  })

  const truncateText = (text, maxLength) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <>
      <ListItemButton
        onClick={toggleSection}
        sx={{
          borderRadius: 2,
          mb: 0.5,

          bgcolor: isWorkspaceActive ? 'action.selected' : 'transparent',
          '&:hover': {
            bgcolor: isWorkspaceActive ? 'action.selected' : 'action.hover'
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 44 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 1.5,
              bgcolor: randomColor(),
              color: '#fff'
            }}
          >
            {workspace?.title?.charAt(0)?.toUpperCase()}
          </Avatar>
        </ListItemIcon>

        <ListItemText primary={truncateText(workspace.title, 15)} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {sidebarItems.map((item) => {
            const active = isActive(item.to)

            return (
              <ListItemButton
                key={item.key}
                component={RouterLink}
                to={item.to}
                sx={getSubItemSx(active)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText primary={item.label} />
              </ListItemButton>
            )
          })}
        </List>
      </Collapse>
    </>
  )
}

export default WorkspaceSidebarItem

import React from 'react'
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box
} from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'

export default function SidebarMenu({ items, collapsed, onItemClick }) {
  const location = useLocation()

  return (
    <List sx={{ p: 0 }}>
      {items.map((item) => {
        const isActive = location.pathname === item.path

        const buttonContent = (
          <ListItemButton
            component={NavLink}
            to={item.path}
            onClick={onItemClick}
            sx={{
              minHeight: 50,
              mb: 0.75,
              px: collapsed ? 1.25 : 1.5,
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '14px',
              position: 'relative',
              color: isActive ? '#f97316' : '#0f172a',
              bgcolor: isActive ? '#fff1eb' : 'transparent',
              transition: 'all 0.25s ease',
              overflow: 'hidden',
              '&:hover': {
                bgcolor: isActive ? '#fff1eb' : '#f8fafc',
                transform: 'translateX(4px)'
              },
              '&::before': {
                content: '\'\'',
                position: 'absolute',
                left: 0,
                top: 8,
                bottom: 8,
                width: isActive ? '4px' : '0px',
                borderRadius: '0 6px 6px 0',
                bgcolor: '#f97316',
                transition: 'all 0.25s ease'
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 'auto' : 40,
                mr: collapsed ? 0 : 1,
                color: isActive ? '#f97316' : '#64748b',
                transition: 'all 0.25s ease'
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {item.icon}
              </Box>
            </ListItemIcon>

            {!collapsed && (
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 15,
                  fontWeight: isActive ? 700 : 500
                }}
              />
            )}
          </ListItemButton>
        )

        if (collapsed) {
          return (
            <Tooltip key={item.label} title={item.label} placement='right'>
              {buttonContent}
            </Tooltip>
          )
        }

        return <React.Fragment key={item.label}>{buttonContent}</React.Fragment>
      })}
    </List>
  )
}
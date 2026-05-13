import React from 'react'
import {
  Box,
  Drawer,
  Toolbar,
  Typography,
  Divider
} from '@mui/material'
import { menuSections } from './MenuItem'
import SidebarMenu from './SidebarMenu'

export default function Sidebar({
  drawerWidth,
  collapsedWidth,
  currentDrawerWidth,
  collapsed,
  mobileOpen,
  onCloseMobileSidebar
}) {
  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff'
      }}
    >
      <Toolbar
        sx={{
          minHeight: '72px !important',
          px: collapsed ? 1.5 : 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid #e5e7eb',
          transition: 'all 0.25s ease'
        }}
      >
        {collapsed ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: '#fff1eb',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18
            }}
          >
            I
          </Box>
        ) : (
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Taskio
            </Typography>
            <Typography variant='body2' sx={{ color: '#64748b' }}>
              Taskio App
            </Typography>
          </Box>
        )}
      </Toolbar>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: collapsed ? 1 : 1.5,
          py: 2
        }}
      >
        {menuSections.map((section, index) => (
          <Box key={section.title} sx={{ mb: 2.5 }}>
            {!collapsed && (
              <Typography
                variant='caption'
                sx={{
                  px: 1.5,
                  mb: 1,
                  display: 'block',
                  color: '#94a3b8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                {section.title}
              </Typography>
            )}

            <SidebarMenu
              items={section.items}
              collapsed={collapsed}
              onItemClick={onCloseMobileSidebar}
            />

            {index !== menuSections.length - 1 && (
              <Divider sx={{ mt: 2, borderColor: '#eef2f7' }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )

  return (
    <>
      <Drawer
        variant='temporary'
        open={mobileOpen}
        onClose={onCloseMobileSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e5e7eb'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant='permanent'
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: currentDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e5e7eb',
            transition: 'width 0.25s ease',
            overflowX: 'hidden'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}
import React, { useState } from 'react'
import { Box, Toolbar } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Header from '~/components/Admin/Layouts/Header'
import Sidebar from '~/components/Admin/Layouts/Sidebar'

const DRAWER_WIDTH = 260
const COLLAPSED_DRAWER_WIDTH = 88

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleToggleMobileSidebar = () => {
    setMobileOpen((prev) => !prev)
  }

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false)
  }

  const handleToggleCollapseSidebar = () => {
    setCollapsed((prev) => !prev)
  }

  const currentDrawerWidth = collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Header
        drawerWidth={currentDrawerWidth}
        collapsed={collapsed}
        onToggleMobileSidebar={handleToggleMobileSidebar}
        onToggleCollapseSidebar={handleToggleCollapseSidebar}
      />

      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_DRAWER_WIDTH}
        currentDrawerWidth={currentDrawerWidth}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobileSidebar={handleCloseMobileSidebar}
      />

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: `calc(100% - ${currentDrawerWidth}px)`
          },
          transition: 'width 0.25s ease'
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
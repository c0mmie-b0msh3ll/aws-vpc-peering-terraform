import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled, alpha } from '@mui/material/styles'

import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import HomeIcon from '@mui/icons-material/Home'
import AddIcon from '@mui/icons-material/Add'

import WorkspaceSidebarItem from './WorkspaceSidebarItem'

const SidebarRootItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 14px',
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: theme.palette.text.primary,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.03)
      : theme.palette.common.white,
  border: `1px solid ${
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.06)
      : alpha(theme.palette.common.black, 0.06)
  }`,
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.main, 0.12)
        : alpha(theme.palette.primary.main, 0.06)
  },
  '&.active': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`
  }
}))

const ItemLeft = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10
}))

function SideBar({ workspaces, handleOpenCreateWorkspaceModal }) {
  

  return (
    <Grid xs={12} sm={3} md={2}>
      <Stack spacing={1.2}>
        <SidebarRootItem className="active">
          <ItemLeft>
            <SpaceDashboardIcon fontSize="small" />
            <Typography fontSize={15} fontWeight={600}>
              Boards
            </Typography>
          </ItemLeft>
        </SidebarRootItem>

        <SidebarRootItem>
          <ItemLeft>
            <HomeIcon fontSize="small" />
            <Typography fontSize={15} fontWeight={600}>
              Home
            </Typography>
          </ItemLeft>
        </SidebarRootItem>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={1}>
        {workspaces.length === 0 && (
          <SidebarRootItem onClick={handleOpenCreateWorkspaceModal}>
            <ItemLeft>
              <AddIcon fontSize="small" />
              <Typography
                fontSize={14.5}
                color="text.secondary"
                fontWeight={500}
              >
                Create Workspace
              </Typography>
            </ItemLeft>
          </SidebarRootItem>
        )}

        {workspaces?.map((w) => (
          <WorkspaceSidebarItem key={w._id} workspace={w} />
        ))}
      </Stack>
    </Grid>
  )
}

export default SideBar

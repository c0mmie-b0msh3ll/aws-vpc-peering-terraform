import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import SideBar from '~/components/Board/SideBar'
import AppBar from '~/components/AppBar/AppBar'
import Box from '@mui/material/Box'
import CreateWorkspaceModal from '~/components/Workspace/CreateWorkspaceModal'
import { Outlet } from 'react-router-dom'
import { useHomeLayout } from '~/hooks/homeLayout.hook'

function HomeLayout() {
  const { workspaces, createModal, handleOpenCreateWorkspaceModal } =
    useHomeLayout()

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <Box sx={{ paddingX: 2, my: 4 }}>
        <Grid container spacing={2}>
          <SideBar
            workspaces={workspaces}
            handleOpenCreateWorkspaceModal={handleOpenCreateWorkspaceModal}
          />
          <Grid item xs={1} sm={1} md={1}></Grid>
          <Grid item xs={12} sm={8} md={8}>
            <Outlet />
          </Grid>
          <Grid item xs={1} sm={1} md={1}></Grid>
        </Grid>
        <CreateWorkspaceModal {...createModal} />
      </Box>
    </Container>
  )
}
export default HomeLayout

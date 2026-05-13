import UpdateWorkspaceModal from '~/components/Workspace/UpdateWorkspaceModal'
import WorkspaceHeader from '~/components/Workspace/WorkspaceHeader'
import Box from '@mui/material/Box'
import { Outlet } from 'react-router-dom'
import { useWorkspaceLayout } from '~/hooks/workspaceLayout.hook'

function WorkspaceLayout() {
  const { workspace, updateModal, handleOpenUpdateModal } = useWorkspaceLayout()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <WorkspaceHeader
        workspace={workspace}
        handleOpenUpdateModal={handleOpenUpdateModal}
      />
      <Outlet context={{ workspace }} />
      <UpdateWorkspaceModal {...updateModal} />
    </Box>
  )
}
export default WorkspaceLayout

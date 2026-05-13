import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import AddIcon from '@mui/icons-material/Add'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import WorkspaceRoleCard from '~/components/Workspace/WorkspaceRoleCard'
import CreateWorkspaceRoleModal from '~/components/Workspace/CreateWorkspaceRoleModal'
import ConfirmDialog from '~/components/Common/ConfirmDialog'
import { useWorkspaceSetting } from '~/hooks/workspaceSetting.hook'
import PopperDeleteWorkspace from '~/components/Workspace/PopperDeleteWorkspace'
import { useOutletContext } from 'react-router-dom'

function WorkspaceSettingsPage() {
  const { ui, data, handler } = useWorkspaceSetting()
  const { isUpdating, isDeletingWorkspace } = ui
  const { roles } = data
  const { handleOpenCreateModal, handleUpdateRole, handleDeleteWorkspace } =
    handler

  const { workspace } = useOutletContext()
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap'
        }}
      >
        {/* header  */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettingsOutlinedIcon fontSize="large" />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Workspace Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure permissions and manage workspace roles.
            </Typography>
          </Box>
        </Box>

        {/* button  */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            onClick={handleOpenCreateModal}
            startIcon={<AddIcon />}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              py: 1,
              minHeight: 42
            }}
          >
            Create Role
          </Button>

          <Button
            disabled={isUpdating}
            loadingPosition="center"
            onClick={handleUpdateRole}
            startIcon={
              isUpdating ? (
                <CircularProgress size="20px" />
              ) : (
                <SaveOutlinedIcon />
              )
            }
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              py: 1,
              minHeight: 42,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#0f172a' : '#fff',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? '#64b5f6' : '#1565c0'
              }
            }}
          >
            Save Changes
          </Button>
        </Stack>
      </Box>

      {/* Roles List */}
      <Stack spacing={1.5}>
        {roles.map((role) => (
          <WorkspaceRoleCard
            key={role._id}
            role={role}
            data={data.roleCard}
            handler={handler.roleCard}
          />
        ))}
      </Stack>

      <PopperDeleteWorkspace
        isDeleting={isDeletingWorkspace}
        workspace={workspace}
        handleDeleteWorkspace={handleDeleteWorkspace}
      />

      <CreateWorkspaceRoleModal
        ui={ui.createModal}
        data={data.createModal}
        handler={handler.createModal}
      />

      <ConfirmDialog {...ui.confirmDialog} {...handler.confirmDialog} />
    </>
  )
}

export default WorkspaceSettingsPage

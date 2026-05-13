import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import AddIcon from '@mui/icons-material/Add'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import ConfirmDialog from '~/components/Common/ConfirmDialog'
import { useBoardSetting } from '~/hooks/boardSetting.hook'
import CreateBoardRoleModal from '../CreateBoardRoleModal'
import BoardRoleCard from '../BoardRoleCard'
import { Alert } from '@mui/material'
import PopperDeleteBoard from '../PopperDeleteBoard'

function TabBoardSettings() {
  const { ui, data, handler } = useBoardSetting()
  const { isUpdating } = ui
  const { roles } = data
  const { handleOpenCreateModal, handleUpdateRole } = handler

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
              Board Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure permissions and manage board roles.
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
      {ui.alert.open && (
        <Alert severity={ui.alert.severity}>{ui.alert.message}</Alert>
      )}
      {/* Roles List */}
      <Stack spacing={1.5} sx={{ marginTop: '1rem' }}>
        {roles.map((role) => (
          <BoardRoleCard
            key={role._id}
            role={role}
            data={data.roleCard}
            handler={handler.roleCard}
          />
        ))}
      </Stack>
      <Box sx={{ marginTop: '10px', color: 'red', cursor: 'pointer' }}>
        <PopperDeleteBoard
          isDeleting={ui.isDeletingBoard}
          board={data.board}
          handleDeleteBoard={handler.handleDeleteBoard}
          alert={ui.alert}
        />
      </Box>

      <CreateBoardRoleModal
        ui={ui.createModal}
        data={data.createModal}
        handler={handler.createModal}
      />

      <ConfirmDialog {...ui.confirmDialog} {...handler.confirmDialog} />
    </>
  )
}

export default TabBoardSettings

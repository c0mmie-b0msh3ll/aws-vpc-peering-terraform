import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormHelperText from '@mui/material/FormHelperText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import { groupPermission } from '~/helpers/groupPermission'
import { useCreateWorkspaceRoleForm } from '~/hooks/workspaceRoleForm.hook'

function CreateWorkspaceRoleModal({ ui, data, handler }) {
  const { open, isSubmitting } = ui
  const { permissions } = data || []
  const { onClose, handleCreate } = handler

  const {
    register,
    handleSubmit,
    errors,
    selectedPermissions,
    handleClose,
    onSubmit
  } = useCreateWorkspaceRoleForm({ handleCreate, onClose })

  const grouped = groupPermission({ permissions, prefix: 'workspace.' })

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ pr: 6 }}>
        Create Workspace Role
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack
          component="form"
          spacing={3}
          onSubmit={handleSubmit(onSubmit)}
          id="create-workspace-form"
        >
          <TextField
            label="Workspace role name"
            fullWidth
            autoFocus
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name', {
              required: 'Workspace name is required',
              minLength: {
                value: 2,
                message: 'Workspace name must be at least 2 characters'
              }
            })}
          />

          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Permissions</Typography>
              <Chip
                label={`Selected: ${selectedPermissions.length}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>

            {Object.keys(grouped).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No permissions available
              </Typography>
            ) : (
              <Stack spacing={2}>
                {Object.entries(grouped).map(([groupLabel, groupItems]) => (
                  <Box
                    key={groupLabel}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ mb: 1 }}
                    >
                      {groupLabel}
                    </Typography>

                    <Divider sx={{ mb: 1.5 }} />

                    <FormGroup>
                      {groupItems.map((permission) => (
                        <FormControlLabel
                          key={permission._id || permission.permissionCode}
                          control={
                            <Checkbox
                              value={permission.permissionCode}
                              {...register('permissionCodes')}
                            />
                          }
                          label={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {permission.description}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </Box>
                ))}
              </Stack>
            )}

            {errors.permissionCodes && (
              <FormHelperText error>
                {errors.permissionCodes.message}
              </FormHelperText>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-workspace-form"
          variant="contained"
          disabled={isSubmitting}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateWorkspaceRoleModal

import {
  Avatar,
  Button,
  Chip,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import MemberActionButton from '~/components/Workspace/workspaceMember/MemberActionButton'
import { useSelector } from 'react-redux'

function formatDate(dateString) {
  if (!dateString) return '--'

  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function getStatusColor(status) {
  switch (status) {
    case 'active':
      return 'success'
    case 'removed':
      return 'error'
    default:
      return 'default'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'active':
      return 'Active'
    case 'removed':
      return 'Removed'
    default:
      return status || '--'
  }
}

function BoardMemberTable({
  members = [],
  roles = [],
  handleChangeMemberRole,
  handleRemoveMember,
  handleLeaveWorkspace
}) {
  const currentUser = useSelector((state) => state.user.currentUser)

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.04)'
                  : 'grey.50'
            }}
          >
            <TableCell sx={{ fontWeight: 700 }}>Member</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                <Typography variant="body1" color="text.secondary">
                  There are no members yet
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => {
              const displayName = member?.user?.displayName || 'Unknown User'
              const email = member?.user?.email || '--'
              const avatar = member?.user?.avatar
              const status = member?.status || '--'
              const joinAt = member?.joinAt

              return (
                <TableRow key={member?._id || email} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={avatar || undefined}
                        alt={displayName}
                        sx={{ width: 44, height: 44, fontWeight: 600 }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </Avatar>

                      <Stack spacing={0.25}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {displayName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {email}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Select
                      size="small"
                      value={member.boardRoleId || ''}
                      disabled={member.status !== 'active'}
                      onChange={(e) =>
                        handleChangeMemberRole({
                          _id: member._id,
                          newRole: e.target.value
                        })
                      }
                      displayEmpty
                      sx={{
                        minWidth: 140,
                        fontWeight: 600
                      }}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role._id} value={role._id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getStatusLabel(status)}
                      color={getStatusColor(status)}
                      size="small"
                      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(joinAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <MemberActionButton
                      member={member}
                      currentUser={currentUser}
                      handleLeaveWorkspace={handleLeaveWorkspace}
                      handleRemoveMember={handleRemoveMember}
                    />
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default BoardMemberTable

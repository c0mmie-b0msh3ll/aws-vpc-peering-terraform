import { Box, Button, TextField, Typography } from '@mui/material'
import Diversity2OutlinedIcon from '@mui/icons-material/Diversity2Outlined'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import BoardMemberTable from '../BoardMemberTable'
import { useBoardMember } from '~/hooks/boardMember.hook'
import InviteUserBoardModal from '../../BoardMember/InviteUserBoardModal'
function TabMember() {
  const { members, roles, search, handleChangeMemberRole, handleInputSearchChange, handleOpenInviteModal, handleRemoveMember,handleLeaveBoard, inviteModal } = useBoardMember()

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 1,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Diversity2OutlinedIcon fontSize="large" />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Board members
          </Typography>
        </Box>

        <Button
          startIcon={<PersonAddIcon />}
          onClick={handleOpenInviteModal}
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
          Invite Board Members
        </Button>
      </Box>
      <TextField
        fullWidth
        placeholder="Filter by name"
        value={search}
        onChange={handleInputSearchChange}
        sx={{
          mb: 2, mt: 2
        }}
      />
      <BoardMemberTable members={members} roles={roles} handleChangeMemberRole={handleChangeMemberRole}  handleRemoveMember={handleRemoveMember}
        handleLeaveWorkspace={handleLeaveBoard}
      />
      <InviteUserBoardModal {...inviteModal}/>
    </>
  )
}

export default TabMember

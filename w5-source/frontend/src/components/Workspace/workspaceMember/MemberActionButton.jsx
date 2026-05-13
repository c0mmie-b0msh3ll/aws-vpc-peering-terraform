import { useState } from 'react'

import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import LogoutIcon from '@mui/icons-material/Logout'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'

function MemberActionButton({
  member,
  currentUser,
  handleLeaveWorkspace,
  handleRemoveMember
}) {
  const [anchorEl, setAnchorEl] = useState(null)
  const isSelf = currentUser._id === member.userId
  const open = Boolean(anchorEl)

  const handleTogglePopper = (event) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget))
  }

  const handleClosePopper = () => {
    setAnchorEl(null)
  }

  const handleConfirm = async () => {
    try {
      if (isSelf) {
        await handleLeaveWorkspace({ memberId: member._id })
      } else {
        await handleRemoveMember({ memberId: member._id })
      }
      handleClosePopper()
    } catch (error) {
      console.error(error)
    }
  }

  if (member.status !== 'active') return null

  return (
    <>
      <Button
        size="small"
        color={isSelf ? 'warning' : 'error'}
        variant="outlined"
        startIcon={isSelf ? <LogoutIcon /> : <PersonRemoveIcon />}
        sx={{ width: '100px' }}
        onClick={handleTogglePopper}
      >
        {isSelf ? 'Leave' : 'Remove'}
      </Button>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="left"
        sx={{ zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClosePopper}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              width: 340,
              borderRadius: 2
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                {isSelf ? 'Leave workspace?' : 'Remove member?'}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {isSelf
                  ? 'If you leave this workspace, you may also lose access to related boards and be removed from board memberships.'
                  : 'If you remove this member, they may also lose access to related boards and associated board memberships in this workspace.'}
              </Typography>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" onClick={handleClosePopper}>
                  Cancel
                </Button>

                <Button
                  size="small"
                  color={isSelf ? 'warning' : 'error'}
                  variant="contained"
                  onClick={handleConfirm}
                >
                  {isSelf ? 'Confirm leave' : 'Confirm remove'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  )
}

export default MemberActionButton

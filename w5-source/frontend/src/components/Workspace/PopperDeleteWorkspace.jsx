import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Popper from '@mui/material/Popper'
import PopupState, { bindToggle, bindPopper } from 'material-ui-popup-state'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

function PopperDeleteWorkspace({
  isDeleting,
  workspace,
  handleDeleteWorkspace
}) {
  const [inputValue, setInputValue] = useState('')

  const workspaceName = workspace?.title

  return (
    <PopupState variant="popper" popupId="demo-popup-popper">
      {(popupState) => (
        <div>
          <Typography
            {...bindToggle(popupState)}
            sx={{
              color: 'error.main',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              fontWeight: 700,
              '&:hover': { cursor: 'pointer' }
            }}
          >
            Delete this Workspace?
          </Typography>

          <Popper
            {...bindPopper(popupState)}
            placement="top-start"
            transition
            modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper
                  sx={{
                    width: 300,
                    bgcolor: '#2c2c2c',
                    color: '#fff',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid #444',
                      px: 2,
                      py: 1,
                      position: 'relative'
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 500, color: '#aaa', fontSize: 14 }}
                    >
                      Delete Workspace?
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => popupState.close()}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        color: '#fff',
                        border: '1px solid #666',
                        borderRadius: 1,
                        p: '2px'
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Body */}
                  <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5 }}>
                      Enter the Workspace name "{workspaceName}" to delete
                    </Typography>

                    <Typography sx={{ fontSize: 13, color: '#aaa', mb: 0.5 }}>
                      Things to know:
                    </Typography>

                    <List dense disablePadding sx={{ mb: 1.5 }}>
                      {[
                        {
                          text: "This is permanent and can't be undone.",
                          underline: false
                        },
                        {
                          text: 'All boards in this Workspace will be closed.',
                          underline: true
                        },
                        {
                          text: 'Board admins can reopen boards.',
                          underline: false
                        },
                        {
                          text: 'Board members will not be able to interact with closed boards.',
                          underline: false
                        }
                      ].map((item, i) => (
                        <ListItem
                          key={i}
                          disablePadding
                          sx={{ alignItems: 'flex-start', mb: 0.5 }}
                        >
                          <FiberManualRecordIcon
                            sx={{
                              fontSize: 8,
                              mt: '6px',
                              mr: 1,
                              flexShrink: 0,
                              color: '#fff'
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: 13,
                              textDecoration: item.underline
                                ? 'underline'
                                : 'none'
                            }}
                          >
                            {item.text}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>

                    <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.5 }}>
                      Enter the Workspace name to delete
                    </Typography>

                    <TextField
                      fullWidth
                      size="small"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      sx={{
                        mb: 1.5,
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#1e1e1e',
                          color: '#fff',
                          '& fieldset': { borderColor: '#555' },
                          '&:hover fieldset': { borderColor: '#888' }
                        }
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      disabled={inputValue !== workspaceName || isDeleting}
                      onClick={handleDeleteWorkspace}
                      sx={{
                        mb: 1,
                        bgcolor:
                          inputValue === workspaceName ? 'error.main' : '#444',
                        color: inputValue === workspaceName ? '#fff' : '#888',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'error.dark' },
                        '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
                      }}
                    >
                      Delete Workspace
                    </Button>
                  </Box>
                </Paper>
              </Fade>
            )}
          </Popper>
        </div>
      )}
    </PopupState>
  )
}

export default PopperDeleteWorkspace

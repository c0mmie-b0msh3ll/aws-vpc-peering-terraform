import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'
import modalConfig from '~/config/modalConfig'
import { useCreateWorkspaceForm } from '~/hooks/createWorkspaceForm.hook'

function CreateWorkspaceModal({ isOpen, loading, onClose, onSubmit }) {
  const { register, handleSubmit, errors } = useCreateWorkspaceForm({ isOpen })

  return (
    <Modal open={isOpen} {...modalConfig} onClose={onClose}>
      <Fade in={isOpen}>
        <Box
          onClick={onClose}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: 'flex',
              width: { xs: '95vw', sm: 1000 },
              maxHeight: '90vh',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
            }}
          >
            {/* Left panel */}
            <Box
              sx={{
                flex: 1,
                bgcolor: 'background.paper',
                p: { xs: 3, sm: 5 },
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                overflowY: 'auto'
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: 'text.primary' }}
                >
                  Let's build a Workspace
                </Typography>
                <Typography
                  sx={{ color: 'text.secondary', fontSize: 14, mt: 1 }}
                >
                  Boost your productivity by making it easier for everyone to
                  access boards in one location.
                </Typography>
              </Box>

              {/* Title */}
              <Box>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontWeight: 700,
                    fontSize: 13,
                    mb: 0.75
                  }}
                >
                  Workspace title
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Taco's Co."
                  {...register('title', {
                    required: 'Workspace title is required'
                  })}
                  error={!!errors.title}
                  helperText={
                    errors.title?.message ||
                    'This is the title of your company, team or organization.'
                  }
                  FormHelperTextProps={{
                    sx: {
                      color: errors.title ? 'error.main' : 'text.secondary',
                      mx: 0
                    }
                  }}
                />
              </Box>

              {/* Description */}
              <Box>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontWeight: 700,
                    fontSize: 13,
                    mb: 0.75
                  }}
                >
                  Workspace description{' '}
                  <Box
                    component="span"
                    sx={{ color: 'text.secondary', fontWeight: 400 }}
                  >
                    Optional
                  </Box>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="Our team organizes everything here."
                  {...register('description')}
                />
                <Typography
                  sx={{ color: 'text.secondary', fontSize: 12, mt: 0.75 }}
                >
                  Get your members on board with a few words about your
                  Workspace.
                </Typography>
              </Box>

              <Button
                disabled={loading}
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: '#579dff',
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 1,
                  py: 1,
                  '&:hover': { bgcolor: '#4a8fe0' }
                }}
              >
                Continue
              </Button>
            </Box>

            {/* Right panel */}
            <Box
              sx={{
                width: { xs: 0, sm: 450 },
                display: { xs: 'none', sm: 'flex' },
                bgcolor: '#e6f4f8',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ position: 'absolute', top: 12, right: 12, color: '#555' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              {[
                { top: '18%', right: '28%', size: 22 },
                { bottom: '22%', left: '18%', size: 14 },
                { bottom: '18%', right: '22%', size: 18 },
                { top: '38%', left: '10%', size: 10 }
              ].map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    ...s,
                    width: s.size,
                    height: s.size,
                    '&::before, &::after': {
                      content: '""',
                      position: 'absolute',
                      bgcolor: '#4fc4cf',
                      borderRadius: 4
                    },
                    '&::before': {
                      width: '100%',
                      height: '20%',
                      top: '40%',
                      left: 0
                    },
                    '&::after': {
                      width: '20%',
                      height: '100%',
                      left: '40%',
                      top: 0
                    }
                  }}
                />
              ))}

              <Box
                sx={{
                  width: 260,
                  height: 190,
                  borderRadius: 2,
                  background:
                    'linear-gradient(135deg, #3bb8c4 0%, #5dd87a 100%)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 8,
                      bgcolor: 'rgba(255,255,255,0.5)',
                      borderRadius: 1
                    }}
                  />
                  <Box
                    sx={{
                      ml: 'auto',
                      width: 20,
                      height: 20,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      borderRadius: 0.5
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                  {[
                    { cards: 3, badgeColor: '#e53935' },
                    { cards: 2, badgeColor: '#fb8c00' },
                    { cards: 2, badgeColor: null }
                  ].map((col, ci) => (
                    <Box
                      key={ci}
                      sx={{
                        flex: 1,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        borderRadius: 1,
                        p: 0.75,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5
                      }}
                    >
                      <Box
                        sx={{
                          height: 6,
                          bgcolor: '#ccc',
                          borderRadius: 0.5,
                          mb: 0.25
                        }}
                      />
                      {Array.from({ length: col.cards }).map((_, ri) => (
                        <Box
                          key={ri}
                          sx={{
                            height: 22,
                            bgcolor: '#e8e8e8',
                            borderRadius: 0.5,
                            p: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.25
                          }}
                        >
                          <Box
                            sx={{
                              height: 4,
                              bgcolor: '#bbb',
                              borderRadius: 0.5,
                              width: '80%'
                            }}
                          />
                          <Box
                            sx={{
                              height: 3,
                              bgcolor: '#d0d0d0',
                              borderRadius: 0.5,
                              width: '60%'
                            }}
                          />
                          {col.badgeColor && ri === col.cards - 1 && (
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                bgcolor: col.badgeColor,
                                borderRadius: 0.5,
                                mt: 'auto'
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default CreateWorkspaceModal

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useNavigate } from 'react-router-dom'

function AccessDenied() {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate('/h')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a 0%, #111827 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          px: 4,
          py: 5,
          borderRadius: 4,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(15, 23, 42, 0.9)'
              : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(239,68,68,0.15)'
                : 'rgba(239,68,68,0.1)',
            color: 'error.main'
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography sx={{ fontSize: 30, fontWeight: 700, mb: 1 }}>
          Access Denied
        </Typography>

        <Typography
          sx={{
            fontSize: 15,
            color: 'text.secondary',
            mb: 3,
            lineHeight: 1.6
          }}
        >
          You do not have permission to access this board.
        </Typography>

        <Button
          variant="contained"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleGoBack}
          sx={{
            textTransform: 'none',
            px: 2.5,
            py: 1,
            borderRadius: 2,
            fontWeight: 600
          }}
        >
          Go back
        </Button>
      </Paper>
    </Box>
  )
}

export default AccessDenied

import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Container,
  Link
} from '@mui/material'

export default function Navbar() {
  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          color: '#172b4d',
          borderBottom: '1px solid #e6eaf0'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{ minHeight: 72, justifyContent: 'space-between' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Taskio
              </Typography>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
                <Link
                  href="#"
                  underline="none"
                  color="inherit"
                  sx={{ fontSize: 14 }}
                >
                  Features
                </Link>
                <Link
                  href="#"
                  underline="none"
                  color="inherit"
                  sx={{ fontSize: 14 }}
                >
                  Solutions
                </Link>
                <Link
                  href="#"
                  underline="none"
                  color="inherit"
                  sx={{ fontSize: 14 }}
                >
                  Plans
                </Link>
                <Link
                  href="#"
                  underline="none"
                  color="inherit"
                  sx={{ fontSize: 14 }}
                >
                  Pricing
                </Link>
                <Link
                  href="#"
                  underline="none"
                  color="inherit"
                  sx={{ fontSize: 14 }}
                >
                  Resources
                </Link>
              </Box>
            </Box>

            <Button
              variant="contained"
              sx={{
                bgcolor: '#172b4d',
                px: 3,
                borderRadius: 0,
                height: 72,
                '&:hover': { bgcolor: '#0f1d3a' }
              }}
            >
              Go to your boards
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        sx={{
          bgcolor: '#eaf2ff',
          textAlign: 'center',
          py: 1,
          borderBottom: '1px solid #dce6f5'
        }}
      >
        <Typography variant="body2" sx={{ color: '#172b4d', fontSize: 13 }}>
          Accelerate your team’s work with AI features — now available for all
          Premium and Enterprise plans.
        </Typography>
      </Box>
    </>
  )
}

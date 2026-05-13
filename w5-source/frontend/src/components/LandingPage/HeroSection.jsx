import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material'

function HeroMockup() {
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 460, md: 620 },
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 120, md: 170 },
          height: { xs: 120, md: 170 },
          bgcolor: '#f5a300',
          transform: 'rotate(45deg)',
          bottom: { xs: 40, md: 40 },
          left: { xs: 30, md: 80 },
          borderRadius: 2,
          zIndex: 1
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          width: { xs: 150, md: 230 },
          height: { xs: 150, md: 230 },
          bgcolor: '#a855f7',
          transform: 'rotate(45deg)',
          bottom: { xs: 10, md: 0 },
          left: { xs: 90, md: 150 },
          borderRadius: 2,
          zIndex: 1
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: { xs: 20, md: 10 },
          left: '52%',
          transform: 'translateX(-50%)',
          width: { xs: 220, md: 285 },
          height: { xs: 430, md: 560 },
          borderRadius: '36px',
          bgcolor: '#111',
          p: '6px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.28)',
          zIndex: 3
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '30px',
            overflow: 'hidden',
            bgcolor: '#000'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 74,
              height: 20,
              borderRadius: 999,
              bgcolor: '#0b0b0b',
              zIndex: 5
            }}
          />

          <Box
            component="video"
            autoPlay
            muted
            loop
            playsInline
            src="https://videos.ctfassets.net/rz1oowkt5gyp/4AJBdHGUKUIDo7Po3f2kWJ/3923727607407f50f70ccf34ab3e9d90/updatedhero-mobile-final.mp4"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: { xs: 80, md: 85 },
          left: { xs: '18%', md: '24%' },
          width: { xs: 26, md: 34 },
          height: { xs: 26, md: 34 },
          zIndex: 4
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 14,
            height: 2.5,
            bgcolor: '#172b4d',
            borderRadius: 999,
            transform: 'rotate(-20deg)',
            top: 2,
            left: 10
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 12,
            height: 2.5,
            bgcolor: '#172b4d',
            borderRadius: 999,
            transform: 'rotate(20deg)',
            top: 11,
            left: 18
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 14,
            height: 2.5,
            bgcolor: '#172b4d',
            borderRadius: 999,
            transform: 'rotate(5deg)',
            top: 18,
            left: 2
          }}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: { xs: 115, md: 150 },
          right: { xs: 70, md: 115 },
          width: { xs: 70, md: 90 },
          height: { xs: 40, md: 52 },
          borderTop: '3px solid #172b4d',
          borderRadius: '50%',
          transform: 'rotate(18deg)',
          zIndex: 4,
          '&::after': {
            content: '""',
            position: 'absolute',
            right: -2,
            top: -6,
            width: 10,
            height: 10,
            borderTop: '3px solid #172b4d',
            borderRight: '3px solid #172b4d',
            transform: 'rotate(35deg)'
          }
        }}
      />
    </Box>
  )
}

export default function HeroSection() {
  return (
    <Box sx={{ bgcolor: '#f5f7fb', py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={5}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: 34, md: 52 },
                lineHeight: 1.15,
                color: '#172b4d',
                mb: 2,
                fontWeight: 700
              }}
            >
              Capture, organize, and tackle your to-dos from anywhere.
            </Typography>

            <Typography sx={{ color: '#44546f', fontSize: 18, mb: 4 }}>
              Escape the clutter and chaos—unleash your productivity with Trello.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="stretch"
              sx={{
                mb: 2,
                width: '100%',
                maxWidth: 560
              }}
            >
              <TextField
                placeholder="Email"
                variant="outlined"
                fullWidth
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    bgcolor: '#fff',
                    borderRadius: '10px',
                    fontSize: 16,
                    '& fieldset': {
                      borderColor: '#d0d7de'
                    },
                    '&:hover fieldset': {
                      borderColor: '#b6c2cf'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0065ff',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    px: 2,
                    py: 1.75
                  }
                }}
              />

              <Button
                variant="contained"
                sx={{
                  minWidth: { xs: '100%', sm: 190 },
                  height: 56,
                  px: 3,
                  borderRadius: '12px',
                  bgcolor: '#0065ff',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(0, 101, 255, 0.28)',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: '#0052cc',
                    boxShadow: '0 10px 24px rgba(0, 101, 255, 0.35)'
                  }
                }}
              >
                Sign up – it’s free!
              </Button>
            </Stack>

            <Typography sx={{ fontSize: 13, color: '#6b7280', mb: 3 }}>
              By entering my email, I acknowledge the Privacy Policy.
            </Typography>

            <Button
              variant="text"
              sx={{
                p: 0,
                minWidth: 'unset',
                color: '#0c66e4',
                fontWeight: 600
              }}
            >
              Watch video
            </Button>
          </Grid>

          <Grid item xs={12} md={7}>
            <HeroMockup />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
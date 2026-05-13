import { Link, useSearchParams } from 'react-router-dom'

import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Zoom from '@mui/material/Zoom'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'

import ViewKanbanIcon from '@mui/icons-material/ViewKanban';

function CheckEmail() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')

  return (
    <Box component="form">
      <Zoom in={true} style={{ transitionDelay: '200ms' }}>
        <Card sx={{
            minWidth: 450,
            maxWidth: 450,
            marginTop: '6em',
            backgroundColor: 'rgba(20, 20, 20, 0.72)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            borderRadius: '15px',
            padding: '1em'
          }}>
          <Box
            sx={{
              margin: '1em',
              display: 'flex',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 46, height: 46 }}>
              <ViewKanbanIcon sx={{ fontSize: 30 }}/>
            </Avatar>
          </Box>

          <Box
            sx={{
              marginTop: '1em',
              display: 'flex',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              color: '#fff'
            }}
          >
            Check your email
          </Box>

          <Box
            sx={{
              backgroundImage:
                'url(https://id-frontend.prod-east.frontend.public.atl-paas.net/assets/check-your-email-open-letter.58fc87ea.svg)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              height: '6rem',
              marginTop: '1em',
              marginBottom: '1em'
            }}
          />

          <Box sx={{ padding: '0 1em 1em 1em', textAlign: 'center' }}>
            <Typography variant="caption" component="div">
              We sent a recovery link to you at
            </Typography>

            <Typography
              sx={{
                marginTop: '1em',
                fontWeight: 'bold',
                marginBottom: '0.5em',
                wordBreak: 'break-word'
              }}
            >
              {email}
            </Typography>

            <Typography variant="caption" component="div" sx={{ marginTop: '1rem' }}>
              If you haven&apos;t received the email, check your spam folder or{' '}
              <Link to="/auth/register" style={{ textDecoration: 'none' }}>
                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }}
                >
                  Sign up
                </Box>
              </Link>
            </Typography>
          </Box>

          <Box
            sx={{
              marginBottom: '1.5em',
              display: 'flex',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <Link to="/auth/login" style={{ textDecoration: 'none' }}>
              <Box
                component="span"
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
              >
                Return to log in
              </Box>
            </Link>

            <Typography component="span">|</Typography>

            <Link to="/auth/reset-password" style={{ textDecoration: 'none' }}>
              <Box
                component="span"
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
              >
                Resend recovery link
              </Box>
            </Link>
          </Box>
        </Card>
      </Zoom>
    </Box>
  )
}

export default CheckEmail
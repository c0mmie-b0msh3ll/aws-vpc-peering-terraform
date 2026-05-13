import { Link, useNavigate } from 'react-router-dom'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Zoom from '@mui/material/Zoom'

import Card from '@mui/material/Card'

import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import Box from '@mui/material/Box'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FogotPasswordAPI } from '~/apis'

function ForgotForm() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  const navigate = useNavigate()

  const submitForgotPass = (data) => {
    toast
      .promise(FogotPasswordAPI(data), {
        pending: 'Sending recovery link...',
        error: 'Failed to send recovery link. Please try again later.'
      })
      .then(() => {
        navigate(`/auth/check-email?email=${data.email}`)
      })
  }

  return (
    <form onSubmit={handleSubmit(submitForgotPass)}>
      <Zoom in={true} style={{ transitionDelay: '200ms' }}>
        <Card sx={{
            minWidth: 480,
            maxWidth: 480,
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
            Can't log in?
          </Box>

          <Box sx={{ padding: '0 1em 1em 1em' }}>
            <Typography sx={{ marginTop: '1em', fontSize: '0.8rem' }}>
              We'll send a recovery link to
            </Typography>
            <Box sx={{ marginTop: '1em' }}>
              <TextField
                fullWidth
                label="Enter email..."
                type="email"
                variant="outlined"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </Box>
          </Box>

          <CardActions sx={{ padding: '0 1em 1em 1em' }}>
            <Button
              className="interceptor-loading"
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
            >
              Send recovery link
            </Button>
          </CardActions>

          <Box sx={{ padding: '0 1em 1em 1em', textAlign: 'center' }}>
            <Link to="/auth/login" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{ color: 'primary.main', '&:hover': { color: '#ffbb39' } }}
              >
                Return to login
              </Typography>
            </Link>
          </Box>
        </Card>
      </Zoom>
    </form>
  )
}

export default ForgotForm

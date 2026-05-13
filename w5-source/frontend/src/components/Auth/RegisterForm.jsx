import { Link, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import LockIcon from '@mui/icons-material/Lock'
import Typography from '@mui/material/Typography'
import { Card as MuiCard } from '@mui/material'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Zoom from '@mui/material/Zoom'
import { useForm } from 'react-hook-form'
import {
  FIELD_REQUIRED_MESSAGE,
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  PASSWORD_CONFIRMATION_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { registerUserAPI } from '~/apis'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'

function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const navigate = useNavigate()

  const submitRegister = (data) => {
    const { email, password } = data
    toast
      .promise(registerUserAPI({ email, password }), {
        pending: 'Registration is in progress...'
      })
      .then((user) => {
        navigate(`/auth/login?registeredEmail=${user.email}`)
      })
  }

  return (
    <form onSubmit={handleSubmit(submitRegister)}>
      <Zoom in={true} style={{ transitionDelay: '200ms' }}>
        <MuiCard sx={{
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
              <LockIcon sx={{ fontSize: 30 }}/>
            </Avatar>
            <Avatar sx={{ bgcolor: 'primary.main', width: 46, height: 46 }}>
              <ViewKanbanIcon sx={{ fontSize: 30 }}/>
            </Avatar>
          </Box>
          <Box
            sx={{
              marginTop: '1em',
              display: 'flex',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.2em'
            }}
          >
            Welcome to Taskio
          </Box>

          <Box sx={{ padding: '0 1em 1em 1em' }}>
            <Box sx={{ marginTop: '1em' }}>
              <TextField
                autoFocus
                fullWidth
                label="Enter Email..."
                type="text"
                variant="outlined"
                error={!!errors['email']}
                {...register('email', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: { value: EMAIL_RULE, message: EMAIL_RULE_MESSAGE }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName={'email'} />
            </Box>

            <Box sx={{ marginTop: '1em' }}>
              <TextField
                fullWidth
                label="Enter Password..."
                type="password"
                variant="outlined"
                error={!!errors['password']}
                {...register('password', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
              />
              <FieldErrorAlert errors={errors} fieldName={'password'} />
            </Box>

            <Box sx={{ marginTop: '1em' }}>
              <TextField
                fullWidth
                label="Enter Password Confirmation..."
                type="password"
                variant="outlined"
                error={!!errors['password_confirmation']}
                {...register('password_confirmation', {
                  required: FIELD_REQUIRED_MESSAGE,
                  validate: (value) => {
                    if (value === watch('password')) return true
                    return PASSWORD_CONFIRMATION_MESSAGE
                  }
                })}
              />
            </Box>
            <FieldErrorAlert
              errors={errors}
              fieldName={'password_confirmation'}
            />
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
              Register
            </Button>
          </CardActions>
          <Box sx={{ padding: '0 1em 1em 1em', textAlign: 'center' }}>
            <Typography>Already have an account?</Typography>
            <Link to="/auth/login" style={{ textDecoration: 'none' }}>
              <Typography
                sx={{ color: 'primary.main', '&:hover': { color: '#ffbb39' } }}
              >
                Log in!
              </Typography>
            </Link>
          </Box>
        </MuiCard>
      </Zoom>
    </form>
  )
}

export default RegisterForm

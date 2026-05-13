import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import LockIcon from '@mui/icons-material/Lock'
import Typography from '@mui/material/Typography'
import { Card as MuiCard } from '@mui/material'
// import trelloLogo from '~/assets/trello.svg'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Zoom from '@mui/material/Zoom'
import Alert from '@mui/material/Alert'
import { useForm } from 'react-hook-form'
import {
  FIELD_REQUIRED_MESSAGE,
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginUserApi } from '~/redux/user/userSlice'
import { useDispatch } from 'react-redux'
import Box from '@mui/material/Box'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  let [searchParams] = useSearchParams()

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const registeredEmail = searchParams.get('registeredEmail')

  const verifiedEmail = searchParams.get('verifiedEmail')

  const emailFromChangePassword = searchParams.get('ChangePasswordEmail')

  const submitLogIn = (data) => {
    const { email, password } = data
    toast
      .promise(dispatch(loginUserApi({ email, password })), {
        pending: 'Logging in ...'
      })
      .then((res) => {
        if (!res.error) navigate('/h')
      })
  }

  return (
    <form onSubmit={handleSubmit(submitLogIn)}>
      <Zoom in={true} style={{ transitionDelay: '200ms' }}>
        <MuiCard
          sx={{
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
          }}
        >
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
          <Box
            sx={{
              marginTop: '1em',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '0 1em'
            }}
          >
            {verifiedEmail && (
              <Alert
                severity="success"
                sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}
              >
                Your email&nbsp;
                <Typography
                  variant="span"
                  sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}
                >
                  {verifiedEmail}
                </Typography>
                &nbsp;has been verified.
                <br />
                Now you can login to enjoy our services! Have a good day!
              </Alert>
            )}

            {registeredEmail && (
              <Alert
                severity="info"
                sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}
              >
                An email has been sent to&nbsp;
                <Typography
                  variant="span"
                  sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}
                >
                  {registeredEmail}
                </Typography>
                <br />
                Please check and verify your account before logging in!
              </Alert>
            )}

            {emailFromChangePassword && (
              <Alert
                severity="success"
                sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}
              >
                Your password has been changed successfully.
                <br />
                Please login with your updated credentials.
              </Alert>
            )}
          </Box>
          <Box sx={{ padding: '0 1em 1em 1em' }}>
            <Box sx={{ marginTop: '1em' }}>
              <TextField
                autoFocus
                fullWidth
                value={verifiedEmail || emailFromChangePassword}
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
              Login
            </Button>
          </CardActions>
          <Box sx={{ padding: '0 1em 1em 1em', textAlign: 'center' }}>
            <Typography>Don’t have an account yet?</Typography>
            <Typography
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <Link
                to="/auth/reset-password"
                style={{ textDecoration: 'none' }}
              >
                <Typography
                  sx={{
                    color: 'primary.main',
                    '&:hover': { color: '#ffbb39' }
                  }}
                >
                  Can't log in?
                </Typography>
              </Link>
              <Typography>or</Typography>
              <Link to="/auth/register" style={{ textDecoration: 'none' }}>
                <Typography
                  sx={{
                    color: 'primary.main',
                    '&:hover': { color: '#ffbb39' }
                  }}
                >
                  Create account!
                </Typography>
              </Link>
            </Typography>
          </Box>
        </MuiCard>
      </Zoom>
    </form>
  )
}

export default LoginForm

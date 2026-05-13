import { Link, useNavigate } from 'react-router-dom'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import Zoom from '@mui/material/Zoom'
import Card from '@mui/material/Card'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import Box from '@mui/material/Box'
import { use, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { FIELD_REQUIRED_MESSAGE, PASSWORD_CONFIRMATION_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '../Form/FieldErrorAlert'
import { ChangePassWordAPI, verifyResetPasswordToken } from '~/apis'

function ChangePassword() {
  const Verifytoken = new URLSearchParams(window.location.search).get('token');
  const Verifyemail = new URLSearchParams(window.location.search).get('email');

  const { register, watch, handleSubmit, formState: { errors } } = useForm()

  const navigate = useNavigate();

  useEffect(() => {
    if (!Verifytoken || !Verifyemail) {
      toast.error('Invalid password reset link. Please try again.')
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500)
      return
    }
    toast.promise(verifyResetPasswordToken({ token: Verifytoken, email: Verifyemail }), {
      pending: 'Verifying reset password link...',
    }).then((res) => {
      toast.success(res.message)
    }).catch(() => {
      navigate('/auth/login')
    })
  }, [Verifytoken, Verifyemail])

  const submitChangePassword = (data) => {
    const payload = {
      token: Verifytoken,
      email: Verifyemail,
      password: data.password
    }
    toast.promise(ChangePassWordAPI({ ...payload }), {
      pending: 'Changing password...',
      error: 'Failed to change password. Please try again later.'
    }).then(() => {
      setTimeout(() => {
        navigate(`/auth/login?ChangePasswordEmail=${payload.email}`)
      }, 1500)
    })
  }

  return (
    <form onSubmit={handleSubmit(submitChangePassword)}>
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
            Choose a new password
          </Box>

          <Box sx={{ padding: '0 1em 1em 1em' }}>
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
              <FieldErrorAlert
                errors={errors}
                fieldName={'password_confirmation'}
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
              Continue
            </Button>
          </CardActions>
        </Card>
      </Zoom>
    </form>
  )
}

export default ChangePassword

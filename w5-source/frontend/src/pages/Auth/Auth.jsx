import { useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import LoginForm from '~/components/Auth/LoginForm'
import RegisterForm from '~/components/Auth/RegisterForm'
import ForgotForm from '../../components/Auth/ForgotPassword'
import ChangePassword from '../../components/Auth/ChangePassword'
import CheckEmail from '../../components/Auth/CheckEmail'
import bg from '../../assets/auth/backgroundAuth.jpg'

function Auth() {
  const location = useLocation()
  const isLogin = location.pathname === '/auth/login'
  const isRegister = location.pathname === '/auth/register'
  const isResetPassword = location.pathname === '/auth/reset-password'
  const isChangePassword = location.pathname === '/auth/change-password'
  const isCheckEmail = location.pathname === '/auth/check-email'

  return (
    <Box
      data-mui-color-scheme="dark"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: 'inset 0 0 0 2000px rgba(0, 0, 0, 0.1)'
      }}
    >
      {isLogin && <LoginForm />}
      {isRegister && <RegisterForm />}
      {isResetPassword && <ForgotForm />}
      {isChangePassword && <ChangePassword />}
      {isCheckEmail && <CheckEmail />}
    </Box>
  )
}

export default Auth

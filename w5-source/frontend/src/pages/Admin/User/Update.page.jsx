import { Box } from '@mui/material'
import UpdateUserHeader from '~/components/Admin/User/UpdateUser/UpdateUserHeader'
import UpdateUserForm from '~/components/Admin/User/UpdateUser/UpdateUserForm'
import { useLocation } from 'react-router-dom'

export default function UpdateUserPage() {
  const { state } = useLocation();
  const userData = state?.userData;
  return (
    <Box>
      <UpdateUserHeader />
      <UpdateUserForm initialData={userData} />
    </Box>
  )
}
import { Box } from '@mui/material'
import CreateUserHeader from '~/components/Admin/User/CreateUser/CreateUserHeader'
import CreateUserForm from '~/components/Admin/User/CreateUser/CreateUserForm'

export default function CreateUserPage() {
  return (
    <Box>
      <CreateUserHeader />
      <CreateUserForm />
    </Box>
  )
}
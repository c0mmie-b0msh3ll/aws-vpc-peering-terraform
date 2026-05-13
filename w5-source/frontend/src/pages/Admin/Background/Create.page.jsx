import React from 'react'
import { Box } from '@mui/material'
import CreateBackgroundHeader from '~/components/Admin/Background/CreateBackground/CreateBackgorundHeader'
import CreateBackgroundForm from '~/components/Admin/Background/CreateBackground/CreateBackgroundForm'

export default function CreateBackgroundPage() {
  return (
    <Box>
      <CreateBackgroundHeader />
      <CreateBackgroundForm />
    </Box>
  )
}
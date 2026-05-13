import React from 'react'
import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import UpdateBackgroundHeader from '~/components/Admin/Background/UpdateBackground/UpdateBackgroundHeader'
import UpdateBackgroundForm from '~/components/Admin/Background/UpdateBackground/UpdateBackggroundForm'



export default function UpdateBackgroundPage() {
  const { state } = useLocation()
  const backgroundData = state?.backgroundData

  return (
    <Box>
      <UpdateBackgroundHeader />
      <UpdateBackgroundForm initialData={backgroundData} />
    </Box>
  )
}
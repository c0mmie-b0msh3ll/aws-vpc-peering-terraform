import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function UpdateWorkspaceHeader() {
  const navigate = useNavigate()

  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='flex-start'
      sx={{ mb: 2.5 }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.2
          }}
        >
          Update Workspace
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: '15px',
            color: '#4b5563'
          }}
        >
          Update workspace information
        </Typography>
      </Box>

      <Button
        variant='contained'
        onClick={() => navigate('/admin/workspace')}
        sx={{
          minWidth: 170,
          height: 40,
          px: 2,
          borderRadius: '10px',
          textTransform: 'none',
          fontSize: '14px',
          fontWeight: 600,
          color: '#ffffff',
          backgroundColor: '#ea6b3d',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#dc5f31',
            boxShadow: 'none'
          }
        }}
      >
        Go to Workspace List
      </Button>
    </Stack>
  )
}
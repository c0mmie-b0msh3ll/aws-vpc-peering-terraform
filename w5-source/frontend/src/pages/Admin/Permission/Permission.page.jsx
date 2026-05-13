import React, { useMemo, useState } from 'react'
import {
  Box,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PermissionTable from '~/components/Admin/Permission/PermissionTable'

const mockPermissions = [
  {
    _id: 'PER001',
    permissionName: 'view_dashboard',
    description: 'Allows users to access and view the dashboard page.'
  },
  {
    _id: 'PER002',
    permissionName: 'manage_users',
    description: 'Allows users to create, update, delete and manage user accounts.'
  },
  {
    _id: 'PER003',
    permissionName: 'manage_plans',
    description: 'Allows users to manage subscription plans and pricing settings.'
  },
  {
    _id: 'PER004',
    permissionName: 'manage_backgrounds',
    description: 'Allows users to manage background resources and media assets.'
  },
  {
    _id: 'PER005',
    permissionName: 'manage_templates',
    description: 'Allows users to create, update and delete board templates.'
  }
]

export default function PermissionPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)

  const filteredPermissions = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return mockPermissions

    return mockPermissions.filter((item) => {
      return (
        item.permissionName.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      )
    })
  }, [search])

  const paginatedPermissions = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage
    return filteredPermissions.slice(start, end)
  }, [filteredPermissions, page, rowsPerPage])

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='flex-start'
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '40px',
              fontWeight: 600,
              color: '#111827',
              lineHeight: 1.2
            }}
          >
            Permission
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: '22px',
              color: '#374151'
            }}
          >
            View permission list
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 2 }}
      >
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search permissions...'
          size='small'
          sx={{
            width: 280,
            '& .MuiOutlinedInput-root': {
              height: 38,
              borderRadius: '8px',
              backgroundColor: '#fff'
            },
            '& .MuiInputBase-input': {
              fontSize: '15px'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
        />
      </Stack>

      <PermissionTable
        permissions={paginatedPermissions}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredPermissions.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  )
}
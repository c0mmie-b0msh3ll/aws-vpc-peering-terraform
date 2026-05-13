import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import { useNavigate } from 'react-router-dom'
import ConfirmDeleteModal from '~/components/Admin/ModalDelete/ConfirmDeleteModal'
import UserTable from '~/components/Admin/User/UserTable'
import { useAdminUser } from '~/hooks/adminUser.hook'

export default function UserPage() {
  const navigate = useNavigate();
  
  const {
    search,
    page,
    rowsPerPage,
    deleteModalOpen,
    selectedUser,
    users,
    totalCount,
    handleSearchChange,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleChangePage,
    handleChangeRowsPerPage,
    handleEditUser,
    handleCreateUser,
    handleUpdateBlockUsers
  } = useAdminUser()
  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
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
            User
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: '22px',
              color: '#374151'
            }}
          >
            Manage your user collection
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => navigate('/admin/user/create')}
          sx={{
            textTransform: 'none',
            px: 3,
            py: 1.2,
            fontSize: '18px',
            fontWeight: 500,
            borderRadius: '8px',
            backgroundColor: '#ea6b3d',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#dc5f31',
              boxShadow: 'none'
            }
          }}
        >
          Add User
        </Button>
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <TextField
          value={search}
          onChange={handleSearchChange}
          placeholder="Search users..."
          size="small"
          sx={{
            '& .MuiInputLabel-root': {
              color: '#6b7280'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ea6b3d'
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
              color: '#111827',
              '& fieldset': {
                borderColor: '#d1d5db'
              },
              '&:hover fieldset': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ea6b3d'
              }
            },
            '& .MuiInputBase-input': {
              color: '#111827'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
        />

        <Stack direction="row" spacing={1.2}>
          <Button
            variant="outlined"
            startIcon={<FilterListOutlinedIcon />}
            sx={{
              textTransform: 'none',
              color: '#374151',
              borderColor: '#6b7280',
              backgroundColor: '#fff',
              borderRadius: '8px',
              px: 2,
              minWidth: 'auto',
              '&:hover': {
                borderColor: '#4b5563',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Filter
          </Button>

          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon />}
            sx={{
              textTransform: 'none',
              color: '#374151',
              borderColor: '#6b7280',
              backgroundColor: '#fff',
              borderRadius: '8px',
              px: 2,
              minWidth: 'auto',
              '&:hover': {
                borderColor: '#4b5563',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Excel
          </Button>
        </Stack>
      </Stack>

      <UserTable
        users={users}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEdit={handleEditUser}
        onDelete={handleOpenDeleteModal}
        onUpdateBlock={handleUpdateBlockUsers}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="Delete User"
        description={
          selectedUser
            ? `Are you sure you want to delete user "${selectedUser.displayName}"?`
            : 'Are you sure you want to delete this user?'
        }
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  )
}
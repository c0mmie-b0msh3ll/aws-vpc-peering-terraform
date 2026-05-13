import React from 'react'
import {
  Avatar,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'

function getRoleChipStyle(role) {
  const roleMap = {
    ADMIN: {
      color: '#ea580c',
      backgroundColor: '#fff1eb',
      borderColor: '#fed7aa'
    },
    CLIENT: {
      color: '#475569',
      backgroundColor: '#f8fafc',
      borderColor: '#e2e8f0'
    }
  }

  return (
    roleMap[role] || {
      color: '#475569',
      backgroundColor: '#f8fafc',
      borderColor: '#e2e8f0'
    }
  )
}

function getStatusChipStyle(isActive) {
  return isActive
    ? {
      label: 'Active',
      color: '#16a34a',
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0'
    }
    : {
      label: 'Inactive',
      color: '#dc2626',
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca'
    }
}

function getBlockStatusChipStyle(isBlocked) {
  return isBlocked
    ? {
        label: 'Block',
        color: '#dc2626',
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca'
      }
    : {
        label: 'No Block',
        color: '#0369a1',
        backgroundColor: '#e0f2fe',
        borderColor: '#bae6fd'
      }
}

export default function UserTable({
  users,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onUpdateBlock
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>#</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Avatar</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Email</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Username</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Display Name</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Role</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Active</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Status</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user, index) => {
              const roleStyle = getRoleChipStyle(user.role)
              const activeStyle = getStatusChipStyle(user.isActive)
              const blockStyle = getBlockStatusChipStyle(user.isBlocked)

              return (
                <TableRow
                  key={user._id}
                  hover
                  sx={{
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid #e5e7eb'
                    }
                  }}
                >
                  <TableCell sx={{ fontSize: '15px', color: '#1f2937' }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>

                  <TableCell>
                    <Avatar
                      src={user.avatar || ''}
                      alt={user.displayName}
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: '#e5e7eb',
                        color: '#374151'
                      }}
                    >
                      {!user.avatar
                        ? user.displayName?.charAt(0)?.toUpperCase()
                        : ''}
                    </Avatar>
                  </TableCell>

                  <TableCell sx={{ fontSize: '15px', color: '#1f2937' }}>
                    {user.email}
                  </TableCell>

                  <TableCell sx={{ fontSize: '15px', color: '#1f2937' }}>
                    {user.username}
                  </TableCell>

                  <TableCell sx={{ fontSize: '15px', color: '#1f2937' }}>
                    {user.displayName}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        color: roleStyle.color,
                        backgroundColor: roleStyle.backgroundColor,
                        border: `1px solid ${roleStyle.borderColor}`
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        color: activeStyle.color,
                        backgroundColor: activeStyle.backgroundColor,
                        border: `1px solid ${activeStyle.borderColor}`
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.isBlocked ? 'Block' : 'No Block'}
                      size="small"
                      onClick={() => onUpdateBlock(user)}
                      sx={{
                        fontWeight: 500,
                        color: blockStyle.color,
                        backgroundColor: blockStyle.backgroundColor,
                        border: `1px solid ${blockStyle.borderColor}`,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: blockStyle.backgroundColor,
                          opacity: 0.8
                        }
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(user)}
                        sx={{
                          color: '#374151',
                          '&:hover': { backgroundColor: '#f3f4f6' }
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => onDelete(user)}
                        sx={{
                          color: '#ef4444',
                          '&:hover': { backgroundColor: '#fef2f2' }
                        }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 1,
          py: 1,
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#fff'
        }}
      >
        <Typography sx={{ pl: 1, fontSize: '15px', color: '#111827' }}>
          Showing user per page
        </Typography>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 8, 10]}
          labelRowsPerPage=""
          sx={{
            '.MuiTablePagination-toolbar': {
              minHeight: 40,
              paddingLeft: 0
            },
            '.MuiTablePagination-selectLabel': {
              display: 'none'
            },
            '.MuiTablePagination-displayedRows': {
              color: '#000'
            },
            '.MuiTablePagination-select': {
              color: '#000'
            },
            '.MuiSelect-icon': {
              color: '#000'
            },
            '.MuiIconButton-root': {
              color: '#000'
            },
            '.Mui-disabled': {
              color: '#9ca3af'
            }
          }}
        />
      </Stack>
    </Paper>
  )
}
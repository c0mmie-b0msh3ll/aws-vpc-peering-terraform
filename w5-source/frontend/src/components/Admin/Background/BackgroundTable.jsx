import React from 'react'
import {
  Box,
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

function getStatusChipStyle(status) {
  return status === 'active'
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

const imageSx = {
  width: 88,
  height: 52,
  borderRadius: '8px',
  objectFit: 'cover',
  border: '1px solid #e5e7eb',
  backgroundColor: '#f3f4f6',
  display: 'block'
}

export default function BackgroundTable({
  backgrounds,
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
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Image</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Entity</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Title</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Status</TableCell>
              <TableCell sx={{ fontSize: '16px', color: '#111827' }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {backgrounds.map((background, index) => {
              const statusStyle = getStatusChipStyle(background.status)

              return (
                <TableRow
                  key={background._id}
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
                    <Box
                      component='img'
                      src={background.image}
                      alt={background.title}
                      sx={imageSx}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: '15px',
                      color: '#1f2937',
                      textTransform: 'capitalize'
                    }}
                  >
                    {background.entity}
                  </TableCell>

                  <TableCell sx={{ fontSize: '15px', color: '#1f2937', fontWeight: 500 }}>
                    {background.title}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={statusStyle.label}
                      size='small'
                      onClick={() => onUpdateBlock(background)}
                      sx={{
                        fontWeight: 500,
                        color: statusStyle.color,
                        backgroundColor: statusStyle.backgroundColor,
                        border: `1px solid ${statusStyle.borderColor}`
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction='row' spacing={0.5}>
                      <IconButton
                        size='small'
                        onClick={() => onEdit(background)}
                        sx={{
                          color: '#374151',
                          '&:hover': { backgroundColor: '#f3f4f6' }
                        }}
                      >
                        <EditOutlinedIcon fontSize='small' />
                      </IconButton>

                      <IconButton
                        size='small'
                        onClick={() => onDelete(background)}
                        sx={{
                          color: '#ef4444',
                          '&:hover': { backgroundColor: '#fef2f2' }
                        }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize='small' />
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
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{
          px: 1,
          py: 1,
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#fff',
          color: 'black'
        }}
      >
        <Typography sx={{ pl: 1, fontSize: '15px', color: '#111827' }}>
          Showing background per page
        </Typography>

        <TablePagination
          component='div'
          count={totalCount}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 8, 10]}
          labelRowsPerPage=''
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
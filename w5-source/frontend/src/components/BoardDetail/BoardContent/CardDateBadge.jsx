import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import dayjs from 'dayjs'
import CardDatesPopoverContent from '~/components/Card/CardDatesPopoverContent'

function CardDateBadge({
  clickable,
  startedAt,
  dueAt,
  isCompleted,
  handleUpdate
}) {
  const [anchorEl, setAnchorEl] = useState(null)

  if (!startedAt && !dueAt) return null

  const handleOpen = (event) => {
    if (clickable) setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const isOverdue = dueAt && dayjs().isAfter(dayjs(dueAt), 'day')
  const isDueToday = dueAt && dayjs().isSame(dayjs(dueAt), 'day')

  const label =
    startedAt && !dueAt
      ? `Started: ${dayjs(startedAt).format('MMM DD')}`
      : startedAt && dueAt
        ? `${dayjs(startedAt).format('MMM DD')} - ${dayjs(dueAt).format('MMM DD')}`
        : dayjs(dueAt).format('MMM DD')

  const backgroundColor = isCompleted
    ? '#94C748'
    : isOverdue
      ? '#c9372c'
      : isDueToday
        ? '#f8a11e'
        : 'transparent'

  const hoverBackgroundColor = isCompleted
    ? '#86b63f'
    : isOverdue
      ? '#ae2e24'
      : isDueToday
        ? '#d98c0a'
        : 'transparent'

  const isHighlighted = backgroundColor !== 'transparent'

  return (
    <Box>
      <Button
        size="small"
        onClick={handleOpen}
        startIcon={<AccessTimeOutlinedIcon />}
        sx={(theme) => ({
          textTransform: 'none',
          minWidth: 'fit-content',
          px: 1,
          py: 0.5,
          borderRadius: 1.5,
          fontSize: '12px',
          fontWeight: 500,
          color: isHighlighted
            ? theme.palette.mode === 'dark'
              ? '#000'
              : '#fff'
            : theme.palette.mode === 'dark'
              ? '#c7d1db'
              : '#44546f',
          bgcolor: isHighlighted
            ? backgroundColor
            : theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(9,30,66,0.06)',
          '&:hover': {
            bgcolor: isHighlighted
              ? hoverBackgroundColor
              : theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(9,30,66,0.1)'
          }
        })}
      >
        {label}
      </Button>

      <CardDatesPopoverContent
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        startedAt={startedAt}
        dueAt={dueAt}
        handleUpdate={handleUpdate}
      />
    </Box>
  )
}

export default CardDateBadge

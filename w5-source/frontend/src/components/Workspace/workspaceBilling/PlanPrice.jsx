import { Box, Typography } from '@mui/material'

function formatPrice(value, locale = 'en-US') {
  if (typeof value === 'number') {
    return new Intl.NumberFormat(locale).format(value)
  }

  if (typeof value === 'string') {
    const numeric = Number(String(value).replace(/[^\d]/g, ''))
    return new Intl.NumberFormat(locale).format(numeric || 0)
  }

  return '0'
}

export function PlanPrice({ price, unit, interval, selected = false }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 1,
          flexWrap: 'nowrap'
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: '26px !important',
            fontWeight: 500,
            color: selected ? '#d8b4fe' : '#c1c7d6',
            lineHeight: 1,
            flexShrink: 0
          }}
        >
          ₫
        </Typography>

        <Typography
          component="span"
          sx={{
            fontSize: '38px !important',
            lineHeight: '0.92 !important',
            fontWeight: '900 !important',
            letterSpacing: '-0.05em',
            color: '#fff',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            display: 'inline-block'
          }}
        >
          {formatPrice(price)}
        </Typography>

        <Typography
          component="span"
          sx={{
            fontSize: '16px !important',
            fontWeight: 500,
            color: '#d4d8e2',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {unit} / {interval}
        </Typography>
      </Box>
    </Box>
  )
}

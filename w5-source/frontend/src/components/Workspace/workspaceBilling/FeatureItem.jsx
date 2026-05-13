import { Box, Typography } from '@mui/material';
import { ICON_MAP } from '~/constant/BillingIcons';

export function FeatureItem({ iconKey, text, selected = false }) {
  const Icon = ICON_MAP[iconKey];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '18px 1fr',
        gap: 1.25,
        alignItems: 'start',
      }}
    >
      <Box sx={{ color: selected ? '#d8b4fe' : '#9ea4b5', mt: '2px' }}>
        {Icon ? <Icon fontSize='small' /> : null}
      </Box>

      <Typography
        variant='body2'
        sx={{
          color: selected ? '#f3e8ff' : '#d6d9e3',
          lineHeight: 1.45,
          fontSize: 14,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
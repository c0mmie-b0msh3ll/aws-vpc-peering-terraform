import { Box, Stack, Typography } from '@mui/material';
import { PlanPrice } from './PlanPrice';
import { FeatureItem } from './FeatureItem';

export function PlanCard({ plan, selected, onSelect }) {
  return (
    <Box
      onClick={() => onSelect(plan.id)}
      role='button'
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(plan.id);
        }
      }}
      sx={{
        cursor: 'pointer',
        px: { xs: 2.5, md: 3 },
        py: 3,
        borderRadius: 2,
        border: selected ? '2px solid #a855f7' : '1px solid #373c49',
        background: selected
          ? 'linear-gradient(180deg, rgba(78,35,121,0.55) 0%, rgba(42,28,62,0.72) 100%)'
          : 'linear-gradient(180deg, #242833 0%, #1f2430 100%)',
        boxShadow: selected
          ? '0 0 0 1px rgba(168,85,247,0.15), 0 16px 32px rgba(0,0,0,0.28)'
          : 'none',
        transition: 'all 0.2s ease',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
        '&:hover': {
          borderColor: selected ? '#a855f7' : '#596172',
          transform: 'translateY(-2px)',
        },
        '&:focus-visible': {
          outline: '2px solid #7aa2ff',
          outlineOffset: '2px',
        },
      }}
    >
      <Typography
        variant='h6'
        sx={{
          textAlign: 'center',
          fontWeight: 700,
          color: '#fff',
          mb: 3,
        }}
      >
        {plan.title}
      </Typography>

      <PlanPrice
        price={plan.price}
        unit={plan.currency}
        interval={plan.interval}
        selected={selected}
      />

      <Stack spacing={2}>
        {plan.features.map((feature, index) => (
          <FeatureItem
            key={`${plan.id}-${feature.iconKey}-${index}`}
            iconKey={feature.iconKey}
            text={feature.text}
            selected={selected}
          />
        ))}
      </Stack>
    </Box>
  );
}
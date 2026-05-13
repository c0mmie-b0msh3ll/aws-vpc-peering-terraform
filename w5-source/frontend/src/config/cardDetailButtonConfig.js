export const cardDetailActionButtonSx = {
  textTransform: 'none',
  minWidth: 'fit-content',
  px: 1.5,
  py: 0.75,
  borderRadius: 1.5,
  color: 'text.secondary',
  borderColor: (theme) =>
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(9,30,66,0.14)',
  bgcolor: 'transparent',
  '&:hover': {
    borderColor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.2)'
        : 'rgba(9,30,66,0.25)',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(9,30,66,0.04)'
  }
}

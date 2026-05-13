import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography
} from '@mui/material'

export default function CtaSection() {
  return (
    <Box sx={{ bgcolor: '#f1f3f7', py: { xs: 7, md: 9 } }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          align="center"
          sx={{ color: '#172b4d', fontSize: { xs: 28, md: 38 }, mb: 4 }}
        >
          Get started with Taskio today
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 2 }}
        >
          <TextField
            placeholder="Email"
            size="small"
            sx={{ width: { xs: '100%', sm: 320 }, bgcolor: '#fff' }}
          />
          <Button variant="contained" size="large">
            Sign up – it’s free!
          </Button>
        </Stack>

        <Typography align="center" sx={{ fontSize: 12, color: '#6b7280' }}>
          By entering my email, I acknowledge the Privacy Policy.
        </Typography>
      </Container>
    </Box>
  )
}

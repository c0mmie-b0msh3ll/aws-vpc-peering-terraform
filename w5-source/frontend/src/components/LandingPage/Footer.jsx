import { Box, Container, Grid, Link, Typography, Stack } from '@mui/material'

function FooterCol({ title, links }) {
  return (
    <Box>
      <Typography sx={{ color: '#fff', fontWeight: 700, mb: 2, fontSize: 14 }}>
        {title}
      </Typography>
      <Stack spacing={1}>
        {links.map((item) => (
          <Link
            key={item}
            href="#"
            underline="none"
            sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}
          >
            {item}
          </Link>
        ))}
      </Stack>
    </Box>
  )
}

export default function Footer() {
  return (
    <Box sx={{ bgcolor: '#172b4d', color: '#fff', pt: 6, pb: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} md={3}>
            <Typography variant="h5" fontWeight={800}>
              Taskio
            </Typography>
          </Grid>

          <Grid item xs={6} md={2}>
            <FooterCol
              title="About Taskio"
              links={['What’s behind the boards']}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <FooterCol title="Jobs" links={['Learn about open roles']} />
          </Grid>

          <Grid item xs={6} md={2}>
            <FooterCol title="Apps" links={['Download mobile apps']} />
          </Grid>

          <Grid item xs={6} md={3}>
            <FooterCol
              title="Contact us"
              links={['Need anything? Get in touch']}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            © Copyright 2025 Atlassian
          </Typography>

          <Stack direction="row" spacing={3}>
            <Link
              href="#"
              underline="none"
              sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              underline="none"
              sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}
            >
              Terms
            </Link>
            <Link
              href="#"
              underline="none"
              sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}
            >
              Cookies
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}

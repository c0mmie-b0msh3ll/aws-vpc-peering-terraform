import React from 'react'
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material'

function SmallCard({ title, desc, buttonText }) {
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 3,
        border: '1px solid #e6eaf0',
        boxShadow: 'none'
      }}
    >
      <Typography fontWeight={700} sx={{ mb: 2, color: '#172b4d' }}>
        {title}
      </Typography>
      <Typography sx={{ color: '#44546f', fontSize: 14, mb: 3, minHeight: 84 }}>
        {desc}
      </Typography>
      <Button variant="outlined">{buttonText}</Button>
    </Paper>
  )
}

export default function WorkSmarterSection() {
  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#fff' }}>
      <Container maxWidth="lg">
        <Typography
          sx={{ fontSize: 12, fontWeight: 700, color: '#44546f', mb: 1 }}
        >
          WORK SMARTER
        </Typography>

        <Typography
          variant="h4"
          sx={{ color: '#172b4d', fontSize: { xs: 28, md: 40 }, mb: 2 }}
        >
          Do more with Taskio
        </Typography>

        <Typography sx={{ maxWidth: 760, color: '#44546f', mb: 5 }}>
          Customize the way you organize with easy integrations, automation, and
          mirroring of your to-dos across multiple locations.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <SmallCard
              title="Integrations"
              desc="Connect the apps you use every day into your Taskio workflow or add Power-Ups to fit your specific needs."
              buttonText="Browse integrations"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <SmallCard
              title="Automation"
              desc="No-code automation is built into every Taskio board. Focus on the work that matters most and let the robots do the rest."
              buttonText="Get to know Automation"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <SmallCard
              title="Card mirroring"
              desc="View all your to-dos from multiple boards in one place. Mirror a card to keep track of work wherever you need it."
              buttonText="Compare plans"
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

import { useState } from 'react'
import { Box, Container, Grid, Paper, Typography, Stack } from '@mui/material'

const features = [
  {
    key: 'inbox',
    title: 'Inbox',
    desc: 'When it’s on your mind, it goes in your inbox. Capture your to-dos from anywhere, anytime.',
    image:
      'https://images.ctfassets.net/rz1oowkt5gyp/7lpUSxVqNRggpqzCNcnfo1/04cf35d0a0ef60e18c6575eb9a0374e4/inbox-slider.png?w=1140&fm=webp'
  },
  {
    key: 'boards',
    title: 'Boards',
    desc: 'Your to-do list may be long, but it can be manageable! Keep tabs on everything from "to-dos to tackle" to "mission accomplished!"',
    image:
      'https://images.ctfassets.net/rz1oowkt5gyp/w3lwhF5VUl2zPrQhoo6zi/87076ead73cad0973c907db1960bacfc/board-slider.png?w=1140&fm=webp'
  },
  {
    key: 'planner',
    title: 'Planner',
    desc: 'Drag, drop, get it done. Snap your top tasks into your calendar and make time for what truly matters.',
    image:
      'https://images.ctfassets.net/rz1oowkt5gyp/2CRH0gvg9NCw6tdLBHIBQy/eee39403406317dc1fc841bf3f685245/planner-slider.png?w=1140&fm=webp'
  }
]

function LeftFeatureCard({ title, desc, active, onClick }) {
  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '12px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#fff',
        transition: 'all 0.25s ease',
        boxShadow: active ? '0 10px 24px rgba(15, 23, 42, 0.10)' : 'none',
        '&:hover': {
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)'
        },
        '&::before': active
          ? {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '6px',
              bgcolor: '#14b8d4'
            }
          : undefined
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 20,
          lineHeight: 1.2,
          color: '#091e42',
          mb: 1.5
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: 18,
          lineHeight: 1.6,
          color: '#172b4d'
        }}
      >
        {desc}
      </Typography>
    </Paper>
  )
}

function SlideDots({ activeIndex, onChange }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
        mb: 2
      }}
    >
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          onClick={() => onChange(index)}
          sx={{
            width: index === activeIndex ? 58 : 10,
            height: 10,
            borderRadius: 999,
            bgcolor: index === activeIndex ? '#97a0af' : '#091e42',
            transition: 'all 0.25s ease',
            cursor: 'pointer'
          }}
        />
      ))}
    </Box>
  )
}

function PreviewSlider({ activeIndex, onChange }) {
  const currentFeature = features[activeIndex]

  return (
    <Box sx={{ width: '100%' }}>
      <SlideDots activeIndex={activeIndex} onChange={onChange} />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 3 },
          borderRadius: '16px',
          bgcolor: '#f1f2f4',
          minHeight: { xs: 220, md: 520 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          component="img"
          src={currentFeature.image}
          alt={currentFeature.title}
          sx={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '12px',
            objectFit: 'contain',
            userSelect: 'none'
          }}
        />
      </Paper>
    </Box>
  )
}

export default function ProductivitySection() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#fff' }}>
      <Container maxWidth="lg">

        <Typography
          variant="h4"
          sx={{
            color: '#172b4d',
            fontSize: { xs: 28, md: 40 },
            fontWeight: 700,
            mb: 2
          }}
        >
          Your productivity powerhouse
        </Typography>

        <Typography
          sx={{
            maxWidth: 760,
            color: '#44546f',
            fontSize: 18,
            lineHeight: 1.7,
            mb: 5
          }}
        >
          Stay organized and efficient with Inbox, Boards, and Planner. Every
          to-do, idea, or responsibility—no matter how small—finds its place,
          keeping you at the top of your game.
        </Typography>

        <Grid container spacing={{ xs: 4, md: 5 }} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              {features.map((feature, index) => (
                <LeftFeatureCard
                  key={feature.key}
                  title={feature.title}
                  desc={feature.desc}
                  active={activeIndex === index}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <PreviewSlider
              activeIndex={activeIndex}
              onChange={setActiveIndex}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
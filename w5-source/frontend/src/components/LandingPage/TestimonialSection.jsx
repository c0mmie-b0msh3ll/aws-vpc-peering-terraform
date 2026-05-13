import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const testimonials = [
  {
    quote:
      '[Taskio is] great for simplifying complex processes. As a manager, I can chunk [processes] down into bite-sized pieces for my team and then delegate that out, but still keep a bird’s-eye view.',
    author: 'Joey Rosenberg',
    role: 'Global Leadership Director at Women Who Code',
    stat: '75% of organizations report that Taskio delivers value to their business within 30 days.',
    storyLinkText: 'Read the story',
    surveyLinkText: 'Taskio TechValidate Survey'
  },
  {
    quote:
      'Whether someone is in the office, working from home, or working on-site with a client, everyone can share context and information through Taskio.',
    author: 'Sumeet Moghe',
    role: 'Product Manager at ThoughtWorks',
    stat: '81% of customers chose Taskio for its ease of use.',
    storyLinkText: 'Read the story',
    surveyLinkText: 'Taskio TechValidate Survey'
  },
  {
    quote:
      'We used Taskio to provide clarity on steps, requirements, and procedures. This was exceptional when communicating with teams that had deep cultural and language differences.',
    author: 'Jefferson Scomacao',
    role: 'Development Manager at IKEA/PTC',
    stat: '74% of customers say Taskio has improved communication with their co-workers and teams.',
    storyLinkText: 'Read the story',
    surveyLinkText: 'Taskio TechValidate Survey'
  }
]

function SliderControls({ activeIndex, onPrev, onNext, onDotClick }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={1}
      sx={{ mb: 2 }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center">
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            onClick={() => onDotClick(index)}
            sx={{
              width: index === activeIndex ? 40 : 8,
              height: 8,
              borderRadius: 999,
              bgcolor: index === activeIndex ? '#97a0af' : '#091e42',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </Stack>

      <IconButton
        onClick={onPrev}
        size="small"
        sx={{
          bgcolor: '#f1f2f4',
          '&:hover': { bgcolor: '#e9edf2' }
        }}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      <IconButton
        onClick={onNext}
        size="small"
        sx={{
          bgcolor: '#f1f2f4',
          '&:hover': { bgcolor: '#e9edf2' }
        }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Stack>
  )
}

export default function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (activeIndex === displayIndex) return

    setIsAnimating(true)

    const timer = setTimeout(() => {
      setDisplayIndex(activeIndex)
      setIsAnimating(false)
    }, 220)

    return () => clearTimeout(timer)
  }, [activeIndex, displayIndex])

  const current = testimonials[displayIndex]

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#fff' }}>
      <Container maxWidth="lg">
        <SliderControls
          activeIndex={activeIndex}
          onPrev={handlePrev}
          onNext={handleNext}
          onDotClick={setActiveIndex}
        />

        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: '12px',
            border: '1px solid #dfe1e6',
            boxShadow: '0 6px 18px rgba(9, 30, 66, 0.10)'
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              minHeight: { xs: 'auto', md: 480 }
            }}
          >
            <Box
              sx={{
                p: { xs: 3, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: '#fff',
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? 'translateY(12px)' : 'translateY(0)',
                transition: 'opacity 220ms ease, transform 220ms ease'
              }}
            >
              <Typography
                sx={{
                  color: '#091e42',
                  fontSize: { xs: 24, md: 30 },
                  lineHeight: 1.65,
                  mb: 6,
                  maxWidth: 760
                }}
              >
                {current.quote}
              </Typography>

              <Box>
                <Box
                  sx={{
                    width: 100,
                    height: '1px',
                    bgcolor: '#091e42',
                    mb: 2.5
                  }}
                />

                <Typography
                  sx={{
                    color: '#091e42',
                    fontSize: 18,
                    fontWeight: 500,
                    mb: 0.5
                  }}
                >
                  {current.author}
                </Typography>

                <Typography
                  sx={{
                    color: '#091e42',
                    fontSize: 17,
                    mb: 3
                  }}
                >
                  {current.role}
                </Typography>

                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: '#0c66e4',
                    fontSize: 16,
                    textDecoration: 'underline'
                  }}
                >
                  {current.storyLinkText}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                bgcolor: '#0b63f6',
                color: '#fff',
                p: { xs: 3, md: 5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? 'translateY(-12px)' : 'translateY(0)',
                transition: 'opacity 220ms ease, transform 220ms ease'
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 34, md: 36 },
                  lineHeight: 1.35,
                  fontWeight: 700
                }}
              >
                {current.stat}
              </Typography>

              <Typography
                component="a"
                href="#"
                sx={{
                  color: '#fff',
                  fontSize: 16,
                  textDecoration: 'underline',
                  opacity: 0.95
                }}
              >
                {current.surveyLinkText}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Typography
          align="center"
          sx={{ mt: 4, color: '#44546f', fontSize: 15 }}
        >
          Join a community of millions of users globally who are using Taskio to get more done.
        </Typography>
      </Container>
    </Box>
  )
}
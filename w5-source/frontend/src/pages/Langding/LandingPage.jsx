import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import BlueFeatureSection from '~/components/LandingPage/BlueFeatureSection'
import CtaSection from '~/components/LandingPage/CtaSection'
import Footer from '~/components/LandingPage/Footer'
import HeroSection from '~/components/LandingPage/HeroSection'
import Navbar from '~/components/LandingPage/Navbar'
import ProductivitySection from '~/components/LandingPage/ProductivitySection'
import TestimonialSection from '~/components/LandingPage/TestimonialSection'
import WorkSmarterSection from '~/components/LandingPage/WorkSmarterSection'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0065ff'
    },
    secondary: {
      main: '#172b4d'
    },
    background: {
      default: '#f8f9fb'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700
    },
    h2: {
      fontWeight: 700
    },
    h3: {
      fontWeight: 700
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  }
})

export default function LandingPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Navbar />
        <HeroSection />
        <ProductivitySection />
        <BlueFeatureSection />
        <WorkSmarterSection />
        <TestimonialSection />
        <CtaSection />
        <Footer />
      </Box>
    </ThemeProvider>
  )
}
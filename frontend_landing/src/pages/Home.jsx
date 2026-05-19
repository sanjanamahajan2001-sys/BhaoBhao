import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import ServicesSection from '../components/ServicesSection'
import TransformationsSection from '../components/TransformationsSection'
import TestimonialsSection from '../components/TestimonialsSection'
import ContactSection from '../components/ContactSection'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

function Home() {
  return (
    <>
      <Navbar />
      
      {/* 🚀 Recruiter Demo Gateway Header */}
      <div style={{
        margin: '100px auto 0 auto', // Pushes it below the sticky navbar!
        maxWidth: '1200px',
        padding: '0 20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0d1e36 0%, #1e1b4b 100%)',
          border: '2px solid rgba(196, 167, 125, 0.3)', // Custom gold border to match BhaoBhao palette!
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {/* Subtle gold/indigo radial glow */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(196, 167, 125, 0.1) 0%, transparent 80%)',
            pointerEvents: 'none'
          }}></div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            textAlign: 'center',
            zIndex: 1
          }}>
            <span style={{
              alignSelf: 'center',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: 'rgba(196, 167, 125, 0.15)',
              color: '#C4A77D', // Custom BhaoBhao gold text
              border: '1px solid rgba(196, 167, 125, 0.3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              ✨ Recruiter Sandbox Mode
            </span>
            <h3 style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: '800',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}>
              One-Click Quick-Demo Gateway
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(224, 231, 255, 0.75)',
              maxWidth: '650px',
              lineHeight: '1.5'
            }}>
              Explore the entire multi-portal full-stack ecosystem instantly. Select a role below to launch the respective portal in a new tab:
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '14px',
            width: '100%',
            zIndex: 1
          }}>
            {/* Customer Portal */}
            <a
              href={import.meta.env.VITE_CUSTOMER_PORTAL_URL || "https://bhaobhao-customer.vercel.app"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                cursor: 'pointer',
                border: 'none'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'none'; }}
            >
              👤 Customer Portal
            </a>

            {/* Groomer Portal */}
            <a
              href={import.meta.env.VITE_GROOMER_PORTAL_URL || "https://bhaobhao-groomer.vercel.app"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                backgroundColor: '#059669',
                color: '#ffffff',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)',
                cursor: 'pointer',
                border: 'none'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#047857'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#059669'; e.currentTarget.style.transform = 'none'; }}
            >
              ✂️ Groomer Portal
            </a>

            {/* Admin Portal */}
            <a
              href={import.meta.env.VITE_ADMIN_PORTAL_URL || "https://bhaobhao-admin.vercel.app"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)',
                cursor: 'pointer',
                border: 'none'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#6d28d9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; e.currentTarget.style.transform = 'none'; }}
            >
              ⚙️ Admin Portal
            </a>
          </div>
        </div>
      </div>

      <HeroSection />
      <ServicesSection />
      <TransformationsSection />
      <TestimonialsSection />
      <ContactSection />
      <CTASection />
      <Footer />
    </>
  )
}

export default Home


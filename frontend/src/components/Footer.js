import React from 'react';
import '../pages/pages.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={topSectionStyle}>
          {/* Brand Section */}
          <div style={brandSectionStyle}>
            <h2 style={logoStyle}>EasyRent</h2>
            <p style={taglineStyle}>
              The modern way to rent vehicles. Fast, secure, and reliable service for all your travel needs.
            </p>
            <div style={socialIconsStyle}>
              <a href="#" style={socialIconStyle}>
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" style={socialIconStyle}>
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" style={socialIconStyle}>
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" style={socialIconStyle}>
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div style={linksContainerStyle}>
            <div style={linkColumnStyle}>
              <h3 style={columnTitleStyle}>Company</h3>
              <a href="#" style={linkStyle}>About Us</a>
              <a href="#" style={linkStyle}>Careers</a>
              <a href="#" style={linkStyle}>Blog</a>
              <a href="#" style={linkStyle}>Press</a>
            </div>

            <div style={linkColumnStyle}>
              <h3 style={columnTitleStyle}>Support</h3>
              <a href="#" style={linkStyle}>Help Center</a>
              <a href="#" style={linkStyle}>Contact Us</a>
              <a href="#" style={linkStyle}>Pricing</a>
              <a href="#" style={linkStyle}>FAQ</a>
            </div>

            <div style={linkColumnStyle}>
              <h3 style={columnTitleStyle}>Legal</h3>
              <a href="#" style={linkStyle}>Privacy Policy</a>
              <a href="#" style={linkStyle}>Terms of Service</a>
              <a href="#" style={linkStyle}>Cookie Policy</a>
              <a href="#" style={linkStyle}>Sitemap</a>
            </div>

            <div style={linkColumnStyle}>
              <h3 style={columnTitleStyle}>Resources</h3>
              <a href="#" style={linkStyle}>Documentation</a>
              <a href="#" style={linkStyle}>API Reference</a>
              <a href="#" style={linkStyle}>Community</a>
              <a href="#" style={linkStyle}>Status</a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={dividerStyle}></div>

        {/* Bottom Section */}
        <div style={bottomSectionStyle}>
          <p style={copyrightStyle}>
            © {currentYear} EasyRent Inc. All rights reserved.
          </p>
          <div style={bottomLinksStyle}>
            <a href="#" style={bottomLinkStyle}>Terms</a>
            <span style={separatorStyle}>•</span>
            <a href="#" style={bottomLinkStyle}>Privacy</a>
            <span style={separatorStyle}>•</span>
            <a href="#" style={bottomLinkStyle}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Modern Footer Styles
const footerStyle = {
  backgroundColor: '#0a0e27',
  color: '#e0e7ff',
  padding: '3rem 0 0',
  marginTop: '4rem',
  borderTop: '1px solid #1f2a47',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
};

const topSectionStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '3rem',
  paddingBottom: '2rem',
};

const brandSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const logoStyle = {
  fontSize: '1.75rem',
  fontWeight: '700',
  color: '#fff',
  margin: 0,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const taglineStyle = {
  fontSize: '0.95rem',
  lineHeight: '1.6',
  color: '#a5b4fc',
  margin: 0,
  maxWidth: '280px',
};

const socialIconsStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem',
};

const socialIconStyle = {
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: 'rgba(102, 126, 234, 0.1)',
  color: '#667eea',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  fontSize: '1.1rem',
  border: '1px solid rgba(102, 126, 234, 0.2)',
  cursor: 'pointer',
};

const linksContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '2rem',
  gridColumn: 'span 3',
};

const linkColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const columnTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#fff',
  margin: '0 0 0.5rem 0',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const linkStyle = {
  color: '#a5b4fc',
  textDecoration: 'none',
  fontSize: '0.9rem',
  transition: 'color 0.3s ease',
  cursor: 'pointer',
};

const dividerStyle = {
  height: '1px',
  backgroundColor: '#1f2a47',
  margin: '2rem 0',
};

const bottomSectionStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '2rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const copyrightStyle = {
  fontSize: '0.9rem',
  color: '#818cf8',
  margin: 0,
};

const bottomLinksStyle = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
};

const bottomLinkStyle = {
  fontSize: '0.85rem',
  color: '#818cf8',
  textDecoration: 'none',
  transition: 'color 0.3s ease',
  cursor: 'pointer',
};

const separatorStyle = {
  color: '#4f46e5',
};

export default Footer;

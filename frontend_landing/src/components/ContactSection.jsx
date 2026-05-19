import React from 'react';

const ContactSection = () => {
  return (
    <section className="contact-section">
      <div className="container">
        <h2 className="section-title">Get in touch</h2>
        <p className="section-subtitle">
          <b>
            Have questions about our services? We're here to help! Reach out to us and we'll <br />
            get back to you as soon as possible.
          </b>
        </p>

        <div className="row g-4 justify-content-center">

          {/* Call Card */}
          <div className="col-lg-3 col-md-4">
            <div className="contact-card">
              <div className="contact-icon phone">
                <img src="./img11.png" alt="" />
              </div>
              <h5>CALL US</h5>
              <p>Available 24/7 for emergency support</p>
              <p className="contact-link">+91-7900118109</p>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div className="col-lg-3 col-md-4">
            <div 
              className="contact-card" 
              onClick={() => window.open('https://wa.me/917900118109', '_blank')}
              style={{ cursor: 'pointer' }}
            >
              <div className="contact-icon whatsapp">
                <img src="./img12.png" alt="" />
              </div>
              <h5>WHATSAPP</h5>
              <p>Quick responses via chat</p>
              <p className="contact-link">+91-7900118109</p>
            </div>
          </div>

          {/* Email Card */}
          <div className="col-lg-3 col-md-4">
            <div className="contact-card">
              <div className="contact-icon email">
                <img src="./img13.png" alt="" />
              </div>
              <h5>EMAIL SUPPORT</h5>
              <p>Detailed assistance via email</p>
              <p className="contact-link">contact@bhaobhao.in</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;


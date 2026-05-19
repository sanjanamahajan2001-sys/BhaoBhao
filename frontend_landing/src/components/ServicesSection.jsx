import React from 'react';

const ServicesSection = () => {
  return (
    <section className="services-section">
      <div className="container">
        <div className="section-intro">
          <h2 className="section-title">Why choose Bhao Bhao?</h2>
          <p><b>Salon-like pet grooming within the comfort of your home. Experience professional care tailored to
            your pet's comfort and peace of mind.</b></p>
        </div>
        
        <div className="services-grid">
          {/* Service Card 1 */}
          <div className="service-card with-image" style={{ backgroundColor: 'rgba(255, 217, 93, 1)' }}>
            <div className="service-content">
              <h5><strong>Expert stylists</strong></h5>
              <p>Professionals with 5+ years of grooming experience ensuring top-quality service.</p>
            </div>

            <div className="fix-img">
              <img src="./img6.png" alt="" />
            </div>
          </div>

          {/* Service Card 2 */}
          <div className="service-card with-image" style={{ backgroundColor: 'rgba(32, 180, 187, 1)' }}>
            <div className="service-content">
              <h5 style={{ color: 'white' }}><strong>Gentle care</strong></h5>
              <p style={{ color: 'white' }}>Curated with pet psychologists for stress-free grooming and a happy
                experience.</p>
            </div>
            <div className="fix-img">
              <img src="./img7.png" alt="" />
            </div>
          </div>

          {/* Service Card 3 */}
          <div className="service-card with-image" style={{ backgroundColor: 'rgba(15, 27, 58, 1)' }}>
            <div className="service-content">
              <h5 style={{ color: 'white' }}><strong>Mess-free</strong></h5>
              <p style={{ color: 'white' }}>We clean thoroughly after every service to leave your space sparkling.
              </p>
            </div>
            <div className="fix-img">
              <img src="./img8.png" alt="" />
            </div>
          </div>

          {/* Service Card 4 */}
          <div className="service-card with-image flexibility-card" style={{ backgroundColor: 'rgba(255, 119, 65, 1)' }}>
            <div className="service-content">
              <h5 style={{ color: 'white' }}><strong>Flexibility</strong></h5>
              <p style={{ color: 'white' }}>Book at-will appointments easily – all in just a few clicks.</p>
            </div>
            <div className="fix-img">
              <img src="./img9.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

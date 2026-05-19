import React from 'react';

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-card">
          <div className="cta-decoration circle-1"></div>
          <div className="cta-decoration circle-2"></div>

          <div className="row align-items-center">
            <div className="col-lg-6 col-8 ">
              <div className="cta-content">
                <h2 className="cta-title">Schedule care for your pet today.</h2>
                <a href="#" className="cta-btn">Book your slot</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

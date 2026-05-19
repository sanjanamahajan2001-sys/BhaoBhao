import React from 'react';
import Footer from '../components/Footer';

const CancellationPolicy = () => {
  return (
    <div className="privacy-policy-page">
      <div className="privacy-policy-container">
        <div className="privacy-policy-content">
          <h1>CANCELLATION POLICY</h1>

          <div className="cancellation-table-container">
            <table className="cancellation-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>FEE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>More than 12 hours before the service</td>
                  <td>Free</td>
                </tr>
                <tr>
                  <td>Within 12 hours of the service</td>
                  <td>Rs.200</td>
                </tr>
                <tr>
                  <td>Within 5 hours of the service</td>
                  <td>Rs.300</td>
                </tr>
                <tr>
                  <td>No fee if a professional is not assigned</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;


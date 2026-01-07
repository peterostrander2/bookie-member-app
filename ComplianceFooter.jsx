import React from 'react';

const ComplianceFooter = () => {
  return (
    <footer style={{
      backgroundColor: '#0a0a0f',
      borderTop: '1px solid #1a1a2e',
      padding: '30px 20px',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Age & Gambling Warning */}
        <div style={{
          backgroundColor: '#FF444415',
          border: '1px solid #FF444440',
          borderRadius: '10px',
          padding: '15px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            backgroundColor: '#FF4444',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
            padding: '8px 12px',
            borderRadius: '6px',
            whiteSpace: 'nowrap'
          }}>
            21+
          </div>
          <div style={{ color: '#FF6B6B', fontSize: '13px', lineHeight: '1.5' }}>
            <strong>Gambling Problem?</strong> Call <a href="tel:1-800-522-4700" style={{ color: '#FF6B6B', textDecoration: 'underline' }}>1-800-GAMBLER</a> (1-800-522-4700). 
            Must be 21+ and physically present in a legal betting state. 
            Please gamble responsibly.
          </div>
        </div>

        {/* Resource Links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '25px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <a href="https://www.ncpgambling.org/" target="_blank" rel="noopener noreferrer"
            style={{ color: '#6b7280', fontSize: '12px', textDecoration: 'none' }}>
            National Council on Problem Gambling
          </a>
          <a href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener noreferrer"
            style={{ color: '#6b7280', fontSize: '12px', textDecoration: 'none' }}>
            Gamblers Anonymous
          </a>
          <a href="https://www.begambleaware.org/" target="_blank" rel="noopener noreferrer"
            style={{ color: '#6b7280', fontSize: '12px', textDecoration: 'none' }}>
            BeGambleAware
          </a>
        </div>

        {/* State Specific Resources */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ color: '#6b7280', fontSize: '11px', textAlign: 'center', marginBottom: '10px' }}>
            STATE-SPECIFIC RESOURCES
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            fontSize: '11px'
          }}>
            <span style={{ color: '#9ca3af' }}>NJ: 1-800-GAMBLER</span>
            <span style={{ color: '#9ca3af' }}>NY: 1-877-8-HOPENY</span>
            <span style={{ color: '#9ca3af' }}>PA: 1-800-GAMBLER</span>
            <span style={{ color: '#9ca3af' }}>IL: 1-800-GAMBLER</span>
            <span style={{ color: '#9ca3af' }}>AZ: 1-800-NEXT-STEP</span>
            <span style={{ color: '#9ca3af' }}>CO: 1-800-522-4700</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          color: '#4a4a5a',
          fontSize: '11px',
          textAlign: 'center',
          lineHeight: '1.6',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 10px' }}>
            <strong style={{ color: '#6b7280' }}>DISCLAIMER:</strong> Bookie-o-em provides sports betting analysis and predictions for entertainment and informational purposes only. 
            We do not guarantee any outcomes. Past performance does not guarantee future results. 
            All betting involves risk of loss.
          </p>
          <p style={{ margin: 0 }}>
            This service is not affiliated with or endorsed by any professional sports league, team, or sportsbook. 
            Always verify odds and lines with your sportsbook before placing any wagers.
          </p>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '15px',
          borderTop: '1px solid #1a1a2e',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#00D4FF', fontWeight: 'bold', fontSize: '14px' }}>🎰 Bookie-o-em</span>
            <span style={{ color: '#4a4a5a', fontSize: '12px' }}>© 2025 All rights reserved</span>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
            <a href="/terms" style={{ color: '#6b7280', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/privacy" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ComplianceFooter;

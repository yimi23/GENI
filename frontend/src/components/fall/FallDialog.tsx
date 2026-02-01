import { useEffect, useState } from 'react';
import { socket } from '../../services/socket';
import { api } from '../../services/api';
import './FallDialog.css';

export function FallDialog() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  useEffect(() => {
    // Listen for fall detection from backend
    socket.on('fall_detected', () => {
      console.log('🚨 Fall detected event received');
      setVisible(true);
      setCountdown(60);
    });
    
    return () => {
      socket.off('fall_detected');
    };
  }, []);
  
  // Countdown timer
  useEffect(() => {
    if (visible && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Auto-call help when countdown reaches 0
    if (visible && countdown === 0) {
      handleHelp();
    }
  }, [visible, countdown]);
  
  const handleOkay = async () => {
    try {
      await api.fallOkay();
      setVisible(false);
      setCountdown(60);
    } catch (error) {
      console.error('Error reporting okay:', error);
    }
  };
  
  const handleHelp = async () => {
    try {
      await api.fallHelp();
      setVisible(false);
      setCountdown(60);
    } catch (error) {
      console.error('Error calling for help:', error);
    }
  };
  
  const handleCancel = async () => {
    try {
      await api.fallCancel();
      setVisible(false);
      setCountdown(60);
    } catch (error) {
      console.error('Error cancelling alert:', error);
    }
  };
  
  if (!visible) return null;
  
  return (
    <div className="fall-dialog-overlay">
      <div className="fall-dialog">
        <div className="fall-dialog-icon">⚠️</div>
        <h2>Fall Detected</h2>
        <p className="fall-dialog-question">Are you okay?</p>
        
        <div className="fall-dialog-countdown">
          <div className="countdown-circle">
            <span className="countdown-number">{countdown}</span>
          </div>
          <p className="countdown-text">Calling help in {countdown} seconds</p>
        </div>
        
        <div className="fall-dialog-buttons">
          <button 
            onClick={handleOkay} 
            className="btn-fall btn-okay"
          >
            I'm Okay
          </button>
          <button 
            onClick={handleHelp} 
            className="btn-fall btn-help"
          >
            I Need Help
          </button>
          <button 
            onClick={handleCancel} 
            className="btn-fall btn-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

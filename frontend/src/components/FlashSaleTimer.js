import React, { useState, useEffect } from 'react';

const FlashSaleTimer = ({ endTime, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;
      
      if (distance < 0) {
        clearInterval(timer);
        onEnd && onEnd();
        return;
      }
      
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  return (
    <div className="flash-sale-timer">
      <span className="timer-label">🔥 Flash Sale Ends In:</span>
      <div className="timer-digits">
        <span className="timer-unit">{String(timeLeft.hours).padStart(2, '0')}<small>h</small></span>
        <span>:</span>
        <span className="timer-unit">{String(timeLeft.minutes).padStart(2, '0')}<small>m</small></span>
        <span>:</span>
        <span className="timer-unit">{String(timeLeft.seconds).padStart(2, '0')}<small>s</small></span>
      </div>
    </div>
  );
};

export default FlashSaleTimer;
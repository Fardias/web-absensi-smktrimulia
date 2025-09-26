import { useState, useEffect } from 'react';
import { formatTime, formatDate } from '../utils';

const TimeCard = ({ showDate = true, title = "Waktu Saat Ini" }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="text-center">
        <div className="text-4xl font-bold text-[#003366] mb-2">
          {formatTime(currentTime)}
        </div>
        {showDate && (
          <p className="text-gray-600">{formatDate(currentTime)}</p>
        )}
      </div>
    </div>
  );
};

export default TimeCard;

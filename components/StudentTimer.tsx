// components/student/Timer.tsx
// import React, { useEffect, useState } from 'react';
// import { useTimer } from 'react-timer-hook';

// interface TimerProps {
//   expiryTimestamp: Date;
//   onExpire: () => void;
//   autoSubmit?: boolean;
// }

// export const Timer: React.FC<TimerProps> = ({ expiryTimestamp, onExpire, autoSubmit = true }) => {
//   const {
//     seconds,
//     minutes,
//     hours,
//     isRunning,
//     start,
//     pause,
//     resume,
//     restart,
//   } = useTimer({
//     expiryTimestamp,
//     onExpire: () => {
//       if (autoSubmit) {
//         onExpire();
//       }
//     }
//   });

//   const [isWarning, setIsWarning] = useState(false);
//   const [isCritical, setIsCritical] = useState(false);

//   useEffect(() => {
//     const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
//     // Warning when 5 minutes left
//     if (totalSeconds <= 300 && totalSeconds > 60) {
//       setIsWarning(true);
//       setIsCritical(false);
//     }
//     // Critical when 1 minute left
//     else if (totalSeconds <= 60) {
//       setIsWarning(false);
//       setIsCritical(true);
//     }
//     // Normal
//     else {
//       setIsWarning(false);
//       setIsCritical(false);
//     }
//   }, [hours, minutes, seconds]);

//   const formatTime = (time: number) => {
//     return time.toString().padStart(2, '0');
//   };

//   const getTimerStyles = () => {
//     if (isCritical) {
//       return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
//     } else if (isWarning) {
//       return 'bg-yellow-100 text-yellow-800 border-yellow-300';
//     } else {
//       return 'bg-blue-100 text-blue-800 border-blue-300';
//     }
//   };

//   return (
//     <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border-2 font-mono text-lg font-bold ${getTimerStyles()}`}>
//       <div className="flex items-center space-x-2">
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//         <span>
//           {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
//         </span>
//       </div>
//       {isCritical && (
//         <div className="text-xs mt-1">
//           Time almost up!
//         </div>
//       )}
//       {isWarning && (
//         <div className="text-xs mt-1">
//           less than 5 minutes remaining
//         </div>
//       )}
//     </div>
//   );
// };


// components/student/Timer.tsx
import React, { useEffect, useState } from 'react';
import { useTimer } from 'react-timer-hook';

interface TimerProps {
  expiryTimestamp: Date;
  onExpire: () => void;
  autoSubmit?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ expiryTimestamp, onExpire, autoSubmit = true }) => {
  const {
    seconds,
    minutes,
    hours,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      console.log("⏰ Timer expired!");
      if (autoSubmit) {
        setIsSubmitting(true);
        onExpire();
      }
    },
  });

  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🧠 Ensure timer restarts properly after exam loads
  useEffect(() => {
    restart(expiryTimestamp);
  }, [expiryTimestamp, restart]);

  // ⚠️ Handle visual states
  useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 300 && totalSeconds > 60) {
      setIsWarning(true);
      setIsCritical(false);
    } else if (totalSeconds <= 60) {
      setIsWarning(false);
      setIsCritical(true);
    } else {
      setIsWarning(false);
      setIsCritical(false);
    }
  }, [hours, minutes, seconds]);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const getTimerStyles = () => {
    if (isCritical) return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
    if (isWarning) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <>
      {/* Floating Timer */}
      <div
        className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border-2 font-mono text-lg font-bold shadow-md transition-colors duration-300 ${getTimerStyles()}`}
      >
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
          </span>
        </div>
        {isCritical && <div className="text-xs mt-1">Time almost up!</div>}
        {isWarning && <div className="text-xs mt-1">Less than 5 minutes remaining</div>}
      </div>

      {/* Auto-submit overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 text-lg font-semibold">Submitting your exam...</p>
            <p className="text-sm text-gray-500">Please wait, do not close this page.</p>
          </div>
        </div>
      )}
    </>
  );
};

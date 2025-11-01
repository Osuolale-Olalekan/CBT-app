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


import React, { useEffect, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import { Clock, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

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

  useEffect(() => {
    restart(expiryTimestamp);
  }, [expiryTimestamp, restart]);

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

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return (
    <>
      {/* Timer Display - Inline for all screens */}
      <div className="w-full flex justify-center">
        <div
          className={`
            inline-flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3
            rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300
            ${
              isCritical
                ? 'bg-red-600 shadow-red-500/30 ring-2 ring-red-400 animate-pulse'
                : isWarning
                ? 'bg-amber-500 shadow-amber-500/30 ring-2 ring-amber-400'
                : 'bg-blue-600 shadow-blue-500/30'
            }
          `}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {isCritical ? (
              <div className="relative">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="white" />
                <div className="absolute inset-0 animate-ping opacity-75">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            ) : isWarning ? (
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            )}
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-1 sm:gap-1.5 font-mono font-bold text-white">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-none tabular-nums">
                {formatTime(hours)}
              </span>
              <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider opacity-90 font-medium mt-0.5">
                hr
              </span>
            </div>

            {/* Colon separator */}
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-none pb-3 opacity-75">
              :
            </span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-none tabular-nums">
                {formatTime(minutes)}
              </span>
              <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider opacity-90 font-medium mt-0.5">
                min
              </span>
            </div>

            {/* Colon separator */}
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-none pb-3 opacity-75">
              :
            </span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-none tabular-nums">
                {formatTime(seconds)}
              </span>
              <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider opacity-90 font-medium mt-0.5">
                sec
              </span>
            </div>
          </div>

          {/* Status Badge (only on larger screens) */}
          {(isWarning || isCritical) && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 md:px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-white" />
              <span className="text-xs md:text-sm font-semibold text-white whitespace-nowrap">
                {isCritical ? 'Urgent!' : 'Hurry'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Warning Banner (only visible when warning/critical on mobile) */}
      {(isWarning || isCritical) && (
        <div className="sm:hidden mt-2 w-full">
          <div
            className={`
              flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
              ${isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
            `}
          >
            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {isCritical ? 'Less than 1 minute remaining!' : 'Less than 5 minutes left'}
            </span>
          </div>
        </div>
      )}

      {/* Auto-submit Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden animate-in zoom-in duration-300">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-8 text-center overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative">
                {/* Animated spinner */}
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4">
                  <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-white border-r-transparent rounded-full animate-spin"></div>
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Submitting Your Exam
                </h3>
                <p className="text-sm sm:text-base text-blue-100">
                  Please wait while we process your answers
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Info box */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                    Do Not Close This Window
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Your exam is being securely submitted to the server. This will only take a moment.
                  </p>
                </div>
              </div>

              {/* Progress steps */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Validating answers</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-700 font-medium">Uploading to server</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-50">
                  <div className="flex-shrink-0 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-500 font-medium">Generating results</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-150"></div>
                </div>
                <span className="text-xs text-gray-600 font-medium">Secure connection established</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .delay-75 {
          animation-delay: 75ms;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </>
  );
};






// // components/student/Timer.tsx
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
//     restart,
//   } = useTimer({
//     expiryTimestamp,
//     onExpire: () => {
//       console.log("⏰ Timer expired!");
//       if (autoSubmit) {
//         setIsSubmitting(true);
//         onExpire();
//       }
//     },
//   });

//   const [isWarning, setIsWarning] = useState(false);
//   const [isCritical, setIsCritical] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // 🧠 Ensure timer restarts properly after exam loads
//   useEffect(() => {
//     restart(expiryTimestamp);
//   }, [expiryTimestamp, restart]);

//   // ⚠️ Handle visual states
//   useEffect(() => {
//     const totalSeconds = hours * 3600 + minutes * 60 + seconds;
//     if (totalSeconds <= 300 && totalSeconds > 60) {
//       setIsWarning(true);
//       setIsCritical(false);
//     } else if (totalSeconds <= 60) {
//       setIsWarning(false);
//       setIsCritical(true);
//     } else {
//       setIsWarning(false);
//       setIsCritical(false);
//     }
//   }, [hours, minutes, seconds]);

//   const formatTime = (time: number) => time.toString().padStart(2, '0');

//   const getTimerStyles = () => {
//     if (isCritical) return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
//     if (isWarning) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
//     return 'bg-blue-100 text-blue-800 border-blue-300';
//   };

//   return (
//     <>
//       {/* Floating Timer */}
//       <div
//         className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg border-2 font-mono text-lg font-bold shadow-md transition-colors duration-300 ${getTimerStyles()}`}
//       >
//         <div className="flex items-center space-x-2">
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span>
//             {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
//           </span>
//         </div>
//         {isCritical && <div className="text-xs mt-1">Time almost up!</div>}
//         {isWarning && <div className="text-xs mt-1">Less than 5 minutes remaining</div>}
//       </div>

//       {/* Auto-submit overlay */}
//       {isSubmitting && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
//           <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center space-y-4">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <p className="text-gray-700 text-lg font-semibold">Submitting your exam...</p>
//             <p className="text-sm text-gray-500">Please wait, do not close this page.</p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

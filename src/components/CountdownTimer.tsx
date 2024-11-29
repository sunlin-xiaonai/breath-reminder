import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  breakInterval: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ breakInterval }) => {
  const [timeLeft, setTimeLeft] = useState<number>(breakInterval === 0 ? 6 : breakInterval * 60);
  const [timerState, setTimerState] = useState<string>('INTERVAL');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let stateChecker: NodeJS.Timeout;

    const updateTimerState = async () => {
      try {
        const currentState = await window.electron?.store.get('currentState');
        console.log('[Timer] Current state:', currentState);
        
        if (currentState !== timerState) {
          setTimerState(currentState);
          
          if (currentState === 'INTERVAL') {
            // 根据 breakInterval 设置初始时间
            setTimeLeft(breakInterval === 0 ? 6 : breakInterval * 60);
          } else if (currentState === 'NOTIFY' || currentState === 'BREAK') {
            setTimeLeft(0);
          }
        }
      } catch (error) {
        console.error('Failed to get timer state:', error);
      }
    };

    // 初始化状态
    updateTimerState();

    // 倒计时逻辑
    timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (timerState === 'NOTIFY' || timerState === 'BREAK') {
          return 0;
        }
        
        if (timerState === 'INTERVAL' && prevTime > 0) {
          return prevTime - 1;
        }
        
        return prevTime;
      });
    }, 1000);

    // 状态检查
    stateChecker = setInterval(updateTimerState, 500);

    return () => {
      clearInterval(timer);
      clearInterval(stateChecker);
    };
  }, [timerState, breakInterval]);

  // 格式化显示时间
  const formatTime = (seconds: number): string => {
    if (breakInterval === 0) {
      // 当设置为0时，显示秒数
      return `${Math.max(0, seconds)}s`;
    } else {
      // 当设置不为0时，显示分钟和秒
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  return (
    <div className="text-center">
      {formatTime(timeLeft)}
    </div>
  );
};

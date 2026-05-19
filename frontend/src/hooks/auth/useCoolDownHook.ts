import { useState, useEffect } from 'react';

export const useCooldown = (initialTime: number = 0) => {
  const [cooldownTime, setCooldownTime] = useState(initialTime);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [cooldownTime]);

  const startCooldown = (seconds: number) => {
    setCooldownTime(seconds);
  };

  const resetCooldown = () => {
    setCooldownTime(0);
  };

  return {
    cooldownTime,
    startCooldown,
    resetCooldown,
    isActive: cooldownTime > 0,
  };
};

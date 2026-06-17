import dayjs from 'dayjs';

export const calculateDuration = (entry: string, exit: string): number => {
  const start = dayjs(entry);
  const end = dayjs(exit);
  return end.diff(start, 'minute'); // Returns duration in minutes
};
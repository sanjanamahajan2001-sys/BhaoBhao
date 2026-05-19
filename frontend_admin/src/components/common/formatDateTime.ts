// Format date to short readable format
export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

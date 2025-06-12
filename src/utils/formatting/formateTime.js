export default function formateTime(seconds) {
  // Check if the input date is falsy (null, undefined, empty string, etc.)
  if (!seconds) {
    return '--'; // Return a placeholder for empty dates
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedTime = '';

  // Format hours
  formattedTime += hours > 0 ? `${hours < 10 ? '0' : ''}${hours.toFixed(0)}h ` : '';

  // Format minutes
  formattedTime +=
    minutes > 0 || hours > 0 ? `${minutes < 10 ? '0' : ''}${minutes.toFixed(0)}m ` : '';

  // Format seconds
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds.toFixed(0)}` : `${remainingSeconds.toFixed(0)}`;
  formattedTime += `${formattedSeconds}s`;

  return formattedTime;
}

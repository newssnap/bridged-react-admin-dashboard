import moment from 'moment';

export default function formatDate(date) {
  // Check if the input date is falsy (null, undefined, empty string, etc.)
  if (!date) {
    return '--'; // Return a placeholder for empty dates
  }

  // Parse the input date using Moment.js and format it as "DD-MMM-YY"
  const formattedDate = moment(date).format('DD-MMM-YY');

  return formattedDate;
}

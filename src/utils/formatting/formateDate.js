import moment from 'moment';

export default function formatDate(date) {
  // Check if the input date is falsy (null, undefined, empty string, etc.)
  if (!date) {
    return '--';
  }

  const formattedDate = moment(date).format('DD-MMM-YY HH:mm');

  return formattedDate;
}

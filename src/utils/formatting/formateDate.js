import moment from 'moment';

export default function formatDate(date, onlyDate = false) {
  // Check if the input date is falsy (null, undefined, empty string, etc.)
  if (!date) {
    return '--';
  }

  const formattedDate = onlyDate
    ? moment(date).format('DD-MMM-YY')
    : moment(date).format('DD-MMM-YY HH:mm');

  return formattedDate;
}

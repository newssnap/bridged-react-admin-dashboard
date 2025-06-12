import { CalendarOutlined } from '@ant-design/icons';
import { Popover, Button } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import Date from '../components/Date';
import Icon from '../../Icon';

function DateFilter({
  onDateChange,
  initialDateRange,
  style,
  size = 'large',
  type = 'default',
  bgColor,
}) {
  const [datePopoverVisible, setDatePopoverVisible] = useState(false);

  const handleDateChange = dates => {
    onDateChange(dates);
    setDatePopoverVisible(false);
  };

  const formatDateRange = range => {
    if (!range || !range[0] || !range[1]) return 'All Time';

    const [start, end] = range;
    const now = dayjs();
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    // If end date is today
    if (endDate.isSame(now, 'day')) {
      // Check for preset ranges
      if (startDate.isSame(now.subtract(7, 'day'), 'day')) {
        return 'Past 7 Days';
      }
      if (startDate.isSame(now.subtract(30, 'day'), 'day')) {
        return 'Past Month';
      }
      if (startDate.isSame(now.subtract(90, 'day'), 'day')) {
        return 'Past 3 Months';
      }
      if (startDate.isSame(now.subtract(180, 'day'), 'day')) {
        return 'Past 6 Months';
      }
      if (startDate.isSame(now.subtract(365, 'day'), 'day')) {
        return 'Past Year';
      }
    }

    // Same day selection
    if (startDate.isSame(endDate, 'day')) {
      return startDate.format('MMM D, YYYY');
    }

    // Same year
    if (startDate.isSame(endDate, 'year')) {
      return `${startDate.format('MMM D')} - ${endDate.format('MMM D')}, ${endDate.format('YYYY')}`;
    }

    // Different years
    return `${startDate.format('MMM D, YYYY')} - ${endDate.format('MMM D, YYYY')}`;
  };

  return (
    <Popover
      content={<Date onDateChange={handleDateChange} initialDateRange={initialDateRange} />}
      style={{ padding: 0 }}
      trigger="click"
      open={datePopoverVisible}
      onOpenChange={setDatePopoverVisible}
      placement="bottomLeft"
    >
      <Button
        size={size}
        icon={<Icon name="CalendarOutlined" style={{ width: 12, height: 12, marginTop: 4 }} />}
        style={{ ...style, backgroundColor: bgColor }}
        type={type}
      >
        {formatDateRange(initialDateRange)}{' '}
        <Icon name="ArrowRightOutlined" style={{ rotate: '90deg', width: 11, height: 11 }} />
      </Button>
    </Popover>
  );
}

export default DateFilter;

import React, { useState } from 'react';
import { DatePicker, Radio, Space, Typography, Card } from 'antd';
import dayjs from 'dayjs';

const presetOptions = [
  { label: 'Past 7 days', value: 'past7days', count: 7, unit: 'days' },
  { label: 'Past 1 Month', value: 'past1month', count: 30, unit: 'days' },
  { label: 'Past 3 Months', value: 'past3months', count: 90, unit: 'days' },
  { label: 'Past 6 Months', value: 'past6months', count: 180, unit: 'days' },
  { label: 'Past 1 Year', value: 'past1year', count: 365, unit: 'days' },
];

const { RangePicker } = DatePicker;
const { Text } = Typography;

const Date = ({ onDateChange, initialDateRange }) => {
  const [selectedOption, setSelectedOption] = useState('custom');
  const [dateRange, setDateRange] = useState(initialDateRange);

  const handleOptionChange = e => {
    const value = e.target.value;
    setSelectedOption(value);

    const now = dayjs();
    let startDate, endDate;

    switch (value) {
      case 'past7days':
        startDate = now.subtract(presetOptions[0].count, 'day');
        endDate = now;
        break;
      case 'past1month':
        startDate = now.subtract(presetOptions[1].count, 'day');
        endDate = now;
        break;
      case 'past3months':
        startDate = now.subtract(presetOptions[2].count, 'day');
        endDate = now;
        break;
      case 'past6months':
        startDate = now.subtract(presetOptions[3].count, 'day');
        endDate = now;
        break;
      case 'past1year':
        startDate = now.subtract(presetOptions[4].count, 'day');
        endDate = now;
        break;
      default:
        startDate = null;
        endDate = null;
    }

    if (startDate && endDate) {
      setDateRange([startDate, endDate]);
      onDateChange([startDate, endDate]);
    }
  };

  const handleCustomDateChange = dates => {
    setDateRange(dates);
    onDateChange(dates);
  };

  return (
    <Card size="small" style={{ width: 320, padding: 0, border: 'none' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Radio.Group
            value={selectedOption}
            onChange={handleOptionChange}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {presetOptions.map(option => (
                <Radio key={option.value} value={option.value}>
                  <Space direction="vertical" size={0}>
                    <Text>{option.label}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {`Last ${option.count} ${option.unit}`}
                    </Text>
                  </Space>
                </Radio>
              ))}
              <Radio value="custom">
                <Space direction="vertical" size={0}>
                  <Text>Custom Range</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Select specific dates
                  </Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {selectedOption === 'custom' && (
          <div>
            <RangePicker
              value={dateRange}
              onChange={handleCustomDateChange}
              size="large"
              style={{ width: '100%' }}
              presets={[
                { label: 'Today', value: [dayjs(), dayjs()] },
                { label: 'Last 7 Days', value: [dayjs().subtract(7, 'days'), dayjs()] },
                { label: 'Last 30 Days', value: [dayjs().subtract(30, 'days'), dayjs()] },
                { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
              ]}
            />
          </div>
        )}
      </Space>
    </Card>
  );
};

export default Date;

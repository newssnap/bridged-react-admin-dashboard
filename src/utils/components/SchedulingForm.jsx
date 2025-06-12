import { Drawer } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsSchedulingFormOpen } from '../../redux/slices/schedulingFormSlice';

function SchedulingForm() {
  const isSchedulingFormOpen = useSelector(state => state.schedulingForm.isSchedulingFormOpen);
  const dispatch = useDispatch();

  return (
    <Drawer
      title="Schedule a Meeting"
      onClose={() => {
        dispatch(setIsSchedulingFormOpen(false));
      }}
      closeIcon
      open={isSchedulingFormOpen}
      width={1000}
      style={{
        zIndex: 2147483647,
      }}
    >
      <iframe
        title="calendly"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px',
        }}
        src="https://meetings-eu1.hubspot.com/maanas-mediratta/customer-query"
        frameborder="0"
      ></iframe>
    </Drawer>
  );
}

export default SchedulingForm;

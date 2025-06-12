import React, { cloneElement } from 'react';
import useGetTitleHeight from '../controllers/useGetTitleHeight';

function TitleLeftBorder({ children, style, isError, rerenderState }) {
  const [titleRef, titleHeight] = useGetTitleHeight();

  // Clone the single child and assign titleRef as a ref
  const childWithRef = cloneElement(children, { ref: titleRef });

  return (
    <>
      <span
        className="cardLeftTitleBorder"
        style={{
          height: titleHeight,
          ...style,
          borderColor: isError && 'red',
        }}
      ></span>
      {childWithRef}
    </>
  );
}

export default TitleLeftBorder;

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

function Icon({ name, size = 'medium', style = {}, className = '', color = 'black', onClick }) {
  // Define the initial size style based on the 'size' prop
  const initialSizeStyle = {
    width: size === 'small' ? '8px' : '15px',
  };

  // State to manage the size style
  const [sizeStyle, setSizeStyle] = useState(initialSizeStyle);

  // Determine the color class name based on the 'color' prop
  const colorClassName = color === 'white' ? 'whiteIcon' : color === 'primary' ? 'primaryIcon' : '';

  // Update the size style when the 'size' prop changes
  useEffect(() => {
    setSizeStyle({
      width: size === 'small' ? '8px' : '15px',
    });
  }, [size]);

  // Assemble the final icon element
  return (
    <img
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
      className={classNames('icon', className, colorClassName)}
      style={{ ...sizeStyle, ...style }}
      src={`../../../icons/${name}.svg`} // Update the path to the actual location of your icons
      alt={name}
    />
  );
}

export default Icon;

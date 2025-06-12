import { useState, useEffect } from "react";

function useGetWindowWidth() {
  // Initialize width with the current window.innerWidth
  const [width, setWidth] = useState(window.innerWidth);

  // Effect to update width when window is resized
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Attach the event listener
    window.addEventListener("resize", handleResize);

    // Clean up by removing the event listener when unmounting
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array ensures the effect runs only once

  return width;
}

export default useGetWindowWidth;

import { useState, useEffect, useRef } from "react";

function useGetTitleHeight() {
  // State to store the height of the element
  const [elementHeight, setElementHeight] = useState(null);

  // Ref to reference the DOM element whose height we want to measure
  const elementRef = useRef(null);

  // Function to calculate and update the element's height
  const getElementHeight = () => {
    if (elementRef.current) {
      const height = elementRef.current.clientHeight;
      setElementHeight(height);
    }
  };

  // Effect to initialize the element's height and set up a resize event listener
  useEffect(() => {
    // Get and set the initial element height
    getElementHeight();

    // Add a resize event listener to update the height when the window is resized
    window.addEventListener("resize", getElementHeight);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", getElementHeight);
    };
  }, []);

  // Return an array with the element ref and the element height
  return [elementRef, elementHeight];
}

export default useGetTitleHeight;

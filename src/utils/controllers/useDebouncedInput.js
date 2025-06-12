import { useState, useEffect } from 'react';

const useDebouncedInput = defaultValue => {
  // State for the current input value
  const [inputQuery, setInputQuery] = useState(defaultValue || '');
  // State for the debounced input value
  const [debouncedValue, setDebouncedValue] = useState(inputQuery);

  useEffect(() => {
    // Set up a timeout to update debouncedValue after a specified delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(inputQuery);
    }, 300);

    // Cleanup: Clear the timeout if the input changes before the delay elapses
    return () => clearTimeout(timeoutId);
  }, [inputQuery]);

  // Handler function to update the inputQuery
  const inputHandler = e => {
    setInputQuery(e);
  };

  return {
    inputQuery,
    debouncedValue,
    inputHandler,
  };
};

export default useDebouncedInput;

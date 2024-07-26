import { useState, useEffect } from 'react';

const DisappearingText = ({ text, keyProp }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set the text to be visible when the component mounts or when text prop changes
    setIsVisible(true);

    // Set a timer to hide the text after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); 

    // Cleanup function to clear the timer if the component unmounts or text prop changes
    return () => clearTimeout(timer);
  }, [keyProp]);

  return (
    <div>
      {isVisible && <div>{text}</div>}
    </div>
  );
};

export default DisappearingText;

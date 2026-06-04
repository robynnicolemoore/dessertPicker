import React from 'react';
import './LoadingSpinner.css';

const MESSAGES = [
  'Sifting through recipes…',
  'Asking the baking expert…',
  'Finding your perfect match…',
  'Almost ready…',
];

export default function LoadingSpinner() {
  const [msgIndex, setMsgIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="spinner-container">
      <div className="spinner-ring">
        <div className="spinner-inner" />
      </div>
      <p className="spinner-message">{MESSAGES[msgIndex]}</p>
    </div>
  );
}

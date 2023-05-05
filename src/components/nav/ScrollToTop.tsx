import { useEffect, useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    console.log('scrollY', window.scrollY);
  });

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <button
        type="button"
        onClick={scrollToTop}
        className={`
          ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } inline-flex items-center rounded-full bg-blue-700 p-3 text-white shadow-sm transition-opacity hover:bg-blue-600
        `}
      >
        <ArrowUpTrayIcon
          className={`h-6 w-6 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

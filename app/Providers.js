'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from '../Store/store';

export default function Providers({ children }) {
  useEffect(() => {
    // Remove attributes added by browser extensions
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      const body = document.body;
      
      // Check for extension-added attributes and log them
      const extensionAttrs = Array.from(html.attributes)
        .filter(attr => attr.name.includes('jf-') || attr.name.includes('observer'));
      
      if (extensionAttrs.length > 0) {
        console.warn('⚠️ Browser extension attributes detected:', extensionAttrs.map(a => a.name));
      }
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

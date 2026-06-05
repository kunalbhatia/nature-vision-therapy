import { useMemo } from 'react';

export const useAnaglyphRenderer = () => {
  const filters = useMemo(() => ({
    red: 'url(#red-channel)',
    cyan: 'url(#cyan-channel)',
    none: 'none'
  }), []);

  const svgFilters = `
    <svg style="display: none;">
      <defs>
        <filter id="red-channel">
          <feColorMatrix 
            type="matrix" 
            values="1 0 0 0 0  
                    0 0 0 0 0  
                    0 0 0 0 0  
                    0 0 0 1 0" 
          />
        </filter>
        <filter id="cyan-channel">
          <feColorMatrix 
            type="matrix" 
            values="0 0 0 0 0  
                    0 1 0 0 0  
                    0 0 1 0 0  
                    0 0 0 1 0" 
          />
        </filter>
      </defs>
    </svg>
  `;

  return {
    filters,
    svgFilters
  };
};

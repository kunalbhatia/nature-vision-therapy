import React from 'react';

interface AnaglyphWrapperProps {
  children: React.ReactNode;
}

export default function AnaglyphWrapper({ children }: AnaglyphWrapperProps) {
  return (
    <>
      <svg style={{ display: 'none' }}>
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
          <filter id="red-blue-fusion">
             {/* This filter can be used to combine or process both */}
          </filter>
        </defs>
      </svg>
      <div className="relative w-full h-full overflow-hidden bg-gray-900 rounded-xl cursor-crosshair">
        {children}
      </div>
    </>
  );
}

export const RedEye: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, style, ...props }) => (
  <div style={{ filter: 'url(#red-channel)', ...style }} className={className} {...props}>
    {children}
  </div>
);

export const CyanEye: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, style, ...props }) => (
  <div style={{ filter: 'url(#cyan-channel)', ...style }} className={className} {...props}>
    {children}
  </div>
);

export const BothEyes: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, style, ...props }) => (
  <div className={className} style={style} {...props}>
    {children}
  </div>
);

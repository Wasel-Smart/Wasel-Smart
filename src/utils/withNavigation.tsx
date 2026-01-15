import React from 'react';
import { useNavigate } from 'react-router-dom';

// Typed HOC that provides a legacy `onNavigate` prop.
// If `props` is supplied, it returns a ready element; otherwise it returns a component.
export type WithNavigationProps = {
  onNavigate?: (page: string) => void;
};

export const withNavigation = <P extends object>(
  Component: React.ComponentType<P & WithNavigationProps>,
  props?: P
) => {
  const Wrapper: React.FC<P> = (injectedProps) => {
    const navigate = useNavigate();
    const handleNavigate = (page: string) => {
      if (page === 'dashboard') navigate('/');
      else navigate(`/${page}`);
    };

    return <Component {...(props as P)} {...(injectedProps as P)} onNavigate={handleNavigate} />;
  };

  return props ? <Wrapper /> : (Wrapper as unknown as React.ComponentType<any>);
};

export default withNavigation;

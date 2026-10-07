'use client';

import {forwardRef, type ComponentPropsWithoutRef} from 'react';

/**
 * Store pages are server-rendered documents. Keep document navigation native so
 * it works in embedded previews and does not depend on a client RSC transition.
 * Normal anchor behaviour also preserves open-in-new-tab and browser history.
 */
const SiteLink=forwardRef<HTMLAnchorElement,ComponentPropsWithoutRef<'a'>>(
  function SiteLink({children,...props},ref){
    return <a ref={ref} {...props}>{children}</a>;
  }
);

export default SiteLink;

//import Head from 'next/head'
import React from 'react';
import { description } from '../package.json';

export const pageTitle = description;

export const Layout = ({ href, children, title = pageTitle }) => {

  return (<div className="page">
    {/* <Head>
      <title>{title}</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.svg' />
    </Head> */}
    <style jsx>{`
      main {
        padding: 20px;
      }
    `}</style>
    <div className="gd-header header-6 is-loaded">
      <div className="gd-header-logo gd-header-measure"><img src="https://secure.gooddata.com/images/header/logo.png" title="GoodData" /></div>
    </div>

    <main>{children}</main>
  </div>);
};

export default Layout;

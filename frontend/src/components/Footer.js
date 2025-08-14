const React = require('react');

function Footer() {
  return React.createElement(
    'footer',
    { 
      style: {
        padding: '0.8rem',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #eaeaea',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#666',
        marginTop: 'auto'
      } 
    },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'center', gap: '1.5rem' } },
      React.createElement('a', { href: '#', style: { color: '#666', textDecoration: 'none' } }, 'About'),
      React.createElement('a', { href: '#', style: { color: '#666', textDecoration: 'none' } }, 'Privacy'),
      React.createElement('a', { href: '#', style: { color: '#666', textDecoration: 'none' } }, 'Terms'),
      React.createElement('a', { href: '#', style: { color: '#666', textDecoration: 'none' } }, 'Contact'),
      React.createElement('span', null, '© 2023 WeSee')
    )
  );
}

module.exports = Footer;
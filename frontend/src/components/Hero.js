const React = require('react');

function Hero() {
  return React.createElement(
    'div',
    { 
      style: {
        padding: '3rem 0',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #0071e3 0%, #00c6fb 100%)',
        borderRadius: '12px',
        color: 'white',
        textAlign: 'center'
      } 
    },
    React.createElement('h1', { style: { fontSize: '2.5rem', marginBottom: '1rem' } }, 'See the world differently'),
    React.createElement('p', { style: { fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 1.5rem' } }, 'Explore new perspectives and discover amazing experiences'),
    React.createElement('button', { className: 'button', style: { backgroundColor: 'white', color: '#0071e3', padding: '0.8rem 2rem' } }, 'Get Started')
  );
}

module.exports = Hero;
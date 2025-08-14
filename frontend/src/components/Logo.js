const React = require('react');

function Logo() {
  return React.createElement(
    'svg',
    {
      width: '40',
      height: '40',
      viewBox: '0 0 40 40',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    },
    React.createElement('circle', {
      cx: '20',
      cy: '20',
      r: '18',
      stroke: '#0071e3',
      strokeWidth: '3',
      fill: 'none'
    }),
    React.createElement('path', {
      d: 'M14 20C14 16.6863 16.6863 14 20 14C23.3137 14 26 16.6863 26 20',
      stroke: '#0071e3',
      strokeWidth: '3',
      strokeLinecap: 'round'
    }),
    React.createElement('circle', {
      cx: '20',
      cy: '26',
      r: '2',
      fill: '#0071e3'
    })
  );
}

module.exports = Logo;
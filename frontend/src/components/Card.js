const React = require('react');

function Card({ title, description, buttonText }) {
  return React.createElement(
    'div',
    { className: 'card' },
    React.createElement('h2', null, title),
    React.createElement('p', null, description),
    React.createElement('button', { className: 'button' }, buttonText)
  );
}

module.exports = Card;
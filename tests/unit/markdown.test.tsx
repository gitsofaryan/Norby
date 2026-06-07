import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReactMarkdown from 'react-markdown';
import React from 'react';

describe('ReactMarkdown rendering', () => {
  it('renders markdown images correctly with custom img component', () => {
    const text = 'Check this out: ![image](https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400)';
    
    render(
      <ReactMarkdown
        components={{
          img: ({ node, ...props }) => <img style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }} {...props} data-testid="custom-img" />,
          p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
          a: ({ node, ...props }) => <a style={{ textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer" {...props} />
        }}
      >
        {text}
      </ReactMarkdown>
    );

    const img = screen.getByTestId('custom-img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400');
    expect(img).toHaveAttribute('alt', 'image');
  });
});

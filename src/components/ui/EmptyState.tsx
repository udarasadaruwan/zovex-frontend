import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  text: string;
}

export default function EmptyState({ title, text }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>{text}</p>
      <Button as={Link} to="/products">
        Browse products
      </Button>
    </section>
  );
}

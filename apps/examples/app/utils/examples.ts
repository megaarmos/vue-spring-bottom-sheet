export interface Example {
  slug: string
  title: string
  description: string
}

export const examples: Example[] = [
  {
    slug: 'basic',
    title: 'Basic Example',
    description: 'The simplest implementation with default settings.',
  },
  {
    slug: 'blocking',
    title: 'Blocking Example',
    description: 'A sheet that blocks interactions with underlying content.',
  },
  {
    slug: 'snap-points',
    title: 'Snap Points Example',
    description: 'Define custom stopping positions (px or %).',
  },
  {
    slug: 'header-footer',
    title: 'With Header and Footer',
    description: 'Using slots for complete layout control.',
  },
  {
    slug: 'list-menu',
    title: 'List/Menu Example',
    description: 'Perfect for action sheets and menus.',
  },
  {
    slug: 'form',
    title: 'Form Example',
    description: 'A sheet containing a complete form.',
  },
  {
    slug: 'image-gallery',
    title: 'Image Gallery Example',
    description: 'Display images in a bottom sheet.',
  },
  {
    slug: 'events',
    title: 'Event Handling Example',
    description: 'Demonstrating all lifecycle events.',
  },
]

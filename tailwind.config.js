/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  darkMode: ['class'],
  content: ['src/**/*.{ts,tsx}'],
  prefix: 'pk-',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--pk-border))',
        input: 'hsl(var(--pk-input))',
        ring: 'hsl(var(--pk-ring))',
        background: 'hsl(var(--pk-background))',
        foreground: 'hsl(var(--pk-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--pk-primary))',
          foreground: 'hsl(var(--pk-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--pk-secondary))',
          foreground: 'hsl(var(--pk-secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--pk-destructive))',
          foreground: 'hsl(var(--pk-destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--pk-muted))',
          foreground: 'hsl(var(--pk-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--pk-accent))',
          foreground: 'hsl(var(--pk-accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--pk-popover))',
          foreground: 'hsl(var(--pk-popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--pk-card))',
          foreground: 'hsl(var(--pk-card-foreground))',
        },
      },
      borderRadius: {
        lg: `var(--pk-radius)`,
        md: `calc(var(--pk-radius) - 2px)`,
        sm: 'calc(var(--pk-radius) - 4px)',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
  plugins: [require('tailwindcss-animate')],
};

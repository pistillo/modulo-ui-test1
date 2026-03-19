/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        extend: {
            colors: {
                // Background Colors
                bg: {
                    DEFAULT: 'var(--colors-bg)',
                    subtle: 'var(--colors-bg-subtle)',
                    muted: 'var(--colors-bg-muted)',
                    emphasized: 'var(--colors-bg-emphasized)',
                },
                // Foreground/Text Colors
                fg: {
                    DEFAULT: 'var(--colors-fg)',
                    muted: 'var(--colors-fg-muted)',
                    subtle: 'var(--colors-fg-subtle)',
                    disabled: 'var(--colors-fg-disabled)',
                },
                // Border Colors
                border: {
                    DEFAULT: 'var(--colors-border)',
                    emphasized: 'var(--colors-border-emphasized)',
                },
                // Card Colors
                card: {
                    DEFAULT: 'var(--colors-card-bg)',
                    bg: 'var(--colors-card-bg)',
                    border: 'var(--colors-card-border)',
                    shadow: 'var(--colors-card-shadow)',
                },
                // Primary Colors
                primary: {
                    DEFAULT: 'var(--colors-primary)',
                    hover: 'var(--colors-primary-hover)',
                    // Mapping legacy 50-900 to primary if specific shades aren't defined, 
                    // or ideally these should be removed from app usage in favor of semantic tokens.
                    // For now, mapping to main primary to avoid crash, but they won't be distinct shades per theme
                    // unless defined in CSS.
                    50: 'var(--semantic-background-primary50, var(--color-primary-light))',
                    100: 'var(--semantic-background-primary100, var(--colors-primary))',
                    200: 'var(--semantic-background-primary200, var(--colors-primary))',
                    300: 'var(--semantic-background-primary300, var(--colors-primary))',
                    400: 'var(--semantic-text-primary, var(--colors-primary))',
                    500: 'var(--colors-primary)',
                    600: 'var(--colors-primary-hover)',
                    700: 'var(--colors-button-bg-active, var(--colors-primary-hover))',
                    800: 'var(--colors-primary-hover)',
                    900: 'var(--colors-primary-hover)',
                },
                // Status Colors
                success: 'var(--colors-success)',
                warning: 'var(--colors-warning)',
                error: 'var(--colors-error)',
                info: 'var(--colors-info)',
                danger: 'var(--colors-danger)',

                // Sidebar
                sidebar: {
                    bg: 'var(--colors-sidebar-bg)',
                    active: 'var(--colors-sidebar-active)',
                    border: 'var(--colors-sidebar-border)',
                    text: 'var(--colors-sidebar-text)',
                    'text-hover': 'var(--colors-sidebar-text-hover)',
                    'text-active': 'var(--colors-sidebar-text-active)',
                    'icon-hover': 'var(--colors-sidebar-icon-hover)',
                },

                // Legacy/Specific Mappings
                agid: {
                    blue: 'var(--colors-primary)',
                    dark: 'var(--colors-primary-hover)',
                    text: 'var(--colors-fg)',
                },
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                agid: ['var(--font-agid)', 'sans-serif'],
            },
            boxShadow: {
                'glow-primary': 'var(--shadow-glow-primary)',
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          light: '#333333',
          lighter: '#666666',
        },
        accent: {
          DEFAULT: '#FF6B6B',
          light: '#FF8A8A',
          dark: '#E55555',
        },
        background: {
          light: '#FFFFFF',
          dark: '#0F172A',
        },
        surface: {
          light: '#F8F9FA',
          dark: '#1E293B',
        },
        border: {
          light: '#E5E7EB',
          dark: '#334155',
        },
        text: {
          primary: {
            light: '#1F2937',
            dark: '#F1F5F9',
          },
          secondary: {
            light: '#6B7280',
            dark: '#94A3B8',
          }
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        calendar: {
          office: '#3B82F6',
          remote: '#10B981',
          client: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.05)',
        'medium': '0 4px 12px rgba(0,0,0,0.1)',
        'strong': '0 8px 24px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'card': '0.75rem',
      }
    },
  },
  plugins: [],
}

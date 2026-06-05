/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'page-bg': '#F8FAFC',
        'surface': '#FFFFFF',
        'slate-border': '#E2E8F0',
        'sidebar-bg': '#1E293B',
        'sidebar-text': '#94A3B8',
        'sidebar-hover': '#334155',
        'sidebar-active': '#1D4ED8',
        'brand': '#1D4ED8',
        'brand-hover': '#1E40AF',
        'brand-light': '#EFF6FF',
        'status-active': '#3B82F6',
        'status-urgent': '#EF4444',
        'status-hearing-soon': '#F59E0B',
        'status-completed': '#22C55E',
        'status-closed': '#6B7280',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-muted': '#94A3B8',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6'
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'page-title': ['24px', { fontWeight: '700', lineHeight: '1.2' }],
        'section-title': ['18px', { fontWeight: '600', lineHeight: '1.3' }],
        'card-title': ['16px', { fontWeight: '600', lineHeight: '1.4' }],
        'body': ['14px', { fontWeight: '400', lineHeight: '1.5' }],
        'caption': ['12px', { fontWeight: '400', lineHeight: '1.4' }],
        'sidebar-label': ['13px', { fontWeight: '500', lineHeight: '1.4' }]
      }
    },
  },
  plugins: [],
}

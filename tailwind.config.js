/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF9',        // fondo de página
        surface: '#FFFFFF',      // tarjetas
        ink: '#18181B',          // texto y acciones principales
        muted: '#71717A',        // texto secundario
        subtle: '#A1A1AA',       // texto terciario / placeholders
        line: '#E7E5E4',         // bordes finos
        'line-strong': '#D6D3CE', // bordes con énfasis
        accent: '#B91C1C',       // rojo de marca (acciones, marca, enlaces)
        'accent-dark': '#991B1B', // rojo hover
        'accent-soft': '#FEF2F2', // fondo rojo suave
        warn: '#92400E',         // ámbar sobrio para alertas de caducidad
        'warn-soft': '#FBEEDD',  // fondo de alerta
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}

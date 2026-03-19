// Import della libreria @tecnosys/components CSS (contiene le utility Tailwind
// usate internamente dai componenti come MainAppLayout, Sidebar, Header, ecc.)
// DEVE essere importato PRIMA del tema locale per consentire l'override.
import '@tecnosys/components/dist/styles.css';

import './theme/index.css';
export * from './components';
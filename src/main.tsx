import { createRoot } from 'react-dom/client';
import Home from './App';
import '@fontsource/geist/latin-400.css';
import '@fontsource/geist/latin-700.css';
import '@fontsource/geist-mono/latin-400.css';
import '@fontsource/geist-mono/latin-700.css';
import './globals.css';

createRoot(document.getElementById('root')!).render(<Home />);

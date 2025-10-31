import { createRoot } from 'react-dom/client';
import { LogBoxInspectorContainer } from '@expo/metro-runtime/src/error-overlay/ErrorOverlay';

// Create a custom error handler that uses createRoot instead of render
export function setupErrorHandler() {
  // Create a container for the error overlay
  const container = document.getElementById('root') || document.createElement('div');
  if (!container.id) {
    container.id = 'error-container';
    document.body.appendChild(container);
  }
  
  // Use createRoot instead of ReactDOM.render
  const root = createRoot(container);
  root.render(<LogBoxInspectorContainer />);
}
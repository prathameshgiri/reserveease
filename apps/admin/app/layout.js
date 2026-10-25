import '../styles/globals.css';
import { AdminAuthProvider } from '../lib/auth-context';
import { ToastProvider } from '../lib/toast-context';
import AdminShell from '../components/AdminShell';
import Toast from '../components/Toast';

export const metadata = {
  title: 'ReserveEase Administrator — Enterprise Booking Operations',
  description: 'Control panel for service capacity, customer accounts, live reservations, and revenue analytics.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ToastProvider>
          <AdminAuthProvider>
            <AdminShell>
              {children}
            </AdminShell>
            <Toast />
          </AdminAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

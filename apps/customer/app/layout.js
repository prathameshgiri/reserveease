import '../styles/globals.css';
import { AuthProvider } from '../lib/auth-context';
import { ToastProvider } from '../lib/toast-context';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';

export const metadata = {
  title: 'ReserveEase — Premium Customer Reservation & Booking Portal',
  description: 'Book luxury meeting rooms, wellness spas, chef tables, and creative studios with real-time slot availability.'
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
          <AuthProvider>
            <div className="site-container">
              <Navbar />
              <main className="main-content">
                {children}
              </main>
              <Footer />
              <Toast />
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

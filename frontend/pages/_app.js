import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>ValandWaffen - Elite Community Platform</title>
        <meta name="description" content="Modern forum, live chat, and recruitment platform for elite communities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <AuthProvider>
        <SocketProvider>
          <Component {...pageProps} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f3f4f6',
                border: '1px solid #374151',
              },
              success: {
                style: {
                  background: '#065f46',
                  border: '1px solid #10b981',
                },
              },
              error: {
                style: {
                  background: '#7f1d1d',
                  border: '1px solid #ef4444',
                },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;

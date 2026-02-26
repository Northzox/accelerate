import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        newSocket.emit('join-chat', user.id);
      });

      newSocket.on('chat-message', (message) => {
        // This will be handled by the chat component
        console.log('New chat message:', message);
      });

      newSocket.on('ticket-message', (data) => {
        // This will be handled by the ticket component
        console.log('New ticket message:', data);
      });

      newSocket.on('new-ticket', (ticket) => {
        if (user.role === 'Admin' || user.role === 'Co-Leader' || user.role === 'Leader') {
          toast.success(`New recruitment ticket: ${ticket.title}`, {
            duration: 5000,
          });
        }
      });

      newSocket.on('ticket-status-update', (data) => {
        toast(`Ticket status updated to: ${data.status}`, {
          icon: '📋',
        });
      });

      newSocket.on('ticket-assignment-update', (data) => {
        toast('Ticket assignment updated', {
          icon: '👤',
        });
      });

      newSocket.on('ticket-deleted', (data) => {
        toast.error('A ticket has been deleted by an admin');
      });

      newSocket.on('chat-cleared', () => {
        toast('Chat has been cleared by an admin', {
          icon: '🧹',
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  const joinTicket = (ticketId) => {
    if (socket) {
      socket.emit('join-ticket', ticketId);
    }
  };

  const leaveTicket = (ticketId) => {
    if (socket) {
      socket.emit('leave-ticket', ticketId);
    }
  };

  const sendChatMessage = (content) => {
    if (socket) {
      socket.emit('chat-message', { content });
    }
  };

  const sendTicketMessage = (ticketId, content) => {
    if (socket) {
      socket.emit('ticket-message', { ticketId, content });
    }
  };

  const value = {
    socket,
    onlineUsers,
    joinTicket,
    leaveTicket,
    sendChatMessage,
    sendTicketMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

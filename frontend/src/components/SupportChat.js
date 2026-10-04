import React, { useState, useEffect } from 'react';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);

  useEffect(() => {
    if (isOpen && localStorage.getItem('token')) {
      fetchTickets();
    }
  }, [isOpen]);

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/admin/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const createTicket = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to contact support');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: 'Customer Support Request',
          message: message,
          priority: 'medium'
        })
      });
      
      if (response.ok) {
        alert('Support ticket created! We\'ll get back to you soon.');
        setMessage('');
        fetchTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  return (
    <>
      <button className="support-chat-btn" onClick={() => setIsOpen(true)}>
        💬 Support
      </button>
      
      {isOpen && (
        <div className="support-chat-window">
          <div className="chat-header">
            <h4>Customer Support</h4>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chat-body">
            <div className="chat-messages">
              {tickets.map(ticket => (
                <div key={ticket._id} className="ticket-message">
                  <strong>Ticket #{ticket.ticketNumber}</strong>
                  <p>{ticket.message}</p>
                  <small>Status: {ticket.status}</small>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <textarea
                placeholder="Describe your issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="3"
              />
              <button onClick={createTicket} className="btn">Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat;
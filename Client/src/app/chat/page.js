'use client';
import React, { useState, useEffect } from 'react'
import * as signalR from "@microsoft/signalr";
import ChatBubble from '../components/ChatBubble';
import CurrentUserChatBubble from '../components/CurrentUserChatBubble';


const Page = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [connection, setConnection] = useState(null);
    const [activeUser, setActiveUser] = useState(null);
    

    const SendMessage = async () => {
        const user = "activeUser";
        if (connection && message && user) {
            try {
              await connection.invoke("SendMessage", user, message)
              setMessage("")
            } catch (err) {
              console.error("Send error:", err)
            }
        }
    }
    
    useEffect(() => {
        const conn = new signalR.HubConnectionBuilder()
          .withUrl("https://localhost:7188/chatHub") 
          .withAutomaticReconnect()
          .build()
    
        // Set up the listener BEFORE starting the connection
        conn.on("ReceiveMessage", (u, msg) => {
            console.log("received msg", u, msg)
            setMessages(prev => [...prev, { user: u, text: msg }])
        })

        conn.start()
          .then(() => {
            console.log("Connected to hub")
            setConnection(conn)
          })
          .catch(err => console.error("SignalR error:", err))

        // Cleanup on unmount
        return () => {
            conn.stop()
        }
     }, [])
     

  

   return (
    <div className='min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4'>
    <h1 className='font-extrabold text-5xl text-white mb-8'>
      Global Chat
    </h1>
    
    <div className='w-full max-w-4xl h-[600px] bg-blue-950 rounded-lg shadow-2xl flex flex-col'>
      {/* Chat Messages Area */}
      <div className='flex-1 p-6 overflow-y-auto space-y-4'>
        {messages.length === 0 ? (
          <p className='text-gray-400 text-center'>Inga meddelanden ännu...</p>
        ) : (
          messages.map((obj, i) => (
            <ChatBubble key={i} name={obj.user} message={obj.text} />
          ))
        )}
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        SendMessage();
      }} className='p-4 bg-blue-900 rounded-b-lg'>

        <div className='flex gap-2'>
          <input 
            type='text'
            value={message}
            onChange={e => setMessage(e.target.value)}
            className='flex-1 bg-amber-50 border-0 rounded-lg text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400' 
            placeholder='Skriv ditt meddelande...'

          />
          <button type="submit" className='bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors'>
            Skicka
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}

export default Page;
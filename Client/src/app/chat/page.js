'use client';
import React, { useState, useEffect, useRef } from 'react'
import * as signalR from "@microsoft/signalr";
import ChatBubble from '../components/ChatBubble';
import CurrentUserChatBubble from '../components/CurrentUserChatBubble';
import { jwtDecode } from "jwt-decode";
import DOMPurify from 'dompurify';
import { useAuth } from '../contexts/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute';
import GroupList from '../components/GroupList';
import axios from 'axios';

const Page = () => {
  const auth = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [activeGroup, setActiveGroup] = useState({id: "global", name: "Global"});
  const [addMembersList, setAddMembersList] = useState([]);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);

  const activeGroupRef = useRef({id: "global", name: "Global"});
  const connectionRef = useRef(null);

  const [activeUser, setActiveUser] = useState(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    }
    return "";
  });

  const [activeUserId, setActiveUserId] = useState(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    }
    return "";
  });

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    activeGroupRef.current = activeGroup;
  }, [activeGroup]);

  const SendMessage = async () => {  
    try {
      await connection.invoke("SendMessageToGroup", activeGroup.id, activeUser, activeUserId, message);
      setMessage("");
    } catch (err) {
      console.error("Send to group error:", err);
    }
  }



  const confirmAddMembers = async () => {
    try {
      const requestBody = {
        GroupId: activeGroupRef.current.id,
        UserNames: addMembersList
      };
      await axios.post(
        `https://localhost:5242/api/group/add-members`,
        requestBody,
        {
          
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`,
            'Content-Type': 'application/json' }
        }
      );
      console.log("Members added:", addMembersList);
      setShowAddMembers(false);
      setAddMembersList([]);
    } catch (error) {
      console.error("Error adding members:", error);
    }
  }

  const getGroupMessages = async (paramGroup) => {
    if (activeGroup.id !== paramGroup.id) {
      try {
        await connection.invoke("LeaveGroup", activeGroup.id);
        console.log("Left group:", activeGroup.id);
      } catch (error) {
        console.error("Leave group error:", error);
      }
    }

    setActiveGroup(paramGroup);
    console.log("Selected group:", paramGroup);

    try {
      const response = await axios.get(
        `https://localhost:5242/api/group/messages/${paramGroup.id}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        }
      );

      console.log("Messages fetched for group:", response.data);
      const normalizedMessages = response.data.map(msg => ({
        user: DOMPurify.sanitize(msg.senderUsername || msg.user),
        text: DOMPurify.sanitize(msg.text),
        senderId: msg.senderId,
        timestamp: msg.timestamp,
      }));

      await connection.invoke("JoinGroup", paramGroup.id);
      console.log("Joined group:", paramGroup.id);

      setMessages(normalizedMessages);
    } catch (error) {
      console.error("Error fetching messages for group:", error);
    }
  }

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:5242/chatHub")
      .withAutomaticReconnect()
      .build();
  
    conn.on("ReceiveMessage", (user, msg, userId, groupId) => {
      const sanitizedMSG = DOMPurify.sanitize(msg);
      const sanitizedUser = DOMPurify.sanitize(user);
      
      console.log("Message received:", { user: sanitizedUser, groupId });
      
      if(activeGroupRef.current && activeGroupRef.current.id === groupId) {
        setMessages(prev => [...prev, {
          user: sanitizedUser,
          text: sanitizedMSG,
          senderId: userId,
          timestamp: new Date(),
          id: `${userId}-${Date.now()}`
        }]);
      }
    });

    conn.onreconnected(() => {
      console.log("Reconnected to hub");
      if (activeGroupRef.current) {
        conn.invoke("JoinGroup", activeGroupRef.current.id);
      }
    });

    conn.start()
      .then(() => {
        console.log("Connected to hub");
        return conn.invoke("JoinGroup", "global");
      })
      .then(() => {
        console.log("Joined global group");
        setConnection(conn);
        connectionRef.current = conn;
      })
      .catch(err => {
        console.error("SignalR connection error:", err);
      });

    return () => {
      if (connectionRef.current) {
        if (activeGroupRef.current) {
          connectionRef.current.invoke("LeaveGroup", activeGroupRef.current.id)
            .catch(err => console.error("Error leaving group:", err));
        }
        connectionRef.current.stop();
      }
    }
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('https://localhost:5242/api/group', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        });
        console.log("Groups fetched:", response.data);
        setGroups([{ id: "global", name: "Global" }, ...response.data]);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-slate-900 p-4'>
        <h1 className='font-extrabold text-5xl text-white text-center mb-8'>
          {activeGroup ? activeGroup.name : 'Global Chat'}
        </h1>

        <div className='flex gap-6 max-w-6xl mx-auto'>
          <div className='w-80 flex-shrink-0'>
            <div className='bg-blue-900 rounded-lg p-4 h-[600px]'>
              <h2 className='text-white text-xl font-bold mb-4'>Chat Groups</h2>
              <GroupList items={groups} onItemSelect={getGroupMessages} />
            </div>
          </div>
          <div className='flex-1'>
            <div className='w-full h-[600px] bg-blue-950 rounded-lg shadow-2xl flex flex-col'>
              <button
                className='self-start m-4 bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors'
                onClick={setShowAddMembers}
              >
                Add Members
              </button>

              <div className='flex-1 p-6 overflow-y-auto space-y-4'>
                {messages.length === 0 ? (
                  <p className='text-gray-400 text-center'>No messages</p>
                ) : (
                  messages.map((msg, index) => {
                    const isCurrentUser = msg.user === activeUser || msg.senderId === activeUserId;
                    return isCurrentUser ? (
                      <CurrentUserChatBubble
                        key={index}
                        name={msg.user}
                        message={msg.text}
                      />
                    ) : (
                      <ChatBubble
                        key={index}
                        name={msg.user}
                        message={msg.text}
                      />
                    );
                  })
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
                    className='flex-1 bg-amber-50 border-0 rounded-lg text-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed'
                    placeholder='Skriv ditt meddelande...'
                  />
                  <button 
                    type="submit" 
                    className='bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {showAddMembers && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-blue-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-white text-center">
                Add Members to {activeGroup.name}
              </h2>

              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded-lg"
              />
              <div className="max-h-64 overflow-y-auto mb-4">
                {addMembersList.map((member, index) => (
                  <div key={index} className="flex justify-between items-center bg-blue-800 text-white px-4 py-2 mb-2 rounded-lg">
                    <span>{member}</span>
                  </div>
                ))}
              </div>             
                     
                  
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddMembers(false);
                    setAddMembersList([]);

                  }}
                  className="bg-blue-950 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                 <button
                  onClick={() => { 
                    setAddMembersList([...addMembersList, searchTerm]);
                    setSearchTerm('');
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Add
                </button>
                <button
                  onClick={confirmAddMembers}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default Page;

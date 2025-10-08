'use client';
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import * as signalR from "@microsoft/signalr";
import { jwtDecode } from "jwt-decode";
import DOMPurify from 'dompurify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';


const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  return context;
};

export const ChatProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [activeGroup, setActiveGroup] = useState({ id: "global", name: "Global" });
  const [addMembersList, setAddMembersList] = useState([]);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeUser, setActiveUser] = useState('');
  const [activeUserId, setActiveUserId] = useState('');

  const activeGroupRef = useRef(activeGroup);
  const connectionRef = useRef(null);
  const authProvider = useAuth();

    useEffect(() => {
    if (!authProvider.loading && authProvider.auth.isAuthenticated) {
      setActiveUser(authProvider.activeUserName);
      setActiveUserId(authProvider.activeUserId);
      fetchGroups();
    }
  }, [authProvider.auth.isAuthenticated, authProvider.activeUserName, authProvider.activeUserId, authProvider.loading]);

  
  
  useEffect(() => {
    activeGroupRef.current = activeGroup;
  }, [activeGroup]);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:5242/chatHub")
      .withAutomaticReconnect()
      .build();

    conn.on("ReceiveMessage", (user, msg, userId, groupId) => {
      const sanitizedMSG = DOMPurify.sanitize(msg);
      const sanitizedUser = DOMPurify.sanitize(user);
      
      console.log("Message received:", { user: sanitizedUser, groupId });
      
      if (activeGroupRef.current && activeGroupRef.current.id === groupId) {
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
    };
  }, []);

 const fetchGroups = async () => {
      try {
        const response = await axios.get('https://localhost:5242/api/group', {
          headers: {
            'Authorization': `Bearer ${authProvider.auth.accessToken}`
          }
        });
        console.log("Groups fetched:", response.data);
        setGroups([{ id: "global", name: "Global" }, ...response.data]);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

  const sendMessage = async () => {      
    try {
      await connection.invoke("SendMessageToGroup", activeGroup.id, activeUser, activeUserId, message);
      setMessage("");
    } catch (err) {
      console.error("Send to group error:", err);
    }
  };

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
          headers: { 
            'Authorization': `Bearer ${authProvider.auth.accessToken}`,
            'Content-Type': 'application/json' 
          }
        }
      );
      console.log("Members added:", addMembersList);
      setShowAddMembers(false);
      setAddMembersList([]);
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  const getGroupMessages = async (paramGroup) => {
    if (!connection) return;

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
            'Authorization': `Bearer ${authProvider.auth.accessToken}`
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
  };

  const addMemberToList = () => {
    if (searchTerm.trim()) {
      setAddMembersList(prev => [...prev, searchTerm.trim()]);
      setSearchTerm('');
    }
  };

      const createGroup = (name) => {
        console.log("Creating group:", name);
        axios.post('https://localhost:5242/api/group',`"${name}"`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authProvider.auth.accessToken}`
                }
            }).then(response => {
                console.log("Group created:", response.data);
                fetchGroups();
            }
        ).catch(error => {
            console.error("Error creating group:", error);
        });
    }

  const value = {
    message,
    messages,
    connection,
    activeGroup,
    addMembersList,
    showAddMembers,
    searchTerm,
    availableUsers,
    groups,
    activeUser,
    activeUserId,
    setMessage,
    setMessages,
    setActiveGroup,
    setAddMembersList,
    setShowAddMembers,
    setSearchTerm,
    setAvailableUsers,
    setGroups,
    sendMessage,
    confirmAddMembers,
    getGroupMessages,
    addMemberToList,
    createGroup
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
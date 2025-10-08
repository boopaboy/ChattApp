'use client';
import React from 'react';
import ChatBubble from '../components/ChatBubble';
import CurrentUserChatBubble from '../components/CurrentUserChatBubble';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import ProtectedRoute from '../components/ProtectedRoute';
import GroupList from '../components/GroupList';

const Page = () => {
  const auth = useAuth();
  const {
    message,
    setMessage,
    messages,
    activeGroup,
    addMembersList,
    showAddMembers,
    searchTerm,
    setSearchTerm,
    groups,
    activeUser,
    activeUserId,
    setShowAddMembers,
    setAddMembersList,
    sendMessage,
    confirmAddMembers,
    getGroupMessages,
    addMemberToList,
  } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

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
                onClick={() => setShowAddMembers(true)}
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

              <form onSubmit={handleSubmit} className='p-4 bg-blue-900 rounded-b-lg'>
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
                  onClick={addMemberToList}
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
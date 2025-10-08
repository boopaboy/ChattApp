'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext'


export default function Page() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const auth = useAuth();

  const signUp = (e) => {
    e.preventDefault();
    auth.signUp(email,username, password).then((success) => {
      if (success) {
        router.push('/');
      } else {
        alert('Login failed. Please check your credentials and try again.');
      }
    })
   

  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <form
        onSubmit={signUp}
        className="flex flex-col gap-4 w-80 max-w-md bg-blue-900 rounded-xl p-4 mb-1"
      >
         <input
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full h-10 rounded-md p-4 bg-blue-950"
        />
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full h-10 rounded-md p-4 bg-blue-950"
        />
         <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full h-10 rounded-md p-4 bg-blue-950"
        />
        <button type="submit" className="w-full h-10 rounded-md p-2 bg-blue-950 cursor-pointer hover:bg-blue-800">
          Submit
        </button>
      </form>
    </div>
  );
}

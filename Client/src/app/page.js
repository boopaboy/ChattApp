'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [name, setName] = useState('');
  const router = useRouter();

  const connectToHub = (e) => {
    e.preventDefault();
    router.push('/chat');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <form
        onSubmit={connectToHub}
        className="flex flex-col gap-4 w-80 max-w-md bg-blue-900 rounded-xl p-4 mb-1"
      >
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full h-10 rounded-md p-4 bg-blue-950"
        />
        <button type="submit" className="w-full h-10 rounded-md p-2 bg-blue-950">
          Submit
        </button>
      </form>
    </div>
  );
}

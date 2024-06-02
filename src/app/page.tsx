'use client'

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react'

export default function Home() {

  // Create a reference to the worker object.
  const worker = useRef<Worker | null>(null);

  // Keep track of the classification result and the model loading status.
  const [result, setResult] = useState<null | { label: string, score: number }>(null);
  const [ready, setReady] = useState<null | boolean>(null);
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      }) as Worker & { postMessage: (message: any) => void };
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e: MessageEvent) => {
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          break;
        case 'ready':
          setReady(true);
          break;
        case 'complete':
          setResult(e.data.output[0])
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => worker?.current?.removeEventListener('message', onMessageReceived);
  });

  const classify = useCallback((text: string) => {
    if (text === '') {
      setResult(null);
      return;
    }
    if (worker.current) {
      worker.current.postMessage({ text });
    }
  }, []);

  const getEmoji = (result: { label: string, score: number } | null) => {
    const score = result?.score ?? 0;
    if (result?.label === 'POSITIVE') {
      if (score >= 0.9) return '🥳';
      if (score >= 0.8) return '😄';
      if (score >= 0.7) return '😁';
      if (score >= 0.6) return '😃';
      if (score >= 0.5) return '😊';
      return '😊'; // Default case
    } else if (result?.label === 'NEGATIVE') {
      if (score >= 0.9) return '😢';
      if (score >= 0.8) return '😞';
      if (score >= 0.7) return '😔';
      if (score >= 0.6) return '😟';
      if (score >= 0.5) return '😕';
      return '😕'; // Default case
    }
    return '';
  };

  const handleResult = () => {
    setIsResultOpen(!isResultOpen);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className='flex flex-row items-center justify-center'>
        <div className="flex flex-row items-center justify-center">
          <Image src="/theme.gif" className="rounded-full m-4" alt="logo" width={250} height={250} />
        </div>
        <div className="flex flex-col w-full  items-center justify-center">
          <h1 className="text-5xl font-bold mb-2">Ai VibeCheck</h1>
          <h2 className="text-2xl mb-4">Instantly Gauge the Mood Around You</h2>
          <div className='flex flex-col items-center justify-center'>
            {/* <hr className="w-full border-gray-300" /> */}
            <input
              className="w-full max-w-xs p-2 border border-gray-300 dark:text-black rounded m-4"
              placeholder="Type something..."
              onInput={(e: any) => {
                classify(e.target.value);
              }}
            />

            {ready !== null && (
              <>
                <span className="text-9xl">{getEmoji(result)}</span>
                {!!result && <button className="text-center text-xs bg-zinc-600 rounded text-white py-2 px-4 mt-5 hover:bg-zinc-500" onClick={handleResult}>Result</button>}
                {isResultOpen && <pre className="bg-gray-100 mt-5 p-2 rounded dark:text-black">
                  {(!ready || !result) ? 'Loading...' : JSON.stringify(result, null, 2)}
                </pre>}
              </>
            )}
          </div>
        </div>
      </div>
    </main>)
}
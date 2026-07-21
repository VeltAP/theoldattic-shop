'use client';

import { useState, FormEvent } from 'react';

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactPage() {
  const [status, setStatus] = useState<FormStatus>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');

    const formData = new FormData(event.currentTarget);

    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    setStatus(response.ok ? 'sent' : 'error');

    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      <h1 className="text-4xl text-center font-display mb-4">
        Contact Us
      </h1>

      <p className="text-center text-gray-600 mb-10">
        Have a question about one of our vintage pieces, shipping, or anything
        else? We&apos;d be happy to help.
      </p>

      <form
        onSubmit={handleSubmit}
        className="border border-gray-300 rounded p-8"
      >

        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Name
          </label>

          <input
            name="name"
            required
            placeholder="Your name"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Email
          </label>

          <input
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Message
          </label>

          <textarea
            name="message"
            required
            rows={7}
            placeholder="Write your message here..."
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full border border-gray-300 rounded py-3 hover:bg-gray-100"
        >
          {status === 'sending'
            ? 'Sending...'
            : 'Send Message'}
        </button>

        {status === 'sent' && (
          <p className="text-center text-green-600 mt-6">
            Thank you! We will get back to you as soon as possible.
          </p>
        )}

        {status === 'error' && (
          <p className="text-center text-red-600 mt-6">
            Something went wrong. Please try again later.
          </p>
        )}

      </form>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-display mb-3">
          Business Information
        </h2>

        <p className="mb-2">
          <strong>Email:</strong> theoldatticshop@gmail.com
        </p>

        <p className="mb-2">
          <strong>Location:</strong> Slovenia, European Union
        </p>

        <p className="text-gray-600">
          We reply within 24 hours on business days.
        </p>
      </div>

    </div>
  );
}
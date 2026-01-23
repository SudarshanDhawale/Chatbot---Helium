'use client';

import { useState } from 'react';

export default function AnalyticsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // TODO: Implement message sending logic
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Section - 30% - File Upload & Chat */}
      <div className="w-[30%] border-r border-gray-200 bg-white flex flex-col">
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h1>
          
          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Document or CSV
            </label>
            <input
              type="file"
              accept=".csv,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                file:cursor-pointer cursor-pointer"
            />
            {selectedFile && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 truncate">
                  {selectedFile.name}
                </p>
              </div>
            )}
          </div>

          {/* Conversation Area */}
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chat with Helium AI
            </label>
            <div className="flex-1 mb-4 p-4 bg-gray-50 rounded-lg overflow-y-auto">
              <p className="text-sm text-gray-500 text-center">
                Upload a document to start the conversation
              </p>
              {/* Conversation messages will appear here */}
            </div>
          </div>
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask questions about your data..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - 70% - Scrollable Dashboard Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboards</h2>
          <div className="text-gray-500 text-center py-12">
            Upload a document and ask Helium AI to generate analytics dashboards
          </div>
          {/* Dashboard content will be rendered here */}
        </div>
      </div>
    </div>
  );
}

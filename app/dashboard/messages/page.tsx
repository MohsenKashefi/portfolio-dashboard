"use client";

import { useState, useEffect } from "react";
import { Mail, MailOpen, Trash2, Archive, Eye, Moon, Sun, Filter, Search } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/app/context/ThemeContext";

interface Message {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

export default function MessagesPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [messages, filterStatus, searchQuery]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = messages;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.subject?.toLowerCase().includes(query) ||
        m.message.toLowerCase().includes(query)
      );
    }

    setFilteredMessages(filtered);
  };

  const handleUpdateStatus = async (id: number, status: Message['status']) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status });
        }
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(messages.filter(m => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);

    // Mark as read if unread
    if (message.status === 'unread') {
      await handleUpdateStatus(message.id, 'read');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'unread': return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'read': return isDarkMode ? 'text-gray-400' : 'text-gray-600';
      case 'replied': return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'archived': return isDarkMode ? 'text-gray-500' : 'text-gray-500';
    }
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-primary-dark via-gray-900 to-black'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-colors duration-500 ${
        isDarkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white/70 border-white/20'
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`transition ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ← Back
            </Link>
            <div>
              <h1 className={`text-2xl font-black transition-colors ${
                isDarkMode
                  ? 'text-white'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
              }`}>
                Messages
              </h1>
              {unreadCount > 0 && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition-all ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white'
                : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-700'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-primary' : 'border-blue-600'}`}></div>
            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading messages...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-2">
              <div className={`backdrop-blur-sm border rounded-2xl overflow-hidden ${
                isDarkMode
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/60 border-white/40'
              }`}>
                {/* Filters */}
                <div className="p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}">
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-primary transition ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex gap-2 flex-wrap">
                    {['all', 'unread', 'read', 'replied', 'archived'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          filterStatus === status
                            ? isDarkMode
                              ? 'bg-primary/20 text-primary'
                              : 'bg-blue-100 text-blue-700'
                            : isDarkMode
                              ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status === 'all' && ` (${messages.length})`}
                        {status === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message List */}
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredMessages.length === 0 ? (
                    <div className="p-8 text-center">
                      <Mail className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No messages found</p>
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleViewMessage(message)}
                        className={`p-4 border-b cursor-pointer transition ${
                          selectedMessage?.id === message.id
                            ? isDarkMode
                              ? 'bg-white/10 border-white/20'
                              : 'bg-blue-50 border-blue-200'
                            : isDarkMode
                              ? 'border-white/5 hover:bg-white/5'
                              : 'border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {message.status === 'unread' ? (
                              <Mail className="w-4 h-4 text-blue-500" />
                            ) : (
                              <MailOpen className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            )}
                            <span className={`font-semibold ${
                              message.status === 'unread'
                                ? isDarkMode ? 'text-white' : 'text-gray-900'
                                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>{message.name}</span>
                          </div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                        <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {message.email}
                        </p>
                        {message.subject && (
                          <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                            {message.subject}
                          </p>
                        )}
                        <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {message.message}
                        </p>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-3">
              {selectedMessage ? (
                <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/60 border-white/40'
                }`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 pb-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}">
                    <div className="flex-1">
                      <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedMessage.subject || 'No Subject'}
                      </h2>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>From:</p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMessage.name}</p>
                          <a href={`mailto:${selectedMessage.email}`} className="text-sm text-primary hover:underline">
                            {selectedMessage.email}
                          </a>
                        </div>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Received:</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(selectedMessage.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="mb-6">
                    <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {selectedMessage.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 flex-wrap">
                    {selectedMessage.status !== 'read' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                          isDarkMode
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        <MailOpen className="w-4 h-4" />
                        Mark as Read
                      </button>
                    )}
                    {selectedMessage.status !== 'replied' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 transition"
                      >
                        <MailOpen className="w-4 h-4" />
                        Mark as Replied
                      </button>
                    )}
                    {selectedMessage.status !== 'archived' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                          isDarkMode
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ml-auto ${
                        isDarkMode
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`backdrop-blur-sm border rounded-2xl p-12 text-center ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/60 border-white/40'
                }`}>
                  <Mail className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a message to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

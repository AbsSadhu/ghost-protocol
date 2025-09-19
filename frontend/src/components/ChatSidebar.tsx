import React from 'react';
import { User } from '../types';
import { Users, MessageCircle } from 'lucide-react';

interface ChatSidebarProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  users,
  selectedUser,
  onSelectUser,
}) => {
  return (
    <div className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary-500" />
          <h2 className="text-white font-semibold">Contacts</h2>
          <span className="text-xs text-dark-200 bg-dark-700 px-2 py-1 rounded-full">
            {users.length}
          </span>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-4 text-center text-dark-200">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No contacts available</p>
          </div>
        ) : (
          <div className="p-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedUser?.id === user.id
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-200 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.username}</p>
                    <p className="text-xs opacity-75 truncate">{user.email}</p>
                  </div>
                  
                  {/* Online Status */}
                  <div className="w-3 h-3 bg-green-500 rounded-full opacity-75"></div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700">
        <div className="text-xs text-dark-200 text-center">
          <p>Select a contact to start messaging</p>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
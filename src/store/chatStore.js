import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: new Set(),

  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  
  addMessage: (conversationId, message) => {
    const messages = get().messages;
    const convMessages = messages[conversationId] || [];
    set({
      messages: {
        ...messages,
        [conversationId]: [...convMessages, message]
      }
    });
  },
  
  setMessages: (conversationId, messages) => {
    set({
      messages: {
        ...get().messages,
        [conversationId]: messages
      }
    });
  },

  addTypingUser: (userId) => {
    const typingUsers = new Set(get().typingUsers);
    typingUsers.add(userId);
    set({ typingUsers });
  },

  removeTypingUser: (userId) => {
    const typingUsers = new Set(get().typingUsers);
    typingUsers.delete(userId);
    set({ typingUsers });
  },
}));

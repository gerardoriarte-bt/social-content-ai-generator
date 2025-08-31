import type { User } from '../types';

const USERS_KEY = 'social_content_ai_users';
const CURRENT_USER_KEY = 'social_content_ai_current_user';

// Create some default users if none exist
const initializeDefaultUsers = () => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
        const defaultUsers: User[] = [
            { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=Alice` },
            { id: '2', name: 'Bob Williams', email: 'bob@example.com', avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=Bob` },
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
};

initializeDefaultUsers();


// User CRUD
export const getUsers = (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]): void => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const addUser = (user: Omit<User, 'id'>): User => {
    const users = getUsers();
    const newUser: User = { ...user, id: Date.now().toString() };
    saveUsers([...users, newUser]);
    return newUser;
};

export const updateUser = (updatedUser: User): void => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        saveUsers(users);
    }
};

export const deleteUser = (userId: string): void => {
    const users = getUsers();
    saveUsers(users.filter(u => u.id !== userId));
};

// Auth
export const signIn = (userId: string): User | null => {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
    }
    return null;
};

export const signOut = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
};
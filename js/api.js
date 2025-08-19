import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CONFIGURATION ---
const API_BASE_URL = 'https://bidbridge.onrender.com'; // Your Python server
const SUPABASE_URL = 'https://blmskxmzqaanstasqfpy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbXNreG16cWFhbnN0YXNxZnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTU0NzQsImV4cCI6MjA3MDA3MTQ3NH0.5qSBIpjJOZLWT1ToWoX4Fy_-gIaW1V_sC9xtca6cHvA';
// --- INITIALIZATION ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



export const api = {
    async request(endpoint, options = {}) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("User not logged in.");
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            ...options.headers,
        };
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
        }
        return responseData;
    },
    async publicRequest(endpoint, options = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    },
    suggestDescription: (title) => api.request('/suggest-description', { method: 'POST', body: JSON.stringify({ title }) }),
    deleteTask: (taskId) => api.request(`/tasks/${taskId}`, { method: 'DELETE' }),
    getMyTasks: () => api.request('/my-tasks'),
    getMyBids: () => api.request('/my-bids'),
    getProfile: () => api.request('/profile'),
    updateProfile: (data) => api.request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
};
export { supabase };
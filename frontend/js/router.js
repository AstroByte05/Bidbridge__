// js/router.js
// js/router.js

import { supabase } from './api.js'; // <-- ADD THIS LINE
import { state } from './state.js';
import { ui } from './ui.js';
import { app } from './main.js';

// This object centralizes all the page navigation logic.
export const router = {
    cleanup() {
        // This function is crucial for real-time apps. It stops listening to old
        // channels when the user navigates to a new page, preventing memory leaks.
        if (state.taskSubscription) supabase.removeChannel(state.taskSubscription);
        if (state.bidSubscription) supabase.removeChannel(state.bidSubscription);
        if (state.chatSubscription) supabase.removeChannel(state.chatSubscription);
        if (state.notificationSubscription) supabase.removeChannel(state.notificationSubscription);
    },

    async handleLocation() {
        this.cleanup();
        const path = window.location.hash || '';
        
        // --- Route Guarding ---
        // These rules protect pages and redirect users based on their login status.
        const isAuthRoute = path === '#login' || path === '#register';
        const isProtectedRoute = path.startsWith('#dashboard') || path.startsWith('#task-') || path === '#profile';
        
        if (!state.user && isProtectedRoute) {
            window.location.hash = '#login';
            return;
        }
        if (state.user && (isAuthRoute || path === '')) {
            window.location.hash = '#dashboard';
            return;
        }

        // --- Page Loading ---
        // This switch statement determines which page to load based on the URL.
        if (path.startsWith('#task-')) {
            const taskId = parseInt(path.substring(6));
            await app.loadTaskDetail(taskId);
        } else {
            switch (path) {
                case '':
                    ui.render(ui.WelcomeView());
                    break;
                case '#login':
                    ui.render(ui.LoginView());
                    break;
                case '#register':
                    ui.render(ui.RegisterView());
                    break;
                case '#dashboard':
                    await app.loadDashboard();
                    break;
                case '#dashboard/my-tasks':
                    await app.loadMyTasks();
                    break;
                case '#dashboard/my-bids':
                    await app.loadMyBids();
                    break;
                case '#dashboard/browse':
                    await app.loadBrowseTasks();
                    break;
                case '#profile':
                    await app.loadProfile();
                    break;
                default:
                    ui.render(ui.WelcomeView());
            }
        }
    }
};

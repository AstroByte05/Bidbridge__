import { supabase } from './api.js';
import { state } from './state.js';
import { ui } from './ui.js';
import { app } from './main.js'; 
export const router = {
    cleanup() {
        if (state.taskSubscription) supabase.removeChannel(state.taskSubscription);
        if (state.bidSubscription) supabase.removeChannel(state.bidSubscription);
        if (state.chatSubscription) supabase.removeChannel(state.chatSubscription);
        if (state.notificationSubscription) supabase.removeChannel(state.notificationSubscription);
    },

    async handleLocation() {
        this.cleanup();
        const path = window.location.hash || '';
        
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

        // Use the globally available window.app object to call functions
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
                    await window.app.loadMyTasks();
                    break;
                case '#dashboard/my-bids':
                    await window.app.loadMyBids();
                    break;
                case '#dashboard/browse':
                    await window.app.loadBrowseTasks();
                    break;
                case '#profile':
                    await window.app.loadProfile();
                    break;
                default:
                    ui.render(ui.WelcomeView());
            }
        }
    }
};

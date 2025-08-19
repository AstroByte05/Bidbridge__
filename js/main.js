// js/main.js
import { state } from './state.js';
import { api, supabase } from './api.js';
import { ui, showNotification } from './ui.js';
import { authController } from './auth.js';
import { router } from './router.js';

export const app = {
    init() {
        authController.init();
        this.addEventListeners();
    },
    addEventListeners() {
        document.body.addEventListener('click', e => {
            const navLink = e.target.closest('.nav-link');
            if (navLink) {
                e.preventDefault();
                const newHash = new URL(navLink.href).hash;
                if (window.location.hash !== newHash) window.location.hash = newHash;
            }
            if (e.target.closest('#logout-btn') || e.target.closest('#mobile-logout-btn')) authController.handleLogout();
            if (e.target.closest('#post-task-btn') || e.target.closest('#mobile-post-task-btn')) ui.openModal(ui.PostTaskModal());
            if (e.target.closest('#mobile-menu-btn')) document.getElementById('mobile-menu').classList.toggle('hidden');
            if (e.target.closest('#suggest-details-btn')) this.handleAiSuggest(e.target.closest('#suggest-details-btn'));
            if (e.target.closest('#delete-task-btn')) this.handleDeleteTask();
        });
        document.body.addEventListener('submit', e => {
            e.preventDefault();
            const form = e.target;
            if (form.id === 'login-form') authController.handleLogin(form.email.value, form.password.value);
            else if (form.id === 'register-form') authController.handleRegister(form);
            else if (form.id === 'post-task-form') this.handlePostTask(form);
            else if (form.id === 'bid-form') this.handlePostBid(form);
            else if (form.id === 'chat-form') this.handleSendMessage(form);
            else if (form.id === 'profile-form') this.handleUpdateProfile(form);
            else if (form.id === 'verification-form') this.handleVerificationUpload(form);
        });
        window.addEventListener('hashchange', () => router.handleLocation());
    },
    async loadDashboard() {
        try {
            const { data: profile, error } = await supabase.from('users').select('role').eq('id', state.user.id).single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return app.loadBrowseTasks();
                }
                throw error;
            }
            app.subscribeToNotifications();
            if (profile.role === 'buyer') {
                window.location.hash = '#dashboard/my-tasks';
            } else {
                window.location.hash = '#dashboard/my-bids';
            }
        } catch (error) {
            showNotification(error.message, true);
            app.loadBrowseTasks();
        }
    },

    async loadMyTasks() {
        try {
            const tasks = await api.getMyTasks();
            ui.render(ui.BuyerDashboardView(tasks));
        } catch (error) {
            showNotification(error.message, true);
        }
    },

    async loadMyBids() {
        try {
            const tasks = await api.getMyBids();
            ui.render(ui.SellerDashboardView(tasks));
        } catch (error) {
            showNotification(error.message, true);
        }
    },

    async loadBrowseTasks() {
        try {
            const tasks = await api.publicRequest('/tasks');
            ui.render(ui.DashboardView(tasks));
            app.subscribeToAllTasks();
        } catch (error) {
            showNotification(error.message, true);
        }
    },
    
    async loadTaskDetail(taskId) {
        try {
            const { task, bids } = await api.publicRequest(`/tasks/${taskId}`);
            state.currentTask = task;
            ui.render(ui.TaskDetailView(task, bids));
            
            if (task.status === 'assigned') app.initChat(taskId);
            
            app.subscribeToBids(taskId);
            app.subscribeToTaskUpdates(taskId);
        } catch (error) {
            showNotification(error.message, true);
        }
    },

    async loadProfile() {
        try {
            const profile = await api.getProfile();
            state.profile = profile;
            ui.render(ui.ProfileView(profile));
        } catch (error) {
            showNotification(error.message, true);
        }
    },

    // --- ACTION HANDLERS (Called by event listeners) ---
    async handlePostTask(form) {
        const taskData = {
            title: form.querySelector('#task-title').value,
            description: form.querySelector('#task-description').value,
            from_location: form.querySelector('#task-from').value,
            to_location: form.querySelector('#task-to').value,
            budget: form.querySelector('#task-budget').value,
            is_urgent: form.querySelector('#task-urgent').checked
        };
        try {
            await api.request('/tasks', { method: 'POST', body: JSON.stringify(taskData) });
            showNotification('Task posted successfully!');
            ui.closeModal();
            window.location.hash = '#dashboard/my-tasks';
        } catch (error) {
            showNotification(error.message, true);
        }
    },
    
    async handlePostBid(form) {
        if (!state.currentTask) return;
        const bidData = {
            amount: form.querySelector('#bid-amount').value,
            timeEstimate: form.querySelector('#bid-eta').value,
        };
        try {
            await api.request(`/tasks/${state.currentTask.id}/bids`, { method: 'POST', body: JSON.stringify(bidData) });
            showNotification('Bid placed successfully!');
            form.reset();
        } catch (error) {
            showNotification(error.message, true);
        }
    },
    
    async handleAcceptBid(taskId, bidId) {
        if (!confirm('Are you sure you want to accept this bid?')) return;
        try {
            await api.request(`/tasks/${taskId}/accept_bid`, { method: 'POST', body: JSON.stringify({ bid_id: bidId }) });
            showNotification('Bid accepted!');
            app.loadTaskDetail(taskId);
        } catch(error) {
            showNotification(error.message, true);
        }
    },
    
    async handleDeleteTask() {
        if (!state.currentTask) return;
        if (confirm(`Are you sure you want to permanently delete the task: "${state.currentTask.title}"?`)) {
            try {
                await api.deleteTask(state.currentTask.id);
                showNotification('Task deleted successfully.');
                window.location.hash = '#dashboard';
            } catch (error) {
                showNotification(error.message, true);
            }
        }
    },

    async handleUpdateProfile(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        try {
            await api.updateProfile(data);
            showNotification('Profile saved successfully!');
        } catch (error) {
            showNotification(error.message, true);
        }
    },

    async handleVerificationUpload(form) {
        const docFile = form.querySelector('#verification-doc').files[0];
        if (!docFile) return showNotification('Please select a file to upload.', true);

        const button = form.querySelector('button');
        button.disabled = true;
        button.innerHTML = `<i data-lucide="loader" class="animate-spin h-4 w-4"></i> Uploading...`;
        lucide.createIcons();

        try {
            const filePath = `${state.user.id}/${Date.now()}-${docFile.name}`;
            
            const { error: uploadError } = await supabase.storage
                .from('verification-documents')
                .upload(filePath, docFile);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('verification-documents')
                .getPublicUrl(filePath);
            
            await api.updateProfile({ document_url: publicUrl });
            showNotification('Document uploaded! Your profile is now pending review.');
            this.loadProfile();

        } catch (error) {
            showNotification(error.message, true);
        } finally {
            button.disabled = false;
            button.innerHTML = `Upload and Submit for Review`;
        }
    },

    async handleAiSuggest(button) {
        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const title = titleInput.value;

        if (!title) return showNotification('Please enter a task title first.', true);

        button.disabled = true;
        button.innerHTML = `<i data-lucide="loader" class="animate-spin h-4 w-4"></i> Thinking...`;
        lucide.createIcons();

        try {
            const { suggestion } = await api.suggestDescription(title);
            descriptionInput.value = suggestion;
            descriptionInput.style.height = 'auto';
            descriptionInput.style.height = descriptionInput.scrollHeight + 'px';
        } catch (error) {
            showNotification(error.message, true);
        } finally {
            button.disabled = false;
            button.innerHTML = `<i data-lucide="sparkles" class="h-4 w-4"></i> Suggest Details`;
            lucide.createIcons();
        }
    },
    
    // --- REAL-TIME SUBSCRIPTIONS ---
    subscribeToAllTasks() {
        state.taskSubscription = supabase.channel('public:tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
                if (window.location.hash === '#dashboard/browse') {
                    app.loadBrowseTasks();
                }
            }).subscribe();
    },

    subscribeToBids(taskId) {
        state.bidSubscription = supabase.channel(`bids:${taskId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `task_id=eq.${taskId}` }, payload => {
                if (window.location.hash === `#task-${taskId}`) {
                    app.loadTaskDetail(taskId);
                }
            }).subscribe();
    },

    subscribeToTaskUpdates(taskId) {
        state.taskSubscription = supabase.channel(`task-updates:${taskId}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'tasks', 
                filter: `id=eq.${taskId}` 
            }, payload => {
                if (window.location.hash === `#task-${taskId}`) {
                    app.loadTaskDetail(taskId);
                }
            })
            .subscribe();
    },

    subscribeToNotifications() {
        if (!state.user) return;

        const notificationCount = document.getElementById('notification-count');
        const notificationList = document.getElementById('notification-list');

        const fetchAndRenderNotifications = async () => {
            const { data, error } = await supabase.from('notifications').select('*').eq('is_read', false).eq('user_id', state.user.id);
            
            if (data && data.length > 0) {
                notificationCount.textContent = data.length;
                notificationCount.classList.remove('hidden');
                notificationList.innerHTML = data.map(n => `<a href="${n.link}" class="block p-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md">${n.message}</a>`).join('');
            } else {
                notificationCount.classList.add('hidden');
                notificationList.innerHTML = `<p class="p-4 text-sm text-center text-slate-500">You're all caught up!</p>`;
            }
        };

        fetchAndRenderNotifications();

        state.notificationSubscription = supabase.channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${state.user.id}` }, payload => {
                showNotification("You have a new notification!");
                fetchAndRenderNotifications();
            }).subscribe();
    },

    async initChat(taskId) {
        const chatBox = document.getElementById('chat-messages');
        
        const { data: messages, error } = await supabase.from('messages').select(`*, users(email)`).eq('task_id', taskId).order('created_at');
        if (error) return showNotification(error.message, true);

        chatBox.innerHTML = messages.map(app.renderMessage).join('');
        chatBox.scrollTop = chatBox.scrollHeight;

        state.chatSubscription = supabase.channel(`chat:${taskId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `task_id=eq.${taskId}` }, async (payload) => {
                const { data: newMessage, error } = await supabase.from('messages').select(`*, users(email)`).eq('id', payload.new.id).single();
                if (error) return;
                
                if (!document.getElementById(`msg-${newMessage.id}`)) {
                    chatBox.insertAdjacentHTML('beforeend', app.renderMessage(newMessage));
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            })
            .subscribe();
    },

    async handleSendMessage(form) {
        const input = form.querySelector('input');
        const text = input.value.trim();
        if (text && state.currentTask) {
            const originalText = text;
            input.value = '';

            const { error } = await supabase.from('messages').insert({
                text: text,
                task_id: state.currentTask.id,
                sender_id: state.user.id
            });

            if (error) {
                showNotification(error.message, true);
                input.value = originalText;
            }
        }
    },
    
    renderMessage(msg) {
        const isSent = msg.sender_id === state.user.id;
        const senderEmail = msg.users ? msg.users.email : 'Unknown User';
        return `
            <div class="chat-bubble ${isSent ? 'sent' : 'received'}" id="msg-${msg.id}">
                ${!isSent ? `<div class="text-xs font-bold mb-1">${senderEmail}</div>` : ''}
                <p>${msg.text}</p>
                <div class="chat-timestamp">${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
    },
};

window.ui = ui;
app.init();

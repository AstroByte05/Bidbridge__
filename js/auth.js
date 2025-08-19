// js/auth.js
import { state } from './state.js';
import { api, supabase } from './api.js';
import { router } from './router.js';
import { showNotification, ui } from './ui.js';

const userMenu = document.getElementById('user-menu');
const authLinks = document.getElementById('auth-links');
const userEmailEl = document.getElementById('user-email');
const userAvatar = document.getElementById('user-avatar');
const mobileMenu = document.getElementById('mobile-menu');

export const authController = {
    init() {
        supabase.auth.onAuthStateChange((event, session) => {
            state.user = session?.user ?? null;
            this.updateUI(state.user);
            router.handleLocation();
        });
    },
    async handleRegister(form) {
        const email = form.querySelector('#register-email').value;
        const password = form.querySelector('#register-password').value;
        const role = form.querySelector('#register-role').value;
        try {
            const response = await api.publicRequest('/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, role })
            });
            showNotification(response.message);
            ui.closeModal();
            window.location.hash = '#login';
        } catch (error) {
            showNotification(error.message, true);
        }
    },
    async handleLogin(email, password) {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error) {
            showNotification(error.message, true);
        }
    },
    async handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            state.user = null;
            state.profile = null;
            window.location.hash = '#login';
        } catch (error) {
            showNotification(error.message, true);
        }
    },
    updateUI(user) {
        if (user) {
            authLinks.classList.add('hidden');
            userMenu.classList.remove('hidden');
            userEmailEl.textContent = user.email;
            userAvatar.src = `https://placehold.co/40x40/DBE4C9/8AA624?text=${user.email[0].toUpperCase()}`;
        } else {
            authLinks.classList.remove('hidden');
            userMenu.classList.add('hidden');
            userEmailEl.textContent = '';
        }
        this.updateMobileMenu(user);
    },
    updateMobileMenu(user) {
        mobileMenu.innerHTML = '';
        if (user) {
            mobileMenu.innerHTML = `
                <a href="#profile" class="nav-link btn btn-secondary w-full">My Profile</a>
                <button id="mobile-post-task-btn" class="btn btn-primary w-full">Post a Task</button>
                <button id="mobile-logout-btn" class="btn btn-secondary w-full">Logout</button>
            `;
        } else {
            mobileMenu.innerHTML = `
                <a href="#login" class="nav-link btn btn-secondary w-full">Log In</a>
                <a href="#register" class="nav-link btn btn-primary w-full">Register</a>
            `;
        }
    }
};

import { state } from './state.js';

    const mainContent = document.getElementById('main-content');
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');
    const notificationEl = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIcon = document.getElementById('notification-icon');

    export const ui = {
        render(html) {
            mainContent.innerHTML = html;
            if (window.lucide) {
                window.lucide.createIcons();
            }
        },
        createStaggeredTitle(text) {
            return text.split('').map((letter, index) =>
                `<span class="stagger-letter" style="animation-delay: ${index * 40}ms">${letter === ' ' ? '&nbsp;' : letter}</span>`
            ).join('');
        },
    WelcomeView: () => `
        <div class="text-center py-16 md:py-24 fade-in">
            <h1 class="text-5xl md:text-7xl font-heading font-bold mb-4">${ui.createStaggeredTitle('Fast. Local. Trusted.')}</h1>
            <p class="text-lg text-slate-600 max-w-2xl mx-auto mb-8">Your community's marketplace for getting things done. Post a task and get bids from trusted locals in minutes.</p>
            <div><a href="#register" class="nav-link btn btn-primary">Get Started Now</a></div>
        </div>
    `,

    LoginView: () => `
        <div class="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-lg fade-in">
            <h2 class="font-heading text-3xl font-bold text-center mb-2">Welcome Back!</h2>
            <p class="text-center text-slate-500 mb-8">Log in to manage your tasks.</p>
            <form id="login-form">
                <div class="mb-4">
                    <label for="login-email" class="block text-sm font-medium text-slate-600 mb-2">Email</label>
                    <input type="email" id="login-email" name="email" required class="form-input">
                </div>
                <div class="mb-6">
                    <label for="login-password" class="block text-sm font-medium text-slate-600 mb-2">Password</label>
                    <input type="password" id="login-password" name="password" required class="form-input">
                </div>
                <button type="submit" class="btn btn-primary w-full">Log In</button>
            </form>
            <p class="text-center text-sm text-slate-500 mt-6">Don't have an account? <a href="#register" class="nav-link font-semibold text-[#8AA624] hover:underline">Register here</a></p>
        </div>
    `,

    RegisterView: () => `
        <div class="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-lg fade-in">
            <h2 class="font-heading text-3xl font-bold text-center mb-2">Join BidBridge</h2>
            <p class="text-center text-slate-500 mb-8">Create an account to post and bid on tasks.</p>
            <form id="register-form">
                <div class="mb-4">
                    <label for="register-email" class="block text-sm font-medium text-slate-600 mb-2">Email</label>
                    <input type="email" id="register-email" name="email" required class="form-input">
                </div>
                <div class="mb-4">
                    <label for="register-password" class="block text-sm font-medium text-slate-600 mb-2">Password</label>
                    <input type="password" id="register-password" name="password" required class="form-input">
                </div>
                <div class="mb-6">
                    <label for="register-role" class="block text-sm font-medium text-slate-600 mb-2">I am a...</label>
                    <select id="register-role" name="role" class="form-input">
                        <option value="seller">Delivery Partner (I want to bid on tasks)</option>
                        <option value="buyer">Task Poster (I want to post tasks)</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-full">Create Account</button>
            </form>
            <p class="text-center text-sm text-slate-500 mt-6">Already have an account? <a href="#login" class="nav-link font-semibold text-[#8AA624] hover:underline">Log in here</a></p>
        </div>
    `,

    BuyerDashboardView: (tasks) => `
        <div class="fade-in">
            <div class="flex justify-between items-center mb-8">
                <h1 class="font-heading text-4xl font-bold">My Posted Tasks</h1>
                <a href="#dashboard/browse" class="nav-link btn btn-secondary">Browse All Tasks</a>
            </div>
            <div id="task-list" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${tasks.length > 0 ? tasks.map(ui.TaskCard).join('') : ui.EmptyState('inbox', 'You haven\'t posted any tasks yet.', 'Click "Post a Task" to get started!')}
            </div>
        </div>
    `,

    SellerDashboardView: (tasks) => `
        <div class="fade-in">
            <div class="flex justify-between items-center mb-8">
                <h1 class="font-heading text-4xl font-bold">My Bids</h1>
                <a href="#dashboard/browse" class="nav-link btn btn-secondary">Browse All Tasks</a>
            </div>
            <div id="task-list" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${tasks.length > 0 ? tasks.map(ui.TaskCard).join('') : ui.EmptyState('gavel', 'You haven\'t bid on any tasks yet.', 'Browse all tasks to find one.')}
            </div>
        </div>
    `,

    DashboardView: (tasks) => `
        <div class="fade-in">
            <div class="flex justify-between items-center mb-8">
                <h1 class="font-heading text-4xl font-bold">Available Tasks</h1>
                <a href="#dashboard/my-bids" class="nav-link btn btn-secondary">View My Bids</a>
            </div>
            <div id="task-list" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${tasks.length > 0 ? tasks.map(ui.TaskCard).join('') : ui.EmptyState('inbox', 'No tasks yet.', 'Why not post the first one?')}
            </div>
        </div>
    `,

    TaskCard: (task) => {
        const now = new Date();
        const expires = new Date(task.expires_at);
        const isUrgent = task.expires_at && expires > now;
        const urgentClass = isUrgent ? 'urgent-task' : '';

        return `
        <a href="#task-${task.id}" class="nav-link task-card bg-white rounded-2xl shadow-md p-6 border-2 border-slate-200/80 ${urgentClass}" id="task-card-${task.id}">
            <div class="flex justify-between items-start">
                <h3 class="font-heading text-xl font-bold mb-2 pr-4">${task.title}</h3>
                <div class="text-right">
                    <span class="font-bold text-lg text-[#8AA624]">₹${task.budget}</span>
                    ${isUrgent ? `<span class="block mt-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-800">🔥 Urgent</span>` : ''}
                </div>
            </div>
            <p class="text-slate-500 mb-4 h-12 overflow-hidden">${task.description}</p>
            <div class="flex items-center text-sm text-slate-500 mt-4 pt-4 border-t">
                <i data-lucide="map-pin" class="h-4 w-4 mr-2"></i>
                <span>${task.from_location} to ${task.to_location}</span>
            </div>
        </a>
    `;
    },

    TaskDetailView: (task, bids) => {
        const isOwner = task.poster_id === state.user?.id;
        return `
        <div class="fade-in">
            <a href="#dashboard" class="nav-link btn btn-secondary mb-6"><i data-lucide="arrow-left"></i>Back</a>
            <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div class="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 class="font-heading text-4xl font-bold">${task.title}</h2>
                        <p class="text-slate-500 mt-2">Posted by ${task.users.email}</p>
                    </div>
                    <div class="text-right flex-shrink-0">
                        <div class="font-bold text-2xl text-[#8AA624]">₹${task.budget}</div>
                        <span class="text-sm font-semibold px-3 py-1 rounded-full mt-2 inline-block ${task.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">${task.status}</span>
                    </div>
                </div>
                
                ${isOwner ? `
                <div class="mt-6 p-4 border-l-4 border-red-400 bg-red-50 rounded-r-lg">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i data-lucide="shield-alert" class="h-5 w-5 text-red-500"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700">
                                You are the owner of this task.
                                <button id="delete-task-btn" class="ml-2 font-medium underline hover:text-red-600">Delete this task</button>
                            </p>
                        </div>
                    </div>
                </div>
                ` : ''}

                <div class="grid lg:grid-cols-2 gap-8 mt-8">
                    <div id="bids-section">
                        <h3 class="font-heading text-2xl font-semibold mb-4">Bids</h3>
                        <div id="bids-list" class="space-y-4">
                            ${bids.length > 0 ? bids.map(bid => ui.BidCard(bid, task)).join('') : ui.EmptyState('gavel', 'No bids yet', 'Be the first!')}
                        </div>
                        ${(task.status === 'open' && !isOwner) ? ui.BidForm() : ''}
                    </div>
                    <div id="chat-section" class="${task.status === 'assigned' ? '' : 'hidden'}">
                        <h3 class="font-heading text-2xl font-semibold mb-4">Chat</h3>
                        <div id="chat-messages" class="chat-box"></div>
                        <form id="chat-form" class="flex gap-2 mt-4">
                            <input type="text" id="chat-message-input" class="form-input flex-grow" placeholder="Type a message...">
                            <button type="submit" class="btn btn-primary"><i data-lucide="send"></i></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `},

    BidCard: (bid, task) => {
        const isOwner = task.poster_id === state.user?.id;
        const isAccepted = task.accepted_bid_id === bid.id;
        return `
        <div class="p-4 rounded-lg flex justify-between items-center transition-all ${isAccepted ? 'bg-blue-100 border-blue-300' : 'bg-slate-50 border-slate-200'} border" id="bid-${bid.id}">
            <div>
                <p class="font-semibold text-slate-800">${bid.users.email}</p>
                <p class="text-sm text-slate-500">ETA: ${bid.time_estimate}</p>
            </div>
            <div class="text-right">
                <p class="text-xl font-bold text-slate-800">₹${bid.amount}</p>
                ${(isOwner && task.status === 'open') ? `<button class="btn btn-secondary text-xs py-1 px-2 mt-1" data-bid-id="${bid.id}" onclick="app.handleAcceptBid(${task.id}, ${bid.id})">Accept</button>` : ''}
                ${isAccepted ? `<span class="text-xs font-bold text-blue-800 block mt-1">ACCEPTED</span>` : ''}
            </div>
        </div>
    `},

    BidForm: () => `
        <form id="bid-form" class="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold mb-3">Place Your Bid</h4>
            <div class="grid sm:grid-cols-2 gap-3">
                <input type="number" id="bid-amount" name="amount" placeholder="Price (₹)" required class="form-input">
                <input type="text" id="bid-eta" name="timeEstimate" placeholder="ETA (e.g., 2 days)" required class="form-input">
            </div>
            <button type="submit" class="btn btn-primary w-full mt-3">Submit Bid</button>
        </form>
    `,

    PostTaskModal: () => `
        <div class="p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="font-heading text-3xl font-bold">Post a New Task</h2>
                <button onclick="ui.closeModal()" class="p-2 rounded-full hover:bg-slate-100"><i data-lucide="x"></i></button>
            </div>
            <form id="post-task-form">
                <div class="mb-4">
                    <label for="task-title" class="block text-sm font-medium text-slate-600 mb-2">Title</label>
                    <input type="text" id="task-title" name="title" required class="form-input" placeholder="e.g., Deliver a fragile vase">
                </div>
                 <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <label for="task-description" class="block text-sm font-medium text-slate-600">Description</label>
                        <button type="button" id="suggest-details-btn" class="btn btn-secondary text-xs py-1 px-2">
                            <i data-lucide="sparkles" class="h-4 w-4"></i> Suggest Details
                        </button>
                    </div>
                    <textarea id="task-description" name="description" required rows="4" class="form-input" placeholder="Provide details or click 'Suggest Details' for a template."></textarea>
                </div>
                <div class="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="task-from" class="block text-sm font-medium text-slate-600 mb-2">From (City)</label>
                        <input type="text" id="task-from" name="from_location" required class="form-input" placeholder="e.g., Yeola">
                    </div>
                     <div>
                        <label for="task-to" class="block text-sm font-medium text-slate-600 mb-2">To (City)</label>
                        <input type="text" id="task-to" name="to_location" required class="form-input" placeholder="e.g., Nashik">
                    </div>
                </div>
                 <div class="mb-4">
                    <label for="task-budget" class="block text-sm font-medium text-slate-600 mb-2">Budget (₹)</label>
                    <input type="number" id="task-budget" name="budget" required class="form-input" placeholder="e.g., 2000">
                </div>
                <div class="flex items-center mb-6">
                    <input id="task-urgent" name="is_urgent" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-[#8AA624] focus:ring-[#8AA624]">
                    <label for="task-urgent" class="ml-2 block text-sm text-slate-900">
                        Urgent? <span class="text-slate-500">(Task will expire in 24 hours and be highlighted)</span>
                    </label>
                </div>
                <button type="submit" class="btn btn-primary w-full">Post Task</button>
            </form>
        </div>
    `,

    EmptyState: (icon, title, text) => `
        <div class="col-span-full text-center py-16 bg-white/80 rounded-lg">
            <i data-lucide="${icon}" class="mx-auto h-12 w-12 text-slate-400"></i>
            <h3 class="mt-2 text-lg font-medium">${title}</h3>
            <p class="mt-1 text-sm text-slate-500">${text}</p>
        </div>
    `,

    ProfileView: (profile) => {
        const isSeller = profile.role === 'seller';
        let verificationContent = '';

        switch (profile.verification_status) {
            case 'unverified':
                verificationContent = `
                    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 class="font-semibold text-yellow-800">Complete Your Verification</h4>
                        <p class="text-sm text-yellow-700 mt-1">To increase trust and get more bids, please complete your profile and upload a verification document.</p>
                    </div>
                `;
                break;
            case 'pending':
                verificationContent = `
                    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 class="font-semibold text-blue-800">Verification Pending</h4>
                        <p class="text-sm text-blue-700 mt-1">Your document has been submitted and is awaiting admin approval. This usually takes 1-2 business days.</p>
                    </div>
                `;
                break;
            case 'verified':
                verificationContent = `
                    <div class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <i data-lucide="shield-check" class="h-6 w-6 text-green-600"></i>
                        <div>
                            <h4 class="font-semibold text-green-800">You are Verified!</h4>
                            <p class="text-sm text-green-700">Task posters will now see a verified badge next to your bids.</p>
                        </div>
                    </div>
                `;
                break;
        }

        return `
        <div class="fade-in max-w-4xl mx-auto">
            <h1 class="font-heading text-4xl font-bold mb-8">My Profile</h1>
            <div class="bg-white p-8 rounded-2xl shadow-lg">
                <form id="profile-form">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label for="profile-email" class="block text-sm font-medium text-slate-600 mb-2">Email</label>
                            <input type="email" id="profile-email" value="${profile.email}" disabled class="form-input bg-slate-100 cursor-not-allowed">
                        </div>
                        <div>
                            <label for="profile-role" class="block text-sm font-medium text-slate-600 mb-2">Account Type</label>
                            <input type="text" id="profile-role" value="${profile.role === 'buyer' ? 'Task Poster' : 'Delivery Partner'}" disabled class="form-input bg-slate-100 cursor-not-allowed">
                        </div>
                        <div>
                            <label for="profile-name" class="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
                            <input type="text" id="profile-name" name="full_name" value="${profile.full_name || ''}" class="form-input">
                        </div>
                        <div>
                            <label for="profile-phone" class="block text-sm font-medium text-slate-600 mb-2">Phone Number</label>
                            <input type="tel" id="profile-phone" name="phone_number" value="${profile.phone_number || ''}" class="form-input">
                        </div>
                    </div>
                    <div class="mt-6">
                        <button type="submit" class="btn btn-primary">Save Profile</button>
                    </div>
                </form>

                ${isSeller ? `
                <hr class="my-8">
                <div>
                    <h3 class="font-heading text-2xl font-semibold mb-4">Verification Status</h3>
                    ${verificationContent}
                    ${profile.verification_status !== 'verified' ? `
                    <form id="verification-form" class="mt-6">
                        <div>
                            <label for="verification-doc" class="block text-sm font-medium text-slate-600 mb-2">Upload Verification Document</label>
                            <input type="file" id="verification-doc" required class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                            <p class="text-xs text-slate-500 mt-1">e.g., Aadhaar Card, Driver's License. Max file size 5MB.</p>
                        </div>
                        <div class="mt-4">
                            <button type="submit" class="btn btn-secondary">Upload and Submit for Review</button>
                        </div>
                    </form>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        </div>
        `;
    },

  openModal(html) {
            modalContent.innerHTML = html;
            if (window.lucide) {
                window.lucide.createIcons();
            }
            modalContainer.classList.remove('hidden');
            modalContainer.classList.add('flex');
            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
            }, 10);
        },
        closeModal() {
            modalContent.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modalContainer.classList.add('hidden');
                modalContainer.classList.remove('flex');
                modalContent.innerHTML = '';
            }, 300);
        },
    };

    export function showNotification(message, isError = false) {
    const el = document.getElementById('notification');
    const msgEl = document.getElementById('notification-message');
    const iconEl = document.getElementById('notification-icon');
    
    msgEl.textContent = message;
    el.className = `fixed bottom-5 right-5 text-white py-3 px-6 rounded-xl shadow-2xl translate-x-[120%] transform transition-transform duration-500 ease-in-out z-50 flex items-center gap-3 ${isError ? 'bg-red-600' : 'bg-[#8AA624]'}`;
    iconEl.setAttribute('data-lucide', isError ? 'alert-triangle' : 'check-circle');
    lucide.createIcons();
    
    el.classList.remove('translate-x-[120%]');
    setTimeout(() => {
        // *** FIX: Corrected the typo from 'translatex' to 'translate-x' ***
        el.classList.add('translate-x-[120%]');
    }, 3500);
}
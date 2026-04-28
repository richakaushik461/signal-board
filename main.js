import { generateFixtureData } from './data/fixtures.js';
import { StorageManager } from './utils/storage.js';
import { debounce, formatDate, getPriorityColor, getStatusBadge, escapeHtml } from './utils/helpers.js';

class SignalBoardApp {
    constructor() {
        this.items = [];
        this.filters = StorageManager.get('signal-board-filters', {
            search: '',
            status: [],
            priority: [],
            source: []
        });
        this.sort = StorageManager.get('signal-board-sort', {
            field: 'createdAt',
            direction: 'desc'
        });
        this.density = StorageManager.get('signal-board-density', 'comfortable');
        this.selectedItem = null;
        this.isLoading = false;
        this.theme = StorageManager.get('signal-board-theme', 'system');

        this.init();
    }

    async init() {
        this.initTheme(); // Apply theme immediately before DOM loads
        this.cacheDom();
        this.bindEvents();
        this.applyDensity();
        this.restoreFilters();
        await this.fetchData();
    }

    initTheme() {
        if (this.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (this.theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            // System preference (removes attribute to use CSS media query)
            document.documentElement.removeAttribute('data-theme');
        }
        
        // Update the toggle button icon (if it exists in DOM yet)
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        if (this.theme === 'dark') {
            themeToggle.textContent = '☀️';
            themeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else if (this.theme === 'light') {
            themeToggle.textContent = '🌙';
            themeToggle.setAttribute('aria-label', 'Switch to system mode');
        } else {
            themeToggle.textContent = '🌓';
            themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    toggleTheme() {
        // Cycle through: system -> dark -> light -> system
        if (this.theme === 'system') {
            this.theme = 'dark';
        } else if (this.theme === 'dark') {
            this.theme = 'light';
        } else {
            this.theme = 'system';
        }
        
        StorageManager.set('signal-board-theme', this.theme);
        this.initTheme();
    }

    cacheDom() {
        this.elements = {
            queueContainer: document.getElementById('queue-container'),
            queueList: document.getElementById('queue-list'),
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            errorMessage: document.getElementById('error-message'),
            emptyState: document.getElementById('empty-state'),
            searchInput: document.getElementById('search-input'),
            statusFilter: document.getElementById('status-filter'),
            priorityFilter: document.getElementById('priority-filter'),
            sourceFilter: document.getElementById('source-filter'),
            sortSelect: document.getElementById('sort-select'),
            activeFilters: document.getElementById('active-filters'),
            detailPanel: document.getElementById('detail-panel'),
            detailTitle: document.getElementById('detail-title'),
            detailContent: document.getElementById('detail-content'),
            refreshBtn: document.getElementById('refresh-btn'),
            densityBtn: document.getElementById('density-btn'),
            themeToggle: document.getElementById('theme-toggle'),
        };
    }

    bindEvents() {
        // Theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Search with debounce
        this.elements.searchInput.addEventListener('input', 
            debounce((e) => {
                this.filters.search = e.target.value;
                this.saveFilters();
                this.render();
            }, 300)
        );

        // Filters
        this.elements.statusFilter.addEventListener('change', (e) => {
            this.filters.status = Array.from(this.elements.statusFilter.selectedOptions)
                .filter(opt => opt.value)
                .map(opt => opt.value);
            this.saveFilters();
            this.render();
        });

        this.elements.priorityFilter.addEventListener('change', (e) => {
            this.filters.priority = Array.from(this.elements.priorityFilter.selectedOptions)
                .filter(opt => opt.value)
                .map(opt => opt.value);
            this.saveFilters();
            this.render();
        });

        this.elements.sourceFilter.addEventListener('change', (e) => {
            this.filters.source = Array.from(this.elements.sourceFilter.selectedOptions)
                .filter(opt => opt.value)
                .map(opt => opt.value);
            this.saveFilters();
            this.render();
        });

        // Sort
        this.elements.sortSelect.addEventListener('change', (e) => {
            const [field, direction] = e.target.value.split('-');
            this.sort = { field, direction };
            StorageManager.set('signal-board-sort', this.sort);
            this.render();
        });

        // Refresh
        this.elements.refreshBtn.addEventListener('click', () => this.fetchData());

        // Density toggle
        this.elements.densityBtn.addEventListener('click', () => this.toggleDensity());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Focus search on '/' (not when typing in inputs)
            if (e.key === '/' && document.activeElement === document.body) {
                e.preventDefault();
                this.elements.searchInput.focus();
            }
            
            // Close detail on Escape
            if (e.key === 'Escape' && this.selectedItem) {
                this.closeDetail();
            }

            // Refresh on Ctrl/Cmd + R
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.fetchData();
            }
        });

        // Close detail on overlay click
        this.elements.detailPanel.addEventListener('click', (e) => {
            if (e.target === this.elements.detailPanel) {
                this.closeDetail();
            }
        });
    }

    async fetchData() {
        this.showLoading();
        this.isLoading = true;

        try {
            // Simulate network delay (400-700ms as specified)
            const delay = 400 + Math.random() * 300;
            await new Promise(resolve => setTimeout(resolve, delay));

            // Simulate occasional errors (10% chance for testing)
            if (Math.random() < 0.1) {
                throw new Error('Network timeout: Unable to fetch queue data');
            }

            this.items = generateFixtureData(40);
            this.render();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    getFilteredAndSortedItems() {
        let result = [...this.items];

        // Apply search
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(searchLower) ||
                item.summary.toLowerCase().includes(searchLower) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                (item.owner && item.owner.toLowerCase().includes(searchLower))
            );
        }

        // Apply filters
        if (this.filters.status.length > 0) {
            result = result.filter(item => this.filters.status.includes(item.status));
        }
        if (this.filters.priority.length > 0) {
            result = result.filter(item => this.filters.priority.includes(item.priority));
        }
        if (this.filters.source.length > 0) {
            result = result.filter(item => this.filters.source.includes(item.source));
        }

        // Apply sorting
        const direction = this.sort.direction === 'desc' ? -1 : 1;
        result.sort((a, b) => {
            switch (this.sort.field) {
                case 'priority': {
                    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return (priorityOrder[a.priority] - priorityOrder[b.priority]) * direction;
                }
                case 'score':
                    return (a.score - b.score) * direction;
                case 'createdAt':
                default:
                    return (new Date(a.createdAt) - new Date(b.createdAt)) * direction;
            }
        });

        return result;
    }

    render() {
        const filteredItems = this.getFilteredAndSortedItems();

        // Hide all states first
        this.hideAllStates();

        if (this.isLoading) {
            this.showLoading();
            return;
        }

        if (filteredItems.length === 0) {
            this.showEmpty();
            return;
        }

        // Show queue list
        this.showQueueList();
        this.renderQueueItems(filteredItems);
        this.renderActiveFilters();
    }

    renderQueueItems(items) {
        this.elements.queueList.innerHTML = items.map(item => this.createQueueItemHTML(item)).join('');
        
        // Add click handlers
        this.elements.queueList.querySelectorAll('.queue-item').forEach((el, index) => {
            el.addEventListener('click', () => this.openDetail(items[index]));
            
            // Keyboard navigation
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openDetail(items[index]);
                }
            });
        });
    }

    createQueueItemHTML(item) {
        const priorityColor = getPriorityColor(item.priority);
        const badge = getStatusBadge(item.status);
        const timeAgo = formatDate(item.createdAt);
        const densityClass = this.density === 'compact' ? 'queue-item-compact' : '';

        return `
            <div class="queue-item ${densityClass}" 
                 role="listitem" 
                 tabindex="0"
                 aria-label="${escapeHtml(item.title)}"
                 data-id="${item.id}">
                <div class="priority-indicator" style="background-color: ${priorityColor}" 
                     aria-label="Priority: ${item.priority}"></div>
                <div class="queue-item-content">
                    <div class="queue-item-header">
                        <h3 class="queue-item-title">${escapeHtml(item.title)}</h3>
                        <span class="status-badge ${badge.class}">${badge.label}</span>
                    </div>
                    <p class="queue-item-summary">${escapeHtml(item.summary)}</p>
                    <div class="queue-item-meta">
                        <span class="meta-item">${item.source.replace('-', ' ')}</span>
                        ${item.owner ? `<span class="meta-item">👤 ${escapeHtml(item.owner)}</span>` : '<span class="meta-item unassigned">Unassigned</span>'}
                        <span class="meta-item">🕒 ${timeAgo}</span>
                        <span class="meta-item score">Score: ${item.score}</span>
                    </div>
                    ${item.tags.length > 0 ? `
                        <div class="queue-item-tags">
                            ${item.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderActiveFilters() {
        const activeFilters = [];
        
        if (this.filters.search) {
            activeFilters.push(`Search: "${this.filters.search}"`);
        }
        if (this.filters.status.length > 0) {
            activeFilters.push(`Status: ${this.filters.status.join(', ')}`);
        }
        if (this.filters.priority.length > 0) {
            activeFilters.push(`Priority: ${this.filters.priority.join(', ')}`);
        }
        if (this.filters.source.length > 0) {
            activeFilters.push(`Source: ${this.filters.source.join(', ')}`);
        }

        if (activeFilters.length > 0) {
            this.elements.activeFilters.innerHTML = `
                <span class="filter-count">Filters active</span>
                ${activeFilters.map(f => `<span class="filter-badge">${f}</span>`).join('')}
                <button class="btn-clear-filters" onclick="window.app.clearFilters()">Clear all</button>
            `;
        } else {
            this.elements.activeFilters.innerHTML = '';
        }
    }

    openDetail(item) {
        this.selectedItem = item;
        const badge = getStatusBadge(item.status);
        const priorityColor = getPriorityColor(item.priority);
        const timeAgo = formatDate(item.createdAt);

        this.elements.detailTitle.textContent = item.title;
        this.elements.detailContent.innerHTML = `
            <div class="detail-section">
                <h3>Summary</h3>
                <p>${escapeHtml(item.summary)}</p>
            </div>
            
            <div class="detail-section metadata-grid">
                <div class="metadata-item">
                    <strong>Status</strong>
                    <span class="status-badge ${badge.class}">${badge.label}</span>
                </div>
                <div class="metadata-item">
                    <strong>Priority</strong>
                    <span style="color: ${priorityColor}; font-weight: 600;">${item.priority.toUpperCase()}</span>
                </div>
                <div class="metadata-item">
                    <strong>Source</strong>
                    <span>${item.source.replace('-', ' ')}</span>
                </div>
                <div class="metadata-item">
                    <strong>Owner</strong>
                    <span>${item.owner || 'Unassigned'}</span>
                </div>
                <div class="metadata-item">
                    <strong>Score</strong>
                    <span>${item.score}/100</span>
                </div>
                <div class="metadata-item">
                    <strong>Created</strong>
                    <span>${timeAgo}</span>
                </div>
            </div>

            ${item.tags.length > 0 ? `
                <div class="detail-section">
                    <h3>Tags</h3>
                    <div class="detail-tags">
                        ${item.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="detail-section">
                <h3>Actions</h3>
                <div class="action-buttons">
                    <button class="btn btn-success" onclick="window.app.markReviewed('${item.id}')">
                        ✓ Mark Reviewed
                    </button>
                    <button class="btn btn-warning" onclick="window.app.snoozeItem('${item.id}')">
                        ⏰ Snooze
                    </button>
                    <button class="btn btn-danger" onclick="window.app.escalateItem('${item.id}')">
                        ⚠ Escalate
                    </button>
                    <button class="btn btn-secondary" onclick="window.app.addNote('${item.id}')">
                        📝 Add Note
                    </button>
                </div>
            </div>
        `;

        this.elements.detailPanel.classList.remove('hidden');
        // Focus trap for accessibility
        this.elements.detailPanel.querySelector('.btn-close').focus();
    }

    closeDetail() {
        this.selectedItem = null;
        this.elements.detailPanel.classList.add('hidden');
    }

    markReviewed(id) {
        this.updateItem(id, { status: 'reviewed' });
        this.closeDetail();
    }

    snoozeItem(id) {
        this.updateItem(id, { status: 'snoozed' });
        this.closeDetail();
    }

    escalateItem(id) {
        this.updateItem(id, { status: 'escalated', priority: 'critical' });
        this.closeDetail();
    }

    addNote(id) {
        const note = prompt('Add a note for this signal:');
        if (note) {
            const item = this.items.find(i => i.id === id);
            if (item) {
                item.notes = item.notes ? `${item.notes}\n${note}` : note;
                this.render();
            }
        }
    }

    updateItem(id, updates) {
        this.items = this.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        this.render();
    }

    clearFilters() {
        this.filters = {
            search: '',
            status: [],
            priority: [],
            source: []
        };
        this.elements.searchInput.value = '';
        this.elements.statusFilter.selectedIndex = 0;
        this.elements.priorityFilter.selectedIndex = 0;
        this.elements.sourceFilter.selectedIndex = 0;
        this.saveFilters();
        this.render();
    }

    retry() {
        this.fetchData();
    }

    toggleDensity() {
        this.density = this.density === 'comfortable' ? 'compact' : 'comfortable';
        StorageManager.set('signal-board-density', this.density);
        this.applyDensity();
        this.render();
    }

    applyDensity() {
        document.body.classList.toggle('density-compact', this.density === 'compact');
        this.elements.densityBtn.textContent = this.density === 'compact' ? '⊞ Comfortable' : '⊟ Compact';
    }

    restoreFilters() {
        if (this.filters.search) {
            this.elements.searchInput.value = this.filters.search;
        }
        if (this.filters.status.length > 0) {
            Array.from(this.elements.statusFilter.options).forEach(opt => {
                if (this.filters.status.includes(opt.value)) {
                    opt.selected = true;
                }
            });
        }
        if (this.filters.priority.length > 0) {
            Array.from(this.elements.priorityFilter.options).forEach(opt => {
                if (this.filters.priority.includes(opt.value)) {
                    opt.selected = true;
                }
            });
        }
        if (this.filters.source.length > 0) {
            Array.from(this.elements.sourceFilter.options).forEach(opt => {
                if (this.filters.source.includes(opt.value)) {
                    opt.selected = true;
                }
            });
        }
        this.elements.sortSelect.value = `${this.sort.field}-${this.sort.direction}`;
    }

    saveFilters() {
        StorageManager.set('signal-board-filters', this.filters);
    }

    showLoading() {
        this.hideAllStates();
        this.elements.loadingState.classList.remove('hidden');
    }

    showError(message) {
        this.hideAllStates();
        this.elements.errorState.classList.remove('hidden');
        this.elements.errorMessage.textContent = message;
    }

    showEmpty() {
        this.hideAllStates();
        this.elements.emptyState.classList.remove('hidden');
    }

    showQueueList() {
        this.hideAllStates();
        this.elements.queueList.classList.remove('hidden');
    }

    hideAllStates() {
        this.elements.loadingState.classList.add('hidden');
        this.elements.errorState.classList.add('hidden');
        this.elements.emptyState.classList.add('hidden');
        this.elements.queueList.classList.add('hidden');
    }
}

// Initialize app
window.app = new SignalBoardApp();
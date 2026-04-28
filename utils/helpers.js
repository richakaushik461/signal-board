export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getPriorityColor(priority) {
    const colors = {
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#ca8a04',
        low: '#2563eb'
    };
    return colors[priority] || '#6b7280';
}

export function getStatusBadge(status) {
    const badges = {
        new: { label: 'New', class: 'badge-new' },
        reviewing: { label: 'In Review', class: 'badge-reviewing' },
        reviewed: { label: 'Reviewed', class: 'badge-reviewed' },
        escalated: { label: 'Escalated', class: 'badge-escalated' },
        snoozed: { label: 'Snoozed', class: 'badge-snoozed' }
    };
    return badges[status] || { label: status, class: '' };
}

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
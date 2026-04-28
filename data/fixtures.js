const sampleTags = [
    'urgent', 'bug', 'feature', 'ui-ux', 'performance',
    'security', 'accessibility', 'mobile', 'desktop', 'api',
    'documentation', 'onboarding', 'billing', 'integration'
];

const sampleSummaries = [
    'Users reporting intermittent 500 errors during checkout flow',
    'Dashboard loading time exceeds 5 seconds for enterprise accounts',
    'Mobile navigation menu not responding to touch events on iOS 17',
    'Customer requests bulk export feature for analytics data',
    'Accessibility audit found missing ARIA labels in form components',
    'Social media sentiment dropping due to recent pricing changes',
    'Integration with Salesforce failing for accounts with custom fields',
    'Password reset emails not being delivered to Yahoo addresses',
    'Dark mode contrast ratios below WCAG AA standards',
    'Feature request: Add keyboard shortcuts for power users',
    'API rate limiting causing issues for high-volume customers',
    'New user onboarding completion rate dropped by 15%',
    'PDF export generating blank pages for reports over 50 pages',
    'Session timeout happening too aggressively for medical users',
    'Search functionality not returning results for partial matches'
];

const owners = [
    'Alice Chen', 'Bob Martinez', 'Carol Williams', null,
    'David Kim', 'Eva Johansson', 'Frank Liu', 'Grace Patel'
];

export function generateFixtureData(count = 40) {
    const items = [];

    for (let i = 0; i < count; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);

        items.push({
            id: `signal-${String(i + 1).padStart(4, '0')}`,
            title: `Signal Report #${i + 1}${i % 5 === 0 ? ' - Very long title that tests layout overflow handling' : ''}`,
            summary: sampleSummaries[i % sampleSummaries.length],
            status: ['new', 'reviewing', 'reviewed', 'escalated', 'snoozed'][Math.floor(Math.random() * 5)],
            priority: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
            source: ['customer-feedback', 'support-ticket', 'social-media', 'bug-report', 'feature-request'][Math.floor(Math.random() * 5)],
            owner: owners[Math.floor(Math.random() * owners.length)],
            tags: getRandomTags(),
            createdAt: new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString(),
            score: Math.floor(Math.random() * 100),
        });
    }

    return items;
}

function getRandomTags() {
    const count = Math.floor(Math.random() * 3) + 1;
    const tags = [];
    for (let i = 0; i < count; i++) {
        const tag = sampleTags[Math.floor(Math.random() * sampleTags.length)];
        if (!tags.includes(tag)) {
            tags.push(tag);
        }
    }
    return tags;
}
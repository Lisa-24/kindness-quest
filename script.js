const AVATARS = [
    { id: '1', name: 'Kind Koala', url: 'https://picsum.photos/seed/koala/200' },
    { id: '2', name: 'Happy Hippo', url: 'https://picsum.photos/seed/hippo/200' },
    { id: '3', name: 'Gentle Giraffe', url: 'https://picsum.photos/seed/giraffe/200' },
    { id: '4', name: 'Brave Bear', url: 'https://picsum.photos/seed/bear/200' },
    { id: '5', name: 'Wise Whale', url: 'https://picsum.photos/seed/whale/200' },
];

const BADGES = [
    { id: 'helper', name: '🌟 Helper', description: 'Complete your first mission', icon: '🌟' },
    { id: 'community-star', name: '💛 Community Star', description: 'Complete 5 community missions', icon: '💛' },
    { id: 'change-maker', name: '🌍 Change Maker', description: 'Reach Level 5', icon: '🌍' },
    { id: 'positivity-pro', name: '✨ Positivity Pro', description: 'Complete 3 social missions', icon: '✨' },
];

const MISSIONS = [
    { id: 'm1', title: 'Help with Homework', description: 'Spend 15 minutes helping a sibling or friend with their studies.', points: 50, category: 'community' },
    { id: 'm2', title: 'Positive Vibes', description: 'Say something positive to 3 different people today.', points: 30, category: 'social' },
    { id: 'm3', title: 'Share a Meal', description: 'Share your food or a snack with someone who might appreciate it.', points: 40, category: 'social' },
    { id: 'm4', title: 'Clean Up', description: 'Pick up litter in a public park or your neighborhood.', points: 60, category: 'environment' },
    { id: 'm5', title: 'Teach a Skill', description: 'Teach someone a small skill, like a card trick or a word in another language.', points: 45, category: 'personal' },
];

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100];

// State
let profile = JSON.parse(localStorage.getItem('kindness_profile')) || null;
let completedMissions = JSON.parse(localStorage.getItem('kindness_completed')) || [];
let unlockedBadges = JSON.parse(localStorage.getItem('kindness_badges')) || [];
let selectedAvatarId = AVATARS[0].id;
let activeMission = null;

// DOM Elements
const onboarding = document.getElementById('onboarding');
const onboardingStep1 = document.getElementById('onboarding-step-1');
const onboardingStep2 = document.getElementById('onboarding-step-2');
const avatarGrid = document.getElementById('avatar-grid');
const nameInput = document.getElementById('name-input');
const startBtn = document.getElementById('start-btn');

const mainApp = document.getElementById('main-app');
const userName = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const userLevel = document.getElementById('user-level');
const userPoints = document.getElementById('user-points');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const badgeList = document.getElementById('badge-list');
const missionList = document.getElementById('mission-list');

const modal = document.getElementById('mission-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPoints = document.getElementById('modal-points');
const completeBtn = document.getElementById('complete-btn');

// Init
function init() {
    if (profile) {
        onboarding.classList.add('hidden');
        renderApp();
    } else {
        renderOnboarding();
    }
}

// Onboarding
function renderOnboarding() {
    avatarGrid.innerHTML = AVATARS.map(avatar => `
        <img src="${avatar.url}" class="avatar-option ${avatar.id === selectedAvatarId ? 'selected' : ''}" 
             data-id="${avatar.id}" alt="${avatar.name}">
    `).join('');

    avatarGrid.querySelectorAll('.avatar-option').forEach(el => {
        el.onclick = () => {
            selectedAvatarId = el.dataset.id;
            renderOnboarding();
        };
    });

    nameInput.oninput = () => {
        startBtn.disabled = !nameInput.value.trim();
    };

    startBtn.onclick = () => {
        profile = {
            name: nameInput.value.trim(),
            avatarId: selectedAvatarId,
            points: 0
        };
        save();
        onboarding.classList.add('hidden');
        renderApp();
    };
}

function nextStep() {
    onboardingStep1.classList.add('hidden');
    onboardingStep2.classList.remove('hidden');
}

// App Rendering
function renderApp() {
    userName.textContent = profile.name;
    const avatar = AVATARS.find(a => a.id === profile.avatarId);
    userAvatar.src = avatar.url;
    userPoints.textContent = profile.points;

    const level = calculateLevel(profile.points);
    userLevel.textContent = `LVL ${level}`;

    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || (currentThreshold + 500);
    const progress = ((profile.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    progressText.textContent = `${Math.round(progress)}% to Level ${level + 1}`;

    // Badges
    badgeList.innerHTML = BADGES.map(badge => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        return `
            <div class="badge-item ${isUnlocked ? 'unlocked' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name.split(' ').slice(1).join(' ')}</div>
            </div>
        `;
    }).join('');

    // Missions
    missionList.innerHTML = MISSIONS.map(mission => {
        const isCompleted = completedMissions.includes(mission.id);
        return `
            <div class="mission-card ${isCompleted ? 'completed' : ''}" onclick="openMission('${mission.id}')">
                <div class="mission-meta">
                    <span class="category-tag">${mission.category}</span>
                    ${isCompleted ? '<span class="category-tag" style="color: var(--accent-color)">✓ COMPLETED</span>' : ''}
                </div>
                <div class="mission-title">${mission.title}</div>
                <div class="mission-desc">${mission.description}</div>
                <div style="position: absolute; right: 1.25rem; top: 1.25rem; text-align: right;">
                    <div style="color: var(--gold-color); font-weight: 700;">+${mission.points}</div>
                    <div style="font-size: 0.5rem; color: var(--stone-400); font-weight: 700; text-transform: uppercase;">Points</div>
                </div>
            </div>
        `;
    }).join('');
}

function calculateLevel(points) {
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (points >= LEVEL_THRESHOLDS[i]) level = i + 1;
        else break;
    }
    return level;
}

// Mission Logic
function openMission(id) {
    const mission = MISSIONS.find(m => m.id === id);
    if (completedMissions.includes(id)) return;

    activeMission = mission;
    modalTitle.textContent = mission.title;
    modalDesc.textContent = mission.description;
    modalPoints.textContent = `+${mission.points} pts`;
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function completeMission() {
    if (!activeMission) return;

    completedMissions.push(activeMission.id);
    profile.points += activeMission.points;

    // Badge logic
    if (completedMissions.length === 1) unlockBadge('helper');
    
    const communityCount = MISSIONS.filter(m => completedMissions.includes(m.id) && m.category === 'community').length;
    if (communityCount >= 5) unlockBadge('community-star');

    const socialCount = MISSIONS.filter(m => completedMissions.includes(m.id) && m.category === 'social').length;
    if (socialCount >= 3) unlockBadge('positivity-pro');

    save();
    closeModal();
    renderApp();
}

function unlockBadge(id) {
    if (!unlockedBadges.includes(id)) {
        unlockedBadges.push(id);
        // Could add a toast here
    }
}

function save() {
    localStorage.setItem('kindness_profile', JSON.stringify(profile));
    localStorage.setItem('kindness_completed', JSON.stringify(completedMissions));
    localStorage.setItem('kindness_badges', JSON.stringify(unlockedBadges));
}

init();

class ChatManager {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.rateLimitWarning = document.getElementById('rateLimitWarning');
        
        this.initializeEventListeners();
        this.initializeContactButtons();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => {
            this.updateSendButton();
        });
        
        this.updateSendButton();
    }

    initializeContactButtons() {
        const discordBtn = document.getElementById('discordBtn');
        const telegramBtn = document.getElementById('telegramBtn');
        const oguBtn = document.getElementById('oguBtn');
        const tooltip = document.getElementById('tooltip');

        const discordUsername = 'LiteEagle262';
        const telegramUrl = 'http://t.me/LiteEagle262';
        const oguUrl = 'https://oguser.com/sexyeagle';

        discordBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(discordUsername);
                this.showTooltip(tooltip);
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                this.fallbackCopyTextToClipboard(discordUsername, tooltip);
            }
        });

        telegramBtn.addEventListener('click', () => {
            window.open(telegramUrl, '_blank');
        });

        oguBtn.addEventListener('click', () => {
            window.open(oguUrl, '_blank');
        });
    }

    showTooltip(tooltip) {
        tooltip.classList.add('show');
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 2000);
    }

    fallbackCopyTextToClipboard(text, tooltip) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showTooltip(tooltip);
        } catch (err) {
            console.error('Fallback: Could not copy text: ', err);
        }
        
        document.body.removeChild(textArea);
    }

    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText;
        this.sendButton.style.opacity = hasText ? '1' : '0.6';
    }

    showRateLimitWarning() {
        this.rateLimitWarning.style.display = 'block';
        setTimeout(() => {
            this.rateLimitWarning.style.display = 'none';
        }, 5000);
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.updateSendButton();

        this.showTypingIndicator();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (response.status === 429) {
                this.hideTypingIndicator();
                this.showRateLimitWarning();
                this.addMessage('Please wait before sending another message. You can send up to 5 messages per minute.', 'bot', true);
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            this.hideTypingIndicator();
            this.addMessage(data.response, 'bot');

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error processing your request. Please try again.', 'bot', true);
        }
    }

    addMessage(text, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `message-avatar ${sender}-avatar`;
        
        if (sender === 'bot') {
            const avatarImg = document.createElement('img');
            avatarImg.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKwg-DhJBbyogv0C2H5ZN5sZ-vhuGTmtrq7Q&s';
            avatarImg.alt = 'AI Assistant';
            avatarImg.className = 'avatar-img';
            avatarDiv.appendChild(avatarImg);
        } else {
            avatarDiv.textContent = '👤';
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        
        if (isError) {
            textDiv.style.borderColor = '#ff6b6b';
            textDiv.style.background = 'rgba(255, 107, 107, 0.2)';
        }
        
        textDiv.innerHTML = this.formatMessage(text, sender);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.getCurrentTime();
        
        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(timeDiv);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    autoLinkMentions(text) {
        text = text.replace(/\b(Discord|discord)\b/g, '<span class="discord-link" onclick="navigator.clipboard.writeText(\'LiteEagle262\'); document.getElementById(\'tooltip\').classList.add(\'show\'); setTimeout(() => document.getElementById(\'tooltip\').classList.remove(\'show\'), 2000);">$1</span>');
        text = text.replace(/\b(Telegram|telegram)\b/g, '<span class="telegram-link" onclick="window.open(\'http://t.me/LiteEagle262\', \'_blank\');">$1</span>');
        return text;
    }

    formatMessage(text, sender = 'bot') {
        text = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        if (sender === 'bot') {
            text = this.autoLinkMentions(text);
        }
        
        return text;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'inline-flex';
        this.sendButton.disabled = true;
        this.messageInput.disabled = true;
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
        this.sendButton.disabled = false;
        this.messageInput.disabled = false;
        this.updateSendButton();
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatManager();
    addVisualEnhancements();
});

function addVisualEnhancements() {
    const body = document.body;
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        
        body.style.background = `
            radial-gradient(circle at ${mouseX * 100}% ${mouseY * 100}%, 
            rgba(138, 43, 226, 0.1) 0%, 
            transparent 50%),
            linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)
        `;
    });
    
    const sendButton = document.getElementById('sendButton');
    sendButton.addEventListener('click', () => {
        sendButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            sendButton.style.transform = '';
        }, 150);
    });
    
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('focus', () => {
        messageInput.parentElement.style.transform = 'translateY(-2px)';
    });
    
    messageInput.addEventListener('blur', () => {
        messageInput.parentElement.style.transform = '';
    });
}

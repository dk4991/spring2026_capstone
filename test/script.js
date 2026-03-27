class PhilosophyApp {
    constructor() {
        this.currentLang = 'en';
        this.currentPage = 1;
        this.totalPages = 6;
        this.synth = window.speechSynthesis;
        this.utterance = null;
        
        this.init();
    }

    init() {
        // Bind language toggle button
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Initialize display to handle default lang
        this.updateLanguageVisibility();
    }

    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages) return;

        // Hide current page
        const currentPageEl = document.getElementById(`page-${this.currentPage}`);
        if (currentPageEl) {
            currentPageEl.classList.remove('active');
            setTimeout(() => {
                currentPageEl.classList.add('hidden');
            }, 600); // Wait for transition
        }

        // Show new page
        this.currentPage = pageNumber;
        const newPageEl = document.getElementById(`page-${this.currentPage}`);
        if (newPageEl) {
            newPageEl.classList.remove('hidden');
            // Small delay to allow display block to apply before transition
            setTimeout(() => {
                newPageEl.classList.add('active');
            }, 50);
        }

        // Stop audio if navigating away
        this.stopAudio();
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'zh' : 'en';
        this.updateLanguageVisibility();
        this.stopAudio(); // Stop audio if language changes
    }

    updateLanguageVisibility() {
        const enElements = document.querySelectorAll('.lang-en');
        const zhElements = document.querySelectorAll('.lang-zh');

        if (this.currentLang === 'en') {
            enElements.forEach(el => el.classList.remove('hidden'));
            zhElements.forEach(el => el.classList.add('hidden'));
        } else {
            zhElements.forEach(el => el.classList.remove('hidden'));
            enElements.forEach(el => el.classList.add('hidden'));
        }
    }

    speakText(pageId) {
        this.stopAudio();

        let textToRead = "";
        const pageContainer = document.getElementById(pageId);
        
        if (!pageContainer) return;

        // Scrape text based on current language
        const langClass = this.currentLang === 'en' ? '.lang-en' : '.lang-zh';
        const textNodes = pageContainer.querySelectorAll(`.text-container ${langClass}`);

        textNodes.forEach(node => {
            if (!node.classList.contains('hidden')) {
                textToRead += node.textContent + " ";
            }
        });

        if (textToRead.trim() === "") return;

        this.utterance = new SpeechSynthesisUtterance(textToRead);
        
        // Set language of utterance
        this.utterance.lang = this.currentLang === 'en' ? 'en-US' : 'zh-CN';
        
        // Try to select a nice voice depending on OS if possible
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => v.lang === this.utterance.lang && v.name.includes('Siri'));
        if (preferredVoice) {
            this.utterance.voice = preferredVoice;
        }

        this.utterance.rate = 0.9; // Slightly slower for philosophical context
        this.utterance.pitch = 1.0;

        this.synth.speak(this.utterance);
    }

    stopAudio() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
    }
}

// Initialize on load
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new PhilosophyApp();
    
    // Voices might load asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
        // ready
    };
});

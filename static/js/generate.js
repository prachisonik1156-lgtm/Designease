document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topicInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingState = document.getElementById('loadingState');
    const featuresSection = document.getElementById('featuresSection');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');

    // Handle suggestion tags
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            topicInput.value = tag.dataset.topic;
            generatePresentation();
        });
    });

    // Handle input change
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generatePresentation();
        }
    });

    // Handle generate button
    generateBtn.addEventListener('click', generatePresentation);

    async function generatePresentation() {
        const topic = topicInput.value.trim();

        if (!topic) {
            alert('Please enter a topic');
            return;
        }

        // Show loading state
        loadingState.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.classList.add('loading');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) {
                throw new Error('Failed to generate presentation');
            }

            const data = await response.json();

            // Redirect to editor
            setTimeout(() => {
                window.location.href = `/editorg/${data.presentation_id}`;
            }, 500);

        } catch (error) {
            console.error('Error:', error);
            alert('Error generating presentation. Please try again.');
            loadingState.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.classList.remove('loading');
        }
    }
});
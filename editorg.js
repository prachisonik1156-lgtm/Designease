document.addEventListener('DOMContentLoaded', () => {
    const presentation = window.presentationData;
    let currentSlideIndex = 0;

    // DOM elements
    const slidesList       = document.getElementById('slidesList');
    const slidePreview     = document.getElementById('slidePreview');
    const slideTitle       = document.getElementById('slideTitle');
    const bulletPointsList = document.getElementById('bulletPointsList');
    const addBulletBtn     = document.getElementById('addBulletBtn');
    const addSlideBtn      = document.getElementById('addSlideBtn');
    const deleteSlideBtn   = document.getElementById('deleteSlideBtn');
    const prevBtn          = document.getElementById('prevBtn');
    const nextBtn          = document.getElementById('nextBtn');
    const helpBtn          = document.getElementById('helpBtn');
    const uploadImageBtn   = document.getElementById('uploadImageBtn');
    const fetchImageBtn    = document.getElementById('fetchImageBtn');
    const imageUpload      = document.getElementById('imageUpload');
    const currentSlideNum  = document.getElementById('currentSlideNum');
    const totalSlides      = document.getElementById('totalSlides');
    const editTabs         = document.querySelectorAll('.edit-tab');
    const tabContents      = document.querySelectorAll('.tab-content');

    // Modals
    const fetchImageModal  = document.getElementById('fetchImageModal');
    const helpModal        = document.getElementById('helpModal');
    const searchImagesBtn  = document.getElementById('searchImagesBtn');
    const imageKeywords    = document.getElementById('imageKeywords');

    // Design controls
    const textColor   = document.getElementById('textColor');
    const accentColor = document.getElementById('accentColor');
    const fontStyle   = document.getElementById('fontStyle');
    const themeBtns   = document.querySelectorAll('.theme-btn');

    // ── Initialize ──
    renderSlidesList();
    renderSlide(currentSlideIndex);
    updateNavButtons();

    // ── Event Listeners ──
    addSlideBtn.addEventListener('click', addSlide);
    deleteSlideBtn.addEventListener('click', deleteSlide);
    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);
    helpBtn.addEventListener('click', openHelpModal);
    addBulletBtn.addEventListener('click', addBulletPoint);
    uploadImageBtn.addEventListener('click', () => imageUpload.click());
    fetchImageBtn.addEventListener('click', openFetchImageModal);
    searchImagesBtn.addEventListener('click', searchImages);

    // Tab switching
    editTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            editTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });

    // Design controls
    textColor.addEventListener('input', (e) => {
        document.getElementById('colorValue').textContent = e.target.value;
        applySlideStyles();
    });

    accentColor.addEventListener('input', (e) => {
        document.getElementById('accentColorValue').textContent = e.target.value;
        applySlideStyles();
    });

    fontStyle.addEventListener('change', applySlideStyles);

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applySlideStyles();
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')        previousSlide();
        else if (e.key === 'ArrowRight')  nextSlide();
        else if (e.ctrlKey && e.key==='s') { e.preventDefault(); window.location.href = '/api/download-pdf/' + presentation.id; }
    });

    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });

    // File upload
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                presentation.slides[currentSlideIndex].imageUrl = event.target.result;
                renderSlide(currentSlideIndex);
            };
            reader.readAsDataURL(file);
        }
    });

    // Title input
    slideTitle.addEventListener('input', () => {
        presentation.slides[currentSlideIndex].title = slideTitle.value;
        renderSlidesList();
    });

    // ===== FUNCTIONS =====

    function renderSlidesList() {
        slidesList.innerHTML = '';
        presentation.slides.forEach((slide, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `slide-thumbnail ${index === currentSlideIndex ? 'active' : ''}`;
            thumbnail.innerHTML = `
                <img src="${slide.imageUrl}" alt="Slide ${index + 1}" class="thumbnail-image"
                     onerror="this.style.background='#e5e7eb';this.removeAttribute('src')">
                <div class="thumbnail-title">${slide.title}</div>
                <button class="thumbnail-delete" title="Delete slide">×</button>
            `;
            thumbnail.addEventListener('click', () => {
                currentSlideIndex = index;
                renderSlidesList();
                renderSlide(currentSlideIndex);
                updateNavButtons();
            });
            thumbnail.querySelector('.thumbnail-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                if (presentation.slides.length > 1) {
                    presentation.slides.splice(index, 1);
                    if (currentSlideIndex >= presentation.slides.length)
                        currentSlideIndex = presentation.slides.length - 1;
                    renderSlidesList();
                    renderSlide(currentSlideIndex);
                    updateNavButtons();
                    updateSlideCounter();
                }
            });
            slidesList.appendChild(thumbnail);
        });
    }

    function renderSlide(index) {
        const slide = presentation.slides[index];
        slideTitle.value = slide.title;
        renderBulletPoints(slide.content);
        renderPreview(slide);
        updateSlideCounter();
    }

    function renderBulletPoints(content) {
        bulletPointsList.innerHTML = '';
        content.forEach((point, index) => {
            const item = document.createElement('div');
            item.className = 'bullet-point-item';
            item.innerHTML = `
                <input type="text" class="bullet-input" value="${escapeHtml(point)}" placeholder="Enter bullet point">
                <button class="btn-delete-bullet">−</button>
            `;
            const input = item.querySelector('.bullet-input');
            input.addEventListener('input', () => {
                presentation.slides[currentSlideIndex].content[index] = input.value;
                renderPreview(presentation.slides[currentSlideIndex]);
            });
            item.querySelector('.btn-delete-bullet').addEventListener('click', () => {
                if (presentation.slides[currentSlideIndex].content.length > 1) {
                    presentation.slides[currentSlideIndex].content.splice(index, 1);
                    renderBulletPoints(presentation.slides[currentSlideIndex].content);
                    renderPreview(presentation.slides[currentSlideIndex]);
                }
            });
            bulletPointsList.appendChild(item);
        });
    }

    function renderPreview(slide) {
        const bullets = slide.content.map(b => `<li>${escapeHtml(b)}</li>`).join('');
        const imgSrc  = slide.imageUrl || '';
        const imgHtml = imgSrc
            ? `<img src="${imgSrc}" alt="Slide image" class="slide-image"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <div class="slide-image-placeholder" style="display:none">🖼️</div>`
            : `<div class="slide-image-placeholder">🖼️</div>`;

        slidePreview.innerHTML = `
            <div class="slide-content">
                <div class="slide-text">
                    <h2 class="slide-title-text">${escapeHtml(slide.title)}</h2>
                    <ul class="slide-bullets">${bullets}</ul>
                </div>
                <div style="overflow:hidden;height:100%">${imgHtml}</div>
            </div>
        `;
        applySlideStyles();
    }

    function applySlideStyles() {
        const text    = slidePreview.querySelector('.slide-text');
        const title   = slidePreview.querySelector('.slide-title-text');
        const bullets = slidePreview.querySelector('.slide-bullets');
        if (!text) return;

        const activeTheme = document.querySelector('.theme-btn.active');
        const theme = activeTheme ? activeTheme.dataset.theme : 'light';
        const themes = {
            light:    'linear-gradient(135deg,#ffffff 0%,#f3f4f6 100%)',
            dark:     'linear-gradient(135deg,#1f2937 0%,#111827 100%)',
            gradient: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
            ocean:    'linear-gradient(135deg,#0369a1 0%,#06b6d4 100%)'
        };
        text.style.background = themes[theme] || themes.light;
        if (title)   title.style.color   = textColor.value;
        if (bullets) bullets.style.color = textColor.value;
    }

    function updateSlideCounter() {
        currentSlideNum.textContent = currentSlideIndex + 1;
        totalSlides.textContent     = presentation.slides.length;
    }

    function updateNavButtons() {
        prevBtn.disabled = currentSlideIndex === 0;
        nextBtn.disabled = currentSlideIndex === presentation.slides.length - 1;
    }

    function previousSlide() {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            renderSlidesList(); renderSlide(currentSlideIndex); updateNavButtons();
        }
    }

    function nextSlide() {
        if (currentSlideIndex < presentation.slides.length - 1) {
            currentSlideIndex++;
            renderSlidesList(); renderSlide(currentSlideIndex); updateNavButtons();
        }
    }

    function addSlide() {
        presentation.slides.push({
            title: 'New Slide',
            content: ['Point 1', 'Point 2', 'Point 3'],
            imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop',
            imageKeywords: 'presentation'
        });
        currentSlideIndex = presentation.slides.length - 1;
        renderSlidesList(); renderSlide(currentSlideIndex); updateNavButtons();
    }

    function deleteSlide() {
        if (presentation.slides.length <= 1) { alert('Cannot delete the last slide'); return; }
        presentation.slides.splice(currentSlideIndex, 1);
        if (currentSlideIndex >= presentation.slides.length) currentSlideIndex = presentation.slides.length - 1;
        renderSlidesList(); renderSlide(currentSlideIndex); updateNavButtons();
    }

    function addBulletPoint() {
        const slide = presentation.slides[currentSlideIndex];
        slide.content.push('New point');
        renderBulletPoints(slide.content);
        renderPreview(slide);
    }

    function openFetchImageModal() {
        fetchImageModal.classList.remove('hidden');
        imageKeywords.value = presentation.slides[currentSlideIndex].title;
    }

    function openHelpModal() {
        helpModal.classList.remove('hidden');
    }

    async function searchImages() {
        const keywords = imageKeywords.value.trim();
        if (!keywords) { alert('Please enter keywords'); return; }
        searchImagesBtn.disabled    = true;
        searchImagesBtn.textContent = 'Searching...';
        try {
            const res  = await fetch('/api/fetch-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: keywords, slide_index: currentSlideIndex })
            });
            const data = await res.json();
            if (data.success && data.imageUrl) {
                presentation.slides[currentSlideIndex].imageUrl = data.imageUrl;
                renderSlide(currentSlideIndex);
                renderSlidesList();
                fetchImageModal.classList.add('hidden');
            } else {
                alert('Image nahi mili. Koi aur keyword try karein.');
            }
        } catch (err) {
            console.error(err);
            alert('Image fetch nahi hua.');
        } finally {
            searchImagesBtn.disabled    = false;
            searchImagesBtn.textContent = 'Search Images';
        }
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }
});
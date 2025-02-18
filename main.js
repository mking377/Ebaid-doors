// تهيئة مكتبة AOS
AOS.init({
    duration: 400,
    once: true
});

// تهيئة مكتبة GLightbox
let lightbox = GLightbox({
    touchNavigation: true,
    loop: true,
    autoplayVideos: true,
    preload: false // تحسين الأداء
});

// القائمة المتجاوبة
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// إغلاق القائمة عند النقر على أي رابط
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks) {
            navLinks.classList.remove('active');
        }
    });
});

// زر العودة للأعلى
const scrollTopBtn = document.querySelector('.scroll-top');

if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('active');
        } else {
            scrollTopBtn.classList.remove('active');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// معرض الصور
document.addEventListener('DOMContentLoaded', () => {
    // عناصر التحكم في المعرض
    const galleryGrid = document.querySelector('.gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('gallery-search');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');
    const totalPagesSpan = document.getElementById('total-pages');
    const categorySelect = document.getElementById('door-category');

    // التأكد من وجود حاوية المعرض
    if (!galleryGrid) return;

    // تعريف متغيرات بيانات المعرض
    let galleryItems = [];
    let filteredItems = [];
    let currentFilter = 'all';
    let currentType = 'all';
    let currentPage = 1;
    const itemsPerPage = 9;

    // جلب بيانات الصور من ملف JSON
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
          galleryItems = data;
          filteredItems = [...galleryItems];
          updateGallery();
      })
      .catch(error => console.error("خطأ في تحميل البيانات:", error));

    // دالة لتحديث عرض الصور (المعرض) بناءً على التصفية والصفحات
    function updateGallery() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = filteredItems.slice(startIndex, endIndex);

        // استخدام DocumentFragment لتحسين الأداء
        const fragment = document.createDocumentFragment();
        
        currentItems.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-aos', 'fade-up');
            galleryItem.setAttribute('data-aos-delay', (index * 100).toString());

            const priceFormatted = new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
            }).format(item.price);

            galleryItem.innerHTML = `
                <a href="${item.src}" class="glightbox" data-gallery="gallery1" 
                   data-glightbox="title: ${item.title}; description: ${item.description}">
                    <img src="${item.src}" alt="${item.title}" loading="lazy">
                    <div class="gallery-overlay">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <div class="gallery-details">
                            <span class="price">${priceFormatted}</span>
                        </div>
                        <ul class="features">
                            ${item.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                </a>
            `;
            fragment.appendChild(galleryItem);
        });

        galleryGrid.innerHTML = '';
        galleryGrid.appendChild(fragment);

        // إعادة تهيئة GLightbox بعد تحديث المعرض
        if (lightbox) {
            lightbox.destroy();
        }
        lightbox = GLightbox({
            touchNavigation: true,
            loop: true,
            autoplayVideos: true,
            preload: false
        });

        // تحديث أزرار التنقل بين الصفحات
        if (prevPageBtn && nextPageBtn && currentPageSpan && totalPagesSpan) {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages;
            currentPageSpan.textContent = currentPage.toString();
            totalPagesSpan.textContent = totalPages.toString();
        }

        // تحديث عداد النتائج
        const resultsCounter = document.getElementById('results-counter');
        if (resultsCounter) {
            resultsCounter.textContent = `${filteredItems.length} نتيجة`;
        }
    }

    // دالة لتصفية الصور بناءً على الفلاتر والبحث
    function filterGallery() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        filteredItems = galleryItems.filter(item => {
            const matchesFilter = currentFilter === 'all' || item.category === currentFilter;
            const matchesType = currentType === 'all' || item.type === currentType;
            const matchesSearch = 
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm);
            
            return matchesFilter && matchesType && matchesSearch;
        });

        currentPage = 1;
        updateGallery();
    }

    // التعامل مع أزرار الفلترة
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || 'all';
            filterGallery();
        });
    });

    // تغيير نوع الباب عبر القائمة المنسدلة
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            currentType = categorySelect.value;
            filterGallery();
        });
    }

    // البحث في الصور مع تأخير لتحسين الأداء
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterGallery();
            }, 300);
        });
    }

    // التنقل بين الصفحات
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateGallery();
                scrollToGallery();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateGallery();
                scrollToGallery();
            }
        });
    }

    function scrollToGallery() {
        galleryGrid.scrollIntoView({ behavior: 'smooth' });
    }
});

// نموذج الاتصال مع التحقق
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        submitBtn.disabled = true;

        try {
            // محاكاة إرسال النموذج
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // إظهار رسالة النجاح
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                تم إرسال رسالتك بنجاح! سنتواصل معك قريباً
            `;
            contactForm.insertBefore(successMessage, contactForm.firstChild);
            
            // إعادة تعيين النموذج
            contactForm.reset();
            
            // إخفاء رسالة النجاح بعد 5 ثوانٍ
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        } catch (error) {
            // إظهار رسالة الخطأ
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-error';
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى
            `;
            contactForm.insertBefore(errorMessage, contactForm.firstChild);
            
            // إخفاء رسالة الخطأ بعد 5 ثوانٍ
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
        } finally {
            // إعادة زر الإرسال إلى حالته الأصلية
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// تحسين أداء الصفحة: تأخير تحميل الصور غير المرئية
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
});
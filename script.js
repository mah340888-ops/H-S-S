const defaultProducts = [
    {
        id: 1,
        name: "برنامج المحاسبة الاحترافي",
        description: "أفضل نظام لإدارة مبيعاتك ومخازنك بسهولة. يتضمن تقارير يومية، إدارة مخازن، ودعم ضريبة القيمة المضافة.",
        price: "100$",
        icon: "📊",
        downloadUrl: "#"
    },
    {
        id: 2,
        name: "نظام إدارة الصيدليات",
        description: "تتبع الأدوية، المبيعات، وتنبيهات انتهاء الصلاحية. واجهة سهلة ودعم كامل للباركود.",
        price: "150$",
        icon: "💊",
        downloadUrl: "#"
    },
    {
        id: 3,
        name: "أداة أتمتة المهام",
        description: "وفر وقتك مع برنامج يقوم بالمهام المتكررة بدلاً عنك. يدعم الجدولة والتنبيهات.",
        price: "40$",
        icon: "🤖",
        downloadUrl: "#"
    }
];

// وظيفة لعرض البرامج
function displayProducts(limitLatest = false, searchTerm = "") {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    const localProducts = JSON.parse(localStorage.getItem('my_products')) || [];
    let allProducts = [...defaultProducts, ...localProducts];

    // تصفية المنتجات بناءً على البحث
    if (searchTerm) {
        allProducts = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // إذا كنا في الصفحة الرئيسية (بدون بحث)، نعرض آخر 3 فقط
    if (limitLatest && !searchTerm) {
        allProducts = allProducts.slice(-3).reverse();
    }

    if (allProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 50px; text-align: center; color: #7f8c8d;">
                <span style="font-size: 4rem; display: block; margin-bottom: 15px;">🔍</span>
                <h3>عذراً، لم نجد أي نتائج تطابق بحثك.</h3>
                <p>حاول استخدام كلمات مفتاحية أخرى.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = ""; 
    allProducts.forEach((product) => {
        const productId = product.id;
        const originalIndex = [...defaultProducts, ...localProducts].findIndex(p => p.name === product.name);

        const shortDesc = product.description.substring(0, 60) + "...";
        
        let iconHTML = product.icon;
        if (product.icon && product.icon.startsWith('data:image')) {
            iconHTML = `<img src="${product.icon}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px;">`;
        }

        const card = `
            <div class="product-card" onclick="goToDetails(${productId}, ${originalIndex})">
                <div class="product-image">${iconHTML}</div>
                <h3>${product.name}</h3>
                <p class="specs">${shortDesc}</p>
                <span class="price">${product.price}</span>
                <button class="buy-btn">عرض التفاصيل</button>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// وظيفة البحث
function searchProducts() {
    const input = document.getElementById('search-input');
    if (!input) return;
    
    const searchTerm = input.value.trim();
    const title = document.querySelector('.products h2');
    
    if (title) {
        title.innerText = searchTerm ? `نتائج البحث عن: ${searchTerm}` : (window.location.pathname.includes('products.html') ? "جميع البرامج المتاحة" : "أحدث البرامج");
    }

    displayProducts(window.location.pathname.includes('index.html'), searchTerm);
}

// التوجيه لصفحة التفاصيل
function goToDetails(id, index) {
    window.location.href = `product-details.html?index=${index}&id=${id}`;
}

// جلب بيانات المستخدم المسجل
function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('hss_user'));
}

// عرض تفاصيل المنتج في صفحة التفاصيل
function showProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const index = params.get('index');
    const user = getLoggedInUser();

    const localProducts = JSON.parse(localStorage.getItem('my_products')) || [];
    const allProducts = [...defaultProducts, ...localProducts];
    
    const product = allProducts[index];
    if (!product) return;

    const container = document.getElementById('product-details');
    const isPurchased = user && user.purchases && user.purchases.find(p => p.productName === product.name);

    let galleryHTML = "";
    if (product.gallery && product.gallery.length > 0) {
        galleryHTML = `
            <div class="gallery-section">
                <h3>📷 صور من داخل البرنامج</h3>
                <div class="gallery-grid">
                    ${product.gallery.map(img => `<img src="${img}" class="gallery-img" onclick="openLightbox(this.src)">`).join('')}
                </div>
            </div>
        `;
    }

    let videoHTML = "";
    if (product.video) {
        videoHTML = `
            <div class="video-section">
                <h3>🎥 فيديو شرح البرنامج</h3>
                <video controls class="video-player">
                    <source src="${product.video}" type="video/mp4">
                    متصفحك لا يدعم تشغيل الفيديو.
                </video>
            </div>
        `;
    }

    let actionSection = "";
    if (isPurchased) {
        actionSection = `
            <div class="actions-section" style="background: #e8f5e9; padding: 25px; border-radius: 10px;">
                <h3 style="color: #2e7d32; margin-top:0;">تم تفعيل النسخة الكاملة ✅</h3>
                <p>مفتاح التفعيل: <b style="background:white; padding:5px 15px; border: 1px solid #2e7d32; border-radius:5px; font-family:monospace; font-size:1.4rem;">${isPurchased.serial}</b></p>
                <a href="${product.downloadUrl}" class="download-link" style="background:#2e7d32; display:inline-block; margin-top:15px;">تحميل البرنامج</a>
            </div>
        `;
    } else {
        actionSection = `
            <div class="actions-section">
                <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
                    <a href="${product.downloadUrl}" onclick="trackDownload('${product.name}')" class="download-link" style="background:#34495e; min-width:250px;">📥 تحميل النسخة التجريبية (مجاناً)</a>
                    <button class="buy-btn" onclick="buyNow('${product.name}', '${product.downloadUrl}')" style="min-width:250px;">🛒 شراء كود التفعيل (${product.price})</button>
                </div>
                <p style="margin-top:15px; color:#666;">تجربة مجانية لمدة 7 أيام - التفعيل يفتح النسخة للأبد.</p>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="product-header-panel">
            <img src="${product.icon && product.icon.startsWith('data') ? product.icon : 'https://via.placeholder.com/100?text=📦'}" class="product-header-icon">
            <div class="product-header-info">
                <h1>${product.name}</h1>
                <span class="version-tag">الإصدار: ${product.version || 'v1.0.0'}</span>
            </div>
        </div>
        ${galleryHTML}
        <div class="description-section">
            <h3>📝 عن البرنامج</h3>
            <div class="description-text">${product.description}</div>
        </div>
        ${videoHTML}
        ${actionSection}
    `;
}

function trackDownload(productName) {
    let downloads = JSON.parse(localStorage.getItem('hss_downloads')) || [];
    const downloadInfo = {
        product: productName,
        date: new Date().toLocaleString('ar-EG'),
        type: "Trial"
    };
    downloads.push(downloadInfo);
    localStorage.setItem('hss_downloads', JSON.stringify(downloads));
    showToast("جاري بدء تحميل النسخة التجريبية...");
}

function buyNow(name, downloadUrl) {
    const user = getLoggedInUser();
    if (!user || !user.isLoggedIn) {
        showToast("يرجى تسجيل الدخول أولاً لإتمام عملية الشراء.", "error");
        setTimeout(() => window.location.href = "register.html", 2000);
        return;
    }

    if (confirm(`هل تريد تأكيد شراء ${name}؟`)) {
        const serial = generateSerial();
        const purchase = {
            productName: name,
            downloadUrl: downloadUrl,
            date: new Date().toLocaleDateString('ar-EG'),
            serial: serial,
            status: "نشط"
        };

        if (!user.purchases) user.purchases = [];
        const alreadyBought = user.purchases.find(p => p.productName === name);
        if (alreadyBought) {
            showToast("لقد قمت بشراء هذا البرنامج بالفعل.", "error");
            setTimeout(() => window.location.href = "profile.html", 2000);
            return;
        }

        user.purchases.push(purchase);
        localStorage.setItem('hss_user', JSON.stringify(user));
        
        let allUsers = JSON.parse(localStorage.getItem('hss_users_list')) || [];
        const userIndex = allUsers.findIndex(u => u.email === user.email);
        if (userIndex !== -1) {
            allUsers[userIndex] = user;
            localStorage.setItem('hss_users_list', JSON.stringify(allUsers));
        }

        showToast("تمت عملية الشراء بنجاح! جاري تحويلك...");
        setTimeout(() => window.location.href = "profile.html", 2000);
    }
}

function generateSerial() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let serial = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            serial += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) serial += '-';
    }
    return serial;
}

function displayUserPurchases(user) {
    const list = document.getElementById('purchases-list');
    if (!list) return;

    if (!user.purchases || user.purchases.length === 0) {
        list.innerHTML = `<tr><td colspan="5" style="text-align:center;">لم تقم بشراء أي برامج بعد.</td></tr>`;
        return;
    }

    list.innerHTML = user.purchases.map(p => `
        <tr>
            <td>${p.productName}</td>
            <td>${p.date}</td>
            <td><span class="serial-key">${p.serial}</span></td>
            <td><span class="status-badge status-active">${p.status}</span></td>
            <td><a href="${p.downloadUrl}" target="_blank" class="download-link" style="padding: 5px 10px;">تحميل</a></td>
        </tr>
    `).join('');
}

// نظام تنبيهات (Toast) بسيط وجذاب
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 12px 25px;
        border-radius: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        font-weight: bold;
        transition: 0.3s;
        opacity: 0;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => { toast.style.opacity = '1'; toast.style.bottom = '40px'; }, 100);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Lightbox Functions
function openLightbox(src) {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
        img.src = src;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightbox');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

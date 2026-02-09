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
function displayProducts(limitLatest = false) {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    grid.innerHTML = ""; 

    const localProducts = JSON.parse(localStorage.getItem('my_products')) || [];
    let allProducts = [...defaultProducts, ...localProducts];

    // إذا كنا في الصفحة الرئيسية، نعرض آخر 3 فقط
    if (limitLatest) {
        allProducts = allProducts.slice(-3).reverse();
    }

    allProducts.forEach((product, index) => {
        const shortDesc = product.description.substring(0, 60) + "...";
        
        // التحقق من نوع الأيقونة (صورة أم إيموجي)
        let iconHTML = product.icon;
        if (product.icon && product.icon.startsWith('data:image')) {
            iconHTML = `<img src="${product.icon}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px;">`;
        }

        const card = `
            <div class="product-card" onclick="goToDetails(${product.id || 'null'}, ${index})">
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
    
    // التحقق من الشراء
    const isPurchased = user && user.purchases && user.purchases.find(p => p.productName === product.name);

    // بناء معرض الصور
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

    // بناء الفيديو
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

    // بناء قسم الأكشن (شراء/تحميل)
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

    // تجميع الصفحة النهائية
    container.innerHTML = `
        <div class="product-header-panel">
            <img src="${product.icon.startsWith('data') ? product.icon : 'https://via.placeholder.com/100?text=📦'}" class="product-header-icon">
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
    console.log("Download tracked:", productName);
}

function buyNow(name, downloadUrl) {
    const user = getLoggedInUser();
    if (!user || !user.isLoggedIn) {
        alert("يرجى تسجيل الدخول أولاً لإتمام عملية الشراء.");
        window.location.href = "register.html";
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
            alert("لقد قمت بشراء هذا البرنامج بالفعل.");
            window.location.href = "profile.html";
            return;
        }

        user.purchases.push(purchase);
        localStorage.setItem('hss_user', JSON.stringify(user));
        
        alert("تمت عملية الشراء بنجاح! السيريال: " + serial);
        window.location.href = "profile.html";
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

function searchProducts() {
    // ... كود البحث السابق مع التعديل ليعمل بنفس الطريقة
}

// Lightbox Functions
function openLightbox(src) {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
        img.src = src;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // منع السكرول في الصفحة الخلفية
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightbox');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

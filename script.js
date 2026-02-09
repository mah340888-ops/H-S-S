import { db } from './firebase-config.js';
import { 
    collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- وظائف عامة ---
window.showToast = function(message, type = 'success') {
    const toast = document.createElement('div');
    let bgColor = '#27ae60'; // success
    if (type === 'error') bgColor = '#e74c3c';
    if (type === 'warning') bgColor = '#f39c12';

    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: ${bgColor};
        color: white; padding: 12px 25px; border-radius: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 9999;
        font-weight: bold; transition: 0.3s; opacity: 0;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; toast.style.bottom = '40px'; }, 100);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// جلب البرامج من Firebase
window.displayProducts = async function(limitLatest = false, searchTerm = "") {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 50px;">جاري تحميل البرامج...</div>';

    try {
        let q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        if (limitLatest && !searchTerm) q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(3));
        
        const querySnapshot = await getDocs(q);
        let allProducts = [];
        querySnapshot.forEach(doc => allProducts.push({ id: doc.id, ...doc.data() }));

        if (searchTerm) {
            allProducts = allProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (allProducts.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; padding: 50px; text-align: center; color: #7f8c8d;"><h3>لم نجد أي نتائج تطابق بحثك.</h3></div>`;
            if (!searchTerm) showToast("تنبيه: لا توجد أي برامج مضافة حالياً في فيربيز", "warning");
            return;
        }

        grid.innerHTML = ""; 
        allProducts.forEach((product) => {
            const shortDesc = product.description.substring(0, 60) + "...";
            let iconHTML = product.icon && product.icon.startsWith('data') ? `<img src="${product.icon}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px;">` : '📦';

            grid.innerHTML += `
                <div class="product-card" onclick="location.href='product-details.html?id=${product.id}'">
                    <div class="product-image">${iconHTML}</div>
                    <h3>${product.name}</h3>
                    <p class="specs">${shortDesc}</p>
                    <span class="price">${product.price}</span>
                    <button class="buy-btn">عرض التفاصيل</button>
                </div>
            `;
        });
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 50px; color:red;">حدث خطأ أثناء تحميل البيانات.</div>';
    }
};

window.searchProducts = function() {
    const input = document.getElementById('search-input');
    if (!input) return;
    const searchTerm = input.value.trim();
    displayProducts(window.location.pathname.includes('index.html'), searchTerm);
};

// عرض تفاصيل المنتج
window.showProductDetails = async function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const container = document.getElementById('product-details');
    container.innerHTML = "جاري تحميل التفاصيل...";

    try {
        const docSnap = await getDoc(doc(db, "products", id));
        if (!docSnap.exists()) return;
        const product = docSnap.data();
        const user = JSON.parse(localStorage.getItem('hss_user'));
        const isPurchased = user && user.purchases && user.purchases.find(p => p.productName === product.name);

        let galleryHTML = product.gallery ? `
            <div class="gallery-section">
                <h3>📷 صور من داخل البرنامج</h3>
                <div class="gallery-grid">
                    ${product.gallery.map(img => `<img src="${img}" class="gallery-img" onclick="openLightbox(this.src)">`).join('')}
                </div>
            </div>
        ` : "";

        let videoHTML = product.video ? `
            <div class="video-section">
                <h3>🎥 فيديو شرح البرنامج</h3>
                <video controls class="video-player">
                    <source src="${product.video}" type="video/mp4">
                    متصفحك لا يدعم تشغيل الفيديو.
                </video>
            </div>
        ` : "";

        let actionSection = isPurchased ? `
            <div class="actions-section" style="background: #e8f5e9; padding: 25px; border-radius: 10px;">
                <h3 style="color: #2e7d32; margin-top:0;">تم تفعيل النسخة الكاملة ✅</h3>
                <p>مفتاح التفعيل: <b style="background:white; padding:5px 15px; border: 1px solid #2e7d32; border-radius:5px; font-family:monospace; font-size:1.4rem;">${isPurchased.serial}</b></p>
                <a href="${product.downloadUrl}" class="download-link" style="background:#2e7d32;">تحميل البرنامج</a>
            </div>
        ` : `
            <div class="actions-section">
                <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
                    <a href="${product.downloadUrl}" onclick="trackDownload('${product.name}')" class="download-link" style="background:#34495e; min-width:250px;">📥 تحميل النسخة التجريبية (مجاناً)</a>
                    <button class="buy-btn" onclick="buyNow('${id}', '${product.name}', '${product.downloadUrl}', '${product.price}')" style="min-width:250px;">🛒 شراء كود التفعيل (${product.price})</button>
                </div>
                <p style="margin-top:15px; color:#666;">تجربة مجانية لمدة 7 أيام - التفعيل يفتح النسخة للأبد.</p>
            </div>
        `;

        container.innerHTML = `
            <div class="product-header-panel">
                <img src="${product.icon && product.icon.startsWith('data') ? product.icon : 'https://via.placeholder.com/100?text=📦'}" class="product-header-icon">
                <div class="product-header-info">
                    <h1>${product.name}</h1>
                    <span class="version-tag">الإصدار: ${product.version}</span>
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
    } catch (err) { console.error(err); }
};

window.trackDownload = async function(productName) {
    try {
        await addDoc(collection(db, "downloads"), {
            product: productName,
            createdAt: serverTimestamp(),
            type: "Trial"
        });
        showToast("جاري بدء تحميل النسخة التجريبية...");
    } catch (err) { console.error(err); }
};

window.buyNow = async function(id, name, downloadUrl, price) {
    const user = JSON.parse(localStorage.getItem('hss_user'));
    if (!user || !user.isLoggedIn) {
        showToast("يرجى تسجيل الدخول أولاً لإتمام عملية الشراء.", "error");
        setTimeout(() => window.location.href = "register.html", 2000);
        return;
    }

    if (confirm(`هل تريد تأكيد شراء ${name} بسعر ${price}؟`)) {
        const serial = generateSerial();
        const purchase = {
            productName: name,
            downloadUrl: downloadUrl,
            date: new Date().toLocaleDateString('ar-EG'),
            serial: serial,
            status: "نشط"
        };

        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const purchases = userData.purchases || [];
                if (purchases.find(p => p.productName === name)) {
                    showToast("لقد قمت بشراء هذا البرنامج بالفعل.", "error");
                    return;
                }
                purchases.push(purchase);
                await updateDoc(userRef, { purchases: purchases });
                
                // تحديث الـ LocalStorage
                user.purchases = purchases;
                localStorage.setItem('hss_user', JSON.stringify(user));

                showToast("تمت عملية الشراء بنجاح! جاري تحويلك للملف الشخصي...");
                setTimeout(() => window.location.href = "profile.html", 2000);
            }
        } catch (err) {
            console.error(err);
            showToast("حدث خطأ أثناء إتمام الشراء.", "error");
        }
    }
};

function generateSerial() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let serial = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) serial += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i < 3) serial += '-';
    }
    return serial;
}

// Lightbox functions
window.openLightbox = function(src) {
    const modal = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
        img.src = src;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.closeLightbox = function() {
    const modal = document.getElementById('lightbox');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

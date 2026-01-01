// Sidebar Toggle Functionality
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Check if elements exist before adding event listeners
if (sidebarToggle && sidebar && sidebarOverlay) {
    // Toggle Sidebar
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        sidebarOverlay.classList.toggle('show');
    });

    // Close Sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
    });
}

// Active Menu Item
const currentPath = window.location.pathname;
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
    if (item.getAttribute('href') === currentPath) {
        item.classList.add('active');
    }
});

// Toast Notifications
window.addEventListener('load', function () {
    // Show success toast if present
    const successToast = document.getElementById('successToast');
    if (successToast) {
        const toast = new bootstrap.Toast(successToast, {
            autohide: true,
            delay: 5000
        });
        toast.show();
    }

    // Show error toast if present
    const errorToast = document.getElementById('errorToast');
    if (errorToast) {
        const toast = new bootstrap.Toast(errorToast, {
            autohide: true,
            delay: 5000
        });
        toast.show();
    }
});

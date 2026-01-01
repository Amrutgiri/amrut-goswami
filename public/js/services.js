// ========================================
// SERVICES MANAGEMENT SCRIPT
// Handles DataTables, AJAX Interactions & UI
// ========================================

let servicesTable;

$(document).ready(function () {
    initializeDataTable();
    initializeEventHandlers();
});

// ========================================
// DATATABLES INITIALIZATION
// ========================================

function initializeDataTable() {
    servicesTable = $('#servicesTable').DataTable({
        ajax: {
            url: '/admin/api/services',
            dataSrc: '',
            error: function (xhr, error, thrown) {
                console.error('Error loading services:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load services. Please refresh the page.'
                });
            }
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                },
                width: '5%'
            },
            {
                data: 'icon',
                render: function (data) {
                    return `<i class="${data} fs-4 text-primary"></i>`;
                },
                width: '10%'
            },
            {
                data: 'title',
                className: 'fw-semibold',
                width: '20%'
            },
            {
                data: 'shortDescription',
                render: function (data) {
                    return data ? (data.length > 50 ? data.substring(0, 50) + '...' : data) : '-';
                },
                width: '40%'
            },
            {
                data: 'isActive',
                render: function (data, type, row) {
                    const badgeClass = data ? 'bg-success' : 'bg-secondary';
                    const badgeText = data ? 'Active' : 'Inactive';
                    // Clickable badge to toggle status
                    return `<span class="badge ${badgeClass} cursor-pointer toggle-status" data-id="${row._id}" style="cursor: pointer;">${badgeText}</span>`;
                },
                width: '15%'
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-primary btn-edit" 
                                    data-id="${row._id}" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-delete" 
                                    data-id="${row._id}" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;
                },
                orderable: false,
                width: '10%',
                className: 'text-center'
            }
        ],
        responsive: true,
        order: [[0, 'asc']], // Sort by ID
        pageLength: 10,
        language: {
            emptyTable: "No services found."
        },
        drawCallback: function () {
            attachRowEventHandlers();
        }
    });
}

// ========================================
// EVENT HANDLERS
// ========================================

function initializeEventHandlers() {
    // Add Service Form Submission
    $('#addServiceForm').on('submit', function (e) {
        e.preventDefault();
        handleCreateService(this);
    });

    // Edit Service Form Submission
    $('#editServiceForm').on('submit', function (e) {
        e.preventDefault();
        handleUpdateService(this);
    });
}

function attachRowEventHandlers() {
    // Edit Button Click
    $('.btn-edit').off('click').on('click', function () {
        const id = $(this).data('id');
        loadServiceForEdit(id);
    });

    // Delete Button Click
    $('.btn-delete').off('click').on('click', function () {
        const id = $(this).data('id');
        handleDeleteService(id);
    });

    // Status Toggle Click
    $('.toggle-status').off('click').on('click', function () {
        const id = $(this).data('id');
        handleToggleStatus(id);
    });
}

// ========================================
// API INTERACTIONS
// ========================================

// Create Service
function handleCreateService(form) {
    const formData = $(form).serialize(); // Serialize form data (including checked checkbox as name=on)

    // Explicitly handle checkbox if unchecked (it won't be in serialized data)
    // But backend handles missing 'isActive' as false if we just pass body 
    // Actually, serialize matches name attributes. 

    $.ajax({
        url: '/admin/api/services',
        method: 'POST',
        data: formData,
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Service created successfully!',
                timer: 1500,
                showConfirmButton: false
            });
            $('#addServiceModal').modal('hide');
            form.reset();
            // Reset preview
            $('#addIconPreview').attr('class', 'bi bi-star');
            servicesTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            const msg = xhr.responseJSON?.message || 'Failed to create service';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: msg
            });
        }
    });
}

// Load Service for Edit
function loadServiceForEdit(id) {
    $.ajax({
        url: `/admin/api/services/${id}`,
        method: 'GET',
        success: function (response) {
            const service = response.service;

            $('#editServiceId').val(service._id);
            $('#editServiceTitle').val(service.title);
            $('#editServiceIcon').val(service.icon);
            // Update preview
            $('#editIconPreview').attr('class', 'bi ' + service.icon);

            $('#editShortDescription').val(service.shortDescription);
            $('#editDetailDescription').val(service.detailDescription);

            $('#editServiceStatus').prop('checked', service.isActive);

            $('#editServiceModal').modal('show');
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load service details'
            });
        }
    });
}

// Update Service
function handleUpdateService(form) {
    const id = $('#editServiceId').val();
    const formData = $(form).serialize();

    $.ajax({
        url: `/admin/api/services/${id}`,
        method: 'PUT',
        data: formData,
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Service updated successfully!',
                timer: 1500,
                showConfirmButton: false
            });
            $('#editServiceModal').modal('hide');
            servicesTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            const msg = xhr.responseJSON?.message || 'Failed to update service';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: msg
            });
        }
    });
}

// Delete Service
function handleDeleteService(id) {
    Swal.fire({
        title: 'Delete Service?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/admin/api/services/${id}`,
                method: 'DELETE',
                success: function (response) {
                    Swal.fire(
                        'Deleted!',
                        response.message,
                        'success'
                    );
                    servicesTable.ajax.reload(null, false);
                },
                error: function (xhr) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: xhr.responseJSON?.message || 'Failed to delete'
                    });
                }
            });
        }
    });
}

// Toggle Status
function handleToggleStatus(id) {
    $.ajax({
        url: `/admin/api/services/${id}/toggle-status`,
        method: 'PATCH',
        success: function (response) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            Toast.fire({
                icon: 'success',
                title: response.message
            });
            servicesTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            Toast.fire({
                icon: 'error',
                title: 'Failed to update status'
            });
        }
    });
}

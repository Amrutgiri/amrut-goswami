// ========================================
// PROJECTS MANAGEMENT - AJAX CRUD
// Handles all frontend operations with DataTables & SweetAlert2
// Includes Image Upload to Cloudinary
// ========================================

let projectsTable;

// Initialize when DOM is ready
$(document).ready(function () {
    initializeDataTable();
    initializeEventHandlers();
    initializeImagePreview();
});

// ========================================
// DATATABLES INITIALIZATION
// ========================================

function initializeDataTable() {
    projectsTable = $('#projectsTable').DataTable({
        ajax: {
            url: '/admin/api/projects',
            dataSrc: '',
            error: function (xhr, error, thrown) {
                console.error('Error loading projects:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load projects. Please refresh the page.'
                });
            }
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                },
                orderable: false,
                width: '5%'
            },
            {
                data: 'image',
                render: function (data, type, row) {
                    if (data && data.url) {
                        return `<img src="${data.url}" alt="${row.title}" class="project-thumbnail" onerror="this.parentElement.innerHTML='<div class=\\'project-thumbnail-placeholder\\'><i class=\\'bi bi-image\\'></i></div>'">`;
                    } else {
                        return `<div class="project-thumbnail-placeholder"><i class="bi bi-image"></i></div>`;
                    }
                },
                orderable: false,
                width: '10%'
            },
            {
                data: 'title',
                render: function (data, type, row) {
                    return `<span class="fw-semibold">${data}</span>`;
                },
                width: '20%'
            },
            {
                data: 'description',
                render: function (data) {
                    // Truncate description if too long
                    const maxLength = 100;
                    if (data.length > maxLength) {
                        return `<span class="description-cell" title="${data}">${data.substring(0, maxLength)}...</span>`;
                    }
                    return `<span class="description-cell">${data}</span>`;
                },
                width: '30%'
            },
            {
                data: 'techStack',
                render: function (data) {
                    if (!data || data.length === 0) {
                        return '<span class="text-muted">-</span>';
                    }
                    // Show first 3 tech badges
                    let html = '';
                    const displayCount = Math.min(data.length, 3);
                    for (let i = 0; i < displayCount; i++) {
                        html += `<span class="tech-badge">${data[i]}</span>`;
                    }
                    if (data.length > 3) {
                        html += `<span class="tech-badge">+${data.length - 3}</span>`;
                    }
                    return html;
                },
                orderable: false,
                width: '15%'
            },
            {
                data: 'isActive',
                render: function (data, type, row) {
                    const badgeClass = data ? 'bg-success' : 'bg-secondary';
                    const badgeText = data ? 'Active' : 'Inactive';
                    const icon = data ? 'bi-check-circle' : 'bi-x-circle';

                    return `
                        <button type="button" class="btn btn-sm badge ${badgeClass} status-toggle" 
                                data-id="${row._id}" data-status="${data}" 
                                title="Click to toggle status" style="cursor: pointer; border: none;">
                            <i class="bi ${icon} me-1"></i>${badgeText}
                        </button>
                    `;
                },
                width: '10%'
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
                                    data-id="${row._id}" data-title="${row.title}" title="Delete">
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
        order: [[2, 'asc']], // Sort by title
        pageLength: 10,
        responsive: true,
        language: {
            emptyTable: "No projects added yet. Click 'Add Project' to get started!",
            zeroRecords: "No matching projects found",
            search: "Search projects:"
        },
        drawCallback: function () {
            // Reinitialize event handlers after table redraw
            attachRowEventHandlers();
        }
    });
}

// ========================================
// EVENT HANDLERS
// ========================================

function initializeEventHandlers() {
    // Add Project Form Submit
    $('#addProjectForm').on('submit', function (e) {
        e.preventDefault();
        handleAddProject();
    });

    // Edit Project Form Submit
    $('#editProjectForm').on('submit', function (e) {
        e.preventDefault();
        handleUpdateProject();
    });

    // Status Toggle Labels
    $('#projectStatus').on('change', function () {
        $('#addStatusLabel').text(this.checked ? 'Active' : 'Inactive');
    });

    $('#editProjectStatus').on('change', function () {
        $('#editStatusLabel').text(this.checked ? 'Active' : 'Inactive');
    });

    // Reset form when Add modal is closed
    $('#addProjectModal').on('hidden.bs.modal', function () {
        $('#addProjectForm')[0].reset();
        $('#imagePreviewAdd').html(`
            <div class="image-preview-placeholder">
                <i class="bi bi-image"></i>
                <p class="mb-0">Image preview will appear here</p>
            </div>
        `);
        $('#addStatusLabel').text('Active');
    });

    // Reset preview when Edit modal is closed
    $('#editProjectModal').on('hidden.bs.modal', function () {
        $('#editProjectForm')[0].reset();
        $('#imagePreviewEdit').html(`
            <div class="image-preview-placeholder">
                <i class="bi bi-image"></i>
                <p class="mb-0">Current project image</p>
            </div>
        `);
    });
}

function attachRowEventHandlers() {
    // Edit button click
    $('.btn-edit').off('click').on('click', function () {
        const projectId = $(this).data('id');
        loadProjectForEdit(projectId);
    });

    // Delete button click
    $('.btn-delete').off('click').on('click', function () {
        const projectId = $(this).data('id');
        const projectTitle = $(this).data('title');
        handleDeleteProject(projectId, projectTitle);
    });

    // Status toggle button click
    $('.status-toggle').off('click').on('click', function () {
        const projectId = $(this).data('id');
        const currentStatus = $(this).data('status');
        handleToggleStatus(projectId, currentStatus);
    });
}

// ========================================
// IMAGE PREVIEW FUNCTIONALITY
// ========================================

function initializeImagePreview() {
    // Add Project Image Preview
    $('#projectImage').on('change', function (e) {
        const file = e.target.files[0];
        const preview = $('#imagePreviewAdd');

        if (file) {
            // Validate file type
            if (!file.type.match('image.*')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid File',
                    text: 'Please select an image file'
                });
                this.value = '';
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'File Too Large',
                    text: 'Image size must be less than 5MB'
                });
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                preview.html(`<img src="${e.target.result}" alt="Preview">`);
            };
            reader.readAsDataURL(file);
        } else {
            preview.html(`
                <div class="image-preview-placeholder">
                    <i class="bi bi-image"></i>
                    <p class="mb-0">Image preview will appear here</p>
                </div>
            `);
        }
    });

    // Edit Project Image Preview
    $('#editProjectImage').on('change', function (e) {
        const file = e.target.files[0];
        const preview = $('#imagePreviewEdit');

        if (file) {
            // Validate file type
            if (!file.type.match('image.*')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid File',
                    text: 'Please select an image file'
                });
                this.value = '';
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'File Too Large',
                    text: 'Image size must be less than 5MB'
                });
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                preview.html(`<img src="${e.target.result}" alt="Preview">`);
            };
            reader.readAsDataURL(file);
        }
    });
}

// ========================================
// ADD PROJECT (AJAX POST with FormData)
// ========================================

function handleAddProject() {
    const form = $('#addProjectForm')[0];
    const formData = new FormData(form);

    // Client-side validation
    if (!$('#projectTitle').val().trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter a project title'
        });
        return;
    }

    if (!$('#projectDescription').val().trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter a project description'
        });
        return;
    }

    if (!$('#projectImage')[0].files[0]) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please select a project image'
        });
        return;
    }

    // Show loading
    Swal.fire({
        title: 'Adding Project...',
        html: 'Uploading image to Cloudinary...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // AJAX POST Request with FormData
    $.ajax({
        url: '/admin/api/projects',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message || 'Project added successfully!',
                timer: 2000,
                showConfirmButton: false
            });

            // Close modal and reset form
            $('#addProjectModal').modal('hide');
            $('#addProjectForm')[0].reset();
            $('#imagePreviewAdd').html(`
                <div class="image-preview-placeholder">
                    <i class="bi bi-image"></i>
                    <p class="mb-0">Image preview will appear here</p>
                </div>
            `);
            $('#addStatusLabel').text('Active');

            // Reload DataTable
            projectsTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            const errorMessage = xhr.responseJSON?.message || 'Failed to add project. Please try again.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
}

// ========================================
// EDIT PROJECT (LOAD & UPDATE)
// ========================================

function loadProjectForEdit(projectId) {
    // Show loading
    Swal.fire({
        title: 'Loading Project...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // AJAX GET Request
    $.ajax({
        url: `/admin/api/projects/${projectId}`,
        method: 'GET',
        success: function (response) {
            Swal.close();

            const project = response.project;

            // Populate form fields
            $('#editProjectId').val(project._id);
            $('#editProjectTitle').val(project.title);
            $('#editProjectDescription').val(project.description);
            $('#editProjectTechStack').val(project.techStack ? project.techStack.join(', ') : '');
            $('#editProjectLiveUrl').val(project.liveUrl || '');
            $('#editProjectGithubUrl').val(project.githubUrl || '');
            $('#editProjectStatus').prop('checked', project.isActive);
            $('#editStatusLabel').text(project.isActive ? 'Active' : 'Inactive');

            // Show current image
            if (project.image && project.image.url) {
                $('#imagePreviewEdit').html(`<img src="${project.image.url}" alt="${project.title}">`);
            } else {
                $('#imagePreviewEdit').html(`
                    <div class="image-preview-placeholder">
                        <i class="bi bi-image"></i>
                        <p class="mb-0">No image available</p>
                    </div>
                `);
            }

            // Show modal
            $('#editProjectModal').modal('show');
        },
        error: function (xhr) {
            const errorMessage = xhr.responseJSON?.message || 'Failed to load project data.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
}

function handleUpdateProject() {
    const projectId = $('#editProjectId').val();
    const form = $('#editProjectForm')[0];
    const formData = new FormData(form);

    // Client-side validation
    if (!$('#editProjectTitle').val().trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter a project title'
        });
        return;
    }

    if (!$('#editProjectDescription').val().trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter a project description'
        });
        return;
    }

    // Show loading
    Swal.fire({
        title: 'Updating Project...',
        html: $('#editProjectImage')[0].files[0] ? 'Uploading new image to Cloudinary...' : 'Saving changes...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // AJAX PUT Request with FormData
    $.ajax({
        url: `/admin/api/projects/${projectId}`,
        method: 'PUT',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message || 'Project updated successfully!',
                timer: 2000,
                showConfirmButton: false
            });

            // Close modal
            $('#editProjectModal').modal('hide');

            // Reload DataTable
            projectsTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            const errorMessage = xhr.responseJSON?.message || 'Failed to update project. Please try again.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
}

// ========================================
// DELETE PROJECT (AJAX DELETE)
// ========================================

function handleDeleteProject(projectId, projectTitle) {
    Swal.fire({
        title: 'Delete Project?',
        html: `Are you sure you want to delete <strong>${projectTitle}</strong>?<br>This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-trash me-1"></i>Yes, delete it!',
        cancelButtonText: '<i class="bi bi-x-circle me-1"></i>Cancel',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading
            Swal.fire({
                title: 'Deleting Project...',
                html: 'Removing image from Cloudinary...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // AJAX DELETE Request
            $.ajax({
                url: `/admin/api/projects/${projectId}`,
                method: 'DELETE',
                success: function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: response.message || 'Project deleted successfully!',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Reload DataTable
                    projectsTable.ajax.reload(null, false);
                },
                error: function (xhr) {
                    const errorMessage = xhr.responseJSON?.message || 'Failed to delete project. Please try again.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorMessage
                    });
                }
            });
        }
    });
}

// ========================================
// TOGGLE PROJECT STATUS (AJAX PATCH)
// ========================================

function handleToggleStatus(projectId, currentStatus) {
    const newStatus = !currentStatus;
    const statusText = newStatus ? 'activate' : 'deactivate';

    // Show loading
    Swal.fire({
        title: 'Updating Status...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // AJAX PATCH Request
    $.ajax({
        url: `/admin/api/projects/${projectId}/toggle-status`,
        method: 'PATCH',
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message || `Project ${statusText}d successfully!`,
                timer: 1500,
                showConfirmButton: false
            });

            // Reload DataTable to show updated status
            projectsTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            const errorMessage = xhr.responseJSON?.message || 'Failed to update status. Please try again.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
}

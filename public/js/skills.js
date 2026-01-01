// ========================================
// SKILLS MANAGEMENT - AJAX CRUD
// Handles all frontend operations with DataTables & SweetAlert2
// ========================================

let skillsTable;

// Initialize when DOM is ready
$(document).ready(function () {
    initializeDataTable();
    initializeFilters();
    initializeEventHandlers();
});

// ========================================
// DATATABLES INITIALIZATION
// ========================================

function initializeDataTable() {
    skillsTable = $('#skillsTable').DataTable({
        ajax: {
            url: '/admin/api/skills',
            dataSrc: '',
            error: function (xhr, error, thrown) {
                console.error('Error loading skills:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load skills. Please refresh the page.'
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
                data: 'icon',
                render: function (data) {
                    const iconClass = data || 'bx bx-star';
                    return `<i class="${iconClass} fs-4 text-primary"></i>`;
                },
                width: '10%'
            },
            {
                data: 'name',
                render: function (data, type, row) {
                    return `<span class="fw-semibold">${data}</span>`;
                },
                width: '30%'
            },
            {
                data: 'category',
                render: function (data) {
                    const badges = {
                        'frontend': 'bg-primary',
                        'backend': 'bg-success',
                        'database': 'bg-warning text-dark',
                        'tools': 'bg-info'
                    };
                    const badgeClass = badges[data.toLowerCase()] || 'bg-secondary';
                    return `<span class="badge ${badgeClass}">${data.charAt(0).toUpperCase() + data.slice(1)}</span>`;
                },
                width: '15%'
            },
            {
                data: 'level',
                render: function (data) {
                    let progressColor = 'bg-success';
                    if (data < 70) progressColor = 'bg-warning';
                    if (data < 50) progressColor = 'bg-danger';

                    return `
                        <div class="d-flex align-items-center">
                            <div class="progress flex-grow-1 me-2" style="height: 8px;">
                                <div class="progress-bar ${progressColor}" role="progressbar" 
                                     style="width: ${data}%" aria-valuenow="${data}" 
                                     aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <small class="text-muted fw-semibold">${data}%</small>
                        </div>
                    `;
                },
                orderable: true,
                width: '25%'
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
                                    data-id="${row._id}" data-name="${row.name}" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;
                },
                orderable: false,
                width: '15%',
                className: 'text-center'
            }
        ],
        order: [[1, 'asc']], // Sort by name
        pageLength: 10,
        responsive: true,
        language: {
            emptyTable: "No skills added yet. Click 'Add Skill' to get started!",
            zeroRecords: "No matching skills found",
            search: "Search skills:"
        },
        drawCallback: function () {
            // Reinitialize event handlers after table redraw
            attachRowEventHandlers();
        }
    });
}

// ========================================
// FILTER FUNCTIONALITY
// ========================================

function initializeFilters() {
    // Category Filter
    $('#categoryFilter').on('change', function () {
        const category = $(this).val();
        skillsTable.column(2).search(category).draw();
    });

    // Status Filter
    $('#statusFilter').on('change', function () {
        const status = $(this).val();
        if (status === '') {
            skillsTable.column(4).search('').draw();
        } else {
            const searchTerm = status === 'true' ? 'Active' : 'Inactive';
            skillsTable.column(4).search(searchTerm).draw();
        }
    });

    // Reset Filters
    $('#resetFilters').on('click', function () {
        $('#categoryFilter').val('');
        $('#statusFilter').val('');
        skillsTable.search('').columns().search('').draw();
    });
}

// ========================================
// EVENT HANDLERS
// ========================================

function initializeEventHandlers() {
    // Add Skill Form Submit
    $('#addSkillForm').on('submit', function (e) {
        e.preventDefault();
        handleAddSkill();
    });

    // Edit Skill Form Submit
    $('#editSkillForm').on('submit', function (e) {
        e.preventDefault();
        handleUpdateSkill();
    });

    // Status Toggle Labels
    $('#skillStatus').on('change', function () {
        $('#statusLabel').text(this.checked ? 'Active' : 'Inactive');
    });

    $('#editSkillStatus').on('change', function () {
        $('#editStatusLabel').text(this.checked ? 'Active' : 'Inactive');
    });

    // Reset forms on modal close
    $('#addSkillModal').on('hidden.bs.modal', function () {
        $('#addSkillForm')[0].reset();
        $('#skillLevelValue').text('50%'); // Reset slider label
        $('#addIconPreview').attr('class', 'bx bx-star'); // Reset preview
        $('#statusLabel').text('Active');
    });
}

function attachRowEventHandlers() {
    // Edit button click
    $('.btn-edit').off('click').on('click', function () {
        const skillId = $(this).data('id');
        loadSkillForEdit(skillId);
    });

    // Delete button click
    $('.btn-delete').off('click').on('click', function () {
        const skillId = $(this).data('id');
        const skillName = $(this).data('name');
        handleDeleteSkill(skillId, skillName);
    });

    // Status toggle button click
    $('.status-toggle').off('click').on('click', function () {
        const skillId = $(this).data('id');
        const currentStatus = $(this).data('status');
        handleToggleStatus(skillId, currentStatus);
    });
}

// ========================================
// ADD SKILL (AJAX POST)
// ========================================

function handleAddSkill() {
    const formData = {
        name: $('#skillName').val().trim(),
        category: $('#skillCategory').val(),
        level: parseInt($('#skillLevel').val()),
        isActive: $('#skillStatus').is(':checked')
    };

    // Client-side validation
    if (!formData.name) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter a skill name'
        });
        return;
    }

    if (!formData.category) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please select a category'
        });
        return;
    }

    // Show loading
    Swal.fire({
        title: 'Adding Skill...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // AJAX POST Request
    $.ajax({
        url: '/admin/api/skills',
        method: 'POST',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message || 'Skill added successfully!',
                timer: 2000,
                showConfirmButton: false
            });

            // Close modal and reset form
            $('#addSkillModal').modal('hide');
            $('#addSkillForm')[0].reset();
            $('#skillLevelValue').text('50%');
            $('#statusLabel').text('Active');

            // Reload DataTable
            skillsTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            const errorMessage = xhr.responseJSON?.message || 'Failed to add skill. Please try again.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
}

// ========================================
// EDIT SKILL (LOAD & UPDATE)
// ========================================

function loadSkillForEdit(skillId) {
    // Show loading
    Swal.fire({
        title: 'Loading Skill...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // AJAX GET Request
    $.ajax({
        url: `/admin/api/skills/${skillId}`,
        method: 'GET',
        success: function (response) {
            Swal.close();

            const skill = response.skill;

            // Populate form fields
            $('#editSkillId').val(skill._id);
            $('#editSkillName').val(skill.name);
            $('#editSkillIcon').val(skill.icon);
            // Update preview
            $('#editIconPreview').attr('class', skill.icon);

            $('#editSkillCategory').val(skill.category);
            $('#editSkillLevel').val(skill.level);
            $('#editSkillLevelValue').text(skill.level + '%');
            $('#editSkillStatus').prop('checked', skill.isActive);
            $('#editStatusLabel').text(skill.isActive ? 'Active' : 'Inactive');

            // Show modal
            $('#editSkillModal').modal('show');
        },
        error: function (xhr) {
            const errorMessage = xhr.responseJSON?.message || 'Failed to load skill data.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
}

function handleUpdateSkill() {
    const skillId = $('#editSkillId').val();
    const formData = {
        name: $('#editSkillName').val().trim(),
        icon: $('#editSkillIcon').val().trim(),
        category: $('#editSkillCategory').val(),
        level: parseInt($('#editSkillLevel').val()),
        isActive: $('#editSkillStatus').is(':checked')
    };

    // Client-side validation
    if (!formData.name) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please enter a skill name'
        });
        return;
    }

    if (!formData.category) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please select a category'
        });
        return;
    }

    // Show loading
    Swal.fire({
        title: 'Updating Skill...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // AJAX PUT Request
    $.ajax({
        url: `/admin/api/skills/${skillId}`,
        method: 'PUT',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message || 'Skill updated successfully!',
                timer: 2000,
                showConfirmButton: false
            });

            // Close modal
            $('#editSkillModal').modal('hide');

            // Reload DataTable
            skillsTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            const errorMessage = xhr.responseJSON?.message || 'Failed to update skill. Please try again.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
}

// ========================================
// DELETE SKILL (AJAX DELETE)
// ========================================

function handleDeleteSkill(skillId, skillName) {
    Swal.fire({
        title: 'Delete Skill?',
        html: `Are you sure you want to delete <strong>${skillName}</strong>?<br>This action cannot be undone.`,
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
                title: 'Deleting Skill...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // AJAX DELETE Request
            $.ajax({
                url: `/admin/api/skills/${skillId}`,
                method: 'DELETE',
                success: function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: response.message || 'Skill deleted successfully!',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Reload DataTable
                    skillsTable.ajax.reload(null, false);
                },
                error: function (xhr) {
                    const errorMessage = xhr.responseJSON?.message || 'Failed to delete skill. Please try again.';
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
// TOGGLE SKILL STATUS (AJAX PATCH)
// ========================================

function handleToggleStatus(skillId, currentStatus) {
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
        url: `/admin/api/skills/${skillId}/toggle-status`,
        method: 'PATCH',
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message || `Skill ${statusText}d successfully!`,
                timer: 1500,
                showConfirmButton: false
            });

            // Reload DataTable to show updated status
            skillsTable.ajax.reload(null, false);
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

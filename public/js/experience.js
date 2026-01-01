// ========================================
// EXPERIENCE MANAGEMENT SCRIPT
// Handles DataTables, AJAX CRUD & UI interactions
// ========================================

let experienceTable;

$(document).ready(function () {
    initializeDataTable();
    initializeEventHandlers();
});

// ========================================
// DATATABLES INITIALIZATION
// ========================================

function initializeDataTable() {
    experienceTable = $('#experienceTable').DataTable({
        ajax: {
            url: '/admin/api/experiences',
            dataSrc: '',
            error: function (xhr, error, thrown) {
                console.error('Error loading experiences:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load experience data. Please refresh the page.'
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
                data: 'companyName',
                render: function (data) {
                    return `<span class="fw-semibold">${data}</span>`;
                },
                width: '20%'
            },
            { data: 'role', width: '20%' },
            {
                data: null,
                render: function (data, type, row) {
                    // Start Date
                    const startDate = new Date(row.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                    // End Date
                    let endDate = 'Present';
                    if (!row.isCurrent && row.endDate) {
                        endDate = new Date(row.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }

                    return `${startDate} – ${endDate}`;
                },
                width: '20%'
            },
            {
                data: 'type',
                render: function (data) {
                    let badgeClass = 'bg-primary';
                    if (data === 'Full-time') badgeClass = 'bg-info text-dark';
                    if (data === 'Part-time') badgeClass = 'bg-warning text-dark';
                    if (data === 'Internship') badgeClass = 'bg-secondary';
                    if (data === 'Freelance') badgeClass = 'bg-success';

                    return `<span class="badge ${badgeClass}">${data}</span>`;
                },
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
        order: [[0, 'asc']], // Sort by ID/Index
        pageLength: 10,
        language: {
            emptyTable: "No experience entries found. Click 'Add Experience' to get started!",
            zeroRecords: "No matching records found",
            search: "Search experience:"
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
    // Initialize Summernote
    $('.summernote').summernote({
        placeholder: 'Describe your responsibilities...',
        tabsize: 2,
        height: 150,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ]
    });

    // Add Form Submit
    $('#addExperienceForm').on('submit', function (e) {
        e.preventDefault();
        handleAddExperience();
    });

    // Edit Form Submit
    $('#editExperienceForm').on('submit', function (e) {
        e.preventDefault();
        handleUpdateExperience();
    });

    // Handle "Currently Working Here" checkbox (Add Modal)
    $('#addCurrentJob').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('#addEndDate').prop('disabled', isChecked);
        if (isChecked) {
            $('#addEndDate').val('');
        }
    });

    // Handle "Currently Working Here" checkbox (Edit Modal)
    $('#editCurrentJob').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('#editEndDate').prop('disabled', isChecked);
        if (isChecked) {
            $('#editEndDate').val('');
        }
    });

    // Reset forms on modal close
    $('#addExperienceModal').on('hidden.bs.modal', function () {
        $('#addExperienceForm')[0].reset();
        $('#addEndDate').prop('disabled', false); // Reset state
        $('.summernote').summernote('reset'); // Reset Summernote
    });
}

function attachRowEventHandlers() {
    // Edit button click
    $('.btn-edit').off('click').on('click', function () {
        const id = $(this).data('id');
        loadExperienceForEdit(id);
    });

    // Delete button click
    $('.btn-delete').off('click').on('click', function () {
        const id = $(this).data('id');
        handleDeleteExperience(id);
    });

    // Status toggle click
    $('.status-toggle').off('click').on('click', function () {
        const id = $(this).data('id');
        const status = $(this).data('status');
        handleToggleStatus(id, status);
    });
}

// ========================================
// CRUD OPERATIONS
// ========================================

// Add Experience
function handleAddExperience() {
    const form = $('#addExperienceForm');
    const formData = new FormData(form[0]);
    // Convert FormData to JSON object
    const data = Object.fromEntries(formData.entries());

    // Explicitly handle checkboxes
    data.isActive = $('#addStatus').is(':checked') ? 'true' : 'false';

    // Ensure Description uses Summernote value
    // Summernote updates the underlying textarea on submit automatically, but explicit check for safety
    // or just rely on form[0] serialization which should have the updated value if summernote synced it.
    // Summernote usually syncs on submit event, but we are preventing default.
    // So we should grab it manually to be safe.
    data.description = form.find('.summernote').summernote('code');

    $.ajax({
        url: '/admin/api/experiences',
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message,
                timer: 1500,
                showConfirmButton: false
            });
            $('#addExperienceModal').modal('hide');
            experienceTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: xhr.responseJSON?.message || 'Failed to add experience'
            });
        }
    });
}

// Load Experience for Edit
function loadExperienceForEdit(id) {
    $.ajax({
        url: `/admin/api/experiences/${id}`,
        method: 'GET',
        success: function (response) {
            const exp = response.experience;
            const form = $('#editExperienceForm');

            // Set ID
            form.attr('data-id', exp._id);

            form.find('[name="companyName"]').val(exp.companyName);
            form.find('[name="role"]').val(exp.role);
            form.find('[name="location"]').val(exp.location);
            form.find('[name="type"]').val(exp.type);
            form.find('[name="startDate"]').val(exp.startDate.substring(0, 7));

            // Set Summernote content
            form.find('.summernote').summernote('code', exp.description);

            // Handle End Date & Current Job
            if (exp.isCurrent || !exp.endDate) {
                $('#editCurrentJob').prop('checked', true);
                $('#editEndDate').prop('disabled', true).val('');
            } else {
                $('#editCurrentJob').prop('checked', false);
                $('#editEndDate').prop('disabled', false).val(exp.endDate.substring(0, 7));
            }

            // Handle Status
            $('#editStatus').prop('checked', exp.isActive);

            $('#editExperienceModal').modal('show');
        },

        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load experience details'
            });
        }
    });
}

// Update Experience
function handleUpdateExperience() {
    const form = $('#editExperienceForm');
    const id = form.attr('data-id');
    const formData = new FormData(form[0]);
    const data = Object.fromEntries(formData.entries());

    data.isActive = $('#editStatus').is(':checked') ? 'true' : 'false';
    data.description = form.find('.summernote').summernote('code');


    $.ajax({
        url: `/admin/api/experiences/${id}`,
        method: 'PUT',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message,
                timer: 1500,
                showConfirmButton: false
            });
            $('#editExperienceModal').modal('hide');
            experienceTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: xhr.responseJSON?.message || 'Failed to update experience'
            });
        }
    });
}

// Delete Experience
function handleDeleteExperience(id) {
    // We already have a modal structure in HTML but standard SweetAlert is easier for dynamic ID handling
    // or we can use the existing modal if we set the ID on the confirm button.
    // Let's use SweetAlert for consistency with other modules.

    Swal.fire({
        title: 'Delete Experience?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/admin/api/experiences/${id}`,
                method: 'DELETE',
                success: function (response) {
                    Swal.fire(
                        'Deleted!',
                        response.message,
                        'success'
                    );
                    experienceTable.ajax.reload(null, false);
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
function handleToggleStatus(id, currentStatus) {
    $.ajax({
        url: `/admin/api/experiences/${id}/toggle-status`,
        method: 'PATCH',
        success: function (response) {
            const toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            toast.fire({
                icon: 'success',
                title: response.message
            });
            experienceTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: xhr.responseJSON?.message || 'Failed to toggle status'
            });
        }
    });
}

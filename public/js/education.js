// ========================================
// EDUCATION MANAGEMENT SCRIPT
// Handles DataTables, AJAX CRUD & UI interactions
// ========================================

let educationTable;

$(document).ready(function () {
    initializeDataTable();
    initializeEventHandlers();
});

// ========================================
// DATATABLES INITIALIZATION
// ========================================

function initializeDataTable() {
    educationTable = $('.table').DataTable({
        ajax: {
            url: '/admin/api/education',
            dataSrc: '',
            error: function (xhr, error, thrown) {
                console.error('Error loading education:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load education data. Please refresh the page.'
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
                data: 'degree',
                render: function (data) {
                    return `<span class="fw-semibold">${data}</span>`;
                },
                width: '20%'
            },
            { data: 'institution', width: '20%' },
            {
                data: 'fieldOfStudy',
                render: function (data) {
                    return data || '-';
                },
                width: '20%'
            },
            {
                data: null,
                render: function (data, type, row) {
                    const start = row.startYear;
                    const end = row.isCurrent ? 'Present' : (row.endYear || '');
                    return `${start} – ${end}`;
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
        order: [[4, 'desc']], // Sort by Start Year (desc) by default
        pageLength: 10,
        language: {
            emptyTable: "No education entries found. Click 'Add Education' to get started!",
            zeroRecords: "No matching records found",
            search: "Search education:"
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
    // Add Form Submit
    $('#addEducationForm').on('submit', function (e) {
        e.preventDefault();
        handleAddEducation();
    });

    // Edit Form Submit
    $('#editEducationForm').on('submit', function (e) {
        e.preventDefault();
        handleUpdateEducation();
    });

    // Handle "Currently Studying" checkbox (Add Modal)
    $('#addCurrentlyStudying').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('#addEndYear').prop('disabled', isChecked);
        if (isChecked) {
            $('#addEndYear').val('');
        }
    });

    // Handle "Currently Studying" checkbox (Edit Modal)
    $('#editCurrentlyStudying').on('change', function () {
        const isChecked = $(this).is(':checked');
        $('#editEndYear').prop('disabled', isChecked);
        if (isChecked) {
            $('#editEndYear').val('');
        }
    });

    // Reset forms on modal close
    $('#addEducationModal').on('hidden.bs.modal', function () {
        $('#addEducationForm')[0].reset();
        $('#addEndYear').prop('disabled', false);
    });
}

function attachRowEventHandlers() {
    // Edit button click
    $('.btn-edit').off('click').on('click', function () {
        const id = $(this).data('id');
        loadEducationForEdit(id);
    });

    // Delete button click
    $('.btn-delete').off('click').on('click', function () {
        const id = $(this).data('id');
        handleDeleteEducation(id);
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

// Add Education
function handleAddEducation() {
    const form = $('#addEducationForm');
    const formData = new FormData(form[0]);
    const data = Object.fromEntries(formData.entries());

    // Explicitly handle checkboxes
    data.isActive = $('#addStatus').is(':checked') ? 'true' : 'false';

    $.ajax({
        url: '/admin/api/education',
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
            $('#addEducationModal').modal('hide');
            educationTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: xhr.responseJSON?.message || 'Failed to add education'
            });
        }
    });
}

// Load Education for Edit
function loadEducationForEdit(id) {
    $.ajax({
        url: `/admin/api/education/${id}`,
        method: 'GET',
        success: function (response) {
            const edu = response.education;
            const form = $('#editEducationForm');

            form.attr('data-id', edu._id);

            form.find('[name="degree"]').val(edu.degree);
            form.find('[name="institution"]').val(edu.institution);
            form.find('[name="fieldOfStudy"]').val(edu.fieldOfStudy);
            form.find('[name="startYear"]').val(edu.startYear);
            form.find('[name="grade"]').val(edu.grade);
            form.find('[name="description"]').val(edu.description);

            // Handle End Year & Currently Studying
            if (edu.isCurrent || !edu.endYear) {
                $('#editCurrentlyStudying').prop('checked', true);
                $('#editEndYear').prop('disabled', true).val('');
            } else {
                $('#editCurrentlyStudying').prop('checked', false);
                $('#editEndYear').prop('disabled', false).val(edu.endYear);
            }

            // Handle Status
            $('#editStatus').prop('checked', edu.isActive);

            $('#editEducationModal').modal('show');
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load education details'
            });
        }
    });
}

// Update Education
function handleUpdateEducation() {
    const form = $('#editEducationForm');
    const id = form.attr('data-id');
    const formData = new FormData(form[0]);
    const data = Object.fromEntries(formData.entries());

    data.isActive = $('#editStatus').is(':checked') ? 'true' : 'false';

    $.ajax({
        url: `/admin/api/education/${id}`,
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
            $('#editEducationModal').modal('hide');
            educationTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: xhr.responseJSON?.message || 'Failed to update education'
            });
        }
    });
}

// Delete Education
function handleDeleteEducation(id) {
    Swal.fire({
        title: 'Delete Education?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/admin/api/education/${id}`,
                method: 'DELETE',
                success: function (response) {
                    Swal.fire(
                        'Deleted!',
                        response.message,
                        'success'
                    );
                    educationTable.ajax.reload(null, false);
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
        url: `/admin/api/education/${id}/toggle-status`,
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
            educationTable.ajax.reload(null, false);
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

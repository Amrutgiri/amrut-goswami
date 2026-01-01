// ========================================
// MESSAGES INBOX SCRIPT
// Handles DataTables, AJAX Interactions & UI
// ========================================

let messagesTable;

$(document).ready(function () {
    initializeDataTable();
    initializeEventHandlers();
});

// ========================================
// DATATABLES INITIALIZATION
// ========================================

function initializeDataTable() {
    messagesTable = $('.table').DataTable({
        ajax: {
            url: '/admin/api/messages',
            dataSrc: '',
            error: function (xhr, error, thrown) {
                console.error('Error loading messages:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load messages. Please refresh the page.'
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
                data: 'name',
                render: function (data, type, row) {
                    return row.isRead ? data : `<strong>${data}</strong>`;
                },
                width: '20%'
            },
            { data: 'email', width: '20%' },
            {
                data: 'subject',
                render: function (data, type, row) {
                    return row.isRead ? data : `<strong>${data}</strong>`;
                },
                width: '25%'
            },
            {
                data: 'createdAt',
                render: function (data) {
                    return new Date(data).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    });
                },
                width: '15%'
            },
            {
                data: 'isRead',
                render: function (data) {
                    const badgeClass = data ? 'bg-success' : 'bg-warning text-dark';
                    const badgeText = data ? 'Read' : 'Unread';
                    return `<span class="badge ${badgeClass}">${badgeText}</span>`;
                },
                width: '10%'
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-primary btn-view" 
                                    data-id="${row._id}" title="View Details">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-delete" 
                                    data-id="${row._id}" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;
                },
                orderable: false,
                width: '5%',
                className: 'text-center'
            }
        ],
        createdRow: function (row, data, dataIndex) {
            if (!data.isRead) {
                $(row).addClass('bg-light-subtle');
            }
        },
        responsive: true,
        order: [[4, 'desc']], // Sort by Date (desc)
        pageLength: 10,
        language: {
            emptyTable: "No messages found.",
            zeroRecords: "No matching messages found",
            search: "Search messages:"
        },
        drawCallback: function () {
            attachRowEventHandlers();
        }
    });

    // Custom Filter Logic
    $('select[aria-label="Filter status"]').on('change', function () {
        const val = $(this).val();
        if (val === 'All Messages') {
            messagesTable.column(5).search('').draw();
        } else if (val === 'unread') {
            messagesTable.column(5).search('Unread').draw();
        } else if (val === 'read') {
            messagesTable.column(5).search('Read').draw();
        }
    });
}

// ========================================
// EVENT HANDLERS
// ========================================

function initializeEventHandlers() {
    // Reset modal on close
    $('#viewMessageModal').on('hidden.bs.modal', function () {
        // Clear fields if needed, but we overwrite them on open
    });
}

function attachRowEventHandlers() {
    // View button click
    $('.btn-view').off('click').on('click', function () {
        const id = $(this).data('id');
        loadMessageDetails(id);
    });

    // Delete button click
    $('.btn-delete').off('click').on('click', function () {
        const id = $(this).data('id');
        handleDeleteMessage(id);
    });
}

// ========================================
// API INTERACTIONS
// ========================================

// Load Message Details
function loadMessageDetails(id) {
    $.ajax({
        url: `/admin/api/messages/${id}`,
        method: 'GET',
        success: function (response) {
            const msg = response.message;
            const modal = $('#viewMessageModal');

            // Populate Modal
            modal.find('.fs-5').html(`${msg.name} <span class="text-muted fs-6 fw-normal">&lt;${msg.email}&gt;</span>`);
            modal.find('.fw-semibold').text(msg.subject);

            const date = new Date(msg.createdAt).toLocaleString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
            });
            modal.find('.mb-3:eq(2) div').text(date);

            modal.find('.p-3').text(msg.message);

            modal.modal('show');

            // Reload table to update status visually (since backend marked it as read)
            messagesTable.ajax.reload(null, false);
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load message details'
            });
        }
    });
}

// Delete Message
function handleDeleteMessage(id) {
    Swal.fire({
        title: 'Delete Message?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/admin/api/messages/${id}`,
                method: 'DELETE',
                success: function (response) {
                    Swal.fire(
                        'Deleted!',
                        response.message,
                        'success'
                    );
                    messagesTable.ajax.reload(null, false);
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

$(document).ready(function() {
    // Edit button click
    $('.edit-user').on('click', function() {
        const row = $(this).closest('tr');
        $('#editUserId').val($(this).data('id'));
        $('#editFName').val(row.find('td:eq(1)').text());
        $('#editMName').val(row.find('td:eq(2)').text());
        $('#editLName').val(row.find('td:eq(3)').text());
        $('#editEmail').val(row.find('td:eq(4)').text());
        $('#editIdentificationNumber').val(row.find('td:eq(5)').text());
        $('#editNumberField').val(row.find('td:eq(6)').text());
        $('#editUserModal').modal('show');
    });
    // Edit form submit
    $('#editUserForm').on('submit', function(e) {
        e.preventDefault();
        const id = $('#editUserId').val();
        const data = $(this).serialize();
        $.ajax({
            url: '/admin/user/' + id,
            type: 'PUT',
            data: data,
            success: function(res) {
                $('#adminFeedback').removeClass('alert-danger d-none').addClass('alert-success').text('User updated successfully!');
                setTimeout(() => location.reload(), 1000);
            },
            error: function(xhr) {
                let msg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Update failed.';
                $('#adminFeedback').removeClass('alert-success d-none').addClass('alert-danger').text(msg);
            }
        });
        $('#editUserModal').modal('hide');
    });
    // Delete button click
    $('.delete-user').on('click', function() {
        $('#deleteUserId').val($(this).data('id'));
        $('#deleteUserModal').modal('show');
    });
    // Confirm delete
    $('#confirmDeleteUser').on('click', function() {
        const id = $('#deleteUserId').val();
        $.ajax({
            url: '/admin/user/' + id,
            type: 'DELETE',
            success: function(res) {
                $('#adminFeedback').removeClass('alert-danger d-none').addClass('alert-success').text('User deleted successfully!');
                setTimeout(() => location.reload(), 1000);
            },
            error: function(xhr) {
                let msg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Delete failed.';
                $('#adminFeedback').removeClass('alert-success d-none').addClass('alert-danger').text(msg);
            }
        });
        $('#deleteUserModal').modal('hide');
    });
}); 
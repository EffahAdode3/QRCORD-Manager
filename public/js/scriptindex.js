$(document).ready(function () {
    $('#indexForm').submit(function (event) {
        event.preventDefault();
        const formData = $(this).serialize();
        // Reset feedback
        $('#feedback').removeClass('alert-success alert-danger d-none').text('');
        $.ajax({
            type: 'POST',
            url: '/',
            data: formData,
            success: function (response) {
                $('#feedback').removeClass('alert-danger d-none').addClass('alert-success').text(response.message);
                $('#indexForm')[0].reset();
            },
            error: function (xhr) {
                let msg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'An error occurred.';
                $('#feedback').removeClass('alert-success d-none').addClass('alert-danger').text(msg);
            }
        });
    });
});

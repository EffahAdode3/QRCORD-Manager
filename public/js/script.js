
$(document).ready(function() {
    $('#qrCard').hide();
    $('#feedback').removeClass('alert-success alert-danger').addClass('d-none').text('');
    $('#checkNumber').submit(function(event) {
        event.preventDefault();
        var identificationNumber = $('#identificationNumber').val();
        // Reset feedback and QR card
        $('#feedback').removeClass('alert-success alert-danger').addClass('d-none').text('');
        $('#qrCard').hide();
        $.ajax({
            type: 'POST',
            url: '/checkNumber',
            data: { identificationNumber: identificationNumber },
            success: function(response) {
                $('#feedback').removeClass('alert-danger d-none').addClass('alert-success').text(response.message);
                $('#qrCodeContainer').html(`
                    <img id="qrCodeImage" src="${response.qrCode}" alt="QR Code">
                    <p><strong>Full Name: ${response.user + " " + response.users + " " + response.userq}</strong></p>
                    <p><strong>Identification Number: ${response.identificationNumber}</strong></p>
                    <p>Email: ${response.email}</p>
                    <p>Contact: ${response.numberField}</p>
                `);
                $('#qrCard').show();
                // Download QR code
                $('#downloadQR').off('click').on('click', function() {
                    var link = document.createElement('a');
                    link.href = response.qrCode;
                    link.download = 'qr-code.png';
                    link.click();
                });
            },
            error: function(xhr) {
                let msg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'User not found or error occurred.';
                $('#feedback').removeClass('alert-success d-none').addClass('alert-danger').text(msg);
                $('#qrCard').hide();
            }
        });
    });
});

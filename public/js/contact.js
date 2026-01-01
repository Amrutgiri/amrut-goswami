$(document).ready(function () {
    console.log('Contact Script Loaded'); // Debug

    $('#contactForm').on('submit', function (e) {
        e.preventDefault();
        console.log('Form Submit Intercepted'); // Debug

        // 1. Get Values
        const form = $(this);
        const submitBtn = $('#sendBtn');
        const formData = {
            name: form.find('input[name="name"]').val().trim(),
            email: form.find('input[name="email"]').val().trim(),
            subject: form.find('input[name="subject"]').val().trim(),
            message: form.find('textarea[name="message"]').val().trim(),
            'g-recaptcha-response': grecaptcha.getResponse()
        };

        console.log('Form Data:', formData); // Debug

        // 2. Client-side Validation logic
        if (!formData.name) {
            showError('Please enter your name.');
            return;
        }

        if (!validateEmail(formData.email)) {
            showError('Please enter a valid email address.');
            return;
        }

        if (!formData.subject) {
            showError('Please enter a subject.');
            return;
        }

        if (!formData.message) {
            showError('Please enter a message.');
            return;
        }

        // 3. Validate Captcha
        if (formData['g-recaptcha-response'].length === 0) {
            showError('Please check the CAPTCHA box.');
            return;
        }

        // 4. Submit via AJAX
        $.ajax({
            url: '/send-message',
            method: 'POST',
            data: formData, // Express body parser handles this if urlencoded/json
            beforeSend: function () {
                submitBtn.text('Sending...').prop('disabled', true);
            },
            success: function (response) {
                console.log('Success:', response); // Debug
                Swal.fire({
                    icon: 'success',
                    title: 'Sent!',
                    text: response.message,
                    timer: 3000,
                    showConfirmButton: false
                });

                // Reset Form
                form[0].reset();
                grecaptcha.reset();
            },
            error: function (xhr) {
                console.error('Error:', xhr); // Debug
                const msg = xhr.responseJSON?.message || 'Something went wrong. Please try again.';
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: msg
                });
            },
            complete: function () {
                submitBtn.text('Send Message').prop('disabled', false);
            }
        });
    });

    function showError(msg) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation',
            text: msg
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});

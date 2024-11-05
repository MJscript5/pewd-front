
const forgotPasswordForm = document.getElementById('forgot-password-form');
const verifyCodeForm = document.getElementById('verify-code-form');
const formTitle = document.getElementById('form-title');

forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    try {
        const response = await sendResetCode(email);
        if (response.ok) {
            showMessage('Reset code sent. Please check your email.');
            showVerifyCodeForm();
        } else {
            throw new Error('Failed to send reset code');
        }
    } catch (error) {
        showMessage(error.message, true);
    }
});

verifyCodeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const code = document.getElementById('code').value;
    
    try {
        const response = await verifyCode(email, code);
        if (response.ok) {
            showMessage('Code verified successfully. You can now reset your password.');
            // Redirect to password reset page or show password reset form
        } else {
            throw new Error('Invalid verification code');
        }
    } catch (error) {
        showMessage(error.message, true);
    }
});

async function sendResetCode(email) {
    const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return response;
}

async function verifyCode(email, code) {
    const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
    });
    return response;
}

function showVerifyCodeForm() {
    forgotPasswordForm.classList.add('hidden');
    verifyCodeForm.classList.remove('hidden');
    formTitle.textContent = 'Verify Code';
}

function showMessage(message, isError = false) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.color = isError ? 'red' : 'green';
    messageElement.style.textAlign = 'center';
    messageElement.style.marginTop = '10px';
    
    const container = document.querySelector('.card');
    const existingMessage = container.querySelector('p');
    if (existingMessage) {
        container.removeChild(existingMessage);
    }
    container.appendChild(messageElement);
}
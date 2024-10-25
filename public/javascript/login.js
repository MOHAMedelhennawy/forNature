document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#login-form');
    const emailError = document.querySelector('.email.error');
    const passwordError = document.querySelector('.password.error');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        emailError.textContent = '';
        passwordError.textContent = '';

        const email = form.email.value;
        const password = form.password.value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                }),
                headers: {'Content-Type': 'application/json'}
            });
            
            const data = await response.json();
            if (!response.ok) {
                if (data.errors) {
                    data.errors.forEach(error => {
                        if (error.field === 'email') {
                            emailError.textContent = error.message;
                        } else if (error.field === 'password') {
                            passwordError.textContent = error.message;
                        }
                    });
                }
            }

            this.location.assign('/')
        } catch (err) {
            console.error('Error:', err);
        }
    });
});

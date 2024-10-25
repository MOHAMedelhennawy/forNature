document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#signup-form');
    const fnameError = document.querySelector('.first_name.error');
    const lnameError = document.querySelector('.last_name.error');
    const usernameError = document.querySelector('.username.error');
    const emailError = document.querySelector('.email.error');
    const passwordError = document.querySelector('.password.error');
    const phoneError = document.querySelector('.phone_number.error');
    

    console.log(form)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // clear previous errors
        fnameError.textContent = '';
        lnameError.textContent = '';
        usernameError.textContent = '';
        emailError.textContent = '';
        passwordError.textContent = '';
        phoneError.textContent = '';

        const first_name = form.first_name.value;
        const last_name = form.last_name.value;
        const username = form.username.value;
        const email = form.email.value;
        const password = form.password.value;
        const phone_number = form.phone_number.value;

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                body: JSON.stringify({
                    first_name,
                    last_name,
                    username,
                    email,
                    password,
                    phone_number
                }),
                headers: {'Content-Type': 'application/json'}
            });

            const data = await response.json();
            if (!response.ok) {
                if (data.errors) {
                    data.errors.forEach(error => {
                        if (error.field === 'first_name') {
                            fnameError.textContent = error.message;
                        } else if (error.field === 'last_name') {
                            lnameError.textContent = error.message;
                        } else if (error.field === 'username') {
                            usernameError.textContent = error.message;
                        } else if (error.field === 'email') {
                            emailError.textContent = error.message;
                        } else if (error.field === 'password') {
                            passwordError.textContent = error.message;
                        } else if (error.field === 'phone_number') {
                            phoneError.textContent = error.message;
                        }
                    });
                }
            }

            this.location.assign('/login')
        } catch (err) {
            console.error('Error:', err);
        }
    });
});

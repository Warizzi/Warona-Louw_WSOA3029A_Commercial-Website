document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("feedbackForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const successMessage = document.getElementById("successMessage");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const phoneError = document.getElementById("phoneError");
    const messageError = document.getElementById("messageError");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        let isValid = true;

        // Name Validation
        if (!/^[a-zA-Z\s]+$/.test(nameInput.value.trim())) {
            nameError.textContent = "Name must only contain letters and spaces.";
            isValid = false;
        } else {
            nameError.textContent = "";
        }

        // Email Validation
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(emailInput.value.trim())) {
            emailError.textContent = "Please enter a valid email address.";
            isValid = false;
        } else {
            emailError.textContent = "";
        }

        // Password Validation
        const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordPattern.test(passwordInput.value.trim())) {
            passwordError.textContent = "Password must be at least 8 characters long and include numbers and special characters.";
            isValid = false;
        } else {
            passwordError.textContent = "";
        }

        // Phone Number Validation
        const phonePattern = /^\d{10,15}$/;
        if (!phonePattern.test(phoneInput.value.trim())) {
            phoneError.textContent = "Phone number must be 10-15 digits long.";
            isValid = false;
        } else {
            phoneError.textContent = "";
        }

        // Message Validation
        if (messageInput.value.trim().length > 250) {
            messageError.textContent = "Message must be less than 250 characters.";
            isValid = false;
        } else if (messageInput.value.trim().length === 0) {
            messageError.textContent = "Message cannot be empty.";
            isValid = false;
        } else {
            messageError.textContent = "";
        }

        // Display Success Message
        if (isValid) {
            successMessage.textContent = "Thank you for your feedback!";
            successMessage.style.color = "green";
            form.reset();
        }
    });
});

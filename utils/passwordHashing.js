import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword)

        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing the password');
    }
}

export default hashPassword;

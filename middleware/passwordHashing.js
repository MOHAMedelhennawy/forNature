import bcrypt from 'bcrypt';

const passowrdHashing = async (req, res, next) => {
    console.log(req.body)
    if (!req.body['password']) {
        throw new Error('Password is missing');
    }

    
    const hashedPassword = await bcrypt.hash(req.body['password'], 10);
    req.body['password'] = hashedPassword;

    next();
}

export default passowrdHashing;
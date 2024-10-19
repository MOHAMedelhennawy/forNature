import bcrypt from 'bcrypt';

const passowrdHashing = async (req, res, next) => {
    const pattern = '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*!@$%^&(){}:;<>,.?/~_+-=|])[A-Za-z0-9*!@$%^&(){}:;<>,.?/~_+-=|0-9]{8,32}$';

    if (!req.body['password']) {
        res.status(400).json({message: 'Password is missing'})
    }

    const regexValid = new RegExp(pattern);

    if (!regexValid.test(req.body.password)) {
        res.status(400).json({message: 'Please chose stronger password'});
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body['password'], salt);
    req.body['password'] = hashedPassword;

    next();
}

export default passowrdHashing;
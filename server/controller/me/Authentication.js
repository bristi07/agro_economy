import Users from "../../model/Users.js";
import jwt from 'jsonwebtoken'
import bcrypt, { compare } from 'bcrypt'

export const register = async (req, res) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        const newUser = new Users
        (
            {...req.body,
            password:hash,
        }
        )
        await newUser.save()
        res.status(200).send("user has been created successfully")
    }
    catch (e) {
        return res.status(400).json({message:"nhi hua register"});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;

    if (!email)
        return res.status(400).json({message: "Email address is not provided!"})
    if (!password)
        return res.status(400).json({message: "Password address is not provided!"})

    try {
        const user = await Users.findOne({email});

        if (!user)
            return res.status(404).json({message: " user not found !"})

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect)
            return res.status(400).json({message: "Wrong password"})

        const token = jwt.sign({
            id: user._id,
            email: user.email
        }, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_AUTH_TTL});
        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                first_name: user.first_name,
                phone: user.phone,
                address: user.address,
                role: user.role,
                wishlist: user.wishlist
            },
            token
        });
    } catch (e) {
        return res.status(400).json({message: "nhi hua login!"});
    }
}


export const verifyUser = async (req, res) => {
   // console.log(req.body);
    const {id} = req.body;
    console.log("id",id);
    try {
        const user = await Users.findById(id, {password: 0})
        return res.status(200).json({...user?._doc});
    } catch (e) {
        return res.status(404).json({message: "User not found"});
    }
}

export const verifyRole = async (req, res) => {
    console.log(req.body);
    try {
        const {id, role} = req.body;

        const user = await Users.findById(id, {password: 0});

        if (!user)
            return res.status(404).json({message: `User ${id} was not found`});

        if (role !== user.role)
            return res.status(401).json({message: "Unauthorized user"});

        return res.status(200).json({user});
    } catch (e) {
        return res.status(400).json({message: e.message});
    }
}
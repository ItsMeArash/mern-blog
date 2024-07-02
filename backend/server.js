import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import {nanoid} from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
// import serviceAccountKey from "./mern-blog-6eb87-firebase-adminsdk-6wi4s-40de442b11.json" assert {type: "json"}
import {getAuth} from "firebase-admin/auth";
import aws from "aws-sdk";

// Schemas
import User from "./Schema/User.js";

const server = express();
let PORT = 3000;

admin.initializeApp({
    // credential: admin.credential.cert(serviceAccountKey)
    // credential: admin.credential.cert({})
})

let emailRegex = /^\w+([\.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true,
});

const s3 = new aws.S3({
    region: "default",
    accessKeyId: process.env.LIARA_ACCESS_KEY,
    secretAccessKey: process.env.LIARA_SECRET_KEY
})

const generateUploadUrl = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise("putObject", {
        Bucket: "itsmearash",
        Key: imageName,
        Expires: 1000,
        ContentType: "image/jpeg"
    })
}

const formatDataToSend = (user) => {
    const accessToken = jwt.sign({id: user._id}, process.env.SECRET_ACCESS_KEY);

    return {
        accessToken,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}

const generateUsername = async (email) => {
    let username = email.split('@')[0];

    let isUsernameNotUnique = await User.exists({"personal_info.username": username}).then(result => result);

    isUsernameNotUnique ? username += nanoid().substring(0, 5) : "";

    return username;

}

server.get("/get-upload-url", (req, res) => {
    console.log('req sent')
    generateUploadUrl().then(url => res.status(200).json({uploadUrl: url}))
        .catch(err => {
            console.log(err.message);
            return(res.status(500).json({error: err.message}));
        })
})

server.post("/signup", (req, res) => {
    const {fullname, email, password} = req.body;

    // validating data from frontend
    if (fullname?.length < 3) {
        return res.status(403).json({"error": "Full name must have at least 3 characters."});
    }

    if (!email?.length) {
        return res.status(403).json({"error": "Enter your email address!"})
    }

    if (!emailRegex.test(email)) {
        return res.status(403).json({"error": "Invalid email format!"})
    }

    if (!passwordRegex.test(password)) {
        return res.status(403).json({"error": "Password must be 6 up to 20 characters containing a numeric, a lowercase and a uppercase letter!"})
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);

        let user = new User({
            personal_info: {fullname, email, password: hashed_password, username}
        });
        user.save().then((u) => {

            return res.status(200).json(formatDataToSend(u));
        }).catch(err => {
            if (err.code === 11000) {
                return res.status(500).json({"error": "Email already exists!"});
            }

            res.status(500).json({"error": err.message})
        });
    })
})

server.post("/signin", (req, res) => {
    const {email, password} = req.body;
    User.findOne({"personal_info.email": email})
        .then(user => {
            if (!user) {
                return res.status(403).json({"error": "Email not found!"})
            }

            if (!user.google_auth) {
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) {
                        return res.status(403).json({"error": "Error occurred, please try again!"})
                    }

                    if (!result) {
                        return res.status(403).json({"error": "Incorrect password!"})
                    } else {
                        return res.status(200).json(formatDataToSend(user));
                    }
                });
            } else {
                return res.status(403).json({"error": "Account was created using Google, try logging in with Google"})
            }
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({"error": err.message})
        })
})

server.post("/google-auth", async (req, res) => {
    const {idToken} = req.body;

    getAuth()
        .verifyIdToken(idToken)
        .then(async (decodedUser) => {
            let {email, name} = decodedUser;
            console.log({decodedUser})
            let user = await User.findOne({"personal_info.email": email})
                .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
                .then(u => u || null)
                .catch(err => res.status(500).json({"error": err.message}))
            if (user) { // sign in
                if (!user.google_auth) {
                    return res.status(403).json({"error": "This email was signed up without Google. Login with password to access your account"})
                }
            } else { // sign up
                let username = await generateUsername(email)

                user = new User({
                    personal_info: {
                        fullname: name,
                        email,
                        username
                    },
                    google_auth: true
                });

                await user.save()
                    .then(u => {
                        user = u;
                    })
                    .catch(err => res.status(500).json({"error": err.message}))
            }

            return res.status(200).json(formatDataToSend(user))
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({"error": "Failed to authenticate you with Google!"})
        })
})

server.listen(PORT, () => {
    console.log("listening on port " + PORT);
});
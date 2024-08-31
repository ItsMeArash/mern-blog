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
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import multer from "multer"

// Schemas
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

const server = express();
const PORT = 3000;

admin.initializeApp({
    // credential: admin.credential.cert(serviceAccountKey)
    // credential: admin.credential.cert({})
})

let emailRegex = /^\w+([\.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

server.use(express.json());
server.use(cors());

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true,
}).then(() => {
    console.log("connected to DB");
});

const s3Client = new S3Client({
    region: "default",
    endpoint: process.env.LIARA_ENDPOINT,
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY,
        secretAccessKey: process.env.LIARA_SECRET_KEY
    },
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

const verifyJWT = (req, res, next) => {
    const authHeaders = req.header('authorization');
    const token = authHeaders && authHeaders.split(" ")[1];
    if (token === null) {
        return res.status(401).json({"error": "No access token!"})
    }
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({"error": "Access token is invalid!"})
        }

        req.user = user.id;
        next();
    })
}

// server.get("/get-upload-url", (req, res) => {
//     generateUploadUrl().then(url => res.status(200).json({uploadUrl: url}))
//         .catch(err => {
//             console.log(err.message);
//             return (res.status(500).json({error: err.message}));
//         })
// })

server.post('/upload-image', upload.single('image'), async (req, res) => {
    const imageBlob = req.file;

    if (imageBlob) {
        const uniqueKey = `${imageBlob.originalname}-${nanoid()}`;
        const params = {
            Bucket: process.env.LIARA_BUCKET_NAME,
            Key: uniqueKey,
            Body: imageBlob.buffer,
            ContentType: imageBlob.mimetype,
        };

        try {
            const data = await s3Client.send(new PutObjectCommand(params));
            console.log(data);
            const urlparams = {
                Bucket: process.env.LIARA_BUCKET_NAME,
                Key: uniqueKey,
            };

            const command = new GetObjectCommand(urlparams);
            getSignedUrl(s3Client, command).then((url) => {
                return res.status(200).json({file: 'okkk', url: url});
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({error: 'Error uploading to S3'});
        }
    } else {
        return res.status(400).json({error: 'No file uploaded'});
    }
});

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

server.post("/change-password", verifyJWT, (req, res) => {
    const {currentPassword, newPassword} = req.body;

    if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
        return res.status(403).json({error: "Password must be 6 up to 20 characters containing a numeric, a lowercase and a uppercase letter!"});
    }

    User.findOne({_id: req.user})
        .then(user => {
            if (user.google_auth) {
                return res.status(403).json({error: "You can't account password because you have logged in using Google!"});
            }

            bcrypt.compare(currentPassword, user.personal_info.password, (error, result) => {
                if (error) {
                    return res.status(500).json({error: "Error occurred during changing your password! Please try again later"});
                }
                if (!result) {
                    return res.status(403).json({error: "Incorrect current password!"});
                }

                bcrypt.hash(newPassword, 10, (error, hashedPassword) => {
                    User.findOneAndUpdate({_id: req.user}, {"personal_info.password": hashedPassword})
                        .then(() => {
                            return res.status(200).json({status: "Password has been changed successfully"});
                        })
                        .catch(() => {
                            return res.status(500).json({error: "Error occurred during changing your password! Please try again later"});
                        })
                })
            })
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({error: "Error occurred during changing your password! Please try again later"});
        })
})

server.post("/latest-blogs", (req, res) => {
    const {page} = req.body;
    const maxLimit = 5;

    Blog.find({draft: false})
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({"publishedAt": -1})
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({blogs});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
});

server.post("/all-latest-blogs-count", (req, res) => {
    Blog.countDocuments({draft: false})
        .then(count => {
            return res.status(200).json({totalDocs: count});
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({error: err.message})
        })
})

server.get("/trending-blogs", (req, res) => {
    Blog.find({draft: false})
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({"activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1})
        .select("blog_id title publishedAt -_id")
        .limit(5)
        .then(blogs => {
            return res.status(200).json({blogs});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
})

server.post("/search-blogs", (req, res) => {
    const {tag, query, page, author, limit, eliminate_blog} = req.body;
    const maxLimit = limit || 2;
    let findQuery;

    if (tag) {
        findQuery = {tags: tag, draft: false, blog_id: {$ne: eliminate_blog}};
    } else if (query) {
        findQuery = {draft: false, title: new RegExp(query, 'i')};
    } else if (author) {
        findQuery = {author, draft: false};
    }

    Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({"publishedAt": -1})
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({blogs});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
})

server.post("/search-blogs-count", (req, res) => {
    const {tag, query, author} = req.body;
    let findQuery;

    if (tag) {
        findQuery = {tags: tag, draft: false};
    } else if (query) {
        findQuery = {draft: false, title: new RegExp(query, 'i')};
    } else if (author) {
        findQuery = {author, draft: false};
    }

    Blog.countDocuments(findQuery)
        .then(count => {
            return res.status(200).json({totalDocs: count});
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({error: err.message});
        })
})

server.post("/search-users", (req, res) => {
    const {query} = req.body;

    User.find({"personal_info.username": new RegExp(query, 'i')})
        .limit(50)
        .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .then(users => {
            return res.status(200).json({users});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
})

server.post("/get-profile", (req, res) => {
    const {username} = req.body;

    User.findOne({"personal_info.username": username})
        .select("-personal_info.password -google_auth -updatedAt -blogs")
        .then(user => {
            return res.status(200).json(user);
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({error: err.message})
        })
})

server.post("/update-profile-img", verifyJWT, (req, res) => {
    const {url} = req.body;

    User.findOneAndUpdate({_id: req.user}, {"personal_info.profile_img": url})
        .then(() => {
            return res.status(200).json({profile_img: url});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
})

server.post("/update-profile", verifyJWT, (req, res) => {
    const {username, bio, social_links} = req.body;
    const bioLimit = 150;

    if (username.length < 3) {
        return res.status(403).json({error: "Username must have at least 3 characters"});
    }
    if (bio.length > bioLimit) {
        return res.status(403).json({error: `Bio must be less than ${bioLimit} characters!`})
    }

    const socialLinksArray = Object.keys(social_links);
    try {
        for (let i = 0; i < socialLinksArray.length; i++) {
            if (social_links[socialLinksArray[i]].length) {
                const hostname = new URL(social_links[socialLinksArray[i]]).hostname;
                if (!hostname.includes(`${socialLinksArray[i]}.com`) && socialLinksArray[i] !== "website") {
                    return res.status(403).json({error: `${socialLinksArray[i]} link is invalid!`})
                }
            }
        }
    } catch (err) {
        return res.status(500).json({error: "You must provide full social links with http(s) included"});
    }

    const updateFields = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
    };

    User.findOneAndUpdate({_id: req.user}, updateFields, {
        runValidators: true
    })
        .then(() => {
            return res.status(200).json({username});
        })
        .catch(err => {
            if (err.code === 11000) {
                return res.status(409).json({error: "Username is already taken!"});
            }
            return res.status(500).json({error: err.message});
        })
})

server.post("/create-blog", verifyJWT, (req, res) => {
    const authorID = req.user;
    const {title, des, banner, content, draft, id} = req.body;
    let {tags} = req.body;

    // blog fields validation
    if (!title.length) {
        return res.status(403).json({"error": "You must provide a title"});
    }
    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({"error": "You  must provide a valid blog description."});
        }
        if (!banner.length) {
            return res.status(403).json({"json": "You must provide a valid banner for your blog."});
        }
        if (!content.blocks.length) {
            return res.status(403).json({"error": "There must be some blog content to publish it!"});
        }
        if (!tags.length || tags.length > 10) {
            return res.status(403).json({"error": "Invalid count of tags"});
        }
    }

    tags = tags.map(tag => tag.toLowerCase());

    const blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, '-').trim() + nanoid();

    if (id) {
        Blog.findOneAndUpdate({blog_id}, {title, des, banner, content, tags, draft: draft ? draft : false})
            .then(() => {
                return res.status(200).json({id: blog_id});
            })
            .catch(err => {
                return res.status(500).json({error: "Failed to update total posts number!"});
            })
    } else {
        const blog = new Blog({
            title, des, banner, content, tags, author: authorID, blog_id: blog_id, draft: Boolean(draft)
        })

        blog?.save().then(blog => {
            const incrementValue = draft ? 0 : 1;
            User.findOneAndUpdate({_id: authorID}, {
                $inc: {"account_info.total_posts": incrementValue},
                $push: {"blogs": blog._id}
            }).then(user => {
                return res.status(200).json({id: blog.blog_id})
            }).catch(err => {
                return res.status(500).json({"error": "Failed to update total post number!"});
            })
        }).catch(err => {
            return res.status(500).json({"error": err.message});
        })
    }
})

server.post("/get-blog", (req, res) => {
    const {blog_id, draft, mode} = req.body;
    const incrementValue = mode !== "edit" ? 1 : 0;

    Blog.findOneAndUpdate({blog_id}, {$inc: {"activity.total_reads": incrementValue}})
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
        .select("title des content banner activity publishedAt blog_id tags")
        .then(blog => {
            User.findOneAndUpdate({"personal_info.username": blog.author.personal_info.username},
                {$inc: {"account_info.total_reads": incrementValue}})
                .catch(err => {
                    return res.status(500).json({error: err.message});
                })
            if (blog.draft && !draft) {
                return res.status(500).json({error: "You can't access draft blogs!"});
            }


            return res.status(200).json({blog});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
})

server.post("/like-blog", verifyJWT, (req, res) => {
    const user_id = req.user;
    const {_id, isLikedByUser} = req.body;
    const incrementValue = !isLikedByUser ? 1 : -1;

    Blog.findOneAndUpdate({_id}, {$inc: {"activity.total_likes": incrementValue}})
        .then(blog => {
            if (!isLikedByUser) {
                const like = new Notification({
                    type: "like",
                    blog: _id,
                    notification_for: blog.author,
                    user: user_id
                });

                like?.save()
                    .then(() => {
                        return res.status(200).json({liked_by_user: true});
                    })
            } else {
                Notification.findOneAndDelete({user: user_id, blog: _id, type: "like"})
                    .then(data => {
                        return res.status(200).json({liked_by_user: false});
                    })
                    .catch(err => {
                        return res.status(500).json({error: err.message})
                    })
            }
        })
})

server.post("/isliked-by-user", verifyJWT, (req, res) => {
    const user_id = req.user;
    const {_id} = req.body;

    Notification.exists({user: user_id, type: "like", blog: _id})
        .then(result => {
            return res.status(200).json({result});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
})

server.post("/add-comment", verifyJWT, (req, res) => {
    const user_id = req.user;
    const {_id, comment, blog_author, replying_to, notification_id} = req.body;

    if (!comment.length) {
        return res.status(403).json({error: "Write something to submit your comment!"});
    }

    const commentObject = {
        blog_id: _id,
        blog_author,
        comment,
        commented_by: user_id,
    };

    if (replying_to) {
        commentObject.parent = replying_to;
        commentObject.isReply = true;
    }

    new Comment(commentObject).save().then(async commentFile => {
        const {comment, commentedAt, children} = commentFile;

        Blog.findOneAndUpdate({_id}, {
            $push: {"comments": commentFile._id},
            $inc: {"activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1}
        }).then(blog => {
            console.log('new comment added')
        })

        const notificationObject = {
            type: replying_to ? "reply" : "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: commentFile._id
        };

        if (replying_to) {
            notificationObject.replied_on_comment = replying_to;
            await Comment.findOneAndUpdate({_id: replying_to}, {$push: {children: commentFile._id}})
                .then(replyingToCommentDoc => notificationObject.notification_for = replyingToCommentDoc.commented_by);

            if (notification_id) {
                Notification.findOneAndUpdate({_id: notification_id}, {reply: commentFile._id})
                    .then(() => {
                        console.log('Notification updated');
                    })
                    .catch(() => {
                        console.log("Failed to update notification!");
                    })
            }
        }

        new Notification(notificationObject).save().then(notification => console.log("New notification created!"));

        return res.status(200).json({comment, commentedAt, _id: commentFile._id, user_id, children});
    })
})

server.post("/get-blog-comments", (req, res) => {
    const {blog_id, skip} = req.body;
    const maxLimit = 5;

    Comment.find({blog_id, isReply: false})
        .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
        .skip(skip)
        .limit(maxLimit)
        .sort({"commentedAt": -1})
        .then(comment => {
            return res.status(200).json(comment);
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({error: err});
        })
})

server.post("/get-replies", (req, res) => {
    const {_id, skip} = req.body;
    const maxLimit = 5;

    Comment.findOne({_id})
        .populate({
            path: "children",
            options: {
                limit: maxLimit,
                skip: skip,
                sort: {"commentedAt": -1}
            },
            populate: {
                path: "commented_by",
                select: "personal_info.profile_img personal_info.fullname personal_info.username"
            },
            select: "-blog_id -updatedAt"
        })
        .select("children")
        .then(doc => {
            return res.status(200).json({replies: doc.children});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
})

const deleteComments = (_id) => {
    Comment.findOneAndDelete({_id})
        .then(comment => {
            if (comment.parent) {
                Comment.findOneAndDelete({_id: comment.parent}, {$pull: {children: _id}})
                    .then(data => {
                        console.log(data);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
            Notification.findOneAndDelete({comment: _id})
                .then(() => {
                    console.log("Comment notification has been deleted!");
                })
                .catch(err => {
                    console.log(err);
                });
            Notification.findOneAndDelete({reply: _id})
                .then(() => {
                    console.log("Reply notification has been deleted!");
                })
                .catch(err => {
                    console.log(err);
                })
            Blog.findOneAndUpdate({_id: comment.blog_id}, {
                $pull: {comments: _id},
                $inc: {"activity.total_comments": -1, "activity.total_parent_comments": comment.parent ? 0 : -1}
            })
                .then(blog => {
                    if (comment.children.length) {
                        comment.children.map(replies => {
                            deleteComments(replies);
                        })
                    }
                })
        })
        .catch(err => {
            console.log(err.message);
        })
};
server.post("/delete-comment", verifyJWT, (req, res) => {
    const user_id = req.user;
    const {_id} = req.body;
    Comment.findOne({_id})
        .then(comment => {
            if (user_id == comment.commented_by || user_id == comment.blog_author) {
                deleteComments(_id);

                return res.status(200).json({status: "Done!"})
            } else {
                return res.status(403).json({error: "You don't have privileges to delete this comment!"})
            }
        })
})

server.get("/new-notification", verifyJWT, (req, res) => {
    const user_id = req.user;

    Notification.exists({"notification_for": user_id, "seen": false, user: {$ne: user_id}})
        .then(result => {
            return res.status(200).json({new_notification_available: !!result});
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({error: err.message});
        })
})

server.post("/notifications", verifyJWT, (req, res) => {
    const user_id = req.user;
    const {page, filter, deletedDocCount} = req.body;
    const maxLimit = 10;
    const findQuery = {notification_for: user_id, user: {$ne: user_id}};
    let skipDocs = (page - 1) * maxLimit;

    if (filter !== "all") {
        findQuery.type = filter;
    }

    if (deletedDocCount) {
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
        .skip(skipDocs)
        .limit(maxLimit)
        .populate("blog", "title blog_id")
        .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
        .populate("comment", "comment")
        .populate("replied_on_comment", "comment")
        .populate("reply", "comment")
        .sort({createdAt: -1})
        .select("createdAt type seen reply")
        .then(notifications => {
            return res.status(200).json({notifications});
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({error: err.message});
        })
})

server.post("/all-notifications-count", verifyJWT, (req, res) => {
    const user_id = req.user;
    const {filter} = req.body;
    const findQuery = {notification_for: user_id, user: {$ne: user_id}};

    if (filter !== "all") {
        findQuery.type = filter;
    }

    Notification.countDocuments(findQuery)
        .then(count => {
            return res.status(200).json({totalDocs: count});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        })
})

server.listen(PORT, () => {
    console.log("listening on port " + PORT);
});
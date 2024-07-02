// importing tools
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import {uploadImage} from "../common/aws.jsx";

const uploadImageByURL = (event) => {
    const link = new Promise((resolve, reject) => {
        try {
            resolve(event);
        } catch (err) {
            reject(err);
        }
    })

    return link.then(url => ({
        success: 1,
        file: {url},
    }))
}

const uploadImageByFile = (event) => (
    uploadImage(event).then((url) => {
        if (url) {
            return {
                success: 1,
                file: {url},
            }
        }
    })
)

export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true,
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByURL,
                uploadByFile: uploadImageByFile,
            }
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading...",
            levels: [2, 3],
            defaultLevel: 2,

        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true,
    },
    marker: Marker,
    inlineCode: InlineCode
}
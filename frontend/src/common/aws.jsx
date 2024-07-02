import axios from "axios";

const uploadImage = async (image) => {
    let imageUrl = null;
    console.log(import.meta.env.VITE_SERVER_DOMAIN)
    await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
        .then(async ({data: {uploadUrl}}) => {
            console.log(uploadUrl)
            await axios({
                method: "PUT",
                url: uploadUrl,
                headers: {"Content-Type": "multipart/form-data"},
                data: image
            }).then(() => {
                imageUrl = uploadUrl.split("?")[0];
            }).catch(err => {
                console.log(err)
            })
        })

    return imageUrl;
}

export {
    uploadImage,
};
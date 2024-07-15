import axios from "axios";

export const uploadImage = async (image) => {
    if (image) {
        try {
            const imageBlob = new Blob([image], { type: image.type });

            const formData = new FormData();
            formData.append('image', imageBlob, image.name);

            const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return(response.data.url)
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    } else {
        console.error('No image provided');
    }
};
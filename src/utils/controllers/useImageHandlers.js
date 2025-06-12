import { useUploadImageMutation } from "../../services/api";
import { notification } from "antd";
import { base64ToImageFile } from "./imageConversions";
import isValidHttpUrl from "./isValidHttpUrl";

function useImageHandlers() {
  const [_UPLOAD, { isLoading }] = useUploadImageMutation();

  // Function to upload an image
  const uploadImage = async (file) => {
    if (!file) {
      // Handle the case where no image is selected
      notification.error({
        message: "Image not selected",
        placement: "bottomRight",
        showProgress: true,
      });
      return null; // Return null or any other value to indicate an error or no image selected.
    }

    if (isValidHttpUrl(file)) {
      // If the file is a valid HTTP URL, return it directly
      return file;
    }

    let formData;

    if (typeof file === "string" && file.startsWith("data:image/")) {
      // It's a base64 string, convert it to a File using base64ToImageFile function.
      formData = new FormData();
      const imageFile = base64ToImageFile(file); // Convert base64 to File
      formData.append("file", imageFile);
    } else if (file instanceof File) {
      // It's already a File, no need to convert.
      formData = new FormData();
      formData.append("file", file);
    } else {
      // Handle other cases or show an error message for unsupported file types
      notification.error({
        message: "Invalid File Type",
        placement: "bottomRight",
        showProgress: true,
      });
      return null; // Return null or any other value to indicate an error.
    }

    try {
      // Upload the image and get the URL
      const imageSrcResponse = await _UPLOAD(formData);
      return imageSrcResponse?.data?.data?.url;
    } catch (error) {
      // Handle any errors during the image upload
      console.error("Error uploading image:", error);
      return null; // Return null or any other value to indicate an error.
    }
  };

  return { uploadImage, isLoading };
}

export default useImageHandlers;

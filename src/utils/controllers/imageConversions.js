import { notification } from "antd";

// Upload an image file with validation
export async function uploadImageFile(file) {
  // Check if the file status is "removed."
  if (file?.status === "removed") {
    return "";
  }

  const fileType = file?.type.substring(file?.type.indexOf("/") + 1);
  const sizeofImg = file?.size;

  // Validate image type.
  if (!(fileType === "jpeg" || fileType === "png" || fileType === "jpg")) {
    notification.error({
      message: "Image type should be jpeg, png, jpg",
      placement: "bottomRight",
      showProgress: true,
    });
    return "";
  }

  // Validate image size.
  if (sizeofImg >= 1500000) {
    notification.error({
      message: "Image size should be less than 1.5MB",
      placement: "bottomRight",
      showProgress: true,
    });
    return "";
  }

  // Convert image file to base64.
  return await imageFileToBase64(file);
}

// Convert an image file to a base64 string
export function imageFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

// Convert a base64 string to an image File
export function base64ToImageFile(base64String) {
  // Remove the data URL prefix (e.g., 'data:image/png;base64,')
  const base64Data = base64String.replace(
    /^data:image\/(png|jpeg|jpg);base64,/,
    ""
  );

  // Generate a default file name based on the current timestamp
  const currentTimestamp = Date.now();
  const fileType = base64String.startsWith("data:image/jpeg")
    ? "jpeg"
    : base64String.startsWith("data:image/jpg")
    ? "jpg"
    : "png";

  // Create a blob from the base64 data and define the file type
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: `image/${fileType}` });

  // Create a File object from the blob with the default name and type.
  const fileName = `image_${currentTimestamp}.${fileType}`;
  return new File([blob], fileName, { type: `image/${fileType}` });
}

// Convert a URL to an image File
export async function urlToImageFile(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const filename = url.substring(url.lastIndexOf("/") + 1);
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    throw error;
  }
}

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useUploadImageMutation } from '../../../services/api';

/**
 * Uploads a logo image for the team drawers and hands the hosted URL to `onSetValue`.
 * Non-image files are ignored, as before.
 */
export const useLogoUpload = () => {
  const [uploadImage, { isLoading: isUploadingLogo }] = useUploadImageMutation();

  const processUploadedFile = useCallback(
    async ({ file, onSetValue }) => {
      if (!file || !file.type?.startsWith('image/')) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await uploadImage(formData).unwrap();
        if (response?.success && response?.data) {
          const url = typeof response.data === 'string' ? response.data : response.data?.url;
          if (url) {
            onSetValue(url);
          } else {
            toast.error("Couldn't upload the image", {
              description: 'The server sent back an invalid response.',
            });
          }
        } else {
          toast.error(response?.message || "Couldn't upload the image");
        }
      } catch (error) {
        toast.error(error?.data?.message || "Couldn't upload the image");
      }
    },
    [uploadImage]
  );

  return { processUploadedFile, isUploadingLogo };
};

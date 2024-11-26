import { drive } from '../config/GoogleDrive';
import path from 'path';
import { PassThrough } from 'stream';
import createHttpError from 'http-errors';

const fileIdToLink = (fileId: string): string => {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

const folderIdToLink = (folderId: string): string => {
  return `https://drive.google.com/drive/folders/${folderId}`;
};

const extractLinkDrive = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const driveId =
      urlObj.searchParams.get('id') || urlObj.pathname.split('/').pop();
    if (driveId) {
      return driveId;
    }
    return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle invalid URLs or other errors
    console.error('Error extracting Drive ID:', error.message);
    throw createHttpError(400, 'Invalid URL');
  }
};

const SaveOneFileToDrive = async (
  fileObject: Express.Multer.File,
  fileNameInDrive: string,
  folderId = '1_MwmGF73Vs3SjiCEEdXv3Pp9b8xoknPu',
): Promise<string> => {
  try {
    if (!fileObject || !fileObject.buffer) {
      throw createHttpError(400, 'Invalid file object');
    }

    const bufferStream = new PassThrough();
    bufferStream.end(fileObject.buffer);

    const fileExtension = path.extname(fileObject.originalname) || '';

    const fileMetadata = {
      name: `${fileNameInDrive}${fileExtension}`,
      parents: [folderId],
    };

    const media = {
      mimeType: fileObject.mimetype,
      body: bufferStream,
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    const fileId = res.data.id;
    if (!fileId) {
      throw createHttpError(500, 'Failed to retrieve file ID');
    }

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    const imageUrl = fileIdToLink(fileId);
    return imageUrl;
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error saving file to Drive:', err.message);
      throw createHttpError(500, err.message);
    } else {
      console.error('Error saving file to Drive:', err);
      throw createHttpError(500, 'Unknown error');
    }
  }
};

export { SaveOneFileToDrive, fileIdToLink, folderIdToLink, extractLinkDrive };

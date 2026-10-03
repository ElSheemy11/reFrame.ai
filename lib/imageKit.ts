import imageKit, { toFile } from '@imagekit/nodejs'; 

let _client: InstanceType<typeof imageKit> | null = null;

function getClient() {
    if (!_client) {
        _client = new imageKit({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
        }
        );
    }
    return _client;
}

export async function uploadImageBufferToImageKit(params: {
    buffer: Buffer;
    fileName: string;
    folder?: string;
    mimeType?: string;
}) {
    const client = getClient();
    const file = await toFile(params.buffer, params.fileName, { type: params.mimeType });

    const result = await client.files.upload({
        file,
        fileName: params.fileName,
        folder: params.folder,
        useUniqueFileName: true,
    });

    return {url: result.url, fileId: result.fileId};
}
import { S3 } from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const uploadToS3 = async (
  buffer: Buffer,
  key: string
): Promise<string> => {
  try {
    await s3
      .putObject({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      })
      .promise();

    return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw { message: "Failed to upload image to S3.", statusCode: 500 };
  }
};

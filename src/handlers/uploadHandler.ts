import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { uploadToS3 } from "../services/s3Service";
import { extractPassportData } from "../services/textractService";
import { saveExtractedDataToDB } from "../services/dbService";
import { handleError } from "../utils/errorHandler";

export const uploadHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      throw { message: "Missing request body.", statusCode: 400 };
    }

    const body = JSON.parse(event.body);
    const base64Image = body.image;

    if (!base64Image) {
      throw { message: "Image data is required.", statusCode: 400 };
    }

    const buffer = Buffer.from(base64Image, "base64");

    const s3Key = `passport_${Date.now()}.jpg`;
    const s3Url = await uploadToS3(buffer, s3Key);

    const extractedData = await extractPassportData(s3Key);

    await saveExtractedDataToDB({
      dateOfBirth: extractedData.dateOfBirth,
      expiryDate: extractedData.expiryDate,
      s3ImageUrl: s3Url,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success",
        extractedData,
      }),
    };
  } catch (error) {
    return handleError(error, "Failed to process passport image.");
  }
};

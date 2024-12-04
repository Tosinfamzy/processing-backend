import { Textract } from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const textract = new Textract({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const extractPassportData = async (
  s3Key: string
): Promise<{ dateOfBirth: string; expiryDate: string }> => {
  const params: Textract.Types.AnalyzeDocumentRequest = {
    Document: {
      S3Object: {
        Bucket: process.env.S3_BUCKET!,
        Name: s3Key,
      },
    },
    FeatureTypes: ["FORMS"],
  };

  try {
    const data = await textract.analyzeDocument(params).promise();

    if (!data.Blocks) {
      throw new Error("No blocks found in the Textract response.");
    }

    const blockMap = data.Blocks.reduce((map, block) => {
      if (block.Id) {
        map[block.Id] = block;
      }
      return map;
    }, {} as Record<string, Textract.Block>);

    const keyValuePairs: Record<string, string> = {};
    data.Blocks.forEach((block) => {
      if (
        block.BlockType === "KEY_VALUE_SET" &&
        block.EntityTypes?.includes("KEY")
      ) {
        const keyBlock = block;
        const keyText = getText(keyBlock, blockMap);

        const valueBlockId = keyBlock.Relationships?.find(
          (rel) => rel.Type === "VALUE"
        )?.Ids?.[0];
        const valueBlock = valueBlockId ? blockMap[valueBlockId] : null;
        const valueText = valueBlock ? getText(valueBlock, blockMap) : "";

        if (keyText) {
          keyValuePairs[keyText] = valueText;
        }
      }
    });

    const dateOfBirth = keyValuePairs["Date of Birth"] || "";
    const expiryDate = keyValuePairs["Expiry Date"] || "";

    if (!dateOfBirth || !expiryDate) {
      throw new Error("Required data not found in Textract response.");
    }

    return { dateOfBirth, expiryDate };
  } catch (error) {
    console.error("Error extracting passport data:", error);
    throw { message: "Failed to extract data from Textract.", statusCode: 500 };
  }
};

const getText = (
  block: Textract.Block,
  blockMap: Record<string, Textract.Block>
): string => {
  if (block.Relationships) {
    return block.Relationships.filter((rel) => rel.Type === "CHILD")
      .flatMap((rel) => rel.Ids?.map((id) => blockMap[id]?.Text || "") || [])
      .join(" ");
  }
  return block.Text || "";
};

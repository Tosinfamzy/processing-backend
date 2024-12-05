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
): Promise<{
  surname: string;
  givenNames: string;
  dateOfBirth: string;
  expiryDate: string;
  passportNumber: string;
}> => {
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
      throw new Error("No blocks found in Textract response.");
    }

    // console.log(JSON.stringify(data, null, 2));

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

    const surname = keyValuePairs["Surname/ Nom"] || "";
    const givenNames = keyValuePairs["Given Names/ Prénoms"] || "";
    const dateOfBirth = keyValuePairs["Date of birth/ Date du naissance"] || "";
    const expiryDate =
      keyValuePairs["Date of expiration/ Date d'expiration"] || "";
    const passportNumber = keyValuePairs["Passport No./ No du Passeport"] || "";

    if (
      !surname ||
      !givenNames ||
      !dateOfBirth ||
      !expiryDate ||
      !passportNumber
    ) {
      throw new Error("Required data not found in Textract response.");
    }

    return { surname, givenNames, dateOfBirth, expiryDate, passportNumber };
  } catch (error) {
    console.error("Error extracting passport data:", error);
    throw new Error("Failed to extract data from passport image.");
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

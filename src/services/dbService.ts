import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const saveExtractedDataToDB = async (data: {
  dateOfBirth: string;
  expiryDate: string;
  s3ImageUrl: string;
}): Promise<void> => {
  try {
    const dateOfBirth = parseDate(data.dateOfBirth);
    const expiryDate = parseDate(data.expiryDate);

    console.log("Parsed Dates:", { dateOfBirth, expiryDate });

    await client.connect();
    const query =
      "INSERT INTO passport_data (date_of_birth, expiry_date, s3_image_url) VALUES ($1, $2, $3)";
    await client.query(query, [dateOfBirth, expiryDate, data.s3ImageUrl]);
  } catch (error) {
    console.error("Error saving data to database:", error);
    throw new Error("Failed to save extracted data to the database.");
  } finally {
    await client.end();
  }
};

const parseDate = (dateString: string): string => {
  try {
    const [day, month, year] = dateString.split(" ");
    const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1;
    if (!day || !month || !year || isNaN(monthIndex)) {
      throw new Error("Invalid date format");
    }
    return `${year}-${String(monthIndex).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error parsing date:", dateString, error.message);
    } else {
      console.error("Error parsing date:", dateString, error);
    }
    throw new Error(`Invalid date format: ${dateString}`);
  }
};

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
    await client.connect();
    const query = `
      INSERT INTO passport_data (date_of_birth, expiry_date, s3_image_url)
      VALUES ($1, $2, $3)
    `;
    await client.query(query, [
      data.dateOfBirth,
      data.expiryDate,
      data.s3ImageUrl,
    ]);
  } catch (error) {
    console.error("Error saving data to database:", error);
    throw new Error("Failed to save extracted data to the database.");
  } finally {
    await client.end();
  }
};
# Passport Processor

A serverless application for processing passport images. The application allows users to upload passport images, extracts relevant data using AWS Textract, and stores the extracted data along with the image URL in a PostgreSQL database.

## Features

- **Image Upload**: Upload passport images in base64 format.
- **AWS S3 Integration**: Stores uploaded images securely in an AWS S3 bucket.
- **Data Extraction**: Uses AWS Textract to extract passport data such as date of birth and expiry date.
- **Database Storage**: Saves the extracted data and image URL to a PostgreSQL database.
- **Serverless Architecture**: Built using AWS Lambda functions and managed with the Serverless Framework.

## Architecture

The **Upload Handler** performs the following actions:

- Accepts image data in base64 format via an HTTP POST request.
- Validates the image format and size.
- Stores the image in an S3 bucket using the **S3 Service**.
- Invokes the **Textract Service** to extract data from the image.
- Saves the extracted data and image URL to the PostgreSQL database using the **Database Service**.

2. **S3 Service**: Uploads images to an Amazon S3 bucket.
3. **Textract Service**: Processes images using AWS Textract to extract passport data.
4. **Database Service**: Connects to a PostgreSQL database to save extracted data.

## Prerequisites

- **Node.js** v18.x
- **AWS Account** with access to S3 and Textract services.
- **PostgreSQL Database** accessible from AWS Lambda.
- **Serverless Framework** installed globally: `npm install -g serverless`

## Installation

1. **Clone the Repository**

   ```bash
   git clone <repo>
   cd <processing-backend>
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

## Configuration

1. **AWS Credentials**

   Ensure your AWS credentials are configured locally. You can use `aws configure` to set up your AWS Access Key and Secret Key.

2. **Environment Variables**

   Create a `.env` file in the root directory with the following content:

   ```env
   S3_BUCKET=your-s3-bucket-name
   DB_HOST=your-database-host
   DB_PORT=your-database-port
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   ```

   Replace the placeholders with your actual database configuration and desired S3 bucket name.

3. **Serverless Configuration**

   The `serverless.yml` file contains the configuration for the Serverless Framework, specifying the AWS region, runtime, and environment variables.

## Usage

1. **Deploy the Application**

   Deploy the serverless application to AWS:

   ```bash
   npm run deploy
   ```

   This will set up the AWS Lambda functions and S3 bucket as specified in `serverless.yml`.

2. **Invoke the Upload Endpoint**

   The `uploadHandler` function is exposed via an HTTP POST endpoint. You can test the endpoint using `curl` or a tool like Postman.

   **Request URL**:

   ```http
   POST https://your-api-endpoint/dev/upload
   ```

   **Request Body**:

   ```json
   {
     "image": "base64-encoded-image-string"
   }
   ```

   **Response**:

   ```json
   {
     "message": "Success",
     "extractedData": {
       "dateOfBirth": "YYYY-MM-DD",
       "expiryDate": "YYYY-MM-DD"
     }
   }
   ```

## Testing Locally

1. **Start Serverless Offline**

   ```bash
   npm run start
   ```

   This will start the serverless application locally using the `serverless-offline` plugin.

2. **Test the Endpoint**

   Send a POST request to `http://localhost:3000/dev/upload` with the required payload.

## Project Structure

- `src/handlers/uploadHandler.ts`: Handles the image upload and orchestrates the processing steps.
- `src/services/s3Service.ts`: Contains the logic for uploading images to S3.
- `src/services/textractService.ts`: Contains the logic for extracting data using AWS Textract.
- `src/services/dbService.ts`: Contains the logic for saving data to the PostgreSQL database.

## Dependencies

- **AWS SDK**: For interacting with AWS services like S3 and Textract.
- **pg**: PostgreSQL client for Node.js.
- **Serverless Framework**: For deploying and managing serverless functions.
- **TypeScript**: TypeScript support.

## Deployment

To remove the deployed services from AWS:

```bash
npm run remove
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## License

This project is licensed under the [MIT License](LICENSE).

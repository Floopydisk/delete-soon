import AWS from "aws-sdk";

// Log environment variables (without sensitive data)
console.log("AWS Region:", process.env.NEXT_PUBLIC_AWS_REGION);
console.log("AWS Bucket:", process.env.NEXT_PUBLIC_AWS_S3_BUCKET);
console.log(
  "AWS Access Key configured:",
  !!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY
);
console.log(
  "AWS Secret Key configured:",
  !!process.env.NEXT_PUBLIC_AWS_SECRET_KEY
);

// Configure AWS SDK
AWS.config.update({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
});

const s3 = new AWS.S3();
const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "";

/**
 * Uploads an image file to AWS S3 and returns the URL
 * @param file - The file to upload
 * @param directory - The directory in the bucket to store the file (e.g., 'courtship-photos')
 * @returns The URL of the uploaded file
 */
export async function uploadImageToS3(
  file: File,
  directory: string
): Promise<string> {
  // Maximum number of retry attempts
  const MAX_RETRIES = 3;
  let retries = 0;
  let lastError: any = null;

  while (retries < MAX_RETRIES) {
    try {
      if (!bucketName || !process.env.NEXT_PUBLIC_AWS_ACCESS_KEY) {
        console.warn("AWS S3 not configured — using data URL fallback");
        return await readFileAsDataURL(file);
      }

      // Create a unique file name
      const timestamp = new Date().getTime();
      const fileName = `${directory}/${timestamp}-${file.name.replace(
        /\s+/g,
        "-"
      )}`;

      // For debugging
      console.log("Uploading to bucket:", bucketName);
      console.log("File path:", fileName);
      console.log("Content type:", file.type);
      console.log("Retry attempt:", retries + 1);

      // Read the file
      const fileData = await readFileAsArrayBuffer(file);

      // Upload to S3
      const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileData,
        ContentType: file.type,
        ACL: "public-read", // Make the file publicly accessible
      };

      await s3.upload(params).promise();

      // Generate the public URL
      const fileUrl = `https://${bucketName}.s3.${
        process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1"
      }.amazonaws.com/${fileName}`;
      console.log("File uploaded successfully. URL:", fileUrl);

      return fileUrl;
    } catch (error: any) {
      lastError = error;
      console.error(`Upload attempt ${retries + 1} failed:`, error);

      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      retries++;
    }
  }

  // If we've exhausted all retries, throw the last error
  console.error("All upload attempts failed");
  throw new Error(
    `Failed to upload file after ${MAX_RETRIES} attempts: ${
      lastError?.message || "Unknown error"
    }`
  );
}

/**
 * Helper function to read a file as ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as Data URL"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

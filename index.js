import { SSMClient, PutParameterCommand } from "@aws-sdk/client-ssm";
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables from .env file
dotenv.config();

const ssmClient = new SSMClient({
    region: process.env.AWS_REGION || 'us-east-1',
    // AWS credentials will be automatically loaded from environment variables
    // or AWS credentials file
});

async function uploadToSSM(key, value) {
    try {
        const command = new PutParameterCommand({
            Name: `${process.env.AWS_SSM_PATH}/${key}`,
            Value: value,
            Type: 'SecureString',
            Overwrite: true,
        });

        await ssmClient.send(command);
        console.log(`✅ Successfully uploaded ${key} to SSM`);
    } catch (error) {
        console.error(`❌ Error uploading ${key} to SSM:`, error);
    }
}

async function main() {
    // Read .env file content
    const envContent = readFileSync('.env', 'utf-8');
    const envVars = dotenv.parse(envContent);

    console.log('Starting to upload environment variables to SSM...');

    // Upload each environment variable to SSM
    for (const [key, value] of Object.entries(envVars)) {
        // Skip AWS-related environment variables and empty values
        if (!key.startsWith('AWS_') && value && value.trim() !== '') {
            await uploadToSSM(key, value);
        }
    }

    console.log('Finished uploading environment variables to SSM');
}

main().catch(console.error); 
#!/usr/bin/env node --experimental-modules

import { SSMClient, PutParameterCommand } from "@aws-sdk/client-ssm";
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const helpText = `
Usage: env-to-ssm [options] [.env file path]

Options:
  -h, --help     Show this help message
  -v, --version  Show version number

Examples:
  env-to-ssm                   # Use .env in current directory
  env-to-ssm ./config/.env     # Use specific .env file
  env-to-ssm -h                # Show help

Required AWS Environment Variables:
  AWS_ACCESS_KEY_ID            Your AWS access key
  AWS_SECRET_ACCESS_KEY        Your AWS secret key
  AWS_REGION                   AWS region (defaults to us-east-1)
  AWS_SSM_PATH                 Base path for SSM parameters (e.g., /myapp/prod)

Note: Make sure you have proper AWS credentials configured.
`;

if (args.includes('-h') || args.includes('--help')) {
    console.log(helpText);
    process.exit(0);
}

if (args.includes('-v') || args.includes('--version')) {
    const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
    console.log(`env-to-ssm version ${packageJson.version}`);
    process.exit(0);
}

// Load environment variables from .env file
const envPath = args[0] ? resolve(args[0]) : '.env';
try {
    dotenv.config({ path: envPath });
} catch (error) {
    console.error(`❌ Error loading .env file from ${envPath}:`, error.message);
    process.exit(1);
}

// Validate required AWS environment variables
if (!process.env.AWS_SSM_PATH) {
    console.error('❌ Error: AWS_SSM_PATH environment variable is required');
    console.error('Please set AWS_SSM_PATH in your .env file or environment');
    process.exit(1);
}

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
        console.log(`✅ Successfully uploaded ${key} to SSM at ${process.env.AWS_SSM_PATH}/${key}`);
    } catch (error) {
        console.error(`❌ Error uploading ${key} to SSM:`, error.message);
    }
}

async function main() {
    console.log(`🚀 Starting to upload environment variables to SSM from ${envPath}`);
    console.log(`📁 Using SSM base path: ${process.env.AWS_SSM_PATH}`);
    console.log(`🌎 AWS Region: ${process.env.AWS_REGION || 'us-east-1'}\n`);

    try {
        // Read .env file content
        const envContent = readFileSync(envPath, 'utf-8');
        const envVars = dotenv.parse(envContent);

        // Upload each environment variable to SSM
        for (const [key, value] of Object.entries(envVars)) {
            // Skip AWS-related environment variables and empty values
            if (!key.startsWith('AWS_') && value && value.trim() !== '') {
                await uploadToSSM(key, value);
            }
        }

        console.log('\n✨ Finished uploading environment variables to SSM');
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main().catch(error => {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
}); 
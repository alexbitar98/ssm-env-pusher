# Node.js Application

A tool to bulk upload environment variables to AWS Systems Manager Parameter Store (SSM). Instead of manually creating SSM parameters one by one through the AWS console, this tool allows you to push multiple environment variables from your local `.env` file to SSM in a single operation.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy the `.env.example` file to create your `.env` file:
     ```bash
     cp .env.example .env
     ```
   - Fill in the required environment variables in your `.env` file:
     ```
     AWS_REGION=your-aws-region
     AWS_ACCESS_KEY_ID=your-access-key
     AWS_SECRET_ACCESS_KEY=your-secret-key
     # Add other required environment variables
     ```

3. **AWS SSM Configuration**
   - Ensure your AWS credentials have permissions to access Systems Manager (SSM)
   - Required IAM permissions:
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": [
                     "ssm:PutParameter",
                     "ssm:GetParameter",
                     "ssm:GetParameters"
                 ],
                 "Resource": "arn:aws:ssm:*:*:parameter/*"
             }
         ]
     }
     ```
   - Any environment variable you want to deploy to SSM should be added to your `.env` file
   - Variables will be automatically synced to SSM when deploying

4. **Start the Application**
   ```bash
   npm start
   ```

## Project Files

- `index.js` - Main application file
- `.env.example` - Template for environment variables
- `.env` - Your local environment configuration (do not commit this file)
- `package.json` - Project dependencies and scripts

## Need Help?

If you encounter any issues:
1. Make sure all dependencies are installed
2. Verify your `.env` file is properly configured with all required variables
3. Confirm you have the correct AWS permissions set up
4. Check the console for error messages
5. Ensure your AWS credentials are valid and have SSM access

## License

This project is open source and available under the MIT License.

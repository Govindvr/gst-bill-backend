 
# Google Sheets API Integration with Node.js and Express

This project demonstrates how to integrate the Google Sheets API with a Node.js Express application. It allows users to download a PDF of a Google Sheet, get data from a Google Sheet, and set data in a Google Sheet in a premade template design.

## Prerequisites

To follow along with this tutorial, you will need the following:

- Node.js installed on your system
- A Google account
- The Google Sheets API enabled for your project



## Step 1: Install Dependencies

Install the dependencies:

```
npm install
```
## Step 2: Configure the Google Sheets API

Download and add your Google Sheets API service account credentials to the root directory `service_account_credentials.json`. You can get your credentials from the [Google Developers Console](https://console.developers.google.com/).

```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials.json
```
## Step 3: Configure the Google Sheets API

Create a new file called `.env` and add your Google Sheets API credentials to it. You can get your credentials from the [Google Developers Console](https://console.developers.google.com/).

```
PORT=<port number>
SPREADSHEET_ID=<sheet id>
GOOGLE_APPLICATION_CREDENTIALS=./service_account_credentials.json
GCLOUD_PROJECT=<google cloud project id>
```
## Step 4: Run the application

```
npm run dev
```
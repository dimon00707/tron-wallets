# TronTransactionNotifier

TronTransactionNotifier is a tool for monitoring and tracking USDT (Tether) transactions on the TRON network. It allows users to observe incoming and outgoing USDT transactions for a specified TRON wallet address. 

## Features

- Periodic checking of new USDT transactions for the specified TRON wallet address.
- Saving transaction information in a SQLite database for further analysis and processing.
- Recording transactions in a Google Sheets table for convenient viewing and data management.
- Sending notifications about new transactions to Telegram, including information about the amount, time, and current balance.
- Filtering transactions based on a minimum USDT amount for processing.
- Logging important events and errors to facilitate debugging and monitoring of the application.

## Purpose

This project is intended for developers and users who need to track and manage USDT transactions on the TRON network. It can be useful for various purposes, such as monitoring personal finances, transaction analytics, or integration with other applications.

## Technologies

The project is written in JavaScript and uses the following main technologies and libraries:

- Node.js: JavaScript runtime environment on the server.
- SQLite: Lightweight database for storing transaction information.
- Google Sheets API: Integration with Google Sheets for data recording and management.
- Telegram Bot API: Sending notifications about new transactions via Telegram bot.
- Tron Web API: Interacting with the TRON blockchain to retrieve transaction information and wallet balance.

## Installation

1. Clone the project repository to your computer.
2. Install dependencies using the command `npm install`.
3. Configure the `.env` configuration file with your parameters, such as the TRON wallet address, Telegram bot token, etc.

## Usage

1. Start the application using the command `npm start`.
2. For management and control of the application, it is recommended to use PM2.
3. The application will start monitoring new USDT transactions for the specified wallet address and will send notifications to Telegram when new transactions are detected.


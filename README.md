# Destiny Item Rater

A web-based tool to compare and rate all of your Destiny 2 items.

Displays a table showing all of your Destiny 2 items, as well as items similar to them. This tool also allows you to export all items considered "bad" as a CSV to import into [Destiny Item Manager](https://github.com/DestinyItemManager/DIM) with "junk" and "infuse" tags, or as an ID-based search query for Destiny Item Manager.

## Getting Started

### 1. Install prerequisites

- [Node.js](https://nodejs.org)
- [Yarn Package Manager](https://yarnpkg.com)
- [OpenSSL](https://www.openssl.org/)

If you are on Windows and have [Chocolatey](https://chocolatey.org/) installed, you can run the following commands in PowerShell:

``` powershell
choco install nodejs
choco install yarn
choco install openssl.light
```

### 2. Register on Bungie.net

In order to make requests to the Bungie.net API, you need to register for an API key [here](https://www.bungie.net/en/Application).

Click **Create New App** and specify the following information:

- **OAuth Client Type** must be set to `Confidential`
- **Redirect URL** must be set to `https://localhost:3000/redirect`
- **Scope** must have the following items checked
    - `Read your Destiny vault and character inventory.`
    - `Read your Destiny vendor and advisor information.`
    - `Move or equip Destiny gear and other items.`
    - `Access items like your notifications, memberships, and recent activity.`
- **Origin Header** must be set to `https://localhost:3000`

After submitting the application, make a note of the following values in the **API Keys** section:
- `API Key`
- `OAuth client_id`
- `OAuth client_secret`

### 3. Create the `.env` file

Next, copy the `.env.template` file in the root directory and rename the copy to `.env`. Replace the variable values with the following information:

| Variable               | Value                                                    |
| ---------------------- | -------------------------------------------------------- |
| `BUNGIE_API_KEY`       | The `Api Key` value from Bungie.net                      |
| `BUNGIE_CLIENT_ID`     | The `OAuth client_id` value from Bungie.net              |
| `BUNGIE_CLIENT_SECRET` | The `OAuth client_secret` value from Bungie.net          |
| `CERT_PASSPHRASE`      | The passphrase to use when generating an SSL certificate |

### 4. Install dependencies

Next, restore all package dependencies using the following command:
```
yarn install
```

## Running the Website

To run the web server, run the following command:

```
yarn start
```

This will bundle the JavaScript files, and then start up the server, while watching for changes in the source JavaScript files.

> NOTE: When running the app for the first time in non-production mode, you will be prompted to enter a passphrase for the SSL certificate. This passphrase should be the same value that is set for `CERT_PASSPHRASE` in your `.env` file.

The website will now be running on https://localhost:3000.
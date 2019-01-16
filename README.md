# Destiny Item Rater

A web-based tool to compare and rate all of your Destiny 2 items.<br>
Displays a table showing all of your Destiny 2 items, as well as items similar to them. This tool also allows you to export all items considered "bad" as a CSV to import into [Destiny Item Manager](https://github.com/DestinyItemManager/DIM) with "junk" and "infuse" tags, or as an ID-based search query for Destiny Item Manager.

## Getting Started

### Installation

This website uses [Yarn Package Manager](https://yarnpkg.com/) to install dependencies and run the server.

You will also need OpenSSL installed and configured in order to create an SSL certificate for the server.

In order to set up this website, you will need to register an app at:<br>
https://www.bungie.net/en/Application <br>
With the following information:
- OAuth Client Type must be set to 'Confidential'
- Redirect URL must be set to 'https://localhost:3000/redirect'
- Scope must have the following items checked
    - Read your Destiny vault and character inventory.
    - Read your Destiny vendor and advisor information.
    - Move or equip Destiny gear and other items.
    - Access items like your notifications, memberships, and recent activity.
- Origin Header must be set to 'https://localhost:3000'

After submitting the application, make a note of the API Key, OAuth client_id and OAuth client_secret.
<br><br>
You will then need to create a file named '.env' at the project's root directory with the following information, replacing the values with their respective information:
```
BUNGIE_API_KEY<Your Bungie API Key>
BUNGIE_CLIENT_ID=<Your Bungie OAuth client_id>
BUNGIE_CLIENT_SECRET=<Your Bungie OAuth client_secret>
CERT_PASSPHRASE=<A passphrase for your SSL certificate>
```
*Note: You will need to supply CERT_PASSPHRASE when creating an SSL certificate when the server is first run.*

After this, in a command line type:
```
yarn install
```
This will install all the required dependencies of the project

### Running the Website

In order to run the web server, open a command line and type:
```
yarn start
```
This will bundle the JavaScript files, and then start up the server, while watching for changes in the source JavaScript files.
<br>
*Note: During the first run of the application, the server may ask for a passphrase for the SSL certificate. When this happens, enter in the passphrase you supplied for the CERT_PASSPHRASE in the '.env' file.*
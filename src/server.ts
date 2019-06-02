console.log('Loading modules...');

import express from 'express';
import path from "path";
import logger from "morgan";
import cookieParser from "cookie-parser";
import createError from "http-errors";
import debug from "debug";
import https from "https";
import fs from "fs";
import fetch from "node-fetch";

import indexRouter from "./routes/index";
import itemsRouter from "./routes/api/items";
import itemDefinitionsRouter from "./routes/api/itemdefinitions";
import perksRouter from "./routes/api/perks";
import membershipsRouter from "./routes/api/memberships";
import authRouter from "./routes/auth/bungie";
import redirectRouter from "./routes/redirect";

const manifestUrl = 'https://destiny.plumbing/';
const itemDefinitionUrl = 'https://destiny.plumbing/en/raw/DestinyInventoryItemDefinition.json';

const app = express();
const serverDebug = debug("destiny-item-rater:server");
// @ts-ignore
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// @ts-ignore
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/redirect', redirectRouter);
app.use('/api/items', itemsRouter);
app.use('/api/itemdefinitions', itemDefinitionsRouter);
app.use('/api/perks', perksRouter);
app.use('/api/memberships', membershipsRouter);
app.use('/auth/bungie', authRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// if we aren't running in production, load env vars from a .env file
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
    require('dotenv').config();
}

// validate that environment variables were set
let errors = "";
if (!process.env.BUNGIE_API_KEY) {
    errors += "  The 'BUNGIE_API_KEY' environment variable has not been set.\n";
}
if (!process.env.BUNGIE_CLIENT_ID) {
    errors += "  The 'BUNGIE_CLIENT_ID' environment variable has not been set.\n";
}
if (!process.env.BUNGIE_CLIENT_SECRET) {
    errors += "  The 'BUNGIE_CLIENT_SECRET' environment variable has not been set.\n";
}
if (!process.env.CERT_PASSPHRASE) {
    errors += "  The 'CERT_PASSPHRASE' environment variable has not been set.\n";
}
if (errors) {
    console.error('Terminating. One or more environment variables were not set:');
    console.error(errors);
    process.exit(1);
}

/**
 * Get port from environment and store in Express.
 */

console.log('Retreving port...');
var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

var hostname = process.env.HOSTNAME || "localhost";

/**
 * Create HTTP server.
 */
console.log('Creating HTTP server...');
const keyPath = path.join(__dirname, "./key.pem");
const certPath = path.join(__dirname, "./cert.pem");
if (!fs.existsSync(keyPath)) {
    throw `SSL key not found at '${keyPath}'. Is OpenSSL configured?`
}
if (!fs.existsSync(certPath)) {
    throw `SSL cert not found at '${certPath}'. Is OpenSSL configured?`
}

const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
    passphrase: process.env.CERT_PASSPHRASE
};

var server = https.createServer(options, app);

/**
 * Update Destiny manifest
 * Listen on provided port, on all network interfaces.
 */
updateItemDefinitions()
    .then(() => {
        console.log(`Listening on port ${port}...`);
        server.listen(port, hostname, onListening);
        server.on("error", onError);
    })
    .catch(error => { throw error });

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val): number {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return -1;
}

/**
 * Updates the current Destiny manifest
 */

async function updateItemDefinitions() {
    console.log('Checking Destiny manifest version...');
    return fetch(manifestUrl, {})
        .then(response => response.json())
        .then(manifest => updateDefinitionsIfRequired(manifest.bungieManifestVersion))
        .catch(error => { throw error });
}

/**
 * Fetches the newest item definitions if required
 */

async function updateDefinitionsIfRequired(manifestVersion) {
    let updateDefs = true;
    const itemDefPath = path.join(__dirname, "./data/ItemDefinitions.json");
    console.log(`Online manifest version: ${manifestVersion}`);
    if (fs.existsSync(itemDefPath)) {
        let itemDefs = JSON.parse(fs.readFileSync(itemDefPath).toString());
        let localManifestVersion = itemDefs.bungieManifestVersion;
        if (localManifestVersion) {
            console.log(`Local manifest version: ${localManifestVersion}`);
            if (localManifestVersion == manifestVersion) {
                console.log('Manifest versions match.');
                updateDefs = false;
            } else {
                console.log('Item definitions are out of date.');
            }
        } else {
            console.log('Local item definition format is invalid.');
        }
    } else {
        console.log('Item definitions not downloaded.');
    }
    if (updateDefs) {
        console.log('Downloading item definitions...');
        return fetch(itemDefinitionUrl, {})
            .then(response => response.json())
            .then(plumbingItemDefs => {
                console.log('Item definitions downloaded.');
                console.log('Formatting item definitions...');
                let formattedDefs = formatItemDefinitions(plumbingItemDefs, manifestVersion);
                fs.writeFileSync(itemDefPath, JSON.stringify(formattedDefs));
                console.log('Item definitions updated');
            })
            .catch(error => { throw error });
    }
    return Promise.resolve();
}

/**
 * Strips unneeded information from the item definitions
 */

function formatItemDefinitions(itemDefinitions, manifestVersion) {
    let itemDefs = [];
    for (var itemDefProp in itemDefinitions) {
        if (itemDefinitions.hasOwnProperty(itemDefProp)) {
            let itemDef = itemDefinitions[itemDefProp];
            let itemClass = "";
            switch (itemDef.classType) {
                case 0:
                    itemClass = "Titan"
                    break;
                case 1:
                    itemClass = "Hunter"
                    break;
                case 2:
                    itemClass = "Warlock"
                    break;
            }
            let tier = "";
            if (itemDef.inventory) {
                tier = itemDef.inventory.tierTypeName;
            }
            itemDefs.push({
                hash: itemDef.hash,
                name: itemDef.displayProperties.name,
                itemType: itemDef.itemTypeDisplayName,
                classType: itemClass,
                tier: tier
            });
        }
    }

    return {
        bungieManifestVersion: manifestVersion,
        itemDefinitions: itemDefs
    };
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    serverDebug("Listening on " + bind);
}
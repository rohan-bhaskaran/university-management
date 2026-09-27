import arcjet, { shield, detectBot, tokenBucket, validateEmail } from "@arcjet/node";
import {ARCJET_KEY} from "./env.js";


const aj = arcjet({
    key: ARCJET_KEY,
    rules: [
        shield({mode: "LIVE"}),
        detectBot({mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"]}),
        tokenBucket({
            mode: "LIVE",
            refillRate: 5,
            interval: 10,
            capacity: 10
        })
    ]
});

const emailAj = arcjet({
    key: ARCJET_KEY,
    rules: [
        validateEmail({
            mode: "LIVE",
            deny: ["DISPOSABLE","INVALID", "NO_MX_RECORDS"]
        })
    ]
})

export {aj, emailAj};
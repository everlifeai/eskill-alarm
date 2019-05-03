'use strict'
const cote = require('cote')
const cron = require('cron')
const cronstrue = require('cronstrue')

const fs = require('fs')
const path = require('path')

const u = require('elife-utils')

const jughead = require('jughead')
const archieml = require('archieml')

/*      understand/
 * This is the main entry point where we start.
 *
 *      outcome/
 * Start our microservice.
 */
function main() {
    loadReminders((err) => {
        if(err) u.showErr(err)
        startMicroservice()
        registerWithCommMgr()
    })
}

let REMINDERS = {
    cronjobs: [],
    reminders: [],
}
/*      outcome/
 * Clear all existing reminders and load them freshly from the reminder
 * file.
 */
function loadReminders(cb) {
    fs.readFile(reminderFile(), 'utf8', (err, data) => {
        if(err) {
            if(err.code == 'ENOENT') clearReminders()
            else cb(err)
        }
        else {
            clearReminders()
            let d = archieml.load(data)
            for(let i = 0;i < d.reminders.length;i++) {
                addReminder(d.reminders[i])
            }
            cb()
        }
    })
}

function clearReminders() {
    let cjs = REMINDERS.cronjobs;
    REMINDERS.reminders = []
    REMINDERS.cronjobs = []
    for(let i = 0;i < cjs.length;i++) cjs[i].stop()
}

/*      outcome/
 * Save reminders into an ArchieML file
 */
function saveReminders(cb) {
    let pfx = `This is your Reminder File. Every pair of lines below represent
    (a) a reminder time in cron format (cron: xxxx)
    (b) a message to ping you with at the appropriate time (message: xxxx)
You can add, remove, and edit reminders in this file and then
ask your avatar to load your changes by using the '/reminder_reload'
command.
(If you need help with the 'cron' format go to http://crontab.org)


`

    fs.writeFile(reminderFile(), pfx, (err) => {
        if(err) cb(err)
        else {
            let txt = jughead.archieml({ reminders: REMINDERS.reminders })
            fs.appendFile(reminderFile(), txt, cb)
        }
    })

}

/*      outcome/
 * Get path to our reminder file
 */
function reminderFile() {
    return path.join(u.dataLoc(), 'eskill-alarm.txt')
}

/*      outcome/
 * Given a user entered reminder string:
 *      * * * * * Remind me
 *      30 7 * * * Remind me
 * We split it into a reminder ({ when:..,msg:.. })
 * And check that the 'when' is a valid cron string by trying to parse
 * it into a human-displayable string.
 */
function line2reminder(txt) {
    let parts = txt.split(' ')
    if(parts.length < 6) return
    let reminder = {
        when: parts.slice(0,5).join(' '),
        msg: parts.slice(5).join(' '),
    }

    try {
        cronstrue.toString(reminder.when) // just to check
        return reminder
    } catch(e) {
        return undefined
    }
}

function addReminder(reminder) {
    try {
        let cronjob = new cron.CronJob(reminder.when, () =>{
            sendReply(reminder.msg)
        })
        cronjob.start()
        REMINDERS.cronjobs.push(cronjob)
        REMINDERS.reminders.push(reminder)
    } catch(e) {}
}

/* microservice key (identity of the microservice) */
let msKey = 'everlife-reminder-alarm'

function startMicroservice() {

    /*      understand/
     * The microservice (partitioned by key to prevent
     * conflicting with other services).
     */
    const svc = new cote.Responder({
        name: 'Everlife Reminder Alarm Skill',
        key: msKey,
    })

    /*      outcome/
     * Respond to user messages
     */
    svc.on('msg', (req, cb) => {
        if(req.msg.startsWith("/remind_me ")) {
            cb(null, true)
            add_reminder_1(req)
        } else if(req.msg.startsWith("/reminder_reload")) {
            cb(null, true)
            loadReminders()
        } else {
            cb()
        }
    })

    function add_reminder_1(req) {
        let reminder = line2reminder(req.msg.substring('/remind_me '.length))
        if(!reminder) {
            sendReply(`Didn't get that. Use <when to remind> <what to say>`, req)
            sendReply(`<when to remind> is in crontab format`, req)
            sendReply(`For example: 13 15 * * * Daily meeting (at 1:15 PM)`, req)
        } else {
            saveReminders((err) => {
                if(err) {
                    sendReply(`Failed to save reminder`, req)
                    u.showErr(err)
                } else {
                    let display = cronstrue.toString(reminder.when)
                    sendReply(`Great - will remind you to ${reminder.msg} ${display}`, req)
                    addReminder(reminder)
                }
            })
        }
    }

}

const commMgrClient = new cote.Requester({
    name: 'Elife Alarm -> CommMgr',
    key: 'everlife-communication-svc',
})

function sendReply(msg, req) {
    if(!req) req = {}
    req.USELASTCHAN = true
    req.type = 'reply'
    req.msg = String(msg)
    commMgrClient.send(req, (err) => {
        if(err) u.showErr(err)
    })
}

/*      outcome/
 * Register ourselves as a message handler with the communication
 * manager so we can handle requests for reminder alarms.
 */
function registerWithCommMgr() {
    commMgrClient.send({
        type: 'register-msg-handler',
        mskey: msKey,
        mstype: 'msg',
        mshelp: [ { cmd: '/remind_me', txt: 'Add reminder (cron format)' } ],
    }, (err) => {
        if(err) u.showErr(err)
    })
}

main()

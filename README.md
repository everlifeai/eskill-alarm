# Remind Me

Ask your Avatar to remind you of something.

![icon](eskill-alarm.png)

## Usage

        /remind_me 30 7 * * 0-5 Wake Up!

Sets a new reminder for 7:30 every morning Monday to Friday. See
[the cron format](http://crontab.org/) for details on how to specify
reminder time.

Every morning the avatar will now greet you by saying:

```
> Wake Up!
```

## Editing
While adding reminders is can be done through the chat, to change or delete
them requires a more flexible interface.
The Avatar stores the reminders in your data folder in a file
called `eskill-alarm.txt`. Open this file using your favorite text editor
and you will find it very easy to edit.

To find the data folder location for your avatar you can use the
`/whoami` command.

The file should look something like this:

```
This is your Reminder File. Every pair of lines below represent
    (a) a reminder time in cron format (cron: xxxx)
    (b) a message to ping you with at the appropriate time (message: xxxx)
You can add, remove, and edit reminders in this file and then
ask your avatar to load your changes by using the '/reminder_reload'
command.
(If you need help with the 'cron' format go to http://crontab.org)


[reminders]
when: 30 6 * * *
msg: Wake up!

when: * * * * *
msg: Every minute is precious

when: 0 12 * * *
msg: Lunchtime

when: 30 15 * * *
msg: Exercise

[]
```

Once you have made your changes, use the

        /reminder_reload

command to your avatar to ask it to take in your changes.

## Feedback
Report bugs and issues on our discord channel

## TODO
[ ] Add Timezone

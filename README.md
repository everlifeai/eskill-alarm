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

        open ~/everlifeai/0/eskill-alarm.txt

To find the data folder location for your avatar you can use the
`/whoami` command.

Once you have made your changes, use the

        /reminder_reload

command to your avatar to ask it to take in your changes.

## Feedback
Report bugs and issues on our discord channel

## TODO
[ ] Add Timezone

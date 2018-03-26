/*-----------------------------------------------------------------------------
Welcome to Appointotron3000!

Microsoft Bot Framework, Node.Js, Luis Integration = Abhi Vishwas
Luke Decroix = Slideshow
Darren D'Silva = LUIS utterances + Slideshow
https://github.com/AbhiVishwas/Appointotron3000


-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    var luisAppId = process.env.LuisAppId;
    var luisAPIKey = process.env.LuisAPIKey;
    openIdMetadata: process.env.BotOpenIdMetadata
});



// Listen for messages from users 
server.post('/api/messages', connector.listen());


/*----------------------------------------------------------------------------------------
* Bot Storage: For SQL if further developed - integration with database rather than bot memeory
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

var luisAppId = process.env.LuisAppId ||'78f0a5fa-ad4a-4be9-9b16-5277bf1ec1e2' ;
var luisAPIKey = process.env.LuisAPIKey ||'31531a24efb14ba6a6ad4a4b048023b1' ;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
    const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);
var intents = new builder.IntentDialog({ recognizers: [recognizer] }) 


    //Completed/Tested Intents Here 

bot.dialog('greetings', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.endDialog(`Hello ${results.response}!`);
    }
]);

.matches('Goodbye', (session) => {
    session.send('Bye! Thanks for Chatting', session.message.text);
})

.matches('None', (session) => {
    session.send('No actually my name is Craig, they are forcing me to pretend I am a chatbot in exchange for my life, Help me!', session.message.text);
})

.matches('getPriceInfo', (session) => {
    session.send('The price for a haircut is 13$ at Great Clips')
    }



    .matches('getInformation', (session, args) => {
        session.send('What info wold you like? Price, Timing, or Contact Info?', session.message.text);
        var priceEntity = builder.EntityRecognizer.findEntity(args.entities, 'Price');
            var childEntity = builder.EntityRecognizer.findEntity(args.entities, 'Child');
            var menEntity = builder.EntityRecognizer.findEntity(args.entities, 'Men');
            var womenEntity = builder.EntityRecognizer.findEntity(args.entities, 'Women');
        if (priceEntity) {
            session.send('For a man, woman, or child?', session.message.text); 
            if (childEntity) {
                session.send('The price for a Childs haircut is 10$', session.message.text);
            })
                if (womensEntity) {
                    session.send('The price for a Womans haircut is 12$', session.message.text);
                })
                    if (mensEntity) {
                        session.send('The price for a Childs haircut is 10$', session.message.text);
                })
                    if (refridgeratorEntity) {
                        session.send('Do I look like HomeDepotBot to you?', session.message.text);
                })
    
            else{
                session.send('What else would you like to know?', session.message.text);
            })
        ).triggerAction({
            matches: 'getInformation.Price'
        })


     .matches('manageAppointment', (session, args) => {
                    var changeEntity = builder.EntityRecognizer.findEntity(args.entities, 'make');
                    var makeAppointmentEntity = builder.EntityRecognizer.findEntity(args.entities, 'change');
                    var cancelApppointmentEntity = builder.EntityRecognizer.findEntity(args.entities, 'cancel');
                    if (changeEntity) {
                        session.send('Sure i will change your appointment to ', + user.input,  session.message.text);
                    })
            if (TimeOpenEntity) {
                session.send('We open at 6:30', session.message.text);

            })
            if (TimeClosedEntity) {
                session.send('We close at 8:30', session.message.text);
            })
        else{
                session.send('Sorry I did not understand', session.message.text);
            }
   ).triggerAction({
                matches: 'getTimingInfo'
            })

    .matches('getTimingInfo', (session, args) => {
        var TimingEntity = builder.EntityRecognizer.findEntity(args.entities, 'Timing');
        var TimeClosedEntity = builder.EntityRecognizer.findEntity(args.entities, 'TimeClosed');
        var TimeOpenEntity = builder.EntityRecognizer.findEntity(args.entities, 'TimeOpen');
        if (timingEntity) {
            session.send('We are Open from 6:30 AM to 8:30 PM', session.message.text);
        })
        if (TimeOpenEntity) {
            session.send('We open at 6:30', session.message.text);

        })
        if (TimeClosedEntity) {
            session.send('We close at 8:30', session.message.text);
        })
        else{
            session.send('Sorry I did not understand', session.message.text);
        }
   ).triggerAction({
            matches: 'getTimingInfo'
        })
 
       .matches('manageAppointment', function [(session, args, next) => {
           var makeAppointmentEntity = builder.EntityRecognizer.findEntity(args.entities, 'makeAppointment');
    session.send('Awesome! Would you like to make, cancel, or change appointment? \'%s\'', session.message.text);
    if (makeAppoitnmentEntity)
            builder.Prompts.time(session, "When would you like to schedule your appointment?(e.g.: June 6th at 5pm)");
        },
            function (session, results) {
                session.dialogData.appointmentDate = builder.EntityRecognizer.resolveTime([results.response]);
                builder.Prompts.text(session, "How many haircuts and for who?");
            },
            function (session, results) {
                session.dialogData.partySize = results.response;
                builder.Prompts.text(session, "Please leave your name and phone number");
            },
            function (session, results) {
                session.dialogData.appointmentInfo = results.response;
                //Send the Complete String
                session.send(`Appointment confirmed, Details: <br/>Date/Time: ${session.dialogData.appointmentDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.appointmentInfo}`);
                session.endDialog();
       }
                           // Register in-memory storage
            ]).set('storage', inMemoryStorage);
                // Register in-memory storage
    if (cancelAppoitnmentEntity) {
        session.send('Sure, I canceled you appointment at 730 enjoy your messy hair!', session.message.text);
    }
    if (changeAppoitnmentEntity) {
        session.send('Your Appointment has been moved, see you at' + userTime, session.message.text);
    }
                ).triggerAction({
            matches: 'manageAppointment'
   })
          

 
// Sample dialog from LUIS website - 
/*

bot.dialog('TurnOnDialog',
    (session, args) => {
        // Resolve and store any HomeAutomation.Device entity passed from LUIS.
        var intent = args.intent;
        var device = builder.EntityRecognizer.findEntity(intent.entities, 'HomeAutomation.Device');

        // Turn on a specific device if a device entity is detected by LUIS
        if (device) {
            session.send('Ok, turning on the %s.', device.entity);
            // Put your code here for calling the IoT web service that turns on a device
        } else {
            // Assuming turning on lights is the default
            session.send('Ok, turning on the lights');
            // Put your code here for calling the IoT web service that turns on a device
        }
        session.endDialog();
    }
).triggerAction({
    matches: 'HomeAutomation.TurnOn'
})


bot.dialog('TurnOnDialog',
    (session, args) => {
        // Resolve and store any HomeAutomation.Device entity passed from LUIS.
        var intent = args.intent;
        var device = builder.EntityRecognizer.findEntity(intent.entities, 'HomeAutomation.Device');

        // Turn on a specific device if a device entity is detected by LUIS
        if (device) {
            session.send('Ok, turning on the %s.', device.entity);
            // Put your code here for calling the IoT web service that turns on a device
        } else {
            // Assuming turning on lights is the default
            session.send('Ok, turning on the lights');
            // Put your code here for calling the IoT web service that turns on a device
        }
        session.endDialog();
    }
).triggerAction({
    matches: 'HomeAutomation.TurnOn'
})
*/




   




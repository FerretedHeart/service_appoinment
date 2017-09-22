'use strict';
const AWSregion = 'us-east-1';  // us-east-1

const params = {
    TableName: 'scheduledVisits',
    Key:{ customerId: '1'  }
};

const welcomeMessage = "Welcome to service scheduler.  Would you like to schedule an appointment?"
const repromptMessage = "Want to schedule a service appointment."
const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

AWS.config.update({
    region: AWSregion
});

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    console.log(event)
    alexa.appId = 'amzn1.ask.skill.acc4882b-72f5-4bf9-bfae-2b75c0413966'; // skill id from dev portal
    // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes
    
    //if no amazon token, return a LinkAccount card
    if (event.session.user.accessToken == undefined) {
        alexa.emit(':tellWithLinkAccountCard',
                   'to start using this skill, please authenticate your account by using the Alexa app');
        return;
            }
            
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.response.speak(welcomeMessage).listen(repromptMessage);
        this.emit(':responseReady');
    },
    
    'ScheduleAnAppointment': function () {
        //delegate to Alexa to collect all the required slot values
        var filledSlots = delegateSlotCollection.call(this);
        var say = "Here's your appoinment...";
        // var MyScheduler = this.event.request.intent.slots.ScheduleAnAppointment.value;
        // console.log('MyScheduler : ' + MyScheduler);
        
                //Now let's recap the trip
        var make=this.event.request.intent.slots.make.value;
        var model=this.event.request.intent.slots.model.value;
        var date=this.event.request.intent.slots.date.value;
        say+= " your "+ make + " "+ model+" is scheduled for service on  "+date;

        // readDynamoItem(params, myResult=>{
        //     var say = '';
        //     console.log(myResult);
        //     // say = myResult;

        //     // say = 'you asked, ' + MyScheduler + '. The answer is: ' + myResult;
        //     say = myResult.first + ", your " + myResult.year + ' ' +  myResult.make + ' ' + myResult.model + ' is scheduled for ' +  myResult.day + ' at ' + myResult.time + ' AM';
            this.response.speak(say);
            this.emit(':responseReady');

        // });

    },
    'AMAZON.HelpIntent': function () {
        var output
        this.response.speak('Would you like to schedule an appointment?').listen('try again');
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('Goodbye!');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('Goodbye!');
        this.emit(':responseReady');
    }
};


function readDynamoItem(params, callback) {

    var AWS = require('aws-sdk');
    AWS.config.update({region: AWSregion});

    var docClient = new AWS.DynamoDB.DocumentClient();

    console.log('reading item from DynamoDB table');

    docClient.get(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

            callback(data.Item);  // this Item is the entire row

        }
    });

}

function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
      var updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      this.emit(":delegate");
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}
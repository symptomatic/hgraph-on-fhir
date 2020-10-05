
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import moment from 'moment';
import { get } from 'lodash';

import { FhirUtilities, Bundles, Devices, Observations, Organizations, Patients, Questionnaires, QuestionnaireResponses } from 'meteor/clinical:hl7-fhir-data-infrastructure';

if(Meteor.isClient){
  Meteor.subscribe('Observations');
}


if(Meteor.isServer){  
  Meteor.publish('Observations', function(){
    return Observations.find();
  });    
}
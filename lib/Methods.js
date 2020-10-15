import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';

import { Observations } from 'meteor/clinical:hl7-fhir-data-infrastructure';

Meteor.methods({
    initVitalSigns: function(){
        console.log("Seeding patient with realistic vital signs.")

        let newPulse = {
            resourceType: "Observation",
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: '8867-4',
                    display: 'Heart rate'
                }]
            },
            valueQuantity: {
                value: 65,
                unit: 'bps',
                system: 'http://unitsofmeasure.org'
            },
            effectiveDateTime: new Date()
        }
        Observations.insert(newPulse)


        let newTemperature = {
            resourceType: "Observation",
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: '8310-5',
                    display: 'Body temperature'
                }]
            },
            valueQuantity: {
                value: 98.6,
                unit: 'F',
                system: 'http://unitsofmeasure.org'
            }, 
            effectiveDateTime: new Date()
        }
        Observations.insert(newTemperature)


        let newBloodOxygenation = {
            resourceType: "Observation",
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: '20564-1',
                    display: 'Oxygen saturation in Blood'
                }]
            },
            valueQuantity: {
                value: 98,
                unit: '%',
                system: 'http://unitsofmeasure.org'
            },
            effectiveDateTime: new Date()
        }
        Observations.insert(newBloodOxygenation)

        let newWaistCircumference = {
            resourceType: "Observation",
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: '56115-9',
                    display: 'Waist Circumference by NCFS'
                }]
            },
            valueQuantity: {
                value: 32,
                unit: 'inches',
                system: 'http://unitsofmeasure.org'
            },
            effectiveDateTime: new Date()
        }
        Observations.insert(newWaistCircumference)



        let newWeight = {
            resourceType: "Observation",
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: '3141-9',
                    display: 'Body weight Measured'
                }]
            },
            valueQuantity: {
                value: 160,
                unit: 'lbs',
                system: 'http://unitsofmeasure.org'
            },
            effectiveDateTime: new Date()
        }
        Observations.insert(newWeight)

        let newBloodPressure = {
            resourceType: "Observation",
            code: {
                coding: [{
                    system: "http://loinc.org",
                    code: '55284-4',
                    display: 'Blood pressure systolic and diastolic'
                }]
            },
            effectiveDateTime: new Date(),
            component: [{
                code: {
                    coding: [{
                        system: "http://loinc.org",
                        code: '8480-6',
                        display: 'Systolic blood pressure'
                    }]
                },
                valueQuantity: {
                    value: 120,
                    unit: 'mmHg',
                    system: 'http://unitsofmeasure.org'
                }
            }, {
                code: {
                    coding: [{
                        system: "http://loinc.org",
                        code: '8462-4',
                        display: 'Diastolic blood pressure'
                    }]
                },
                valueQuantity: {
                    value: 80,
                    unit: 'mmHg',
                    system: 'http://unitsofmeasure.org'
                },
            }]
        }

        

        Observations._collection.insert(newBloodPressure, {validate: false, filter: false}, function(error){
            console.log('error', error)
        })
        
        // if(Meteor.isCordova){
        //     Observations._collection.insert(newBloodPressure, {validate: false, filter: false}, function(error){
        //         console.log('error', error)
        //     })
        // } else {
        //     Observations._collection.insert(newBloodPressure, {validate: false, filter: false}, function(error){
        //         console.log('error', error)
        //     })
        // }

    }
});
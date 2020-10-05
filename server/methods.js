import { HTTP } from 'meteor/http';

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
                value: 65
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
                value: 98.6
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
                value: 98
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
                value: 32
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
                value: 160
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
            valueQuantity: {
                value: 32
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
                    value: 120
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
                    value: 80
                },
            }]
        }
        Observations.insert(newBloodPressure)

    }
});